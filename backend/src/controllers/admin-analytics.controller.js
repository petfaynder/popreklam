import prisma from '../lib/prisma.js'

/**
 * Revenue Timeline
 * GET /api/admin/analytics/revenue?period=30
 */
export const getRevenueTimeline = async (req, res) => {
    try {
        const { period = '30' } = req.query;
        const days = Math.min(parseInt(period) || 30, 365);
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const impressions = await prisma.impression.findMany({
            where: { createdAt: { gte: startDate } },
            select: { createdAt: true, revenue: true, publisherRevenue: true, systemProfit: true, clicked: true }
        });

        // Build daily buckets
        const byDay = {};
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const key = d.toISOString().slice(0, 10);
            byDay[key] = { date: key, revenue: 0, payout: 0, profit: 0, impressions: 0, clicks: 0 };
        }

        impressions.forEach(imp => {
            const key = new Date(imp.createdAt).toISOString().slice(0, 10);
            if (byDay[key]) {
                byDay[key].revenue += Number(imp.revenue || 0);
                byDay[key].payout += Number(imp.publisherRevenue || 0);
                byDay[key].profit += Number(imp.systemProfit || 0);
                byDay[key].impressions++;
                if (imp.clicked) byDay[key].clicks++;
            }
        });

        const timeline = Object.values(byDay).map(d => ({
            ...d,
            margin: d.revenue > 0 ? parseFloat(((d.profit / d.revenue) * 100).toFixed(2)) : 0,
            ctr: d.impressions > 0 ? parseFloat(((d.clicks / d.impressions) * 100).toFixed(2)) : 0,
        }));

        const totals = timeline.reduce((acc, d) => ({
            revenue: acc.revenue + d.revenue,
            payout: acc.payout + d.payout,
            profit: acc.profit + d.profit,
            impressions: acc.impressions + d.impressions,
            clicks: acc.clicks + d.clicks,
        }), { revenue: 0, payout: 0, profit: 0, impressions: 0, clicks: 0 });

        res.json({ timeline, totals, period: days });
    } catch (error) {
        console.error('Revenue timeline error:', error);
        res.status(500).json({ error: 'Failed to fetch revenue timeline' });
    }
};

/**
 * Top Publishers
 * GET /api/admin/analytics/top-publishers?period=30&limit=10
 */
export const getTopPublishers = async (req, res) => {
    try {
        const { period = '30', limit = 10 } = req.query;
        const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

        // Get impressions per zone, then join publisher
        const zoneRevenue = await prisma.impression.groupBy({
            by: ['zoneId'],
            where: { createdAt: { gte: startDate } },
            _sum: { publisherRevenue: true },
            _count: true,
            orderBy: { _sum: { publisherRevenue: 'desc' } },
            take: parseInt(limit) * 3, // get more to dedupe by publisher
        });

        // Fetch zone → site → publisher info
        const zoneIds = zoneRevenue.map(z => z.zoneId);
        const zones = await prisma.zone.findMany({
            where: { id: { in: zoneIds } },
            include: { site: { include: { publisher: { include: { user: { select: { id: true, email: true } } } } } } }
        });

        const publisherMap = {};
        zoneRevenue.forEach(zr => {
            const zone = zones.find(z => z.id === zr.zoneId);
            if (!zone?.site?.publisher) return;
            const pub = zone.site.publisher;
            const pubId = pub.id;
            if (!publisherMap[pubId]) {
                publisherMap[pubId] = {
                    publisherId: pubId,
                    email: pub.user.email,
                    companyName: pub.companyName || pub.user.email,
                    revenue: 0,
                    impressions: 0,
                };
            }
            publisherMap[pubId].revenue += Number(zr._sum.publisherRevenue || 0);
            publisherMap[pubId].impressions += zr._count;
        });

        const sorted = Object.values(publisherMap)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, parseInt(limit));

        res.json({ publishers: sorted, period: parseInt(period) });
    } catch (error) {
        console.error('Top publishers error:', error);
        res.status(500).json({ error: 'Failed to fetch top publishers' });
    }
};

