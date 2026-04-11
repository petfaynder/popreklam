import prisma from '../lib/prisma.js';

/**
 * GET /api/admin/conversions/overview
 * Global conversion KPIs for the admin panel
 */
export const getConversionOverview = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);

        const [
            totalAll, totalToday, totalWeek,
            s2sAll, pixelAll, testAll,
            payoutAgg,
            topCampaigns,
            dailyRaw,
        ] = await Promise.all([
            // Total confirmed conversions
            prisma.conversion.count({ where: { status: 'CONFIRMED' } }),
            // Today
            prisma.conversion.count({ where: { status: 'CONFIRMED', createdAt: { gte: today } } }),
            // This week
            prisma.conversion.count({ where: { status: 'CONFIRMED', createdAt: { gte: weekAgo } } }),
            // By method
            prisma.conversion.count({ where: { trackingMethod: 'S2S', status: 'CONFIRMED' } }),
            prisma.conversion.count({ where: { trackingMethod: 'PIXEL', status: 'CONFIRMED' } }),
            prisma.conversion.count({ where: { trackingMethod: 'TEST' } }),
            // Total payout reported by advertisers
            prisma.conversion.aggregate({
                where: { status: 'CONFIRMED' },
                _sum: { payout: true }
            }),
            // Top converting campaigns
            prisma.$queryRaw`
                SELECT
                    c.id, c.name, c.ad_format AS adFormat,
                    COUNT(cv.id) AS conversions,
                    COALESCE(SUM(cv.payout), 0) AS totalPayout,
                    MAX(cv.created_at) AS lastConversion
                FROM campaigns c
                LEFT JOIN conversions cv ON cv.campaign_id = c.id AND cv.status = 'CONFIRMED'
                GROUP BY c.id, c.name, c.ad_format
                HAVING conversions > 0
                ORDER BY conversions DESC
                LIMIT 15
            `,
            // Daily trend (last 14 days)
            prisma.$queryRaw`
                SELECT
                    DATE(created_at) AS date,
                    COUNT(*) AS total,
                    SUM(CASE WHEN tracking_method = 'S2S' THEN 1 ELSE 0 END) AS s2s,
                    SUM(CASE WHEN tracking_method = 'PIXEL' THEN 1 ELSE 0 END) AS pixel,
                    COALESCE(SUM(payout), 0) AS payout
                FROM conversions
                WHERE status = 'CONFIRMED'
                  AND created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
                GROUP BY DATE(created_at)
                ORDER BY date ASC
            `,
        ]);

        res.json({
            kpis: {
                totalAll,
                totalToday,
                totalWeek,
                s2sCount: s2sAll,
                pixelCount: pixelAll,
                testCount: testAll,
                totalPayout: parseFloat(payoutAgg._sum.payout || 0).toFixed(2),
            },
            methodBreakdown: [
                { name: 'S2S Postback', value: s2sAll },
                { name: 'Pixel', value: pixelAll },
                { name: 'Test', value: testAll },
            ],
            topCampaigns: topCampaigns.map(r => ({
                id: r.id,
                name: r.name,
                adFormat: r.adFormat,
                conversions: Number(r.conversions),
                totalPayout: parseFloat(r.totalPayout || 0).toFixed(2),
                lastConversion: r.lastConversion,
            })),
            dailyTrend: dailyRaw.map(r => ({
                date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date),
                total: Number(r.total),
                s2s: Number(r.s2s),
                pixel: Number(r.pixel),
                payout: parseFloat(r.payout || 0).toFixed(2),
            })),
        });

    } catch (err) {
        console.error('[Admin Conversions] Overview error:', err);
        res.status(500).json({ error: 'Failed to get conversion overview' });
    }
};

/**
 * GET /api/admin/conversions/postback-logs
 * All postback logs with filtering
 */
export const getPostbackLogs = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(parseInt(req.query.limit) || 50, 200);
        const skip = (page - 1) * limit;
        const status = req.query.status || null;
        const campaignId = req.query.campaignId || null;

        const where = {};
        if (status) where.status = status;
        if (campaignId) where.campaignId = campaignId;

        const [logs, total] = await Promise.all([
            prisma.postbackLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.postbackLog.count({ where }),
        ]);

        res.json({
            logs,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });

    } catch (err) {
        res.status(500).json({ error: 'Failed to get postback logs' });
    }
};

/**
 * DELETE /api/admin/conversions/test
 * Clear all TEST conversions and their logs
 */
export const deleteTestConversions = async (req, res) => {
    try {
        const deleted = await prisma.conversion.deleteMany({
            where: { status: 'TEST' }
        });
        await prisma.postbackLog.deleteMany({
            where: { status: 'SUCCESS', errorMsg: { contains: 'Test conversion' } }
        });
        res.json({ success: true, deleted: deleted.count });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete test conversions' });
    }
};
