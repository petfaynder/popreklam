import prisma from '../lib/prisma.js';

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/admin/ad-quality/overview
// Summary stats for the Ad Quality page header cards
// ──────────────────────────────────────────────────────────────────────────────
export async function getOverview(req, res) {
    try {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [openReports, resolvedThisWeek, totalReports] = await Promise.all([
            prisma.adReport.count({ where: { status: 'OPEN' } }),
            prisma.adReport.count({
                where: { status: { in: ['RESOLVED', 'DISMISSED'] }, resolvedAt: { gte: weekAgo } }
            }),
            prisma.adReport.count(),
        ]);

        // Campaigns with high avg fraud score in last 7 days
        const fraudyImpressions = await prisma.$queryRaw`
            SELECT campaign_id, AVG(fraud_score) as avg_score, COUNT(*) as imp_count
            FROM impressions
            WHERE created_at >= ${weekAgo}
            GROUP BY campaign_id
            HAVING avg_score > 40
            ORDER BY avg_score DESC
            LIMIT 100
        `;

        res.json({
            openReports,
            resolvedThisWeek,
            totalReports,
            fraudFlaggedCampaigns: fraudyImpressions.length,
        });
    } catch (err) {
        console.error('[AdQuality] Overview error:', err);
        res.status(500).json({ error: 'Failed to load overview' });
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/admin/ad-quality/fraud-signals
// Campaigns flagged automatically by fraud score or CTR anomaly
// ──────────────────────────────────────────────────────────────────────────────
export async function getFraudSignals(req, res) {
    try {
        const days = parseInt(req.query.days) || 7;
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        // Aggregate impressions by campaign for the period
        const rows = await prisma.$queryRaw`
            SELECT
                i.campaign_id                           AS campaignId,
                c.name                                  AS campaignName,
                c.target_url                            AS targetUrl,
                c.ad_format                             AS adFormat,
                c.status                                AS campaignStatus,
                u.email                                 AS advertiserEmail,
                AVG(i.fraud_score)                      AS avgFraudScore,
                COUNT(*)                                AS impressions,
                SUM(CASE WHEN i.clicked = 1 THEN 1 ELSE 0 END) AS clicks,
                SUM(CASE WHEN i.traffic_status = 'INVALID' THEN 1 ELSE 0 END) AS invalidCount,
                SUM(CASE WHEN i.traffic_status = 'PENDING' THEN 1 ELSE 0 END) AS pendingCount
            FROM impressions i
            JOIN campaigns c ON c.id = i.campaign_id
            JOIN advertisers adv ON adv.id = c.advertiser_id
            JOIN users u ON u.id = adv.user_id
            WHERE i.created_at >= ${since}
            GROUP BY i.campaign_id, c.name, c.target_url, c.ad_format, c.status, u.email
            HAVING
                AVG(i.fraud_score) > 35
                OR (COUNT(*) > 50 AND SUM(CASE WHEN i.clicked = 1 THEN 1 ELSE 0 END) / COUNT(*) > 0.15)
                OR (COUNT(*) > 50 AND SUM(CASE WHEN i.clicked = 1 THEN 1 ELSE 0 END) / COUNT(*) < 0.001)
            ORDER BY AVG(i.fraud_score) DESC
            LIMIT 100
        `;

        const signals = rows.map(r => {
            const imp = Number(r.impressions) || 0;
            const clk = Number(r.clicks) || 0;
            const ctr = imp > 0 ? ((clk / imp) * 100).toFixed(2) : '0.00';
            const avgFraud = Number(r.avgFraudScore).toFixed(1);

            // Determine flag reason(s)
            const flags = [];
            if (Number(r.avgFraudScore) > 35) flags.push('High Fraud Score');
            if (imp > 50 && (clk / imp) > 0.15) flags.push('Abnormally High CTR');
            if (imp > 50 && (clk / imp) < 0.001) flags.push('Suspiciously Low CTR');

            return {
                campaignId: r.campaignId,
                campaignName: r.campaignName,
                targetUrl: r.targetUrl,
                adFormat: r.adFormat,
                campaignStatus: r.campaignStatus,
                advertiserEmail: r.advertiserEmail,
                avgFraudScore: parseFloat(avgFraud),
                impressions: imp,
                clicks: clk,
                ctr: parseFloat(ctr),
                invalidCount: Number(r.invalidCount),
                pendingCount: Number(r.pendingCount),
                flags,
            };
        });

        res.json({ signals, period: days });
    } catch (err) {
        console.error('[AdQuality] Fraud signals error:', err);
        res.status(500).json({ error: 'Failed to load fraud signals' });
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/admin/ad-quality/reports
// Publisher-submitted ad reports
// ──────────────────────────────────────────────────────────────────────────────
export async function getPublisherReports(req, res) {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (status) where.status = status;

        const [reports, total] = await Promise.all([
            prisma.adReport.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    publisher: {
                        include: { user: { select: { email: true } } }
                    }
                }
            }),
            prisma.adReport.count({ where })
        ]);

        // Enrich with campaign and zone info if available
        const enriched = await Promise.all(reports.map(async (r) => {
            let campaignInfo = null;
            let zoneInfo = null;

            if (r.campaignId) {
                const camp = await prisma.campaign.findUnique({
                    where: { id: r.campaignId },
                    select: {
                        name: true, targetUrl: true, adFormat: true, status: true,
                        advertiser: { include: { user: { select: { email: true } } } }
                    }
                });
                if (camp) {
                    campaignInfo = {
                        name: camp.name,
                        targetUrl: camp.targetUrl,
                        adFormat: camp.adFormat,
                        status: camp.status,
                        advertiserEmail: camp.advertiser?.user?.email
                    };
                }
            }

            if (r.zoneId) {
                const zone = await prisma.zone.findUnique({
                    where: { id: r.zoneId },
                    select: { name: true, type: true, site: { select: { name: true, url: true } } }
                });
                if (zone) zoneInfo = { name: zone.name, type: zone.type, siteName: zone.site?.name, siteUrl: zone.site?.url };
            }

            return {
                id: r.id,
                reason: r.reason,
                description: r.description,
                status: r.status,
                adminNote: r.adminNote,
                createdAt: r.createdAt,
                resolvedAt: r.resolvedAt,
                publisherEmail: r.publisher?.user?.email,
                publisherId: r.publisherId,
                campaignId: r.campaignId,
                zoneId: r.zoneId,
                campaign: campaignInfo,
                zone: zoneInfo,
            };
        }));

        res.json({
            reports: enriched,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (err) {
        console.error('[AdQuality] Reports error:', err);
        res.status(500).json({ error: 'Failed to load reports' });
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/ad-quality/reports/:id
// Resolve or dismiss a publisher report
// ──────────────────────────────────────────────────────────────────────────────
export async function updateReportStatus(req, res) {
    try {
        const { id } = req.params;
        const { status, adminNote } = req.body;

        if (!['RESOLVED', 'DISMISSED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be RESOLVED or DISMISSED.' });
        }

        const report = await prisma.adReport.update({
            where: { id },
            data: {
                status,
                adminNote: adminNote || null,
                resolvedAt: new Date(),
            }
        });

        res.json({ success: true, report });
    } catch (err) {
        console.error('[AdQuality] Update report error:', err);
        res.status(500).json({ error: 'Failed to update report' });
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/admin/ad-quality/reports/:id/pause-campaign
// Pause the campaign associated with this report
// ──────────────────────────────────────────────────────────────────────────────
export async function pauseCampaignFromReport(req, res) {
    try {
        const { id } = req.params;

        const report = await prisma.adReport.findUnique({ where: { id } });
        if (!report) return res.status(404).json({ error: 'Report not found' });
        if (!report.campaignId) return res.status(400).json({ error: 'No campaign associated with this report' });

        await prisma.campaign.update({
            where: { id: report.campaignId },
            data: { status: 'PAUSED' }
        });

        // Auto-resolve the report
        await prisma.adReport.update({
            where: { id },
            data: {
                status: 'RESOLVED',
                adminNote: (req.body.adminNote || '') || 'Campaign paused via Ad Quality report.',
                resolvedAt: new Date(),
            }
        });

        res.json({ success: true, message: 'Campaign paused and report resolved.' });
    } catch (err) {
        console.error('[AdQuality] Pause campaign error:', err);
        res.status(500).json({ error: 'Failed to pause campaign' });
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/admin/ad-quality/fraud-signals/:campaignId/pause
// Directly pause a fraud-flagged campaign
// ──────────────────────────────────────────────────────────────────────────────
export async function pauseFraudCampaign(req, res) {
    try {
        const { campaignId } = req.params;

        const campaign = await prisma.campaign.update({
            where: { id: campaignId },
            data: { status: 'PAUSED' }
        });

        res.json({ success: true, campaign });
    } catch (err) {
        console.error('[AdQuality] Pause fraud campaign error:', err);
        res.status(500).json({ error: 'Failed to pause campaign' });
    }
}
