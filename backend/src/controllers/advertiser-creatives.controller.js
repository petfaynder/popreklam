import prisma from '../lib/prisma.js'
/**
 * GET /api/advertiser/campaigns/:id/creatives
 * List all creatives for a campaign with their weights and A/B stats.
 */
export const getCreatives = async (req, res) => {
    try {
        const { id: campaignId } = req.params;
        const userId = req.user.id;

        // Verify ownership
        const campaign = await prisma.campaign.findFirst({
            where: { id: campaignId, advertiser: { userId } },
            include: { creatives: { orderBy: { createdAt: 'asc' } } }
        });

        if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

        // Compute impression counts per creative (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const stats = await prisma.impression.groupBy({
            by: ['creativeId'],
            where: {
                campaignId,
                createdAt: { gte: sevenDaysAgo },
                creativeId: { not: null }
            },
            _count: { id: true },
            _sum: { revenue: true }
        });

        const statMap = {};
        for (const s of stats) {
            if (s.creativeId) {
                statMap[s.creativeId] = {
                    impressions: s._count.id,
                    spent: Number(s._sum.revenue || 0)
                };
            }
        }

        const creatives = campaign.creatives.map(c => ({
            ...c,
            weight: c.weight,
            label: c.label,
            stats: statMap[c.id] || { impressions: 0, spent: 0 }
        }));

        res.json({ creatives });
    } catch (error) {
        console.error('getCreatives error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * PUT /api/advertiser/campaigns/:id/creatives/:creativeId
 * Update a creative's label and A/B weight.
 */
export const updateCreativeWeight = async (req, res) => {
    try {
        const { id: campaignId, creativeId } = req.params;
        const { weight, label } = req.body;
        const userId = req.user.id;

        // Verify ownership
        const campaign = await prisma.campaign.findFirst({
            where: { id: campaignId, advertiser: { userId } }
        });
        if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

        const updated = await prisma.creative.update({
            where: { id: creativeId },
            data: {
                ...(weight !== undefined && { weight: Math.max(1, parseInt(weight)) }),
                ...(label !== undefined && { label }),
            }
        });

        res.json({ creative: updated });
    } catch (error) {
        console.error('updateCreativeWeight error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * POST /api/advertiser/campaigns/:id/creatives
 * Add a new creative to a campaign.
 */
export const addCreative = async (req, res) => {
    try {
        const { id: campaignId } = req.params;
        const userId = req.user.id;
        const { type, label, weight, title, description, iconUrl, imageUrl, htmlCode } = req.body;

        const campaign = await prisma.campaign.findFirst({
            where: { id: campaignId, advertiser: { userId } }
        });
        if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

        const creative = await prisma.creative.create({
            data: {
                campaignId,
                type: type || 'IN_PAGE_PUSH',
                label: label || `Creative ${Date.now()}`,
                weight: weight ? Math.max(1, parseInt(weight)) : 1,
                title, description, iconUrl, imageUrl, htmlCode
            }
        });

        res.status(201).json({ creative });
    } catch (error) {
        console.error('addCreative error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * DELETE /api/advertiser/campaigns/:id/creatives/:creativeId
 * Remove a creative from a campaign.
 */
export const deleteCreative = async (req, res) => {
    try {
        const { id: campaignId, creativeId } = req.params;
        const userId = req.user.id;

        const campaign = await prisma.campaign.findFirst({
            where: { id: campaignId, advertiser: { userId } },
            include: { _count: { select: { creatives: true } } }
        });
        if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
        if (campaign._count.creatives <= 1) {
            return res.status(400).json({ message: 'Cannot delete the last creative — a campaign needs at least one.' });
        }

        await prisma.creative.delete({ where: { id: creativeId } });
        res.json({ message: 'Creative deleted' });
    } catch (error) {
        console.error('deleteCreative error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
