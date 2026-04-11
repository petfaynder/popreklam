import prisma from '../lib/prisma.js';
import { getVapidPublicKey } from '../services/vapid.service.js';


// ── Helper: parse user-agent ──────────────────────────────────────────────
const parseDevice = (ua = '') => {
    if (/android|iphone|ipad|mobile/i.test(ua)) return 'mobile';
    if (/tablet|ipad/i.test(ua)) return 'tablet';
    return 'desktop';
};

const parseOS = (ua = '') => {
    if (/windows/i.test(ua)) return 'Windows';
    if (/macintosh|mac os x/i.test(ua)) return 'MacOS';
    if (/linux/i.test(ua)) return 'Linux';
    if (/android/i.test(ua)) return 'Android';
    if (/iphone|ipad/i.test(ua)) return 'iOS';
    return 'Unknown';
};

const parseBrowser = (ua = '') => {
    if (/chrome/i.test(ua) && !/edge|opr/i.test(ua)) return 'Chrome';
    if (/firefox/i.test(ua)) return 'Firefox';
    if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
    if (/edge/i.test(ua)) return 'Edge';
    if (/opr|opera/i.test(ua)) return 'Opera';
    return 'Other';
};

// ── GET /api/push/vapid-public-key ─────────────────────────────────────────
export const getPublicKey = async (req, res) => {
    try {
        const publicKey = await getVapidPublicKey();
        if (!publicKey) return res.status(503).json({ error: 'Push not configured' });
        res.json({ publicKey });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get VAPID key' });
    }
};

// ── POST /api/push/subscribe ──────────────────────────────────────────────
// Accepts either a zoneId (PUSH_NOTIFICATION zone) or a siteId directly
export const subscribe = async (req, res) => {
    try {
        const { zoneId, siteId: directSiteId, subscription } = req.body;

        if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
            return res.status(400).json({ error: 'Invalid subscription data' });
        }
        if (!zoneId && !directSiteId) {
            return res.status(400).json({ error: 'zoneId or siteId required' });
        }

        let resolvedSiteId = directSiteId;

        // If zoneId provided, look up zone and validate type
        if (zoneId && !directSiteId) {
            const zone = await prisma.zone.findUnique({
                where: { id: zoneId },
                include: { site: true }
            });
            if (!zone) return res.status(404).json({ error: 'Zone not found' });
            if (zone.type !== 'PUSH_NOTIFICATION') {
                return res.status(400).json({ error: 'Zone is not a push notification zone' });
            }
            resolvedSiteId = zone.siteId;
        }

        // Verify site exists and is active
        const site = await prisma.site.findFirst({
            where: { id: resolvedSiteId, status: 'ACTIVE' }
        });
        if (!site) return res.status(404).json({ error: 'Active site not found' });

        // Parse subscriber info from request
        const ua = req.headers['user-agent'] || '';
        const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || '';
        const country = req.headers['cf-ipcountry'] || req.headers['x-country-code'] || null;
        const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0] || null;

        // Upsert subscription (MySQL TEXT can't be unique, so findFirst + create/update)
        const existing = await prisma.pushSubscription.findFirst({
            where: { siteId: resolvedSiteId, endpoint: subscription.endpoint }
        });

        if (existing) {
            await prisma.pushSubscription.update({
                where: { id: existing.id },
                data: {
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth,
                    isActive: true,
                    failCount: 0,
                }
            });
        } else {
            await prisma.pushSubscription.create({
                data: {
                    siteId: resolvedSiteId,
                    endpoint: subscription.endpoint,
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth,
                    ip: ip.substring(0, 45),
                    country: country?.substring(0, 2) || null,
                    device: parseDevice(ua),
                    os: parseOS(ua),
                    browser: parseBrowser(ua),
                    language: language?.substring(0, 10) || null,
                }
            });
        }

        // ✅ Immediately trigger active push campaigns for this new subscriber
        // (fire-and-forget — don't block the subscription response)
        if (!existing) {
            setImmediate(async () => {
                try {
                    const { enqueuePushCampaign } = await import('../services/push-delivery.service.js');
                    const activeCampaigns = await prisma.campaign.findMany({
                        where: { status: 'ACTIVE', adFormat: 'PUSH_NOTIFICATION' },
                        include: { advertiser: true }
                    });
                    for (const campaign of activeCampaigns) {
                        await enqueuePushCampaign(campaign).catch(() => {});
                    }
                    if (activeCampaigns.length > 0) {
                        console.log(`🔔 New subscriber — triggered ${activeCampaigns.length} active push campaigns`);
                    }
                } catch (e) {
                    // Redis not available — cron will handle it
                }
            });
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Push subscribe error:', err);
        res.status(500).json({ error: 'Subscription failed' });
    }
};

