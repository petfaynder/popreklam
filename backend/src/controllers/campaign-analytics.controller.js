import prisma from '../lib/prisma.js'
import crypto from 'crypto';

/**
 * GET /api/advertiser/campaigns/:id/analytics
 * Returns hourly impression/click data for the last 24h + country + device breakdown
 */
export const getCampaignAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id: campaignId } = req.params;

        // Verify campaign ownership
        const campaign = await prisma.campaign.findFirst({
            where: {
                id: campaignId,
                advertiser: { userId }
            }
        });

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        // Hourly data — last 24 hours
        const hourlyRaw = await prisma.$queryRaw`
            SELECT
                HOUR(i.created_at) AS hour,
                DATE(i.created_at) AS date,
                COUNT(i.id) AS impressions,
                SUM(i.clicked) AS clicks,
                SUM(i.revenue) AS spent
            FROM impressions i
            WHERE i.campaign_id = ${campaignId}
              AND i.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            GROUP BY DATE(i.created_at), HOUR(i.created_at)
            ORDER BY date ASC, hour ASC
        `;

        // Fill gaps: build a full 24-hour map
        const now = new Date();
        const hourMap = {};
        for (let h = 0; h < 24; h++) {
            const d = new Date(now);
            d.setHours(now.getHours() - (23 - h), 0, 0, 0);
            const label = `${d.toLocaleDateString('en', { month: 'short', day: 'numeric' })} ${d.getHours().toString().padStart(2, '0')}:00`;
            hourMap[`${d.toISOString().slice(0, 10)}_${d.getHours()}`] = {
                label,
                impressions: 0,
                clicks: 0,
                spent: 0,
                ctr: 0
            };
        }

        for (const row of hourlyRaw) {
            const key = `${String(row.date).slice(0, 10)}_${Number(row.hour)}`;
            if (hourMap[key]) {
                const imps = Number(row.impressions);
                const clks = Number(row.clicks);
                hourMap[key].impressions = imps;
                hourMap[key].clicks = clks;
                hourMap[key].spent = Number(row.spent || 0);
                hourMap[key].ctr = imps > 0 ? ((clks / imps) * 100).toFixed(2) : 0;
            }
        }

        const hourly = Object.values(hourMap);

        // Country breakdown
        const countryRaw = await prisma.$queryRaw`
            SELECT
                COALESCE(i.country, 'Unknown') AS country,
                COUNT(i.id) AS impressions,
                SUM(i.clicked) AS clicks,
                SUM(i.revenue) AS spent
            FROM impressions i
            WHERE i.campaign_id = ${campaignId}
            GROUP BY i.country
            ORDER BY impressions DESC
            LIMIT 10
        `;

        const countries = countryRaw.map(r => ({
            country: r.country,
            impressions: Number(r.impressions),
            clicks: Number(r.clicks),
            spent: Number(r.spent || 0),
            ctr: Number(r.impressions) > 0 ? ((Number(r.clicks) / Number(r.impressions)) * 100).toFixed(2) : '0.00'
        }));

        // Device breakdown
        const deviceRaw = await prisma.$queryRaw`
            SELECT
                COALESCE(i.device, 'Unknown') AS device,
                COUNT(i.id) AS impressions,
                SUM(i.clicked) AS clicks
            FROM impressions i
            WHERE i.campaign_id = ${campaignId}
            GROUP BY i.device
        `;

        const devices = deviceRaw.map(r => ({
            name: r.device,
            value: Number(r.impressions),
            clicks: Number(r.clicks)
        }));

        // Summary totals
        const summary = await prisma.campaign.findUnique({
            where: { id: campaignId },
            select: { totalImpressions: true, totalClicks: true, totalSpent: true, totalBudget: true, bidAmount: true, totalConversions: true }
        });

        // Conversion data — total & last 24h hourly trend
        const totalConversions = summary.totalConversions || 0;

        const conversionHourlyRaw = await prisma.$queryRaw`
            SELECT
                HOUR(c.created_at) AS hour,
                DATE(c.created_at) AS date,
                COUNT(c.id) AS conversions
            FROM conversions c
            WHERE c.campaign_id = ${campaignId}
              AND c.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            GROUP BY DATE(c.created_at), HOUR(c.created_at)
            ORDER BY date ASC, hour ASC
        `;

        // Recent conversions list (last 20)
        const recentConversions = await prisma.conversion.findMany({
            where: { campaignId },
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: {
                id: true,
                createdAt: true,
                ip: true,
                impressionId: true,
            }
        });

        // Merge conversion hourly into the existing hourMap
        for (const row of conversionHourlyRaw) {
            const key = `${String(row.date).slice(0, 10)}_${Number(row.hour)}`;
            if (hourMap[key]) {
                hourMap[key].conversions = Number(row.conversions);
            }
        }
        // Ensure all hourMap entries have conversions field
        for (const key of Object.keys(hourMap)) {
            if (hourMap[key].conversions === undefined) hourMap[key].conversions = 0;
        }
        const hourlyFinal = Object.values(hourMap);

        const conversionRate = summary.totalClicks > 0
            ? ((totalConversions / summary.totalClicks) * 100).toFixed(2)
            : '0.00';

        const cpa = totalConversions > 0
            ? (Number(summary.totalSpent) / totalConversions).toFixed(4)
            : null;

        res.json({
            campaign: { id: campaign.id, name: campaign.name, adFormat: campaign.adFormat, status: campaign.status },
            summary: {
                impressions: summary.totalImpressions,
                clicks: summary.totalClicks,
                spent: Number(summary.totalSpent),
                budget: Number(summary.totalBudget),
                ctr: summary.totalImpressions > 0 ? ((summary.totalClicks / summary.totalImpressions) * 100).toFixed(2) : '0.00',
                eCPM: summary.totalImpressions > 0 ? ((Number(summary.totalSpent) / summary.totalImpressions) * 1000).toFixed(4) : '0.0000',
                conversions: totalConversions,
                conversionRate,
                cpa,
            },
            hourly: hourlyFinal,
            countries,
            devices,
            recentConversions: recentConversions.map(c => ({
                id: c.id,
                impressionId: c.impressionId,
                ip: c.ip ? c.ip.replace(/\.\d+$/, '.***') : '—', // Mask last octet
                createdAt: c.createdAt,
            }))
        });

    } catch (error) {
        console.error('[Analytics] Campaign analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};

/**
 * GET /api/serve/pixel/:clickId
 * Conversion tracking pixel — 1x1 transparent GIF
 * Advertiser places this on their "Thank You" page
 */
export const conversionPixel = async (req, res) => {
    const { clickId } = req.params;

    try {
        // Find the impression by id (clicked must be true = user actually clicked)
        const impression = await prisma.impression.findFirst({
            where: { id: clickId, clicked: true }
        });

        if (impression) {
            // Only track once — prevent duplicate conversions
            const alreadyConverted = await prisma.conversion.findFirst({
                where: { impressionId: clickId }
            });

            if (!alreadyConverted) {
                await prisma.conversion.create({
                    data: {
                        impressionId: clickId,
                        campaignId: impression.campaignId,
                        ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '',
                        userAgent: req.headers['user-agent'] || ''
                    }
                });

                // Increment campaign conversion counter
                await prisma.campaign.update({
                    where: { id: impression.campaignId },
                    data: { totalConversions: { increment: 1 } }
                });
            }
        }
    } catch (err) {
        console.error('[Conversion] Pixel error:', err.message);
        // Silently fail — never break the advertiser's page
    }

    // Always return a 1x1 transparent GIF regardless of success
    const GIF_1x1 = Buffer.from(
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        'base64'
    );

    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.end(GIF_1x1);
};

/**
 * GET /api/advertiser/campaigns/:id/conversion-tag
 * Returns the conversion pixel HTML snippet for the advertiser to paste
 */
export const getConversionTag = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id: campaignId } = req.params;

        const campaign = await prisma.campaign.findFirst({
            where: { id: campaignId, advertiser: { userId } }
        });

        if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

        const apiUrl = process.env.APP_URL || 'http://localhost:5000';

        // The {CLICK_ID} placeholder will be replaced by our ad tag via URL parameter
        const tag = `<!-- PopReklam Conversion Pixel | Campaign: ${campaign.name} -->
<img src="${apiUrl}/api/serve/pixel/{CLICK_ID}" width="1" height="1" style="display:none;" alt="" />`;

        res.json({ tag, note: 'Place this pixel on your "Thank You" or conversion confirmation page. The {CLICK_ID} placeholder is automatically filled by our ad tag.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate conversion tag' });
    }
};
