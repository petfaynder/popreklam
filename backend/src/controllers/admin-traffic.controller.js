import prisma from '../lib/prisma.js';

/**
 * GET /api/admin/traffic/realtime
 * Returns network-level stats for the past hour, today, and last 30 days.
 * Also returns top countries, publishers, and fraud indicators.
 */
export const getTrafficInsights = async (req, res) => {
    try {
        const now = new Date();
        const oneHourAgo = new Date(now - 60 * 60 * 1000);
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);

        // ── Last Hour ──────────────────────────────────────────────────────
        const [lastHourImpressions, lastHourClicks, lastHourRevenue] = await Promise.all([
            prisma.impression.count({ where: { createdAt: { gte: oneHourAgo } } }),
            prisma.impression.count({ where: { createdAt: { gte: oneHourAgo }, clicked: true } }),
            prisma.impression.aggregate({
                where: { createdAt: { gte: oneHourAgo } },
                _sum: { revenue: true }
            })
        ]);

        // ── Today ───────────────────────────────────────────────────────────
        const [todayImpressions, todayClicks, todayRevenue] = await Promise.all([
            prisma.impression.count({ where: { createdAt: { gte: todayStart } } }),
            prisma.impression.count({ where: { createdAt: { gte: todayStart }, clicked: true } }),
            prisma.impression.aggregate({
                where: { createdAt: { gte: todayStart } },
                _sum: { revenue: true, publisherRevenue: true, systemProfit: true }
            })
        ]);

        // ── Active Campaigns ────────────────────────────────────────────────
        const activeCampaigns = await prisma.campaign.count({ where: { status: 'ACTIVE' } });
        const activeSites = await prisma.site.count({ where: { status: 'ACTIVE' } });

        // ── Top Countries (Today) ───────────────────────────────────────────
        const countryStatsRaw = await prisma.impression.groupBy({
            by: ['country'],
            where: { createdAt: { gte: todayStart }, country: { not: null } },
            _count: { id: true },
            _sum: { revenue: true },
            orderBy: { _count: { id: 'desc' } },
            take: 10
        });

        const topCountries = countryStatsRaw.map(r => ({
            country: r.country,
            impressions: r._count.id,
            revenue: Number(r._sum.revenue || 0).toFixed(4)
        }));

        // ── Top Publishers (Today) ──────────────────────────────────────────
        const topZonesRaw = await prisma.impression.groupBy({
            by: ['zoneId'],
            where: { createdAt: { gte: todayStart } },
            _count: { id: true },
            _sum: { publisherRevenue: true },
            orderBy: { _count: { id: 'desc' } },
            take: 10
        });

        // Hydrate with site name
        const topPublishers = await Promise.all(
            topZonesRaw.map(async (z) => {
                const zone = await prisma.zone.findUnique({
                    where: { id: z.zoneId },
                    include: { site: { select: { name: true, url: true } } }
                });
                return {
                    zoneId: z.zoneId,
                    siteName: zone?.site?.name || z.zoneId,
                    siteUrl: zone?.site?.url || '',
                    impressions: z._count.id,
                    revenue: Number(z._sum.publisherRevenue || 0).toFixed(4)
                };
            })
        );

        // ── Hourly Breakdown (Last 24h) ─────────────────────────────────────
        const last24h = new Date(now - 24 * 60 * 60 * 1000);
        const hourlyRaw = await prisma.$queryRaw`
            SELECT
                DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00') AS hour,
                COUNT(*) AS impressions,
                SUM(CASE WHEN clicked = 1 THEN 1 ELSE 0 END) AS clicks,
                SUM(revenue) AS revenue
            FROM impressions
            WHERE created_at >= ${last24h}
            GROUP BY hour
            ORDER BY hour ASC
        `;

        const hourly = hourlyRaw.map(r => ({
            hour: r.hour,
            impressions: Number(r.impressions),
            clicks: Number(r.clicks),
            revenue: Number(r.revenue || 0)
        }));

        // ── Fraud Score (Rough) ─────────────────────────────────────────────
        // Shows IPs that fired > 20 impressions in the last hour (potential bots)
        const suspiciousIpsRaw = await prisma.impression.groupBy({
            by: ['ip'],
            where: { createdAt: { gte: oneHourAgo } },
            _count: { id: true },
            having: { id: { _count: { gt: 20 } } },
            orderBy: { _count: { id: 'desc' } },
            take: 10
        });

        const suspiciousIps = suspiciousIpsRaw.map(r => ({
            ip: r.ip,
            impressions: r._count.id
        }));

        res.json({
            lastHour: {
                impressions: lastHourImpressions,
                clicks: lastHourClicks,
                revenue: Number(lastHourRevenue._sum.revenue || 0),
                ctr: lastHourImpressions > 0
                    ? ((lastHourClicks / lastHourImpressions) * 100).toFixed(2)
                    : '0.00'
            },
            today: {
                impressions: todayImpressions,
                clicks: todayClicks,
                revenue: Number(todayRevenue._sum.revenue || 0),
                publisherPayout: Number(todayRevenue._sum.publisherRevenue || 0),
                systemProfit: Number(todayRevenue._sum.systemProfit || 0),
                ctr: todayImpressions > 0
                    ? ((todayClicks / todayImpressions) * 100).toFixed(2)
                    : '0.00',
                eCPM: todayImpressions > 0
                    ? ((Number(todayRevenue._sum.revenue || 0) / todayImpressions) * 1000).toFixed(4)
                    : '0.0000'
            },
            network: {
                activeCampaigns,
                activeSites
            },
            topCountries,
            topPublishers,
            hourly,
            suspiciousIps
        });
    } catch (error) {
        console.error('getTrafficInsights error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
