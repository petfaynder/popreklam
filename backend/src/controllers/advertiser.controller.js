import prisma from '../lib/prisma.js'
import { moderationService } from '../services/moderation.service.js';
import { getTierProgress, getMaxCampaignsPerDay, shouldAutoApprove } from '../services/priority.service.js';

// -- Lazy push trigger (Redis optional) --
let _enqueuePush = null;
async function triggerPushDelivery(campaign) {
    try {
        if (!_enqueuePush) {
            const mod = await import('../services/push-delivery.service.js');
            _enqueuePush = mod.enqueuePushCampaign;
        }
        const count = await _enqueuePush(campaign);
        console.log(`[PUSH] Immediate delivery triggered: ${count} jobs for campaign "${campaign.name}"`);
    } catch (err) {
        // Redis not available - cron will pick it up later
        console.warn(`[PUSH] Trigger skipped (Redis unavailable): ${err.message}`);
    }
}

// Get Dashboard Stats
export const getDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        const advertiser = await prisma.advertiser.findUnique({
            where: { userId },
            include: {
                campaigns: true
            }
        });

        if (!advertiser) {
            return res.status(404).json({ message: 'Advertiser profile not found' });
        }

        // Get today's stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const todayImpressions = await prisma.impression.count({
            where: {
                campaign: {
                    advertiserId: advertiser.id
                },
                createdAt: {
                    gte: today
                }
            }
        });

        const yesterdayImpressions = await prisma.impression.count({
            where: {
                campaign: {
                    advertiserId: advertiser.id
                },
                createdAt: {
                    gte: yesterday,
                    lt: today
                }
            }
        });

        const todayClicks = await prisma.impression.count({
            where: {
                campaign: {
                    advertiserId: advertiser.id
                },
                clicked: true,
                createdAt: {
                    gte: today
                }
            }
        });

        const todaySpent = await prisma.impression.aggregate({
            where: {
                campaign: {
                    advertiserId: advertiser.id
                },
                createdAt: {
                    gte: today
                }
            },
            _sum: {
                revenue: true
            }
        });

        const yesterdaySpent = await prisma.impression.aggregate({
            where: {
                campaign: {
                    advertiserId: advertiser.id
                },
                createdAt: {
                    gte: yesterday,
                    lt: today
                }
            },
            _sum: {
                revenue: true
            }
        });

        // Calculate total spending
        const totalSpending = await prisma.impression.aggregate({
            where: {
                campaign: {
                    advertiserId: advertiser.id
                }
            },
            _sum: {
                revenue: true
            }
        });

        const totalImpressions = await prisma.impression.count({
            where: {
                campaign: {
                    advertiserId: advertiser.id
                }
            }
        });

        const totalClicks = await prisma.impression.count({
            where: {
                campaign: {
                    advertiserId: advertiser.id
                },
                clicked: true
            }
        });

        // Calculate changes
        const spendChange = yesterdaySpent._sum.revenue > 0
            ? ((Number(todaySpent._sum.revenue || 0) - Number(yesterdaySpent._sum.revenue)) / Number(yesterdaySpent._sum.revenue) * 100).toFixed(1)
            : 0;

        const impressionsChange = yesterdayImpressions > 0
            ? ((todayImpressions - yesterdayImpressions) / yesterdayImpressions * 100).toFixed(1)
            : 0;

        const todayCTR = todayImpressions > 0
            ? (todayClicks / todayImpressions * 100).toFixed(2)
            : '0.00';

        const averageCTR = totalImpressions > 0
            ? (totalClicks / totalImpressions * 100).toFixed(2)
            : '0.00';

        const averageCPC = totalClicks > 0
            ? (Number(totalSpending._sum.revenue || 0) / totalClicks).toFixed(2)
            : '0.00';

        const averageCPM = totalImpressions > 0
            ? (Number(totalSpending._sum.revenue || 0) / totalImpressions * 1000).toFixed(2)
            : '0.00';

        // Priority tier info
        const tierProgress = await getTierProgress(advertiser.tier, advertiser.monthlySpend);

        // Fetch real user balance
        const userRecord = await prisma.user.findUnique({
            where: { id: userId },
            select: { balance: true }
        });

        res.json({
            balance: Number(userRecord?.balance || 0),
            spending: {
                total: Number(totalSpending._sum.revenue || 0),
                change: Number(spendChange)
            },
            performance: {
                impressions: todayImpressions,
                impressionsChange: Number(impressionsChange),
                clicks: todayClicks,
                ctr: todayCTR
            },
            campaigns: {
                total: advertiser.campaigns.length,
                active: advertiser.campaigns.filter(c => c.status === 'ACTIVE').length
            },
            averageCPC: averageCPC,
            averageCPM: averageCPM,
            averageCTR: averageCTR,
            // Priority System
            priority: {
                tier: advertiser.tier,
                monthlySpend: Number(advertiser.monthlySpend),
                ...tierProgress,
            },
        });
    } catch (error) {
        console.error('Error getting dashboard:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Get All Campaigns
export const getCampaigns = async (req, res) => {
    try {
        const userId = req.user.id;

        const advertiser = await prisma.advertiser.findUnique({
            where: { userId },
            include: {
                campaigns: {
                    where: {
                        status: { in: ['ACTIVE', 'PAUSED', 'PENDING_APPROVAL', 'REJECTED', 'COMPLETED'] },
                        NOT: { name: { startsWith: '[DELETED] ' } }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        if (!advertiser) {
            return res.status(404).json({ message: 'Advertiser not found' });
        }

        // Format campaigns
        const campaigns = advertiser.campaigns.map(campaign => ({
            id: campaign.id,
            name: campaign.name,
            targetUrl: campaign.targetUrl,
            postbackUrl: campaign.postbackUrl,
            adFormat: campaign.adFormat,
            status: campaign.status,
            totalBudget: parseFloat(campaign.totalBudget).toFixed(2),
            dailyBudget: campaign.dailyBudget ? parseFloat(campaign.dailyBudget).toFixed(2) : null,
            totalSpent: parseFloat(campaign.totalSpent).toFixed(2),
            dailySpent: parseFloat(campaign.dailySpent).toFixed(2),
            totalImpressions: campaign.totalImpressions,
            totalClicks: campaign.totalClicks,
            dailyClicks: campaign.dailyClicks,
            totalConversions: campaign.totalConversions,
            bidAmount: parseFloat(campaign.bidAmount).toFixed(4),
            biddingStrategy: campaign.biddingStrategy,
            smartCpmMaxBid: campaign.smartCpmMaxBid ? parseFloat(campaign.smartCpmMaxBid).toFixed(4) : null,
            cpaGoal: campaign.cpaGoal ? parseFloat(campaign.cpaGoal).toFixed(2) : null,
            autoOptimize: campaign.autoOptimize,
            freqCap: campaign.freqCap,
            freqInterval: campaign.freqInterval,
            pacing: campaign.pacing,
            targeting: campaign.targeting,
            // Click limits
            dailyClicksLimit: campaign.dailyClicksLimit,
            totalClicksLimit: campaign.totalClicksLimit,
            // Stats
            ctr: campaign.totalImpressions > 0
                ? ((campaign.totalClicks / campaign.totalImpressions) * 100).toFixed(2)
                : 0,
            cpm: campaign.totalImpressions > 0
                ? ((parseFloat(campaign.totalSpent) / campaign.totalImpressions) * 1000).toFixed(2)
                : 0,
            rejectionReason: campaign.rejectionReason,
            createdAt: campaign.createdAt,
            updatedAt: campaign.updatedAt,
        }));

        res.json(campaigns);
    } catch (error) {
        console.error('Error getting campaigns:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create Campaign
export const createCampaign = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            name, targetUrl, adFormat, totalBudget, dailyBudget, bidAmount,
            cpaGoal, autoOptimize, targeting, creatives, freqCap, freqInterval,
            postbackUrl, pacing, schedule,
            // SmartCPM
            biddingStrategy, smartCpmMaxBid,
            // Audience
            audienceInclude, audienceExclude, feedAudienceIds,
            // Click Limits
            dailyClicksLimit, totalClicksLimit,
            // Push Notification creative fields
            pushTitle, pushBody, pushIcon, pushImage,
            // Traffic Type
            trafficType,
        } = req.body;

        // Validate required fields
        if (!name || !targetUrl || !adFormat || !totalBudget || !bidAmount) {
            return res.status(400).json({
                message: 'Name, target URL, ad format, total budget and bid amount are required'
            });
        }

        // SmartCPM validation
        const resolvedStrategy = biddingStrategy || 'CPM';
        if (resolvedStrategy === 'SMART_CPM' && (!smartCpmMaxBid || parseFloat(smartCpmMaxBid) <= 0)) {
            return res.status(400).json({ message: 'SmartCPM requires a valid maximum CPM bid' });
        }

        // Validate creatives for non-popunder formats
        if (adFormat !== 'POPUNDER' && adFormat !== 'DIRECT_LINK') {
            if (!creatives || !creatives.title) {
                return res.status(400).json({
                    message: 'Creative title is required for this ad format'
                });
            }
        }

        const advertiser = await prisma.advertiser.findUnique({
            where: { userId }
        });

        if (!advertiser) {
            return res.status(404).json({ message: 'Advertiser not found' });
        }

        // Check if user has sufficient balance
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (parseFloat(user.balance) < parseFloat(totalBudget)) {
            return res.status(400).json({
                message: `Insufficient balance. Your balance is $${parseFloat(user.balance).toFixed(2)}, but campaign requires $${parseFloat(totalBudget).toFixed(2)}. Please add funds first.`
            });
        }

        // â”€â”€ GEO FLOOR ENFORCEMENT â”€â”€
        // For SmartCPM: max bid ceiling must exceed floor (system bids lower, but ceiling must allow it)
        const bidForFloorCheck = (resolvedStrategy === 'SMART_CPM' && smartCpmMaxBid)
            ? parseFloat(smartCpmMaxBid)
            : parseFloat(bidAmount);

        if (targeting?.countries && Array.isArray(targeting.countries) && targeting.countries.length > 0) {
            const floors = await prisma.geoFloor.findMany({
                where: {
                    adFormat,
                    countryCode: { in: targeting.countries.map(c => c.toUpperCase()) }
                }
            });

            const violatedFloors = floors.filter(f => bidForFloorCheck < parseFloat(f.minBid));
            if (violatedFloors.length > 0) {
                const msgs = violatedFloors.map(f => `${f.countryCode} (min $${parseFloat(f.minBid).toFixed(4)})`).join(', ');
                return res.status(400).json({
                    message: `Bid amount $${bidForFloorCheck.toFixed(4)} is below the minimum floor for targeted countries: ${msgs}`
                });
            }
        }


        // â”€â”€ TIER: Daily Campaign Limit â”€â”€
        const dailyLimit = await getMaxCampaignsPerDay(advertiser.tier);
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const campaignsCreatedToday = await prisma.campaign.count({
            where: {
                advertiserId: advertiser.id,
                createdAt: { gte: todayStart },
            },
        });
        if (campaignsCreatedToday >= dailyLimit) {
            return res.status(429).json({
                message: `Daily campaign creation limit reached (${dailyLimit}/day for ${advertiser.tier} tier). Upgrade your tier to create more campaigns.`,
            });
        }

        // â”€â”€ AI CAMPAIGN MODERATION â”€â”€
        let campaignStatus = 'PENDING_APPROVAL';
        let rejectionReason = null;

        const moderationResult = await moderationService.analyzeCampaign(
            targetUrl,
            creatives?.title || '',
            creatives?.description || ''
        );

        if (moderationResult.action === 'REJECT') {
            campaignStatus = 'REJECTED';
            rejectionReason = moderationResult.reason;
        }

        // â”€â”€ TIER: Auto-Approve (ELITE/VIP) â”€â”€
        if (campaignStatus === 'PENDING_APPROVAL') {
            const autoApprove = await shouldAutoApprove(advertiser.tier, moderationResult);
            if (autoApprove) {
                campaignStatus = 'ACTIVE';
            }
        }

        // Build final targeting object (merge audience config into targeting)
        const finalTargeting = {
            ...(targeting || {}),
            audiences: {
                include: Array.isArray(audienceInclude) ? audienceInclude : [],
                exclude: Array.isArray(audienceExclude) ? audienceExclude : [],
            },
            feedAudienceIds: Array.isArray(feedAudienceIds) ? feedAudienceIds : [],
        };

        // Use transaction to create campaign + creatives atomically
        const campaign = await prisma.$transaction(async (tx) => {
            const newCampaign = await tx.campaign.create({
                data: {
                    advertiserId: advertiser.id,
                    name,
                    targetUrl,
                    adFormat,
                    totalBudget: parseFloat(totalBudget),
                    dailyBudget: dailyBudget ? parseFloat(dailyBudget) : null,
                    bidAmount: parseFloat(bidAmount),
                    biddingStrategy: resolvedStrategy,
                    smartCpmMaxBid: resolvedStrategy === 'SMART_CPM' ? parseFloat(smartCpmMaxBid) : null,
                    cpaGoal: cpaGoal ? parseFloat(cpaGoal) : null,
                    autoOptimize: autoOptimize ? Boolean(autoOptimize) : false,
                    freqCap: freqCap ? parseInt(freqCap) : 3,
                    freqInterval: freqInterval ? parseInt(freqInterval) : 24,
                    pacing: (pacing || 'EVEN').toUpperCase(),
                    postbackUrl: postbackUrl || null,
                    schedule: schedule || null,
                    targeting: finalTargeting,
                    status: campaignStatus,
                    rejectionReason: rejectionReason,
                    dailyClicksLimit: dailyClicksLimit ? parseInt(dailyClicksLimit) : null,
                    totalClicksLimit: totalClicksLimit ? parseInt(totalClicksLimit) : null,
                    // Push notification fields
                    pushTitle: adFormat === 'PUSH_NOTIFICATION' ? (pushTitle || null) : null,
                    pushBody: adFormat === 'PUSH_NOTIFICATION' ? (pushBody || null) : null,
                    pushIcon: adFormat === 'PUSH_NOTIFICATION' ? (pushIcon || null) : null,
                    pushImage: adFormat === 'PUSH_NOTIFICATION' ? (pushImage || null) : null,
                }
            });

            // Create creative(s) for non-popunder formats
            if (creatives && adFormat !== 'POPUNDER' && adFormat !== 'DIRECT_LINK') {
                if (Array.isArray(creatives)) {
                    // A/B Testing: create multiple creatives with weights
                    for (const c of creatives) {
                        await tx.creative.create({
                            data: {
                                campaignId: newCampaign.id,
                                type: adFormat,
                                label: c.label || null,
                                weight: c.weight || 1,
                                title: c.title || null,
                                description: c.description || null,
                                iconUrl: c.icon || null,
                                imageUrl: c.image || null,
                            }
                        });
                    }
                } else {
                    // Single creative (legacy format)
                    await tx.creative.create({
                        data: {
                            campaignId: newCampaign.id,
                            type: adFormat,
                            title: creatives.title || null,
                            description: creatives.description || null,
                            iconUrl: creatives.icon || null,
                            imageUrl: creatives.image || null,
                        }
                    });
                }
            }

            return newCampaign;
        });

        // Return campaign with creatives
        const campaignWithCreatives = await prisma.campaign.findUnique({
            where: { id: campaign.id },
            include: { creatives: true }
        });

        res.status(201).json(campaignWithCreatives);
    } catch (error) {
        console.error('Error creating campaign:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Update Campaign
export const updateCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name, targetUrl, dailyBudget, totalBudget, bidAmount, cpaGoal,
            autoOptimize, status, targeting, pacing, postbackUrl, schedule,
            freqCap, freqInterval,
            // SmartCPM
            biddingStrategy, smartCpmMaxBid,
            // Audience
            audienceInclude, audienceExclude, feedAudienceIds,
            // Click Limits
            dailyClicksLimit, totalClicksLimit
        } = req.body;
        const userId = req.user.id;

        const advertiser = await prisma.advertiser.findUnique({
            where: { userId }
        });

        if (!advertiser) {
            return res.status(404).json({ message: 'Advertiser not found' });
        }

        // Check if campaign belongs to advertiser
        const campaign = await prisma.campaign.findFirst({
            where: {
                id,
                advertiserId: advertiser.id
            }
        });

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        // â”€â”€ GEO FLOOR ENFORCEMENT â”€â”€
        const checkTargeting = targeting || campaign.targeting;
        const checkFormat = campaign.adFormat;

        // For SmartCPM: floor validation is against smartCpmMaxBid (the max the advertiser will pay)
        const incomingStrategy = biddingStrategy || campaign.biddingStrategy;
        const incomingMaxBid = smartCpmMaxBid !== undefined ? parseFloat(smartCpmMaxBid) : null;
        const incomingBidAmount = bidAmount !== undefined ? parseFloat(bidAmount) : parseFloat(campaign.bidAmount);
        const checkBid = (incomingStrategy === 'SMART_CPM' && incomingMaxBid)
            ? incomingMaxBid
            : incomingBidAmount;

        if (checkTargeting?.countries && Array.isArray(checkTargeting.countries) && checkTargeting.countries.length > 0) {
            const floors = await prisma.geoFloor.findMany({
                where: {
                    adFormat: checkFormat,
                    countryCode: { in: checkTargeting.countries.map(c => c.toUpperCase()) }
                }
            });

            const violatedFloors = floors.filter(f => checkBid < parseFloat(f.minBid));
            if (violatedFloors.length > 0) {
                const msgs = violatedFloors.map(f => `${f.countryCode} (min $${parseFloat(f.minBid).toFixed(4)})`).join(', ');
                return res.status(400).json({
                    message: `Bid amount $${checkBid.toFixed(4)} is below the minimum floor for targeted countries: ${msgs}`
                });
            }
        }


        // â”€â”€ AI CAMPAIGN MODERATION ON UPDATE â”€â”€
        // AI CAMPAIGN MODERATION ON UPDATE
        let newStatus = status; // Keep user requested status by default
        let rejectionReason = campaign.rejectionReason;

        // If targetUrl changed, always re-moderate and force admin re-review.
        // This prevents advertisers from silently changing the destination of an approved campaign.
        if (targetUrl && targetUrl !== campaign.targetUrl) {
            const moderationResult = await moderationService.analyzeCampaign(targetUrl, campaign.name, '');
            if (moderationResult.action === 'REJECT') {
                // AI flagged the new URL - reject immediately
                newStatus = 'REJECTED';
                rejectionReason = moderationResult.reason;
            } else {
                // URL is clean but must go back to manual admin review regardless of current status
                newStatus = 'PENDING_APPROVAL';
                rejectionReason = null;
            }
        }
        // Build merged targeting
        const baseTargeting = targeting || campaign.targeting || {};
        const finalTargeting = {
            ...baseTargeting,
            audiences: {
                include: Array.isArray(audienceInclude) ? audienceInclude
                    : (baseTargeting.audiences?.include || []),
                exclude: Array.isArray(audienceExclude) ? audienceExclude
                    : (baseTargeting.audiences?.exclude || []),
            },
            feedAudienceIds: Array.isArray(feedAudienceIds) ? feedAudienceIds
                : (baseTargeting.feedAudienceIds || []),
        };

        const resolvedStrategy = biddingStrategy || campaign.biddingStrategy;

        const updatedCampaign = await prisma.campaign.update({
            where: { id },
            data: {
                name,
                targetUrl,
                dailyBudget: dailyBudget ? parseFloat(dailyBudget) : null,
                totalBudget: totalBudget ? parseFloat(totalBudget) : undefined,
                bidAmount: bidAmount ? parseFloat(bidAmount) : undefined,
                biddingStrategy: resolvedStrategy,
                smartCpmMaxBid: resolvedStrategy === 'SMART_CPM'
                    ? (smartCpmMaxBid ? parseFloat(smartCpmMaxBid) : parseFloat(bidAmount || campaign.bidAmount))
                    : null,
                cpaGoal: cpaGoal !== undefined ? (cpaGoal ? parseFloat(cpaGoal) : null) : undefined,
                autoOptimize: autoOptimize !== undefined ? Boolean(autoOptimize) : undefined,
                freqCap: freqCap !== undefined ? parseInt(freqCap) : undefined,
                freqInterval: freqInterval !== undefined ? parseInt(freqInterval) : undefined,
                pacing: pacing !== undefined ? pacing.toUpperCase() : undefined,
                postbackUrl: postbackUrl !== undefined ? (postbackUrl || null) : undefined,
                schedule: schedule !== undefined ? schedule : undefined,
                status: newStatus,
                rejectionReason: rejectionReason,
                targeting: finalTargeting,
                dailyClicksLimit: dailyClicksLimit !== undefined ? (dailyClicksLimit ? parseInt(dailyClicksLimit) : null) : undefined,
                totalClicksLimit: totalClicksLimit !== undefined ? (totalClicksLimit ? parseInt(totalClicksLimit) : null) : undefined,
            }
        });

        res.json(updatedCampaign);
    } catch (error) {
        console.error('Error updating campaign:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete Campaign
export const deleteCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const advertiser = await prisma.advertiser.findUnique({
            where: { userId }
        });

        if (!advertiser) {
            return res.status(404).json({ message: 'Advertiser not found' });
        }

        // Check if campaign belongs to advertiser
        const campaign = await prisma.campaign.findFirst({
            where: {
                id,
                advertiserId: advertiser.id
            }
        });

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        // Soft delete � preserve impression history
        await prisma.campaign.update({
            where: { id },
            data: { status: 'DELETED' }
        });

        res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
        console.error('Error deleting campaign:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Billing History
export const getBilling = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        const advertiser = await prisma.advertiser.findUnique({
            where: { userId }
        });

        const transactions = await prisma.transaction.findMany({
            where: {
                userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Calculate stats
        const totalSpent = await prisma.campaign.aggregate({
            where: { advertiserId: advertiser.id },
            _sum: { totalSpent: true }
        });

        const totalDeposited = transactions
            .filter(t => t.type === 'DEPOSIT' && t.status === 'COMPLETED')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        res.json({
            stats: {
                balance: parseFloat(user.balance),
                totalSpent: parseFloat(totalSpent._sum.totalSpent || 0),
                totalDeposited
            },
            transactions
        });
    } catch (error) {
        console.error('Error getting billing:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add Funds
export const addFunds = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, method } = req.body;

        if (!amount || parseFloat(amount) < 100) {
            return res.status(400).json({ message: 'Minimum deposit is $100' });
        }

        // Create deposit transaction
        const transaction = await prisma.transaction.create({
            data: {
                userId,
                type: 'DEPOSIT',
                status: 'COMPLETED', // In real app, would be PENDING until payment confirmation
                amount: parseFloat(amount),
                description: `Deposit via ${method}`,
                metadata: { method },
                completedAt: new Date()
            }
        });

        // Add to balance
        await prisma.user.update({
            where: { id: userId },
            data: {
                balance: {
                    increment: parseFloat(amount)
                }
            }
        });

        // Update advertiser stats
        await prisma.advertiser.update({
            where: { userId },
            data: {
                totalDeposit: {
                    increment: parseFloat(amount)
                }
            }
        });

        res.status(201).json(transaction);
    } catch (error) {
        console.error('Error adding funds:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Pause Campaign
export const pauseCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const advertiser = await prisma.advertiser.findUnique({ where: { userId } });
        if (!advertiser) return res.status(404).json({ message: 'Advertiser not found' });

        const campaign = await prisma.campaign.findFirst({ where: { id, advertiserId: advertiser.id } });
        if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
        if (campaign.status !== 'ACTIVE') return res.status(400).json({ message: 'Campaign is not active' });

        const updated = await prisma.campaign.update({ where: { id }, data: { status: 'PAUSED' } });
        res.json(updated);
    } catch (error) {
        console.error('pauseCampaign error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Resume Campaign + Immediate Push Trigger
export const resumeCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const advertiser = await prisma.advertiser.findUnique({ where: { userId } });
        if (!advertiser) return res.status(404).json({ message: 'Advertiser not found' });

        const campaign = await prisma.campaign.findFirst({
            where: { id, advertiserId: advertiser.id },
            include: { advertiser: true }
        });
        if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
        if (campaign.status !== 'PAUSED') return res.status(400).json({ message: 'Campaign is not paused' });

        if (parseFloat(campaign.totalSpent) >= parseFloat(campaign.totalBudget)) {
            return res.status(400).json({ message: 'Campaign budget exhausted. Please add budget first.' });
        }

        const updated = await prisma.campaign.update({ where: { id }, data: { status: 'ACTIVE' } });

        // Immediately fire push delivery - no 15-min cron delay
        if (campaign.adFormat === 'PUSH_NOTIFICATION') {
            triggerPushDelivery({ ...updated, advertiser: campaign.advertiser });
        }

        res.json(updated);
    } catch (error) {
        console.error('resumeCampaign error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Statistics
export const getStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate } = req.query;

        const advertiser = await prisma.advertiser.findUnique({ where: { userId } });
        if (!advertiser) return res.status(404).json({ message: 'Advertiser not found' });

        const dateFilter = startDate && endDate
            ? { createdAt: { gte: new Date(startDate), lte: new Date(endDate) } }
            : {};

        const campaigns = await prisma.campaign.findMany({
            where: { advertiserId: advertiser.id, status: { in: ['ACTIVE', 'PAUSED', 'PENDING_APPROVAL', 'REJECTED', 'COMPLETED'] } },
            select: { id: true, name: true }
        });

        let totalImpressions = 0, totalClicks = 0, totalSpent = 0;
        const byCampaign = await Promise.all(campaigns.map(async (campaign) => {
            const where = { campaignId: campaign.id, ...dateFilter };
            const [impCount, clickCount, spentSum] = await Promise.all([
                prisma.impression.count({ where }),
                prisma.impression.count({ where: { ...where, clicked: true } }),
                prisma.impression.aggregate({ where, _sum: { revenue: true } })
            ]);
            const spent = Number(spentSum._sum.revenue || 0);
            totalImpressions += impCount;
            totalClicks += clickCount;
            totalSpent += spent;
            return {
                campaignName: campaign.name,
                impressions: impCount,
                clicks: clickCount,
                spent: spent.toFixed(2),
                ctr: impCount > 0 ? ((clickCount / impCount) * 100).toFixed(2) : '0.00'
            };
        }));

        res.json({
            impressions: totalImpressions,
            clicks: totalClicks,
            spent: totalSpent.toFixed(2),
            ctr: totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00',
            byCampaign
        });
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Bid Recommendation
export const getBidRecommendation = async (req, res) => {
    try {
        const { countries, format } = req.query;

        const DEFAULT_BIDS = {
            POPUNDER: { min: 0.5, recommended: 1.0 },
            IN_PAGE_PUSH: { min: 0.3, recommended: 0.6 },
            NATIVE: { min: 0.2, recommended: 0.5 },
        };

        const adFormat = format || 'POPUNDER';
        const defaults = DEFAULT_BIDS[adFormat] || DEFAULT_BIDS.POPUNDER;

        if (!countries || countries === '') {
            return res.json({
                minBid: defaults.min.toFixed(4),
                recommendedBid: defaults.recommended.toFixed(4),
                competition: 'MEDIUM',
                details: [],
            });
        }

        const countryList = countries.split(',').map(c => c.trim().toUpperCase());

        const floors = await prisma.geoFloor.findMany({
            where: { adFormat, countryCode: { in: countryList } },
        });

        if (floors.length === 0) {
            return res.json({
                minBid: defaults.min.toFixed(4),
                recommendedBid: defaults.recommended.toFixed(4),
                competition: 'LOW',
                details: [],
            });
        }

        const maxMinBid = Math.max(...floors.map(f => parseFloat(f.minBid)));
        const recommendedBid = +(maxMinBid * 1.2).toFixed(4);

        const activeCampaigns = await prisma.campaign.count({
            where: { status: 'ACTIVE', adFormat },
        });

        let competition = 'LOW';
        if (activeCampaigns > 20) competition = 'HIGH';
        else if (activeCampaigns > 5) competition = 'MEDIUM';

        const details = floors.map(f => ({
            country: f.countryCode,
            minBid: parseFloat(f.minBid).toFixed(4),
        }));

        res.json({ minBid: maxMinBid.toFixed(4), recommendedBid: recommendedBid.toFixed(4), competition, details });
    } catch (error) {
        console.error('Error getting bid recommendation:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
