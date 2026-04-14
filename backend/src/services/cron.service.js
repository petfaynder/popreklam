import cron from 'node-cron';
import prisma from '../lib/prisma.js';
import { sendEmail } from './email.service.js';
import { syncAdsterraRevenue } from './adsterra-sync.service.js';
import { recalculateAllTiers } from './priority.service.js';
import { flushCommissions, getBufferSize } from './referral-commission.service.js';

// Push delivery (lazy import to handle Redis unavailability gracefully)
let enqueuePushCampaign = null;
const getPushDelivery = async () => {
    if (!enqueuePushCampaign) {
        try {
            const mod = await import('./push-delivery.service.js');
            enqueuePushCampaign = mod.enqueuePushCampaign;
        } catch (e) {
            console.warn('[Cron] Push delivery service unavailable:', e.message);
        }
    }
    return enqueuePushCampaign;
};


export const initCronJobs = () => {
    console.log('⏳ Initializing Cron Jobs...');

    // ============================================
    // JOB 1: Daily Budget + Clicks Reset (Every Midnight UTC)
    // ============================================
    cron.schedule('0 0 * * *', async () => {
        console.log('🔄 Running Daily Budget Reset...');
        try {
            // Reset dailySpent and dailyClicks for all campaigns
            await prisma.campaign.updateMany({
                data: { dailySpent: 0, dailyClicks: 0 }
            });

            // 2. Reactivate campaigns that were paused due to daily budget
            // Note: This requires a specific status or logic. 
            // For MVP: We assume campaigns with status 'ACTIVE' are eligible if they have budget.
            // If we paused them by changing status to 'PAUSED', we need a way to know WHY they were paused.
            // Better approach: Don't change status to PAUSED when daily budget hit, just filter them out in Ad Server.

            console.log('✅ Daily budgets reset successfully.');
        } catch (error) {
            console.error('❌ Daily Budget Reset Failed:', error);
        }
    });

    // ============================================
    // JOB 2: Auto-Invoice Generator (1st of Month)
    // ============================================
    cron.schedule('0 0 1 * *', async () => {
        console.log('📄 Running Monthly Invoice Generation...');
        try {
            // Decide the period we're invoicing: last calendar month
            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1); // 1st of last month
            const monthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999); // last day of last month
            const periodLabel = monthStart.toLocaleString('en-US', { month: 'long', year: 'numeric' }); // e.g. "March 2026"
            const YYYY = monthStart.getFullYear();
            const MM   = String(monthStart.getMonth() + 1).padStart(2, '0');

            // Get global tax rate from admin settings (default 0%)
            const taxRateRaw = await prisma.systemSetting.findUnique({ where: { key: 'invoice_tax_rate' } });
            const taxRate = parseFloat(taxRateRaw?.value || '0') / 100;

            // Find all completed deposits in the last month
            const payments = await prisma.payment.findMany({
                where: {
                    type: 'DEPOSIT',
                    status: 'COMPLETED',
                    createdAt: { gte: monthStart, lte: monthEnd },
                    // Only generate invoice if one doesn't already exist for this payment
                    invoice: null
                },
                include: { user: true }
            });

            let created = 0;

            for (const payment of payments) {
                try {
                    // Generate unique invoice number: INV-YYYY-MM-<last8ofPaymentId>
                    const suffix = payment.id.replace(/-/g, '').slice(-6).toUpperCase();
                    const invoiceNo = `INV-${YYYY}-${MM}-${suffix}`;

                    // Check not already created (safety guard)
                    const exists = await prisma.invoice.findUnique({ where: { invoiceNo } });
                    if (exists) continue;

                    const amount   = Number(payment.amount);
                    const tax      = parseFloat((amount * taxRate).toFixed(2));
                    const total    = parseFloat((amount + tax).toFixed(2));
                    const dueDate  = new Date(); // Due immediately

                    await prisma.invoice.create({
                        data: {
                            userId:    payment.userId,
                            paymentId: payment.id,
                            invoiceNo,
                            amount,
                            tax,
                            total,
                            status:   'PAID',
                            dueDate,
                            paidAt:   payment.updatedAt || new Date(),
                            items: [{
                                description: `Ad Balance Deposit — ${periodLabel}`,
                                quantity:    1,
                                price:       amount,
                                amount:      amount
                            }]
                        }
                    });

                    created++;
                    console.log(`[AutoInvoice] Created ${invoiceNo} for user ${payment.userId.slice(0, 8)} — $${total}`);
                } catch (e) {
                    console.error(`[AutoInvoice] Failed for payment ${payment.id}:`, e.message);
                }
            }

            console.log(`✅ Monthly Invoice Generation complete. ${created} invoices created.`);
        } catch (error) {
            console.error('❌ Monthly Invoice Generation Failed:', error);
        }
    });

    // ============================================
    // JOB 3: Low Balance & Campaign Alerts (Every Hour)
    // ============================================
    cron.schedule('0 * * * *', async () => {
        console.log('📧 Checking Advertiser Balances & Campaigns...');
        try {
            // Find advertisers with balance < 10
            const lowBalanceUsers = await prisma.user.findMany({
                where: {
                    role: 'ADVERTISER',
                    balance: { lt: 10, gt: 0 }
                },
                select: { email: true, balance: true }
            });

            for (const user of lowBalanceUsers) {
                const html = `
                    <h2>Low Balance Alert</h2>
                    <p>Hi ${user.email},</p>
                    <p>Your MrPop.io advertising balance is running low ($${Number(user.balance).toFixed(2)}).</p>
                    <p>Please log in and add funds to avoid campaign interruption.</p>
                `;
                await sendEmail(user.email, 'Action Required: Low Ad Balance', html);
            }

            // Find all active campaigns and check against total budget
            const pausedCampaigns = await prisma.campaign.findMany({
                where: { status: 'ACTIVE' },
                include: {
                    advertiser: {
                        include: { user: true }  // Campaign → Advertiser → User
                    }
                }
            });

            for (const camp of pausedCampaigns) {
                if (Number(camp.totalSpent) >= Number(camp.totalBudget)) {
                    // Auto-pause the campaign
                    await prisma.campaign.update({
                        where: { id: camp.id },
                        data: { status: 'PAUSED' }
                    });

                    // Email the advertiser's user
                    const advertiserUser = camp.advertiser?.user;
                    if (advertiserUser?.email) {
                        const html = `
                            <h2>Campaign Paused</h2>
                            <p>Hi ${advertiserUser.email},</p>
                            <p>Your campaign "<b>${camp.name}</b>" has reached its total budget and has been automatically paused.</p>
                            <p>Please log in to add funds or increase the campaign budget.</p>
                        `;
                        await sendEmail(advertiserUser.email, `Campaign Paused: ${camp.name}`, html);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Low Balance Alert Failed:', error);
        }
    });

    // ============================================
    // JOB 4: Publisher Payout Checker (Daily at 08:00 AM)
    // ============================================
    cron.schedule('0 8 * * *', async () => {
        console.log('💰 Checking Publisher Payout Thresholds...');
        try {
            // Check publishers with balance >= 50
            const eligiblePublishers = await prisma.user.findMany({
                where: {
                    role: 'PUBLISHER',
                    balance: { gte: 50 }
                },
                select: { email: true, balance: true }
            });

            for (const pub of eligiblePublishers) {
                // Send alert to admin (or the publisher)
                // In a real app, we'd fetch the generic admin email from SystemSettings
                const adminHtml = `
                    <h2>Publisher Ready for Payout</h2>
                    <p>Publisher <b>${pub.email}</b> has reached the minimum payout threshold.</p>
                    <p>Current Balance: <b>$${Number(pub.balance).toFixed(2)}</b></p>
                    <p>Please review their account and process the withdrawal.</p>
                `;
                await sendEmail('admin@mrpop.io', `Payout Alert: ${pub.email}`, adminHtml);
            }
        } catch (error) {
            console.error('❌ Payout Checker Failed:', error);
        }
    });

    // ============================================
    // JOB 5: Smart CPA Auto-Optimization (Every Hour)
    // For each campaign with autoOptimize=true, check per-publisher-site
    // spend vs conversions. Blacklist underperformers automatically.
    // ============================================
    cron.schedule('30 * * * *', async () => {
        console.log('🤖 Running Smart CPA Auto-Optimization...');
        try {
            // Find all active campaigns with CPA auto-optimize enabled
            const campaigns = await prisma.campaign.findMany({
                where: {
                    status: 'ACTIVE',
                    autoOptimize: true,
                    cpaGoal: { not: null }
                }
            });

            for (const campaign of campaigns) {
                const cpaGoal = Number(campaign.cpaGoal);
                const spendThreshold = cpaGoal * 1.5;  // Blacklist after 1.5× CPA goal with no conversions

                // Get per-site spending (last 48 hours)
                const since = new Date(Date.now() - 48 * 60 * 60 * 1000);

                const siteStats = await prisma.impression.groupBy({
                    by: ['zoneId'],
                    where: {
                        campaignId: campaign.id,
                        createdAt: { gte: since }
                    },
                    _sum: { revenue: true },
                    _count: { id: true }
                });

                // Get conversions per zone in same period
                const conversions = await prisma.conversion.findMany({
                    where: {
                        impression: {
                            campaignId: campaign.id,
                            createdAt: { gte: since }
                        }
                    },
                    include: { impression: { select: { zoneId: true } } }
                });

                const conversionsByZone = {};
                for (const conv of conversions) {
                    const zId = conv.impression.zoneId;
                    conversionsByZone[zId] = (conversionsByZone[zId] || 0) + 1;
                }

                const targeting = campaign.targeting || {};
                const currentBlacklist = targeting.excludeZones
                    ? (Array.isArray(targeting.excludeZones)
                        ? targeting.excludeZones
                        : targeting.excludeZones.split(',').map(s => s.trim()).filter(Boolean))
                    : [];

                const newBlacklist = [...currentBlacklist];
                let changed = false;

                for (const stat of siteStats) {
                    const totalSpend = Number(stat._sum.revenue || 0);
                    const zoneConversions = conversionsByZone[stat.zoneId] || 0;

                    // Zone spent 1.5× CPA goal but got zero conversions → blacklist
                    if (totalSpend >= spendThreshold && zoneConversions === 0) {
                        if (!newBlacklist.includes(stat.zoneId)) {
                            newBlacklist.push(stat.zoneId);
                            changed = true;
                            console.log(`🚫 [AutoOptimize] Campaign ${campaign.id}: Blacklisting zone ${stat.zoneId} (spent $${totalSpend.toFixed(4)}, 0 conversions, CPA goal $${cpaGoal})`);
                        }
                    }
                }

                if (changed) {
                    await prisma.campaign.update({
                        where: { id: campaign.id },
                        data: {
                            targeting: {
                                ...targeting,
                                excludeZones: newBlacklist
                            }
                        }
                    });
                }
            }

            console.log(`✅ Smart CPA optimization complete. Checked ${campaigns.length} campaigns.`);
        } catch (error) {
            console.error('❌ Smart CPA Optimizer Failed:', error);
        }
    });

    // ============================================
    // JOB 6: Publisher Auto-Payout (1st & 15th of every month at 09:00 UTC)
    // Automatically generates withdrawal requests for eligible publishers
    // who have reached the minimum payout threshold.
    // ============================================
    cron.schedule('0 9 1,15 * *', async () => {
        console.log('💸 Running Publisher Auto-Payout...');
        try {
            const globalMinPayout = 50; // $50 minimum default

            // Find all publisher users with balance >= min payout
            const eligibleUsers = await prisma.user.findMany({
                where: {
                    role: 'PUBLISHER',
                    balance: { gte: globalMinPayout }
                },
                include: {
                    publisher: {
                        include: {
                            user: {
                                include: { paymentMethods: { where: { isDefault: true }, take: 1 } }
                            }
                        }
                    }
                }
            });

            let processed = 0;

            for (const user of eligibleUsers) {
                const publisher = user.publisher;
                if (!publisher) continue;

                const availableBalance = Number(user.balance);
                const threshold = Math.max(globalMinPayout, Number(publisher.minPayout || 0));

                if (availableBalance < threshold) continue;

                // Check if there's already a PENDING withdrawal in progress
                const existingPending = await prisma.payment.findFirst({
                    where: {
                        userId: user.id,
                        type: 'WITHDRAWAL',
                        status: 'PENDING'
                    }
                });

                if (existingPending) {
                    console.log(`[AutoPayout] Skipping ${user.email} — already has a pending withdrawal.`);
                    continue;
                }

                // Determine best payment method
                const paymentMethod = user.publisher?.user?.paymentMethods?.[0] || null;

                // Create auto withdrawal payment record
                await prisma.payment.create({
                    data: {
                        userId: user.id,
                        type: 'WITHDRAWAL',
                        amount: availableBalance,
                        method: paymentMethod?.type || 'PAYPAL',
                        status: 'PENDING',
                        details: paymentMethod?.details || {},
                        notes: 'Auto-generated by monthly payout system'
                    }
                });

                // Move balance to pending
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        balance: { decrement: availableBalance },
                        pendingBalance: { increment: availableBalance }
                    }
                });

                processed++;
                console.log(`[AutoPayout] Created payout request for ${user.email}: $${availableBalance.toFixed(2)}`);

                // Email the publisher
                const html = `
                    <h2>Auto-Payout Request Created</h2>
                    <p>Hello,</p>
                    <p>Your earnings of <b>$${availableBalance.toFixed(2)}</b> have been automatically queued for payout.</p>
                    <p>Our team will process your payment shortly. You can track the status in your publisher dashboard.</p>
                    <p>Thank you for publishing with us!</p>
                `;
                await sendEmail(user.email, 'Your Payout is Being Processed', html).catch(() => { });
            }

            console.log(`✅ Auto-Payout complete. Processed ${processed} publishers.`);
        } catch (error) {
            console.error('❌ Auto-Payout Failed:', error);
        }
    });

    // ============================================
    // JOB 7: Adsterra Revenue Reconciliation (Saatlik — her X:15'te)
    // ============================================
    cron.schedule('15 * * * *', async () => {
        console.log('📊 Running Adsterra Revenue Sync (hourly)...');
        try {
            // Today
            const todayResult = await syncAdsterraRevenue({ daysAgo: 0 });
            // Yesterday (catch late-settling impressions)
            const yesterdayResult = await syncAdsterraRevenue({ daysAgo: 1 });

            const totalZones = (todayResult.zones || 0) + (yesterdayResult.zones || 0);
            const totalRevenue = (todayResult.totalNetworkRevenue || 0) + (yesterdayResult.totalNetworkRevenue || 0);
            const totalAdj = (todayResult.adjustments?.length || 0) + (yesterdayResult.adjustments?.length || 0);

            if (todayResult.skipped && yesterdayResult.skipped) {
                console.log(`⏭ Adsterra sync skipped: ${todayResult.reason}`);
            } else {
                console.log(`✅ Adsterra sync done. Zones: ${totalZones}, Revenue: $${totalRevenue.toFixed(4)}, Corrections: ${totalAdj}`);
            }
        } catch (error) {
            console.error('❌ Adsterra Revenue Sync Cron Failed:', error);
        }
    });

    // ============================================
    // JOB 8: Advertiser Tier Recalculation (Hourly)
    // ============================================
    cron.schedule('45 * * * *', async () => {
        console.log('👑 Running Advertiser Tier Recalculation...');
        try {
            const result = await recalculateAllTiers();
            console.log(`✅ Tier recalculation complete. ${result.total} advertisers checked, ${result.changed} tiers changed.`);
        } catch (error) {
            console.error('❌ Tier Recalculation Failed:', error);
        }
    });

    // ============================================
    // JOB 9: Push Notification Delivery (Every 15 min)
    // Finds active PUSH_NOTIFICATION campaigns and enqueues
    // delivery jobs to eligible subscribers via BullMQ.
    // ============================================
    cron.schedule('*/5 * * * *', async () => {
        console.log('🔔 Running Push Notification Delivery...');
        try {
            const enqueue = await getPushDelivery();
            if (!enqueue) {
                console.log('⏭ Push delivery service not available — skipping.');
                return;
            }

            const activePushCampaigns = await prisma.campaign.findMany({
                where: {
                    status: 'ACTIVE',
                    adFormat: 'PUSH_NOTIFICATION',
                },
                include: { advertiser: true }
            });

            let totalQueued = 0;
            for (const campaign of activePushCampaigns) {
                const count = await enqueue(campaign);
                totalQueued += count;
            }

            console.log(`✅ Push delivery complete. ${activePushCampaigns.length} campaigns, ${totalQueued} jobs queued.`);
        } catch (err) {
            console.error('❌ Push Delivery Cron Failed:', err);
        }
    });

    // ============================================
    // JOB 10: Fraud Audit — PENDING Impression Resolution (Hourly, at :50)
    //
    // For each impression with trafficStatus='PENDING' that is older than 24h:
    //   1. Re-examine how many PENDING impressions that IP had in the same 24h window.
    //   2. If total impression count per IP still looks anomalous (>= 2× hourly max over 24h)
    //      → mark as INVALID: refund advertiser, do NOT release publisher pay.
    //   3. Otherwise → mark as CLEAN: move publisher pay from pendingBalance to balance.
    //
    // Design notes:
    //   - Advertiser is ALWAYS charged at serve time (reflects true budget consumption).
    //   - Refund is only issued when fraud is confirmed post-audit.
    //   - Publisher pendingBalance is decremented on either path (pay moved to balance or voided).
    //   - Publisher totalRevenue is corrected for fraud (decremented back).
    // ============================================
    cron.schedule('50 * * * *', async () => {
        console.log('🔍 Running Fraud Audit (PENDING impressions)...');
        try {
            const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h ago

            // Find PENDING impressions older than 24h (process in batches of 200)
            const pending = await prisma.impression.findMany({
                where: {
                    trafficStatus: 'PENDING',
                    createdAt: { lte: cutoff },
                },
                include: {
                    campaign: { include: { advertiser: { include: { user: true } } } },
                    zone: { include: { site: { include: { publisher: { include: { user: true } } } } } },
                },
                take: 200,
                orderBy: { createdAt: 'asc' },
            });

            if (pending.length === 0) {
                console.log('✅ Fraud Audit: No PENDING impressions to process.');
                return;
            }

            // Group by IP to batch the per-IP DB queries
            const ipSet = [...new Set(pending.map(i => i.ip))];

            // For each IP, count total impressions it generated in the 24h window around the impression
            const ipStats = {};
            await Promise.all(ipSet.map(async (ip) => {
                const windowStart = new Date(cutoff.getTime() - 24 * 60 * 60 * 1000);
                const count = await prisma.impression.count({
                    where: { ip, createdAt: { gte: windowStart, lte: cutoff } },
                });
                ipStats[ip] = count;
            }));

            // Fetch max_impressions_per_ip from settings (default 50/hour → 1200/24h)
            const maxHourlyRaw = await prisma.systemSetting.findUnique({ where: { key: 'max_impressions_per_ip' } });
            const maxHourly = parseInt(maxHourlyRaw?.value || '50', 10);
            // Over 24h: allow 2× the hourly rate per hour (generous, avoids false positives)
            const fraudThreshold24h = maxHourly * 24 * 2;

            let resolved = 0;
            let fraudFound = 0;
            let cleaned = 0;

            for (const imp of pending) {
                try {
                    const ipCount = ipStats[imp.ip] || 0;
                    const isConfirmedFraud = ipCount >= fraudThreshold24h;

                    const publisherUser = imp.zone?.site?.publisher?.user;
                    const advertiserUser = imp.campaign?.advertiser?.user;
                    const publisherPay = Number(imp.publisherRevenue);
                    const advertiserCharge = Number(imp.revenue);

                    if (isConfirmedFraud) {
                        // ── FRAUD CONFIRMED ──────────────────────────────────────
                        // 1. Mark impression as INVALID
                        await prisma.impression.update({
                            where: { id: imp.id },
                            data: { trafficStatus: 'INVALID' },
                        });

                        // 2. Refund advertiser (add back to balance + create REFUND transaction)
                        if (advertiserUser) {
                            await prisma.user.update({
                                where: { id: advertiserUser.id },
                                data: { balance: { increment: advertiserCharge } },
                            });
                            await prisma.transaction.create({
                                data: {
                                    userId: advertiserUser.id,
                                    type: 'REFUND',
                                    status: 'COMPLETED',
                                    amount: advertiserCharge,
                                    description: `Invalid traffic refund — impression ${imp.id}`,
                                    metadata: { impressionId: imp.id, fraudReason: 'High IP volume in 24h audit' },
                                },
                            });
                            // Reverse campaign spend
                            await prisma.campaign.update({
                                where: { id: imp.campaignId },
                                data: { totalSpent: { decrement: advertiserCharge } },
                            });
                        }

                        // 3. Void publisher pending pay — decrement pendingBalance + reverse totalRevenue
                        if (publisherUser) {
                            await prisma.user.update({
                                where: { id: publisherUser.id },
                                data: { pendingBalance: { decrement: publisherPay } },
                            });
                            // Reverse totalRevenue on publisher record (we incremented it at serve time)
                            if (imp.zone?.site?.publisher?.id) {
                                await prisma.publisher.update({
                                    where: { id: imp.zone.site.publisher.id },
                                    data: { totalRevenue: { decrement: publisherPay } },
                                });
                            }
                        }

                        fraudFound++;
                        console.log(`[FraudAudit] INVALID: imp=${imp.id} ip=${imp.ip} 24h_count=${ipCount} refunded=$${advertiserCharge.toFixed(5)}`);

                    } else {
                        // ── CLEAN ─────────────────────────────────────────────────
                        // 1. Mark impression as CLEAN
                        await prisma.impression.update({
                            where: { id: imp.id },
                            data: { trafficStatus: 'CLEAN' },
                        });

                        // 2. Move publisher pay: pendingBalance → balance
                        if (publisherUser) {
                            await prisma.user.update({
                                where: { id: publisherUser.id },
                                data: {
                                    pendingBalance: { decrement: publisherPay },
                                    balance: { increment: publisherPay },
                                },
                            });
                        }

                        cleaned++;
                    }

                    resolved++;
                } catch (impErr) {
                    console.error(`[FraudAudit] Error processing impression ${imp.id}:`, impErr.message);
                }
            }

            console.log(`✅ Fraud Audit complete. Resolved: ${resolved} | Clean: ${cleaned} | Fraud: ${fraudFound}`);
        } catch (error) {
            console.error('❌ Fraud Audit Cron Failed:', error);
        }
    });

    // ============================================
    // JOB 11: Referral Commission Flush (Every 5 Minutes)
    // Drains the in-memory commission buffer to the database.
    // Commissions are accumulated per-impression in memory and
    // written here in batch to avoid per-row DB writes at ad-serve time.
    // ============================================
    cron.schedule('2-59/5 * * * *', async () => {
        try {
            const { pendingReferrals, bufferedImpressions } = getBufferSize();
            if (pendingReferrals === 0) return; // Nothing to flush

            console.log(`💸 [ReferralFlush] Flushing ${pendingReferrals} referrals (${bufferedImpressions} buffered impressions)...`);
            const { flushed, totalEarned } = await flushCommissions();
            if (flushed > 0) {
                console.log(`✅ [ReferralFlush] Done — ${flushed} referrals credited $${totalEarned.toFixed(6)} total.`);
            }
        } catch (err) {
            console.error('❌ [ReferralFlush] Cron Failed:', err.message);
        }
    });

    console.log('✅ Cron Jobs Scheduled.');
};
