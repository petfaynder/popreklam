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