/**
 * Top Advertisers
 * GET /api/admin/analytics/top-advertisers?period=30&limit=10
 */
export const getTopAdvertisers = async (req, res) => {
    try {
        const { period = '30', limit = 10 } = req.query;
        const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

        const campaignSpend = await prisma.impression.groupBy({
            by: ['campaignId'],
            where: { createdAt: { gte: startDate } },
            _sum: { revenue: true, systemProfit: true },
            _count: true,
            orderBy: { _sum: { revenue: 'desc' } },
            take: parseInt(limit) * 3,
        });

        const campaignIds = campaignSpend.map(c => c.campaignId);
        const campaigns = await prisma.campaign.findMany({
            where: { id: { in: campaignIds } },
            include: { advertiser: { include: { user: { select: { id: true, email: true } } } } }
        });

        const advertiserMap = {};
        campaignSpend.forEach(cs => {
            const campaign = campaigns.find(c => c.id === cs.campaignId);
            if (!campaign?.advertiser) return;
            const adv = campaign.advertiser;
            const advId = adv.id;
            if (!advertiserMap[advId]) {
                advertiserMap[advId] = {
                    advertiserId: advId,
                    email: adv.user.email,
                    companyName: adv.companyName || adv.user.email,
                    spend: 0,
                    impressions: 0,
                    campaigns: 0,
                };
            }
            advertiserMap[advId].spend += Number(cs._sum.revenue || 0);
            advertiserMap[advId].impressions += cs._count;
            advertiserMap[advId].campaigns++;
        });

        const sorted = Object.values(advertiserMap)
            .sort((a, b) => b.spend - a.spend)
            .slice(0, parseInt(limit));

        res.json({ advertisers: sorted, period: parseInt(period) });
    } catch (error) {
        console.error('Top advertisers error:', error);
        res.status(500).json({ error: 'Failed to fetch top advertisers' });
    }
};

/**
 * Geo Breakdown
 * GET /api/admin/analytics/geo?period=30&limit=15
 */
export const getGeoBreakdown = async (req, res) => {
    try {
        const { period = '30', limit = 15 } = req.query;
        const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

        const geoData = await prisma.impression.groupBy({
            by: ['country'],
            where: { createdAt: { gte: startDate }, country: { not: null } },
            _sum: { revenue: true, publisherRevenue: true },
            _count: true,
            orderBy: { _count: { country: 'desc' } },
            take: parseInt(limit),
        });

        const geo = geoData.map(g => ({
            country: g.country || 'Unknown',
            impressions: g._count,
            revenue: Number(g._sum.revenue || 0),
            payout: Number(g._sum.publisherRevenue || 0),
        }));

        res.json({ geo, period: parseInt(period) });
    } catch (error) {
        console.error('Geo breakdown error:', error);
        res.status(500).json({ error: 'Failed to fetch geo breakdown' });
    }
};

/**
 * Ad Format Breakdown
 * GET /api/admin/analytics/formats?period=30
 */
