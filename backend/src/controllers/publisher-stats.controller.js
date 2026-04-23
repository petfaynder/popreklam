import prisma from '../lib/prisma.js'
import { yieldOptimizationService } from '../services/yield-optimization.service.js';

// Get Revenue Trends and Daily Stats
export const getRevenueTrends = async (req, res) => {
    try {
        const userId = req.user.id;
        const { period = '7d' } = req.query;

        // Date Handling
        const now = new Date();
        const past = new Date();
        if (period === '7d') past.setDate(now.getDate() - 7);
        else if (period === '30d') past.setDate(now.getDate() - 30);
        else if (period === '90d') past.setDate(now.getDate() - 90);

        // Fetch Stats
        // Using raw query for better date grouping and aggregation across relations
        const stats = await prisma.$queryRaw`
            SELECT 
                DATE(i.created_at) as date,
                SUM(i.publisher_revenue) as revenue,
                COUNT(i.id) as impressions,
                SUM(i.clicked) as clicks
            FROM impressions i
            JOIN zones z ON i.zone_id = z.id
            JOIN sites s ON z.site_id = s.id
            JOIN publishers p ON s.publisher_id = p.id
            WHERE p.user_id = ${userId}
            AND i.created_at >= ${past}
            GROUP BY DATE(i.created_at)
            ORDER BY date ASC
        `;

        // Format BigInt to Number
        const data = stats.map(s => ({
            date: s.date.toISOString().split('T')[0],
            revenue: Number(s.revenue || 0),
            impressions: Number(s.impressions || 0),
            clicks: Number(s.clicks || 0)
        }));

        res.json(data);
    } catch (error) {
        console.error('Revenue trends error:', error);
        res.status(500).json({ error: 'Failed to fetch revenue trends' });
    }
};

// Get Top Pages (Actually Zones/Sites)
export const getTopPages = async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 10;

        const stats = await prisma.$queryRaw`
            SELECT 
                s.url as page,
                COUNT(i.id) as views,
                SUM(i.publisher_revenue) as earnings
            FROM impressions i
            JOIN zones z ON i.zone_id = z.id
            JOIN sites s ON z.site_id = s.id
            JOIN publishers p ON s.publisher_id = p.id
            WHERE p.user_id = ${userId}
            GROUP BY s.id
            ORDER BY earnings DESC
            LIMIT ${limit}
        `;

        const data = stats.map(s => ({
            page: s.page,
            views: Number(s.views),
            earnings: Number(s.earnings)
        }));

        res.json(data);
    } catch (error) {
        console.error('Top pages error:', error);
        res.status(500).json({ error: 'Failed to fetch top pages' });
    }
};

// Get Geographic Stats
export const getGeographicStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const stats = await prisma.$queryRaw`
            SELECT 
                i.country as name,
                COUNT(i.id) as value
            FROM impressions i
            JOIN zones z ON i.zone_id = z.id
            JOIN sites s ON z.site_id = s.id
            JOIN publishers p ON s.publisher_id = p.id
            WHERE p.user_id = ${userId}
            AND i.country IS NOT NULL
            GROUP BY i.country
            ORDER BY value DESC
            LIMIT 10
        `;

        const data = stats.map(s => ({
            name: s.name,
            value: Number(s.value)
        }));

        res.json(data);
    } catch (error) {
        console.error('Geo stats error:', error);
        res.status(500).json({ error: 'Failed to fetch geo stats' });
    }
};

// Get Device Stats
export const getDeviceBreakdown = async (req, res) => {
    try {
        const userId = req.user.id;

        const stats = await prisma.$queryRaw`
            SELECT 
                i.device as name,
                COUNT(i.id) as value
            FROM impressions i
            JOIN zones z ON i.zone_id = z.id
            JOIN sites s ON z.site_id = s.id
            JOIN publishers p ON s.publisher_id = p.id
            WHERE p.user_id = ${userId}
            AND i.device IS NOT NULL
            GROUP BY i.device
        `;

        const data = stats.map(s => ({
            name: s.name,
            value: Number(s.value)
        }));

        res.json(data);
    } catch (error) {
        console.error('Device stats error:', error);
        res.status(500).json({ error: 'Failed to fetch device stats' });
    }
};

