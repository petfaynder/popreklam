import prisma from '../lib/prisma.js';

const VALID_REASONS = ['MISLEADING', 'INAPPROPRIATE', 'MALWARE', 'SPAM', 'OTHER'];

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/publisher/reports
// Publisher submits a report about a bad ad on their zone
// ──────────────────────────────────────────────────────────────────────────────
export async function createReport(req, res) {
    try {
        const userId = req.user.id;
        const { zoneId, reason, description } = req.body;

        if (!zoneId) return res.status(400).json({ error: 'zoneId is required' });
        if (!reason || !VALID_REASONS.includes(reason)) {
            return res.status(400).json({ error: `reason must be one of: ${VALID_REASONS.join(', ')}` });
        }

        // Verify the zone belongs to this publisher
        const publisher = await prisma.publisher.findUnique({
            where: { userId },
            include: { sites: { include: { zones: { where: { id: zoneId } } } } }
        });

        if (!publisher) return res.status(403).json({ error: 'Publisher not found' });

        const zone = publisher.sites.flatMap(s => s.zones).find(z => z.id === zoneId);
        if (!zone) return res.status(403).json({ error: 'Zone not found or not owned by you' });

        // Try to find the most recent campaign that served on this zone (last 24h)
        const recentImpression = await prisma.impression.findFirst({
            where: {
                zoneId,
                createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                trafficStatus: { not: 'INVALID' }
            },
            orderBy: { createdAt: 'desc' },
            select: { campaignId: true }
        });

        const report = await prisma.adReport.create({
            data: {
                publisherId: publisher.id,
                zoneId,
                campaignId: recentImpression?.campaignId || null,
                reason,
                description: description?.trim() || null,
            }
        });

        res.status(201).json({ success: true, report });
    } catch (err) {
        console.error('[PublisherReports] Create error:', err);
        res.status(500).json({ error: 'Failed to submit report' });
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/publisher/reports
// Publisher lists their own submitted reports
// ──────────────────────────────────────────────────────────────────────────────
export async function getMyReports(req, res) {
    try {
        const userId = req.user.id;

        const publisher = await prisma.publisher.findUnique({ where: { userId } });
        if (!publisher) return res.status(403).json({ error: 'Publisher not found' });

        const reports = await prisma.adReport.findMany({
            where: { publisherId: publisher.id },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        // Enrich with zone and campaign names
        const enriched = await Promise.all(reports.map(async (r) => {
            let zoneName = null;
            let campaignName = null;

            if (r.zoneId) {
                const z = await prisma.zone.findUnique({ where: { id: r.zoneId }, select: { name: true } });
                zoneName = z?.name;
            }
            if (r.campaignId) {
                const c = await prisma.campaign.findUnique({ where: { id: r.campaignId }, select: { name: true } });
                campaignName = c?.name;
            }

            return { ...r, zoneName, campaignName };
        }));

        res.json({ reports: enriched });
    } catch (err) {
        console.error('[PublisherReports] List error:', err);
        res.status(500).json({ error: 'Failed to load reports' });
    }
}