export const getFormatBreakdown = async (req, res) => {
    try {
        const { period = '30' } = req.query;
        const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

        // Join with campaign to get adFormat
        const impressions = await prisma.impression.findMany({
            where: { createdAt: { gte: startDate } },
            select: { revenue: true, publisherRevenue: true, systemProfit: true, clicked: true, campaignId: true }
        });

        const campaignIds = [...new Set(impressions.map(i => i.campaignId))];
        const campaigns = await prisma.campaign.findMany({
            where: { id: { in: campaignIds } },
            select: { id: true, adFormat: true }
        });

        const formatMap = {};
        campaigns.forEach(c => { formatMap[c.id] = c.adFormat; });

        const byFormat = {};
        impressions.forEach(imp => {
            const fmt = formatMap[imp.campaignId] || 'UNKNOWN';
            if (!byFormat[fmt]) byFormat[fmt] = { format: fmt, impressions: 0, clicks: 0, revenue: 0, profit: 0 };
            byFormat[fmt].impressions++;
            if (imp.clicked) byFormat[fmt].clicks++;
            byFormat[fmt].revenue += Number(imp.revenue || 0);
            byFormat[fmt].profit += Number(imp.systemProfit || 0);
        });

        const formats = Object.values(byFormat).map(f => ({
            ...f,
            ctr: f.impressions > 0 ? parseFloat(((f.clicks / f.impressions) * 100).toFixed(2)) : 0,
            avgCpm: f.impressions > 0 ? parseFloat(((f.revenue / f.impressions) * 1000).toFixed(3)) : 0,
        })).sort((a, b) => b.revenue - a.revenue);

        res.json({ formats, period: parseInt(period) });
    } catch (error) {
        console.error('Format breakdown error:', error);
        res.status(500).json({ error: 'Failed to fetch format breakdown' });
    }
};

/**
 * Platform Health Metrics
 * GET /api/admin/analytics/health
 */
export const getPlatformHealth = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [todayImpressions, activeCampaigns, activeSites, activePublishers] = await Promise.all([
            prisma.impression.count({ where: { createdAt: { gte: today } } }),
            prisma.campaign.count({ where: { status: 'ACTIVE' } }),
            prisma.site.count({ where: { status: 'ACTIVE' } }),
            prisma.publisher.count(),
        ]);

        const todayRevData = await prisma.impression.aggregate({
            where: { createdAt: { gte: today } },
            _sum: { revenue: true, systemProfit: true }
        });

        res.json({
            today: {
                impressions: todayImpressions,
                revenue: Number(todayRevData._sum.revenue || 0),
                profit: Number(todayRevData._sum.systemProfit || 0),
            },
            platform: {
                activeCampaigns,
                activeSites,
                activePublishers,
            },
            status: activeCampaigns > 0 ? 'operational' : 'degraded',
        });
    } catch (error) {
        console.error('Platform health error:', error);
        res.status(500).json({ error: 'Failed to fetch platform health' });
    }
};

/**
 * Export Revenue CSV
 * GET /api/admin/analytics/export-csv
 */
export const exportRevenueCsv = async (req, res) => {
    try {
        const { period = '30' } = req.query;
        const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

        const impressions = await prisma.impression.findMany({
            where: { createdAt: { gte: startDate } },
            select: { createdAt: true, revenue: true, publisherRevenue: true, systemProfit: true, clicked: true, country: true, device: true }
        });

        const byDay = {};
        impressions.forEach(imp => {
            const key = new Date(imp.createdAt).toISOString().slice(0, 10);
            if (!byDay[key]) byDay[key] = { date: key, impressions: 0, clicks: 0, revenue: 0, payout: 0, profit: 0 };
            byDay[key].impressions++;
            if (imp.clicked) byDay[key].clicks++;
            byDay[key].revenue += Number(imp.revenue || 0);
            byDay[key].payout += Number(imp.publisherRevenue || 0);
            byDay[key].profit += Number(imp.systemProfit || 0);
        });

        const rows = Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date));
        const headers = 'Date,Impressions,Clicks,CTR%,Revenue,Publisher Payout,Platform Profit,Margin%\n';
        const csvRows = rows.map(r => {
            const ctr = r.impressions > 0 ? ((r.clicks / r.impressions) * 100).toFixed(2) : 0;
            const margin = r.revenue > 0 ? ((r.profit / r.revenue) * 100).toFixed(2) : 0;
            return `${r.date},${r.impressions},${r.clicks},${ctr},${r.revenue.toFixed(4)},${r.payout.toFixed(4)},${r.profit.toFixed(4)},${margin}`;
        }).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="revenue-report-${period}d.csv"`);
        res.send(headers + csvRows);
    } catch (error) {
        console.error('Export CSV error:', error);
        res.status(500).json({ error: 'Failed to export CSV' });
    }
};