// ── DELETE /api/push/unsubscribe ──────────────────────────────────────────
export const unsubscribe = async (req, res) => {
    try {
        const { endpoint } = req.body;
        if (!endpoint) return res.status(400).json({ error: 'Endpoint required' });

        await prisma.pushSubscription.updateMany({
            where: { endpoint },
            data: { isActive: false }
        });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Unsubscribe failed' });
    }
};

// ── POST /api/push/click/:deliveryId ─────────────────────────────────────
export const trackClick = async (req, res) => {
    try {
        const { deliveryId } = req.params;

        const delivery = await prisma.pushDelivery.findUnique({
            where: { id: deliveryId },
            include: { campaign: true }
        });

        if (!delivery) return res.status(404).json({ error: 'Delivery not found' });
        if (delivery.status === 'CLICKED') return res.json({ success: true }); // Already tracked

        // Revenue = bid / 1000 (CPC-style for push; 1 push click = 1 CPM impression equivalent)
        const bidAmount = Number(delivery.campaign.bidAmount || 2.0);
        const revenue = bidAmount / 1000;

        await prisma.pushDelivery.update({
            where: { id: deliveryId },
            data: {
                status: 'CLICKED',
                clickedAt: new Date(),
                revenue: revenue,
            }
        });

        // Update campaign click counters + spent
        await prisma.campaign.update({
            where: { id: delivery.campaignId },
            data: {
                totalClicks: { increment: 1 },
                dailyClicks: { increment: 1 },
                totalSpent: { increment: revenue },
            }
        });

        // Redirect to campaign target URL (with tracking)
        const targetUrl = delivery.campaign.targetUrl;
        if (req.accepts('html') && targetUrl) {
            return res.redirect(302, targetUrl);
        }
        res.json({ success: true, redirect: targetUrl });
    } catch (err) {
        console.error('Push click tracking error:', err);
        res.status(500).json({ error: 'Click tracking failed' });
    }
};

// ── GET /api/push/stats/:siteId ─── Publisher stats for a specific site ──
export const getPushStats = async (req, res) => {
    try {
        const { siteId } = req.params;
        const userId = req.user.id;
        const days = parseInt(req.query.days) || 30;

        // Verify site belongs to publisher
        const site = await prisma.site.findFirst({
            where: { id: siteId, publisher: { userId } }
        });
        if (!site) return res.status(404).json({ error: 'Site not found' });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - days);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const [totalSubscribers, activeSubscribers, recentDeliveries, recentClicks] = await Promise.all([
            prisma.pushSubscription.count({ where: { siteId } }),
            prisma.pushSubscription.count({ where: { siteId, isActive: true } }),
            prisma.pushDelivery.aggregate({
                where: { subscription: { siteId }, createdAt: { gte: thirtyDaysAgo } },
                _count: { id: true }
            }),
            prisma.pushDelivery.aggregate({
                where: { subscription: { siteId }, status: 'CLICKED', createdAt: { gte: thirtyDaysAgo } },
                _count: { id: true },
                _sum: { revenue: true }
            }),
        ]);

        const totalDeliveries = recentDeliveries._count.id;
        const totalClicks = recentClicks._count.id;

        // Daily subscriber growth — use raw SQL DATE() to group by calendar day
        const dailyGrowthRaw = await prisma.$queryRaw`
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM push_subscriptions
            WHERE site_id = ${siteId}
              AND created_at >= ${thirtyDaysAgo}
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `;

        // Daily deliveries
        const dailyDeliveriesRaw = await prisma.$queryRaw`
            SELECT DATE(pd.created_at) as date,
                   COUNT(*) as delivered,
                   SUM(CASE WHEN pd.status = 'CLICKED' THEN 1 ELSE 0 END) as clicks,
                   COALESCE(SUM(CASE WHEN pd.status = 'CLICKED' THEN pd.revenue ELSE 0 END), 0) as revenue
            FROM push_deliveries pd
            JOIN push_subscriptions ps ON ps.id = pd.subscription_id
            WHERE ps.site_id = ${siteId}
              AND pd.created_at >= ${thirtyDaysAgo}
            GROUP BY DATE(pd.created_at)
            ORDER BY date ASC
        `;

        // Browser breakdown
        const browserBreakdown = await prisma.pushSubscription.groupBy({
            by: ['browser'],
            where: { siteId, isActive: true },
            _count: { id: true },
        });

        // Device breakdown
        const deviceBreakdown = await prisma.pushSubscription.groupBy({
            by: ['device'],
            where: { siteId, isActive: true },
            _count: { id: true },
        });

        res.json({
            totalSubscribers,
            activeSubscribers,
            churnRate: totalSubscribers > 0
                ? (((totalSubscribers - activeSubscribers) / totalSubscribers) * 100).toFixed(1)
                : '0.0',
            deliveries30d: totalDeliveries,
            clicks30d: totalClicks,
            ctr: totalDeliveries > 0 ? ((totalClicks / totalDeliveries) * 100).toFixed(2) : '0.00',
            revenue30d: parseFloat(recentClicks._sum.revenue || 0).toFixed(4),
            dailyGrowth: dailyGrowthRaw.map(r => ({
                date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date,
                count: Number(r.count)
            })),
            dailyDeliveries: dailyDeliveriesRaw.map(r => ({
                date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date,
                delivered: Number(r.delivered),
                clicks: Number(r.clicks),
                revenue: parseFloat(r.revenue || 0)
            })),
            browserBreakdown: browserBreakdown.map(b => ({ browser: b.browser || 'Other', count: b._count.id })),
            deviceBreakdown: deviceBreakdown.map(d => ({ device: d.device || 'Unknown', count: d._count.id })),
        });
    } catch (err) {
        console.error('Push stats error:', err);
        res.status(500).json({ error: 'Stats fetch failed' });
    }
};

