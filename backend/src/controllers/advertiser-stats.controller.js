import prisma from '../lib/prisma.js';


// ═══════════════════════════════════════════════════════════════════════════════
// Helper: Build WHERE clauses from common filters
// ═══════════════════════════════════════════════════════════════════════════════
function buildDateFilter(query) {
    const { startDate, endDate, period } = query;
    if (startDate && endDate) {
        return { start: new Date(startDate), end: new Date(endDate + 'T23:59:59Z') };
    }
    const days = parseInt(period) || 30;
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);
    return { start, end };
}

function buildFilterSQL(query) {
    const parts = [];
    const params = [];

    if (query.format && query.format !== 'ALL') {
        parts.push('c.ad_format = ?');
        params.push(query.format);
    }
    if (query.countries) {
        const countryList = query.countries.split(',').map(c => c.trim()).filter(Boolean);
        if (countryList.length > 0) {
            parts.push(`i.country IN (${countryList.map(() => '?').join(',')})`);
            params.push(...countryList);
        }
    }
    if (query.device && query.device !== 'ALL') {
        parts.push('i.device = ?');
        params.push(query.device);
    }
    if (query.browser && query.browser !== 'ALL') {
        parts.push('i.browser = ?');
        params.push(query.browser);
    }
    if (query.os && query.os !== 'ALL') {
        parts.push('i.os = ?');
        params.push(query.os);
    }
    if (query.campaignIds) {
        const ids = query.campaignIds.split(',').map(c => c.trim()).filter(Boolean);
        if (ids.length > 0) {
            parts.push(`c.id IN (${ids.map(() => '?').join(',')})`);
            params.push(...ids);
        }
    }

    return { filterSQL: parts.length > 0 ? ' AND ' + parts.join(' AND ') : '', filterParams: params };
}


