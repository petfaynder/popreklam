import prisma from '../lib/prisma.js';


class YieldOptimizationService {

    /**
     * Generates actionable recommendations for a publisher to increase their revenue
     * @param {string} userId - The authenticated user's ID
     * @returns {Promise<Array>} - Array of recommendation objects
     */
    async getRecommendations(userId) {
        const recommendations = [];

        try {
            // 1. Get the publisher
            const publisher = await prisma.publisher.findUnique({
                where: { userId },
                include: {
                    sites: {
                        include: {
                            zones: true
                        }
                    }
                }
            });

            if (!publisher || publisher.sites.length === 0) {
                return []; // No sites to optimize yet
            }

            // Date 7 days ago for recent stats
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            for (const site of publisher.sites) {
                if (site.status !== 'ACTIVE') continue;

                // Grab recent stats for this site
                const stats = await prisma.$queryRaw`
                    SELECT 
                        COUNT(i.id) as total_impressions,
                        SUM(i.clicked) as total_clicks,
                        SUM(CASE WHEN i.device = 'Mobile' THEN 1 ELSE 0 END) as mobile_impressions,
                        SUM(CASE WHEN i.country IN ('US', 'GB', 'CA', 'AU') THEN 1 ELSE 0 END) as tier1_impressions
                    FROM impressions i
                    JOIN zones z ON i.zone_id = z.id
                    WHERE z.site_id = ${site.id}
                    AND i.created_at >= ${sevenDaysAgo}
                `;

                const siteStats = stats[0] || {
                    total_impressions: 0n, total_clicks: 0n, mobile_impressions: 0n, tier1_impressions: 0n
                };

                const totalImpressions = Number(siteStats.total_impressions || 0);

                // If not enough traffic to make statistically significant recommendations, skip
                if (totalImpressions < 500) continue;

                const mobileRatio = Number(siteStats.mobile_impressions || 0) / totalImpressions;
                const tier1Ratio = Number(siteStats.tier1_impressions || 0) / totalImpressions;
                const activeFormats = site.zones.filter(z => z.isActive).map(z => z.adFormat);

                // --- RULE 1: Mobile Traffic Optimization ---
                // If high mobile traffic (>60%) and no IN_PAGE_PUSH
                if (mobileRatio > 0.60 && !activeFormats.includes('IN_PAGE_PUSH')) {
                    recommendations.push({
                        id: `rec-mobile-ipp-${site.id}`,
                        type: 'format_opportunity',
                        severity: 'high',
                        siteName: site.name,
                        title: 'Capitalize on Mobile Traffic',
                        description: `Your site **${site.url}** receives ${(mobileRatio * 100).toFixed(1)}% mobile traffic. Adding an **In-Page Push** zone is highly recommended as it performs exceptionally well on mobile devices, potentially increasing your yield by 15-25%.`,
                        actionLabel: 'Create In-Page Push Zone',
                        actionLink: `/publisher/zones/create?siteId=${site.id}&format=IN_PAGE_PUSH`,
                        icon: 'smartphone'
                    });
                }

                // --- RULE 2: High Tier-1 Traffic Opportunity ---
                // If high Tier 1 traffic (>20%) and no DIRECT_LINK
                if (tier1Ratio > 0.20 && !activeFormats.includes('DIRECT_LINK')) {
                    recommendations.push({
                        id: `rec-tier1-dl-${site.id}`,
                        type: 'revenue_opportunity',
                        severity: 'medium',
                        siteName: site.name,
                        title: 'High-Intent Smartlink Opportunity',
                        description: `We noticed ${(tier1Ratio * 100).toFixed(1)}% of traffic on **${site.url}** comes from premium Tier 1 countries (US, UK, CA, AU). Using a **Direct Link** on high-intent buttons (like Download or Play) can capture highly lucrative CPA payouts.`,
                        actionLabel: 'Create Direct Link',
                        actionLink: `/publisher/zones/create?siteId=${site.id}&format=DIRECT_LINK`,
                        icon: 'globe'
                    });
                }

                // --- RULE 3: Underutilized Placements ---
                // If they only have 1 active format but decent traffic
                if (activeFormats.length === 1 && totalImpressions > 5000) {
                    const currentFormat = activeFormats[0];
                    const suggestedFormat = currentFormat === 'POPUNDER' ? 'BANNER' : 'POPUNDER';
                    recommendations.push({
                        id: `rec-diversify-${site.id}`,
                        type: 'diversification',
                        severity: 'low',
                        siteName: site.name,
                        title: 'Diversify Ad Formats',
                        description: `You are currently only monetizing **${site.url}** with ${currentFormat.replace('_', ' ')}. Consider adding a **${suggestedFormat}** zone to capture distinct audiences without cannibalizing your existing revenue.`,
                        actionLabel: 'Explore Ad Formats',
                        actionLink: `/publisher/zones/create?siteId=${site.id}`,
                        icon: 'layers'
                    });
                }

                // --- RULE 4: Low CTR Warning for specific zones ---
                for (const zone of site.zones) {
                    if (!zone.isActive) continue;

                    // Query zone specific stats
                    const zoneStatsQ = await prisma.$queryRaw`
                        SELECT COUNT(id) as imp, SUM(clicked) as clicks 
                        FROM impressions 
                        WHERE zone_id = ${zone.id} AND created_at >= ${sevenDaysAgo}
                    `;
                    const zStats = zoneStatsQ[0] || { imp: 0n, clicks: 0n };
                    const zImp = Number(zStats.imp || 0);
                    const zClicks = Number(zStats.clicks || 0);

                    if (zImp > 2000) {
                        const ctr = (zClicks / zImp) * 100;
                        if (ctr < 0.1 && zone.adFormat !== 'POPUNDER' && zone.adFormat !== 'DIRECT_LINK') {
                            recommendations.push({
                                id: `rec-lowctr-${zone.id}`,
                                type: 'performance_warning',
                                severity: 'high',
                                siteName: site.name,
                                title: `Low CTR on ${zone.name}`,
                                description: `The zone **${zone.name}** has a very low Click-Through Rate (${ctr.toFixed(2)}%). Consider moving this ad placement higher up on the page (above the fold) to improve visibility and earnings.`,
                                actionLabel: 'Review Zone Settings',
                                actionLink: `/publisher/zones`,
                                icon: 'trending-down'
                            });
                        }
                    }
                }
            }

            // Sort by severity (high -> medium -> low)
            const severityWeight = { high: 3, medium: 2, low: 1 };
            recommendations.sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity]);

            return recommendations;

        } catch (error) {
            console.error('[YieldOptimization] Error generating recommendations:', error);
            // Fail gracefully
            return [];
        }
    }
}

export const yieldOptimizationService = new YieldOptimizationService();