// ── GET /api/push/publisher/overview ─── All push stats for publisher ─────
export const getPublisherPushOverview = async (req, res) => {
    try {
        const userId = req.user.id;
        const days = parseInt(req.query.days) || 30;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        // Get all sites for this publisher
        const publisher = await prisma.publisher.findUnique({
            where: { userId },
            include: { sites: { select: { id: true, name: true, url: true } } }
        });
        if (!publisher) return res.status(404).json({ error: 'Publisher not found' });

        const siteIds = publisher.sites.map(s => s.id);

        if (siteIds.length === 0) {
            return res.json({
                totalSubscribers: 0, activeSubscribers: 0,
                totalDeliveries: 0, totalClicks: 0,
                totalRevenue: 0, ctr: '0.00',
                perSite: [], dailyGrowth: [], dailyDeliveries: []
            });
        }

        const [totalSubs, activeSubs, deliveries, clicks] = await Promise.all([
            prisma.pushSubscription.count({ where: { siteId: { in: siteIds } } }),
            prisma.pushSubscription.count({ where: { siteId: { in: siteIds }, isActive: true } }),
            prisma.pushDelivery.aggregate({
                where: { subscription: { siteId: { in: siteIds } }, createdAt: { gte: cutoff } },
                _count: { id: true }
            }),
            prisma.pushDelivery.aggregate({
                where: { subscription: { siteId: { in: siteIds } }, status: 'CLICKED', createdAt: { gte: cutoff } },
                _count: { id: true },
                _sum: { revenue: true }
            }),
        ]);

        // Per-site breakdown
        const perSite = await Promise.all(publisher.sites.map(async (site) => {
            const [subs, siteDel, siteClicks] = await Promise.all([
                prisma.pushSubscription.count({ where: { siteId: site.id, isActive: true } }),
                prisma.pushDelivery.aggregate({
                    where: { subscription: { siteId: site.id }, createdAt: { gte: cutoff } },
                    _count: { id: true }
                }),
                prisma.pushDelivery.aggregate({
                    where: { subscription: { siteId: site.id }, status: 'CLICKED', createdAt: { gte: cutoff } },
                    _count: { id: true },
                    _sum: { revenue: true }
                }),
            ]);
            const delivered = siteDel._count.id;
            const clicked = siteClicks._count.id;
            return {
                siteId: site.id,
                siteName: site.name,
                siteUrl: site.url,
                subscribers: subs,
                delivered,
                clicks: clicked,
                ctr: delivered > 0 ? ((clicked / delivered) * 100).toFixed(2) : '0.00',
                revenue: parseFloat(siteClicks._sum.revenue || 0).toFixed(4),
            };
        }));

        // Overall daily growth
        const dailyGrowthRaw = await prisma.$queryRaw`
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM push_subscriptions
            WHERE site_id IN (${siteIds.join(',')})
              AND created_at >= ${cutoff}
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `;

        const dailyDeliveriesRaw = await prisma.$queryRaw`
            SELECT DATE(pd.created_at) as date,
                   COUNT(*) as delivered,
                   SUM(CASE WHEN pd.status = 'CLICKED' THEN 1 ELSE 0 END) as clicks,
                   COALESCE(SUM(CASE WHEN pd.status = 'CLICKED' THEN pd.revenue ELSE 0 END), 0) as revenue
            FROM push_deliveries pd
            JOIN push_subscriptions ps ON ps.id = pd.subscription_id
            WHERE ps.site_id IN (${siteIds.join(',')})
              AND pd.created_at >= ${cutoff}
            GROUP BY DATE(pd.created_at)
            ORDER BY date ASC
        `;

        res.json({
            totalSubscribers: totalSubs,
            activeSubscribers: activeSubs,
            totalDeliveries: deliveries._count.id,
            totalClicks: clicks._count.id,
            totalRevenue: parseFloat(clicks._sum.revenue || 0).toFixed(4),
            ctr: deliveries._count.id > 0 ? ((clicks._count.id / deliveries._count.id) * 100).toFixed(2) : '0.00',
            perSite,
            dailyGrowth: dailyGrowthRaw.map(r => ({
                date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date,
                count: Number(r.count)
            })),
            dailyDeliveries: dailyDeliveriesRaw.map(r => ({
                date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date,
                delivered: Number(r.delivered),
                clicks: Number(r.clicks),
                revenue: parseFloat(r.revenue || 0)
            })),
        });
    } catch (err) {
        console.error('Publisher push overview error:', err);
        res.status(500).json({ error: 'Overview fetch failed' });
    }
};