// Get Yield Recommendations
export const getYieldRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;
        const recommendations = await yieldOptimizationService.getRecommendations(userId);
        res.json(recommendations);
    } catch (error) {
        console.error('Yield recommendations error:', error);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/publisher/stats/format?format=POPUNDER&period=30
// Returns daily trend + geo + device breakdown filtered by ad format (zone type)
// Supports: POPUNDER, IN_PAGE_PUSH
// ═══════════════════════════════════════════════════════════════════════════════
export const getFormatStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const format = req.query.format || 'POPUNDER'; // POPUNDER | IN_PAGE_PUSH
        const days = parseInt(req.query.period) || 30;

        const past = new Date();
        past.setDate(past.getDate() - days);
        past.setHours(0, 0, 0, 0);

        // Validate format
        const allowedFormats = ['POPUNDER', 'IN_PAGE_PUSH'];
        if (!allowedFormats.includes(format)) {
            return res.status(400).json({ error: 'Invalid format. Use POPUNDER or IN_PAGE_PUSH.' });
        }

        // 1) Daily trend
        const dailyRaw = await prisma.$queryRawUnsafe(`
            SELECT
                DATE(i.created_at) AS date,
                COUNT(i.id) AS impressions,
                SUM(i.clicked) AS clicks,
                SUM(i.publisher_revenue) AS revenue,
                ROUND(
                    CASE WHEN COUNT(i.id) > 0
                        THEN (SUM(i.publisher_revenue) / COUNT(i.id)) * 1000
                        ELSE 0
                    END, 4
                ) AS ecpm
            FROM impressions i
            JOIN zones z ON i.zone_id = z.id
            JOIN sites s ON z.site_id = s.id
            JOIN publishers p ON s.publisher_id = p.id
            WHERE p.user_id = ?
              AND z.type = ?
              AND i.created_at >= ?
            GROUP BY DATE(i.created_at)
            ORDER BY date ASC
        `, userId, format, past);

        // 2) Summary totals + prev period change
        const summaryRaw = await prisma.$queryRawUnsafe(`
            SELECT
                COUNT(i.id) AS impressions,
                SUM(i.clicked) AS clicks,
                SUM(i.publisher_revenue) AS revenue
            FROM impressions i
            JOIN zones z ON i.zone_id = z.id
            JOIN sites s ON z.site_id = s.id
            JOIN publishers p ON s.publisher_id = p.id
            WHERE p.user_id = ?
              AND z.type = ?
              AND i.created_at >= ?
        `, userId, format, past);

        // Previous period
        const prevPast = new Date(past.getTime() - days * 86400000);
        const prevSummaryRaw = await prisma.$queryRawUnsafe(`
            SELECT
                COUNT(i.id) AS impressions,
                SUM(i.publisher_revenue) AS revenue
            FROM impressions i
            JOIN zones z ON i.zone_id = z.id
            JOIN sites s ON z.site_id = s.id
            JOIN publishers p ON s.publisher_id = p.id
            WHERE p.user_id = ?
              AND z.type = ?
              AND i.created_at >= ?
              AND i.created_at < ?
        `, userId, format, prevPast, past);

        const cur = summaryRaw[0] || {};
        const prev = prevSummaryRaw[0] || {};
        const curImpr = Number(cur.impressions || 0);
        const curRev = Number(cur.revenue || 0);
        const prevImpr = Number(prev.impressions || 0);
        const prevRev = Number(prev.revenue || 0);

        function pctChange(c, p) {
            if (p === 0) return c > 0 ? 100 : 0;
            return parseFloat(((c - p) / p * 100).toFixed(1));
        }

        // 3) Geo breakdown
        const geoRaw = await prisma.$queryRawUnsafe(`
            SELECT
                i.country,
                COUNT(i.id) AS impressions,
                SUM(i.publisher_revenue) AS revenue
            FROM impressions i
            JOIN zones z ON i.zone_id = z.id
            JOIN sites s ON z.site_id = s.id
            JOIN publishers p ON s.publisher_id = p.id
            WHERE p.user_id = ?
              AND z.type = ?
              AND i.created_at >= ?
              AND i.country IS NOT NULL
            GROUP BY i.country
            ORDER BY impressions DESC
            LIMIT 10
        `, userId, format, past);

        // 4) Device breakdown
        const deviceRaw = await prisma.$queryRawUnsafe(`
            SELECT
                i.device,
                COUNT(i.id) AS impressions,
                SUM(i.publisher_revenue) AS revenue
            FROM impressions i
            JOIN zones z ON i.zone_id = z.id
            JOIN sites s ON z.site_id = s.id
            JOIN publishers p ON s.publisher_id = p.id
            WHERE p.user_id = ?
              AND z.type = ?
              AND i.created_at >= ?
              AND i.device IS NOT NULL
            GROUP BY i.device
        `, userId, format, past);

        // 5) Top sites for this format
        const sitesRaw = await prisma.$queryRawUnsafe(`
            SELECT
                s.name AS siteName,
                s.url AS siteUrl,
                COUNT(i.id) AS impressions,
                SUM(i.publisher_revenue) AS revenue,
                ROUND(
                    CASE WHEN COUNT(i.id) > 0
                        THEN (SUM(i.publisher_revenue) / COUNT(i.id)) * 1000
                        ELSE 0
                    END, 4
                ) AS ecpm
            FROM impressions i
            JOIN zones z ON i.zone_id = z.id
            JOIN sites s ON z.site_id = s.id
            JOIN publishers p ON s.publisher_id = p.id
            WHERE p.user_id = ?
              AND z.type = ?
              AND i.created_at >= ?
            GROUP BY s.id, s.name, s.url
            ORDER BY revenue DESC
            LIMIT 10
        `, userId, format, past);

        const totalDeviceImpr = deviceRaw.reduce((s, r) => s + Number(r.impressions || 0), 0);

        res.json({
            format,
            summary: {
                totalImpressions: curImpr,
                totalClicks: Number(cur.clicks || 0),
                totalRevenue: curRev.toFixed(4),
                eCPM: curImpr > 0 ? ((curRev / curImpr) * 1000).toFixed(4) : '0.0000',
                impressionChange: pctChange(curImpr, prevImpr),
                revenueChange: pctChange(curRev, prevRev),
            },
            daily: dailyRaw.map(r => ({
                date: String(r.date).slice(0, 10),
                impressions: Number(r.impressions || 0),
                clicks: Number(r.clicks || 0),
                revenue: Number(r.revenue || 0).toFixed(4),
                ecpm: Number(r.ecpm || 0).toFixed(4),
            })),
            geo: geoRaw.map(r => ({
                country: r.country || 'Unknown',
                impressions: Number(r.impressions || 0),
                revenue: Number(r.revenue || 0).toFixed(4),
            })),
            devices: deviceRaw.map(r => {
                const imp = Number(r.impressions || 0);
                return {
                    device: r.device || 'Unknown',
                    impressions: imp,
                    revenue: Number(r.revenue || 0).toFixed(4),
                    share: totalDeviceImpr > 0 ? parseFloat(((imp / totalDeviceImpr) * 100).toFixed(1)) : 0,
                };
            }),
            sites: sitesRaw.map(r => ({
                siteName: r.siteName || 'Unknown',
                siteUrl: r.siteUrl || '',
                impressions: Number(r.impressions || 0),
                revenue: Number(r.revenue || 0).toFixed(4),
                ecpm: Number(r.ecpm || 0).toFixed(4),
            })),
        });
    } catch (error) {
        console.error('[Publisher] Format stats error:', error);
        res.status(500).json({ error: 'Failed to fetch format stats' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/publisher/stats/export?period=30&format=ALL
// CSV export for publisher statistics
// ═══════════════════════════════════════════════════════════════════════════════
export const exportStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const days = parseInt(req.query.period) || 30;
        const format = req.query.format || 'ALL'; // ALL | POPUNDER | IN_PAGE_PUSH

        const past = new Date();
        past.setDate(past.getDate() - days);
        past.setHours(0, 0, 0, 0);

        const formatFilter = (() => {
            const ALLOWED = ['POPUNDER', 'IN_PAGE_PUSH', 'PUSH_NOTIFICATION'];
            return ALLOWED.includes(format) ? `AND z.type = '${format}'` : '';
        })();

        const rows = await prisma.$queryRawUnsafe(`
            SELECT
                DATE(i.created_at) AS date,
                z.type AS format,
                s.name AS site_name,
                s.url AS site_url,
                i.country,
                i.device,
                i.browser,
                COUNT(i.id) AS impressions,
                SUM(i.clicked) AS clicks,
                SUM(i.publisher_revenue) AS revenue,
                ROUND(
                    CASE WHEN COUNT(i.id) > 0
                        THEN (SUM(i.publisher_revenue) / COUNT(i.id)) * 1000
                        ELSE 0
                    END, 4
                ) AS ecpm
            FROM impressions i
            JOIN zones z ON i.zone_id = z.id
            JOIN sites s ON z.site_id = s.id
            JOIN publishers p ON s.publisher_id = p.id
            WHERE p.user_id = ?
              AND i.created_at >= ?
              ${formatFilter}
            GROUP BY DATE(i.created_at), z.type, s.id, i.country, i.device, i.browser
            ORDER BY date DESC, revenue DESC
        `, userId, past);

        const headers = ['Date', 'Format', 'Site', 'URL', 'Country', 'Device', 'Browser', 'Impressions', 'Clicks', 'Revenue ($)', 'eCPM ($)'];
        const csvRows = rows.map(r => [
            String(r.date).slice(0, 10),
            r.format || '',
            `"${(r.site_name || '').replace(/"/g, '""')}"`,
            r.site_url || '',
            r.country || '',
            r.device || '',
            r.browser || '',
            Number(r.impressions || 0),
            Number(r.clicks || 0),
            Number(r.revenue || 0).toFixed(4),
            Number(r.ecpm || 0).toFixed(4),
        ].join(','));

        const csv = [headers.join(','), ...csvRows].join('\n');
        const filename = `publisher-stats-${format.toLowerCase()}-${days}d.csv`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csv);
    } catch (error) {
        console.error('[Publisher] Export error:', error);
        res.status(500).json({ error: 'Failed to export stats' });
    }
};