// ═══════════════════════════════════════════════════════════════════════════════
// Get Campaign Performance — returns { summary, campaigns, daily }
// ═══════════════════════════════════════════════════════════════════════════════
export const getCampaignPerformance = async (req, res) => {
    try {
        const userId = req.user.id;
        const { start, end } = buildDateFilter(req.query);
        const { filterSQL, filterParams } = buildFilterSQL(req.query);
        const groupBy = req.query.groupBy || 'day'; // hour | day | month

        // 1) Per-campaign breakdown
        const campStats = await prisma.$queryRawUnsafe(`
            SELECT 
                c.id,
                c.name,
                c.ad_format as adFormat,
                c.status,
                c.daily_budget as dailyBudget,
                c.total_budget as totalBudget,
                c.created_at as startDate,
                COUNT(i.id) as impressions,
                SUM(CASE WHEN i.clicked = 1 THEN 1 ELSE 0 END) as clicks,
                SUM(i.revenue) as spent
            FROM campaigns c
            JOIN advertisers a ON c.advertiser_id = a.id
            LEFT JOIN impressions i ON i.campaign_id = c.id
                AND i.created_at BETWEEN ? AND ?
            WHERE a.user_id = ?
            ${filterSQL}
            GROUP BY c.id, c.name, c.ad_format, c.status, c.daily_budget, c.total_budget, c.created_at
            ORDER BY spent DESC
        `, start, end, userId, ...filterParams);

        const campaigns = campStats.map(s => {
            const impressions = Number(s.impressions || 0);
            const clicks = Number(s.clicks || 0);
            const spent = Number(s.spent || 0);
            return {
                id: s.id,
                shortId: s.id ? s.id.substring(0, 8) : '—',
                name: s.name,
                adFormat: s.adFormat,
                status: s.status,
                impressions,
                clicks,
                spent,
                conversions: 0,
                ctr: impressions > 0 ? parseFloat(((clicks / impressions) * 100).toFixed(2)) : 0,
                cpm: impressions > 0 ? parseFloat(((spent / impressions) * 1000).toFixed(2)) : 0,
                cpa: 0,
                spend: spent,
                dailyBudget: Number(s.dailyBudget || 0),
                totalBudget: Number(s.totalBudget || 0),
                startDate: s.startDate,
            };
        });

        // 2) Aggregate summary
        const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
        const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
        const totalSpend = campaigns.reduce((s, c) => s + c.spent, 0);
        const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);

        const summary = {
            totalImpressions,
            totalClicks,
            totalSpend,
            totalConversions,
            ctr: totalImpressions > 0 ? parseFloat(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0,
            cpm: totalImpressions > 0 ? parseFloat(((totalSpend / totalImpressions) * 1000).toFixed(2)) : 0,
            cpa: totalConversions > 0 ? parseFloat((totalSpend / totalConversions).toFixed(2)) : 0,
            roi: totalSpend > 0 ? parseFloat(((totalConversions * 10 - totalSpend) / totalSpend * 100).toFixed(0)) : 0,
            impressionChange: 0,
            clickChange: 0,
            spendChange: 0,
            conversionChange: 0,
        };

        // 3) Daily time-series data (with groupBy support)
        let dateExpr, dateGroupExpr;
        if (groupBy === 'hour') {
            dateExpr = "DATE_FORMAT(i.created_at, '%Y-%m-%d %H:00')";
            dateGroupExpr = dateExpr;
        } else if (groupBy === 'month') {
            dateExpr = "DATE_FORMAT(i.created_at, '%Y-%m-01')";
            dateGroupExpr = dateExpr;
        } else {
            dateExpr = 'DATE(i.created_at)';
            dateGroupExpr = dateExpr;
        }

        const dailyStats = await prisma.$queryRawUnsafe(`
            SELECT 
                ${dateExpr} as date,
                COUNT(i.id) as impressions,
                SUM(CASE WHEN i.clicked = 1 THEN 1 ELSE 0 END) as clicks,
                SUM(i.revenue) as spend
            FROM impressions i
            JOIN campaigns c ON i.campaign_id = c.id
            JOIN advertisers a ON c.advertiser_id = a.id
            WHERE a.user_id = ?
            AND i.created_at BETWEEN ? AND ?
            ${filterSQL}
            GROUP BY ${dateGroupExpr}
            ORDER BY date ASC
        `, userId, start, end, ...filterParams);

        const daily = dailyStats.map(row => {
            const d = new Date(row.date);
            let label;
            if (groupBy === 'hour') {
                label = `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${d.getHours()}:00`;
            } else if (groupBy === 'month') {
                label = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            } else {
                label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
            return {
                date: label,
                rawDate: row.date,
                impressions: Number(row.impressions || 0),
                clicks: Number(row.clicks || 0),
                spend: parseFloat(Number(row.spend || 0).toFixed(2)),
                conversions: 0,
            };
        });

        res.json({ summary, campaigns, daily });
    } catch (error) {
        console.error('Campaign performance error:', error);
        res.status(500).json({ error: 'Failed to fetch campaign performance' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// Get ROI Analysis — per-campaign stats
// ═══════════════════════════════════════════════════════════════════════════════
export const getROIAnalysis = async (req, res) => {
    try {
        const userId = req.user.id;

        const stats = await prisma.$queryRaw`
            SELECT 
                c.id,
                c.name,
                c.total_budget as budget,
                SUM(i.revenue) as spent,
                COUNT(i.id) as impressions,
                SUM(CASE WHEN i.clicked = 1 THEN 1 ELSE 0 END) as clicks
            FROM campaigns c
            JOIN advertisers a ON c.advertiser_id = a.id
            LEFT JOIN impressions i ON i.campaign_id = c.id
            WHERE a.user_id = ${userId}
            GROUP BY c.id, c.name, c.total_budget
            ORDER BY spent DESC
        `;

        const campaigns = stats.map(s => {
            const spent = Number(s.spent || 0);
            const budget = Number(s.budget || 0);
            const impressions = Number(s.impressions || 0);
            const clicks = Number(s.clicks || 0);
            return {
                id: s.id,
                name: s.name,
                budget: budget,
                spent: spent,
                remaining: Math.max(0, budget - spent),
                impressions,
                clicks,
                cpc: clicks > 0 ? (spent / clicks).toFixed(4) : '0.0000',
                ctr: impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00',
            };
        });

        res.json({ campaigns });
    } catch (error) {
        console.error('ROI analysis error:', error);
        res.status(500).json({ error: 'Failed to fetch ROI analysis' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// Get Geographic Performance
// ═══════════════════════════════════════════════════════════════════════════════
export const getGeographicPerformance = async (req, res) => {
    try {
        const userId = req.user.id;
        const { start, end } = buildDateFilter(req.query);
        const { filterSQL, filterParams } = buildFilterSQL(req.query);

        const stats = await prisma.$queryRawUnsafe(`
            SELECT 
                i.country,
                COUNT(i.id) as impressions,
                SUM(CASE WHEN i.clicked = 1 THEN 1 ELSE 0 END) as clicks,
                SUM(i.revenue) as spent
            FROM impressions i
            JOIN campaigns c ON i.campaign_id = c.id
            JOIN advertisers a ON c.advertiser_id = a.id
            WHERE a.user_id = ?
            AND i.country IS NOT NULL
            AND i.created_at BETWEEN ? AND ?
            ${filterSQL}
            GROUP BY i.country
            ORDER BY impressions DESC
            LIMIT 20
        `, userId, start, end, ...filterParams);

        const countries = stats.map(s => ({
            name: s.country || 'Unknown',
            impressions: Number(s.impressions),
            clicks: Number(s.clicks),
            spent: Number(s.spent || 0),
            spend: Number(s.spent || 0),
            ctr: Number(s.impressions) > 0 ? (Number(s.clicks) / Number(s.impressions)) * 100 : 0
        }));

        res.json({ countries });
    } catch (error) {
        console.error('Geo performance error:', error);
        res.status(500).json({ error: 'Failed to fetch geo performance' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// Get Zone Performance (aggregate or per-campaign)
// ═══════════════════════════════════════════════════════════════════════════════
export const getZonePerformance = async (req, res) => {
    try {
        const userId = req.user.id;
        const { campaignId } = req.query;
        const { start, end } = buildDateFilter(req.query);

        // Build the WHERE clause dynamically
        let campaignFilter = '';
        const params = [start, end, userId];

        if (campaignId) {
            campaignFilter = 'AND c.id = ?';
            params.push(campaignId);
        }

        const stats = await prisma.$queryRawUnsafe(`
            SELECT 
                i.zone_id AS zoneId,
                z.name AS zoneName,
                s.name AS siteName,
                s.url AS siteUrl,
                COUNT(i.id) AS impressions,
                SUM(CASE WHEN i.clicked = 1 THEN 1 ELSE 0 END) AS clicks,
                SUM(i.revenue) AS spent
            FROM impressions i
            JOIN campaigns c ON i.campaign_id = c.id
            JOIN advertisers a ON c.advertiser_id = a.id
            LEFT JOIN zones z ON i.zone_id = z.id
            LEFT JOIN sites s ON z.site_id = s.id
            WHERE i.created_at BETWEEN ? AND ?
            AND a.user_id = ?
            ${campaignFilter}
            GROUP BY i.zone_id, z.name, s.name, s.url
            ORDER BY spent DESC
        `, ...params);

        const zones = stats.map(s => {
            const imp = Number(s.impressions || 0);
            const clicks = Number(s.clicks || 0);
            const spent = Number(s.spent || 0);
            return {
                zoneId: s.zoneId,
                shortId: s.zoneId ? s.zoneId.substring(0, 8) : '—',
                zoneName: s.zoneName || 'Unknown Zone',
                siteName: s.siteName || 'Unknown Site',
                siteUrl: s.siteUrl || '',
                impressions: imp,
                clicks,
                spent,
                ctr: imp > 0 ? ((clicks / imp) * 100) : 0,
                cpm: imp > 0 ? ((spent / imp) * 1000) : 0,
            };
        });

        res.json({ zones });
    } catch (error) {
        console.error('Zone performance error:', error);
        res.status(500).json({ error: 'Failed to fetch zone performance' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// Get Device Performance
// ═══════════════════════════════════════════════════════════════════════════════
export const getDevicePerformance = async (req, res) => {
    try {
        const userId = req.user.id;
        const { start, end } = buildDateFilter(req.query);
        const { filterSQL, filterParams } = buildFilterSQL(req.query);

        const stats = await prisma.$queryRawUnsafe(`
            SELECT 
                i.device,
                COUNT(i.id) as impressions,
                SUM(CASE WHEN i.clicked = 1 THEN 1 ELSE 0 END) as clicks,
                SUM(i.revenue) as spent
            FROM impressions i
            JOIN campaigns c ON i.campaign_id = c.id
            JOIN advertisers a ON c.advertiser_id = a.id
            WHERE a.user_id = ?
            AND i.device IS NOT NULL
            AND i.created_at BETWEEN ? AND ?
            ${filterSQL}
            GROUP BY i.device
        `, userId, start, end, ...filterParams);

        const totalImpressions = stats.reduce((s, row) => s + Number(row.impressions || 0), 0);

        const devices = stats.map(s => {
            const impressions = Number(s.impressions || 0);
            return {
                name: s.device || 'Unknown',
                device: s.device,
                impressions,
                clicks: Number(s.clicks || 0),
                spent: Number(s.spent || 0),
                share: totalImpressions > 0 ? parseFloat(((impressions / totalImpressions) * 100).toFixed(1)) : 0,
                conversions: 0,
            };
        });

        res.json({ devices });
    } catch (error) {
        console.error('Device performance error:', error);
        res.status(500).json({ error: 'Failed to fetch device performance' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// Get Browser Performance (NEW)
// ═══════════════════════════════════════════════════════════════════════════════
export const getBrowserPerformance = async (req, res) => {
    try {
        const userId = req.user.id;
        const { start, end } = buildDateFilter(req.query);
        const { filterSQL, filterParams } = buildFilterSQL(req.query);

        const stats = await prisma.$queryRawUnsafe(`
            SELECT 
                COALESCE(i.browser, 'Unknown') as browser,
                COUNT(i.id) as impressions,
                SUM(CASE WHEN i.clicked = 1 THEN 1 ELSE 0 END) as clicks,
                SUM(i.revenue) as spent
            FROM impressions i
            JOIN campaigns c ON i.campaign_id = c.id
            JOIN advertisers a ON c.advertiser_id = a.id
            WHERE a.user_id = ?
            AND i.created_at BETWEEN ? AND ?
            ${filterSQL}
            GROUP BY browser
            ORDER BY impressions DESC
        `, userId, start, end, ...filterParams);

        const totalImpressions = stats.reduce((s, row) => s + Number(row.impressions || 0), 0);

        const browsers = stats.map(s => {
            const impressions = Number(s.impressions || 0);
            const clicks = Number(s.clicks || 0);
            const spent = Number(s.spent || 0);
            return {
                name: s.browser,
                impressions,
                clicks,
                spent,
                ctr: impressions > 0 ? parseFloat(((clicks / impressions) * 100).toFixed(2)) : 0,
                cpm: impressions > 0 ? parseFloat(((spent / impressions) * 1000).toFixed(2)) : 0,
                share: totalImpressions > 0 ? parseFloat(((impressions / totalImpressions) * 100).toFixed(1)) : 0,
            };
        });

        res.json({ browsers });
    } catch (error) {
        console.error('Browser performance error:', error);
        res.status(500).json({ error: 'Failed to fetch browser performance' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// Get OS Performance (NEW)
// ═══════════════════════════════════════════════════════════════════════════════
export const getOSPerformance = async (req, res) => {
    try {
        const userId = req.user.id;
        const { start, end } = buildDateFilter(req.query);
        const { filterSQL, filterParams } = buildFilterSQL(req.query);

        const stats = await prisma.$queryRawUnsafe(`
            SELECT 
                COALESCE(i.os, 'Unknown') as os,
                COUNT(i.id) as impressions,
                SUM(CASE WHEN i.clicked = 1 THEN 1 ELSE 0 END) as clicks,
                SUM(i.revenue) as spent
            FROM impressions i
            JOIN campaigns c ON i.campaign_id = c.id
            JOIN advertisers a ON c.advertiser_id = a.id
            WHERE a.user_id = ?
            AND i.created_at BETWEEN ? AND ?
            ${filterSQL}
            GROUP BY os
            ORDER BY impressions DESC
        `, userId, start, end, ...filterParams);

        const totalImpressions = stats.reduce((s, row) => s + Number(row.impressions || 0), 0);

        const operatingSystems = stats.map(s => {
            const impressions = Number(s.impressions || 0);
            const clicks = Number(s.clicks || 0);
            const spent = Number(s.spent || 0);
            return {
                name: s.os,
                impressions,
                clicks,
                spent,
                ctr: impressions > 0 ? parseFloat(((clicks / impressions) * 100).toFixed(2)) : 0,
                cpm: impressions > 0 ? parseFloat(((spent / impressions) * 1000).toFixed(2)) : 0,
                share: totalImpressions > 0 ? parseFloat(((impressions / totalImpressions) * 100).toFixed(1)) : 0,
            };
        });

        res.json({ operatingSystems });
    } catch (error) {
        console.error('OS performance error:', error);
        res.status(500).json({ error: 'Failed to fetch OS performance' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// Get In-Page Push Stats (NEW)
// ═══════════════════════════════════════════════════════════════════════════════
export const getInPagePushStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const { start, end } = buildDateFilter(req.query);
        const groupBy = req.query.groupBy || 'day';

        // Campaign breakdown filtered to IN_PAGE_PUSH only
        const campStats = await prisma.$queryRawUnsafe(`
            SELECT 
                c.id,
                c.name,
                c.status,
                c.daily_budget as dailyBudget,
                c.total_budget as totalBudget,
                c.created_at as startDate,
                COUNT(i.id) as impressions,
                SUM(CASE WHEN i.clicked = 1 THEN 1 ELSE 0 END) as clicks,
                SUM(i.revenue) as spent
            FROM campaigns c
            JOIN advertisers a ON c.advertiser_id = a.id
            LEFT JOIN impressions i ON i.campaign_id = c.id
                AND i.created_at BETWEEN ? AND ?
            WHERE a.user_id = ?
            AND c.ad_format = 'IN_PAGE_PUSH'
            GROUP BY c.id, c.name, c.status, c.daily_budget, c.total_budget, c.created_at
            ORDER BY spent DESC
        `, start, end, userId);

        const campaigns = campStats.map(s => {
            const impressions = Number(s.impressions || 0);
            const clicks = Number(s.clicks || 0);
            const spent = Number(s.spent || 0);
            return {
                id: s.id,
                name: s.name,
                status: s.status,
                impressions,
                clicks,
                spent,
                ctr: impressions > 0 ? parseFloat(((clicks / impressions) * 100).toFixed(2)) : 0,
                cpm: impressions > 0 ? parseFloat(((spent / impressions) * 1000).toFixed(2)) : 0,
                dailyBudget: Number(s.dailyBudget || 0),
                totalBudget: Number(s.totalBudget || 0),
                startDate: s.startDate,
            };
        });

        const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
        const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
        const totalSpend = campaigns.reduce((s, c) => s + c.spent, 0);

        const summary = {
            totalImpressions,
            totalClicks,
            totalSpend,
            ctr: totalImpressions > 0 ? parseFloat(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0,
            cpm: totalImpressions > 0 ? parseFloat(((totalSpend / totalImpressions) * 1000).toFixed(2)) : 0,
            activeCampaigns: campaigns.filter(c => c.status === 'ACTIVE').length,
        };

        // Daily time-series
        let dateExpr;
        if (groupBy === 'hour') {
            dateExpr = "DATE_FORMAT(i.created_at, '%Y-%m-%d %H:00')";
        } else if (groupBy === 'month') {
            dateExpr = "DATE_FORMAT(i.created_at, '%Y-%m-01')";
        } else {
            dateExpr = 'DATE(i.created_at)';
        }

        const dailyStats = await prisma.$queryRawUnsafe(`
            SELECT 
                ${dateExpr} as date,
                COUNT(i.id) as impressions,
                SUM(CASE WHEN i.clicked = 1 THEN 1 ELSE 0 END) as clicks,
                SUM(i.revenue) as spend
            FROM impressions i
            JOIN campaigns c ON i.campaign_id = c.id
            JOIN advertisers a ON c.advertiser_id = a.id
            WHERE a.user_id = ?
            AND c.ad_format = 'IN_PAGE_PUSH'
            AND i.created_at BETWEEN ? AND ?
            GROUP BY ${dateExpr}
            ORDER BY date ASC
        `, userId, start, end);

        const daily = dailyStats.map(row => {
            const d = new Date(row.date);
            let label;
            if (groupBy === 'hour') {
                label = `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${d.getHours()}:00`;
            } else if (groupBy === 'month') {
                label = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            } else {
                label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
            return {
                date: label,
                impressions: Number(row.impressions || 0),
                clicks: Number(row.clicks || 0),
                spend: parseFloat(Number(row.spend || 0).toFixed(2)),
            };
        });

        res.json({ summary, campaigns, daily });
    } catch (error) {
        console.error('In-page push stats error:', error);
        res.status(500).json({ error: 'Failed to fetch in-page push stats' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// CSV Export — returns all campaign data as CSV
// ═══════════════════════════════════════════════════════════════════════════════
export const exportCSV = async (req, res) => {
    try {
        const userId = req.user.id;
        const { start, end } = buildDateFilter(req.query);
        const { filterSQL, filterParams } = buildFilterSQL(req.query);

        const campStats = await prisma.$queryRawUnsafe(`
            SELECT 
                c.id,
                c.name,
                c.ad_format as adFormat,
                c.status,
                c.daily_budget as dailyBudget,
                c.total_budget as totalBudget,
                c.created_at as startDate,
                COUNT(i.id) as impressions,
                SUM(CASE WHEN i.clicked = 1 THEN 1 ELSE 0 END) as clicks,
                SUM(i.revenue) as spent
            FROM campaigns c
            JOIN advertisers a ON c.advertiser_id = a.id
            LEFT JOIN impressions i ON i.campaign_id = c.id
                AND i.created_at BETWEEN ? AND ?
            WHERE a.user_id = ?
            ${filterSQL}
            GROUP BY c.id, c.name, c.ad_format, c.status, c.daily_budget, c.total_budget, c.created_at
            ORDER BY spent DESC
        `, start, end, userId, ...filterParams);

        // Build CSV
        const headers = ['Campaign', 'ID', 'Format', 'Status', 'Impressions', 'Clicks', 'CTR', 'CPM', 'Spend', 'Daily Budget', 'Total Budget', 'Start Date'];
        const rows = campStats.map(s => {
            const impressions = Number(s.impressions || 0);
            const clicks = Number(s.clicks || 0);
            const spent = Number(s.spent || 0);
            const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';
            const cpm = impressions > 0 ? ((spent / impressions) * 1000).toFixed(2) : '0.00';
            return [
                `"${(s.name || '').replace(/"/g, '""')}"`,
                s.id ? s.id.substring(0, 8) : '',
                s.adFormat || '',
                s.status || '',
                impressions,
                clicks,
                ctr + '%',
                '$' + cpm,
                '$' + spent.toFixed(2),
                '$' + Number(s.dailyBudget || 0).toFixed(2),
                '$' + Number(s.totalBudget || 0).toFixed(2),
                s.startDate ? new Date(s.startDate).toISOString().split('T')[0] : '',
            ].join(',');
        });

        const csv = [headers.join(','), ...rows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="campaign-stats.csv"');
        res.send(csv);
    } catch (error) {
        console.error('CSV export error:', error);
        res.status(500).json({ error: 'Failed to export CSV' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// Get Filter Options (distinct values for dropdowns)
// ═══════════════════════════════════════════════════════════════════════════════
export const getFilterOptions = async (req, res) => {
    try {
        const userId = req.user.id;

        const [countries, browsers, oses, devices] = await Promise.all([
            prisma.$queryRaw`
                SELECT DISTINCT i.country FROM impressions i
                JOIN campaigns c ON i.campaign_id = c.id
                JOIN advertisers a ON c.advertiser_id = a.id
                WHERE a.user_id = ${userId} AND i.country IS NOT NULL
                ORDER BY i.country ASC
                LIMIT 100
            `,
            prisma.$queryRaw`
                SELECT DISTINCT i.browser FROM impressions i
                JOIN campaigns c ON i.campaign_id = c.id
                JOIN advertisers a ON c.advertiser_id = a.id
                WHERE a.user_id = ${userId} AND i.browser IS NOT NULL
                ORDER BY i.browser ASC
            `,
            prisma.$queryRaw`
                SELECT DISTINCT i.os FROM impressions i
                JOIN campaigns c ON i.campaign_id = c.id
                JOIN advertisers a ON c.advertiser_id = a.id
                WHERE a.user_id = ${userId} AND i.os IS NOT NULL
                ORDER BY i.os ASC
            `,
            prisma.$queryRaw`
                SELECT DISTINCT i.device FROM impressions i
                JOIN campaigns c ON i.campaign_id = c.id
                JOIN advertisers a ON c.advertiser_id = a.id
                WHERE a.user_id = ${userId} AND i.device IS NOT NULL
                ORDER BY i.device ASC
            `,
        ]);

        res.json({
            countries: countries.map(c => c.country),
            browsers: browsers.map(b => b.browser),
            operatingSystems: oses.map(o => o.os),
            devices: devices.map(d => d.device),
        });
    } catch (error) {
        console.error('Filter options error:', error);
        res.status(500).json({ error: 'Failed to fetch filter options' });
    }
};
