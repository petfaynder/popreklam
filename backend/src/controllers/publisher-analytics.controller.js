import prisma from '../lib/prisma.js'

/**
 * GET /api/publisher/analytics/realtime
 * Returns: today's stats, hourly breakdown, top sites, recent impressions
 */
export const getRealtimeDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get publisher
        const publisher = await prisma.publisher.findUnique({
            where: { userId },
            select: { id: true }
        });
        if (!publisher) return res.status(404).json({ error: 'Publisher not found' });

        const zones = await prisma.zone.findMany({
            where: { site: { publisherId: publisher.id } },
            select: { id: true, name: true, type: true, siteId: true, site: { select: { domain: true } } }
        });
        const zoneIds = zones.map(z => z.id);

        if (zoneIds.length === 0) {
            return res.json({ today: { impressions: 0, clicks: 0, revenue: 0, eCPM: 0 }, hourly: [], sites: [], recentHourRevenue: 0 });
        }

        // Today's totals
        const todayRaw = await prisma.$queryRaw`
            SELECT
                COUNT(i.id) AS impressions,
                SUM(i.clicked) AS clicks,
                SUM(i.publisher_revenue) AS revenue
            FROM impressions i
            WHERE i.zone_id IN (${zoneIds.join(',')})
              AND DATE(i.created_at) = CURDATE()
        `;

        // Last 24h hourly breakdown
        const hourlyRaw = await prisma.$queryRaw`
            SELECT
                HOUR(i.created_at) AS hour,
                DATE(i.created_at) AS date,
                COUNT(i.id) AS impressions,
                SUM(i.clicked) AS clicks,
                SUM(i.publisher_revenue) AS revenue
            FROM impressions i
            WHERE i.zone_id IN (${zoneIds.join(',')})
              AND i.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            GROUP BY DATE(i.created_at), HOUR(i.created_at)
            ORDER BY date ASC, hour ASC
        `;

        // Fill 24-hour gaps
        const now = new Date();
        const hourMap = {};
        for (let h = 0; h < 24; h++) {
            const d = new Date(now);
            d.setHours(now.getHours() - (23 - h), 0, 0, 0);
            const key = `${d.toISOString().slice(0, 10)}_${d.getHours()}`;
            hourMap[key] = {
                label: `${d.getHours().toString().padStart(2, '0')}:00`,
                impressions: 0, clicks: 0, revenue: 0
            };
        }
        for (const row of hourlyRaw) {
            const key = `${String(row.date).slice(0, 10)}_${Number(row.hour)}`;
            if (hourMap[key]) {
                hourMap[key].impressions = Number(row.impressions);
                hourMap[key].clicks = Number(row.clicks);
                hourMap[key].revenue = Number(row.revenue || 0);
            }
        }

        // Site breakdown
        const siteRaw = await prisma.$queryRaw`
            SELECT
                s.domain,
                s.id AS siteId,
                COUNT(i.id) AS impressions,
                SUM(i.publisher_revenue) AS revenue
            FROM impressions i
            JOIN zones z ON i.zone_id = z.id
            JOIN sites s ON z.site_id = s.id
            WHERE z.id IN (${zoneIds.join(',')})
              AND DATE(i.created_at) = CURDATE()
            GROUP BY s.id, s.domain
            ORDER BY revenue DESC
            LIMIT 10
        `;

        const today = todayRaw[0] || {};
        const totalImpressions = Number(today.impressions || 0);
        const totalRevenue = Number(today.revenue || 0);

        // Last 1h revenue for projection
        const lastHourRevenue = Object.values(hourMap).slice(-1)[0]?.revenue || 0;

        res.json({
            today: {
                impressions: totalImpressions,
                clicks: Number(today.clicks || 0),
                revenue: totalRevenue.toFixed(4),
                eCPM: totalImpressions > 0 ? ((totalRevenue / totalImpressions) * 1000).toFixed(4) : '0.0000'
            },
            hourly: Object.values(hourMap),
            sites: siteRaw.map(s => ({
                domain: s.domain,
                siteId: s.siteId,
                impressions: Number(s.impressions),
                revenue: Number(s.revenue || 0).toFixed(4)
            })),
            // Estimated daily revenue from the last hour's pace
            projectedDaily: (lastHourRevenue * 24).toFixed(2),
            lastHourRevenue: lastHourRevenue.toFixed(4)
        });

    } catch (error) {
        console.error('[Publisher Analytics] Realtime error:', error);
        res.status(500).json({ error: 'Failed to fetch real-time dashboard' });
    }
};

/**
 * GET /api/publisher/analytics/summary
 * Returns 7-day / 30-day comparative revenue summary
 */
export const getRevenueSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const publisher = await prisma.publisher.findUnique({ where: { userId }, select: { id: true } });
        if (!publisher) return res.status(404).json({ error: 'Publisher not found' });

        const zones = await prisma.zone.findMany({
            where: { site: { publisherId: publisher.id } },
            select: { id: true }
        });
        const zoneIds = zones.map(z => z.id);
        if (zoneIds.length === 0) return res.json({ days: [] });

        const rawDays = await prisma.$queryRaw`
            SELECT
                DATE(i.created_at) AS date,
                COUNT(i.id) AS impressions,
                SUM(i.clicked) AS clicks,
                SUM(i.publisher_revenue) AS revenue
            FROM impressions i
            WHERE i.zone_id IN (${zoneIds.join(',')})
              AND i.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(i.created_at)
            ORDER BY date ASC
        `;

        res.json({
            days: rawDays.map(r => ({
                date: String(r.date).slice(0, 10),
                impressions: Number(r.impressions),
                clicks: Number(r.clicks),
                revenue: Number(r.revenue || 0).toFixed(4)
            }))
        });
    } catch (error) {
        console.error('[Publisher Analytics] Summary error:', error);
        res.status(500).json({ error: 'Failed to fetch revenue summary' });
    }
};