// ── GET /api/push/advertiser/stats ─── Campaign-level push analytics ──────
export const getAdvertiserPushStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const campaignId = req.query.campaignId || null;

        // Support both startDate/endDate AND legacy days param
        let cutoff, endDate;
        if (req.query.startDate && req.query.endDate) {
            cutoff = new Date(req.query.startDate);
            endDate = new Date(req.query.endDate + 'T23:59:59Z');
        } else {
            const days = parseInt(req.query.days) || 30;
            cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - days);
            cutoff.setHours(0, 0, 0, 0);
            endDate = new Date();
        }

        const advertiser = await prisma.advertiser.findUnique({ where: { userId } });
        if (!advertiser) return res.status(404).json({ error: 'Advertiser not found' });

        // Base filter: all PUSH_NOTIFICATION campaigns for this advertiser
        const campaignFilter = {
            advertiserId: advertiser.id,
            adFormat: 'PUSH_NOTIFICATION',
            ...(campaignId ? { id: campaignId } : {}),
        };

        const campaigns = await prisma.campaign.findMany({
            where: campaignFilter,
            select: {
                id: true, name: true, status: true, totalBudget: true,
                totalSpent: true, totalClicks: true, totalImpressions: true,
                bidAmount: true, pushTitle: true, pushBody: true,
                dailyClicksLimit: true, totalClicksLimit: true,
                createdAt: true,
            }
        });

        const campIds = campaigns.map(c => c.id);

        if (campIds.length === 0) {
            return res.json({
                campaigns: [],
                summary: { totalDeliveries: 0, totalClicks: 0, totalRevenue: 0, ctr: '0.00', avgCpc: '0.000' },
                dailyDeliveries: [],
                deviceBreakdown: [],
                countryBreakdown: [],
            });
        }

        // Summary aggregates over period
        const [delAgg, clickAgg] = await Promise.all([
            prisma.pushDelivery.aggregate({
                where: { campaignId: { in: campIds }, createdAt: { gte: cutoff, lte: endDate } },
                _count: { id: true }
            }),
            prisma.pushDelivery.aggregate({
                where: { campaignId: { in: campIds }, status: 'CLICKED', createdAt: { gte: cutoff, lte: endDate } },
                _count: { id: true },
                _sum: { revenue: true }
            }),
        ]);

        const totalDeliveries = delAgg._count.id;
        const totalClicks = clickAgg._count.id;
        const totalRevenue = parseFloat(clickAgg._sum.revenue || 0);

        // Daily trend
        const dailyRaw = await prisma.$queryRawUnsafe(`
            SELECT DATE(created_at) as date,
                   COUNT(*) as delivered,
                   SUM(CASE WHEN status = 'CLICKED' THEN 1 ELSE 0 END) as clicks,
                   COALESCE(SUM(CASE WHEN status = 'CLICKED' THEN revenue ELSE 0 END), 0) as revenue
            FROM push_deliveries
            WHERE campaign_id IN (${campIds.map(() => '?').join(',')})
              AND created_at BETWEEN ? AND ?
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `, ...campIds, cutoff, endDate);

        // Device breakdown (from subscriptions)
        const deviceRaw = await prisma.$queryRawUnsafe(`
            SELECT ps.device,
                   COUNT(pd.id) as deliveries,
                   SUM(CASE WHEN pd.status = 'CLICKED' THEN 1 ELSE 0 END) as clicks
            FROM push_deliveries pd
            JOIN push_subscriptions ps ON ps.id = pd.subscription_id
            WHERE pd.campaign_id IN (${campIds.map(() => '?').join(',')})
              AND pd.created_at BETWEEN ? AND ?
            GROUP BY ps.device
        `, ...campIds, cutoff, endDate);

        // Country breakdown
        const countryRaw = await prisma.$queryRawUnsafe(`
            SELECT ps.country,
                   COUNT(pd.id) as deliveries,
                   SUM(CASE WHEN pd.status = 'CLICKED' THEN 1 ELSE 0 END) as clicks
            FROM push_deliveries pd
            JOIN push_subscriptions ps ON ps.id = pd.subscription_id
            WHERE pd.campaign_id IN (${campIds.map(() => '?').join(',')})
              AND pd.created_at BETWEEN ? AND ?
              AND ps.country IS NOT NULL
            GROUP BY ps.country
            ORDER BY deliveries DESC
            LIMIT 10
        `, ...campIds, cutoff, endDate);

        // Per-campaign breakdown
        const campaignsWithStats = await Promise.all(campaigns.map(async (c) => {
            const [cDel, cClk] = await Promise.all([
                prisma.pushDelivery.aggregate({
                    where: { campaignId: c.id, createdAt: { gte: cutoff, lte: endDate } },
                    _count: { id: true }
                }),
                prisma.pushDelivery.aggregate({
                    where: { campaignId: c.id, status: 'CLICKED', createdAt: { gte: cutoff, lte: endDate } },
                    _count: { id: true },
                    _sum: { revenue: true }
                }),
            ]);
            const delivered = cDel._count.id;
            const clicked = cClk._count.id;
            return {
                ...c,
                totalBudget: parseFloat(c.totalBudget),
                totalSpent: parseFloat(c.totalSpent),
                bidAmount: parseFloat(c.bidAmount),
                deliveries: delivered,
                clicks: clicked,
                ctr: delivered > 0 ? ((clicked / delivered) * 100).toFixed(2) : '0.00',
                revenue: parseFloat(cClk._sum.revenue || 0).toFixed(4),
            };
        }));

        res.json({
            campaigns: campaignsWithStats,
            summary: {
                totalDeliveries,
                totalClicks,
                totalRevenue: totalRevenue.toFixed(4),
                ctr: totalDeliveries > 0 ? ((totalClicks / totalDeliveries) * 100).toFixed(2) : '0.00',
                avgCpc: totalClicks > 0 ? (totalRevenue / totalClicks).toFixed(4) : '0.0000',
            },
            dailyDeliveries: dailyRaw.map(r => ({
                date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date,
                delivered: Number(r.delivered),
                clicks: Number(r.clicks),
                revenue: parseFloat(r.revenue || 0)
            })),
            deviceBreakdown: deviceRaw.map(r => ({
                device: r.device || 'Unknown',
                deliveries: Number(r.deliveries),
                clicks: Number(r.clicks),
            })),
            countryBreakdown: countryRaw.map(r => ({
                country: r.country || 'Unknown',
                deliveries: Number(r.deliveries),
                clicks: Number(r.clicks),
            })),
        });
    } catch (err) {
        console.error('Advertiser push stats error:', err);
        res.status(500).json({ error: 'Stats fetch failed' });
    }
};
