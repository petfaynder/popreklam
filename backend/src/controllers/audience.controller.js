/**
 * audience.controller.js
 *
 * CRUD + size estimation for advertiser audiences.
 *
 * Endpoints:
 *   GET    /advertiser/audiences                     → list all audiences
 *   POST   /advertiser/audiences                     → create
 *   GET    /advertiser/audiences/eligible-campaigns  → past campaigns with impressions
 *   GET    /advertiser/audiences/:id                 → single audience
 *   GET    /advertiser/audiences/:id/size            → estimated reach (unique IPs)
 *   PUT    /advertiser/audiences/:id                 → update
 *   DELETE /advertiser/audiences/:id                 → soft delete
 */

import prisma from '../lib/prisma.js';
import { invalidateAudienceCache } from '../services/audience.service.js';

// ─── Helper: resolve advertiser from req ────────────────────────────────────

async function getAdvertiser(userId) {
    return prisma.advertiser.findUnique({ where: { userId } });
}

// ─── GET /advertiser/audiences ───────────────────────────────────────────────

export const getAudiences = async (req, res) => {
    try {
        const advertiser = await getAdvertiser(req.user.id);
        if (!advertiser) return res.status(404).json({ message: 'Advertiser not found' });

        // Also compute estimated size (unique IPs last 30 days) per audience
        const audiences = await prisma.audience.findMany({
            where: { advertiserId: advertiser.id, isActive: true },
            orderBy: { createdAt: 'desc' }
        });

        // Attach basic metadata to each audience
        const result = audiences.map(a => ({
            id: a.id,
            name: a.name,
            description: a.description,
            rules: a.rules,
            isActive: a.isActive,
            createdAt: a.createdAt,
            updatedAt: a.updatedAt,
        }));

        res.json(result);
    } catch (error) {
        console.error('getAudiences error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── POST /advertiser/audiences ──────────────────────────────────────────────

export const createAudience = async (req, res) => {
    try {
        const advertiser = await getAdvertiser(req.user.id);
        if (!advertiser) return res.status(404).json({ message: 'Advertiser not found' });

        const { name, description, rules } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Audience name is required' });
        }

        if (!Array.isArray(rules)) {
            return res.status(400).json({ message: 'Rules must be an array' });
        }

        // Validate rule structure
        const validTypes = ['GEO_INCLUDE', 'GEO_EXCLUDE', 'DEVICE_MATCH', 'OS_MATCH',
            'BROWSER_MATCH', 'CAMPAIGN_SAW', 'CAMPAIGN_CLICKED', 'CAMPAIGN_SAW_NOT'];
        for (const rule of rules) {
            if (!validTypes.includes(rule.type)) {
                return res.status(400).json({ message: `Invalid rule type: ${rule.type}` });
            }
        }

        const audience = await prisma.audience.create({
            data: {
                advertiserId: advertiser.id,
                name: name.trim(),
                description: description?.trim() || null,
                rules: rules,
            }
        });

        res.status(201).json(audience);
    } catch (error) {
        console.error('createAudience error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── GET /advertiser/audiences/eligible-campaigns ────────────────────────────

export const getEligibleCampaigns = async (req, res) => {
    try {
        const advertiser = await getAdvertiser(req.user.id);
        if (!advertiser) return res.status(404).json({ message: 'Advertiser not found' });

        // Return campaigns that have at least 1 impression — useful for CAMPAIGN_SAW rules
        const campaigns = await prisma.campaign.findMany({
            where: {
                advertiserId: advertiser.id,
                totalImpressions: { gt: 0 }
            },
            select: {
                id: true,
                name: true,
                status: true,
                totalImpressions: true,
                totalClicks: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(campaigns);
    } catch (error) {
        console.error('getEligibleCampaigns error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── GET /advertiser/audiences/:id ───────────────────────────────────────────

export const getAudienceDetail = async (req, res) => {
    try {
        const advertiser = await getAdvertiser(req.user.id);
        if (!advertiser) return res.status(404).json({ message: 'Advertiser not found' });

        const audience = await prisma.audience.findFirst({
            where: { id: req.params.id, advertiserId: advertiser.id }
        });

        if (!audience) return res.status(404).json({ message: 'Audience not found' });

        res.json(audience);
    } catch (error) {
        console.error('getAudienceDetail error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── GET /advertiser/audiences/:id/size ──────────────────────────────────────

export const getAudienceSize = async (req, res) => {
    try {
        const advertiser = await getAdvertiser(req.user.id);
        if (!advertiser) return res.status(404).json({ message: 'Advertiser not found' });

        const audience = await prisma.audience.findFirst({
            where: { id: req.params.id, advertiserId: advertiser.id }
        });

        if (!audience) return res.status(404).json({ message: 'Audience not found' });

        const rules = Array.isArray(audience.rules) ? audience.rules : [];
        const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // Build base where conditions from geo/device rules
        const baseWhere = {
            createdAt: { gte: since30 },
            campaign: { advertiserId: advertiser.id }
        };

        for (const rule of rules) {
            switch (rule.type) {
                case 'GEO_INCLUDE':
                    if (Array.isArray(rule.values) && rule.values.length > 0) {
                        baseWhere.country = { in: rule.values };
                    }
                    break;
                case 'GEO_EXCLUDE':
                    if (Array.isArray(rule.values) && rule.values.length > 0) {
                        baseWhere.country = { notIn: rule.values };
                    }
                    break;
                case 'DEVICE_MATCH':
                    if (Array.isArray(rule.values) && rule.values.length > 0) {
                        baseWhere.device = { in: rule.values };
                    }
                    break;
                case 'OS_MATCH':
                    if (Array.isArray(rule.values) && rule.values.length > 0) {
                        baseWhere.os = { in: rule.values };
                    }
                    break;
                case 'BROWSER_MATCH':
                    if (Array.isArray(rule.values) && rule.values.length > 0) {
                        baseWhere.browser = { in: rule.values };
                    }
                    break;
                case 'CAMPAIGN_SAW':
                case 'CAMPAIGN_CLICKED':
                    if (rule.campaignId) {
                        baseWhere.campaignId = rule.campaignId;
                        if (rule.type === 'CAMPAIGN_CLICKED') {
                            baseWhere.clicked = true;
                        }
                    }
                    break;
                default:
                    break;
            }
        }

        // Count distinct IPs matching the filters
        const rawResult = await prisma.impression.findMany({
            where: baseWhere,
            select: { ip: true },
            distinct: ['ip']
        });

        const estimatedSize = rawResult.length;

        res.json({
            estimatedSize,
            last30Days: true,
            audienceId: audience.id
        });
    } catch (error) {
        console.error('getAudienceSize error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── PUT /advertiser/audiences/:id ───────────────────────────────────────────

export const updateAudience = async (req, res) => {
    try {
        const advertiser = await getAdvertiser(req.user.id);
        if (!advertiser) return res.status(404).json({ message: 'Advertiser not found' });

        const audience = await prisma.audience.findFirst({
            where: { id: req.params.id, advertiserId: advertiser.id }
        });

        if (!audience) return res.status(404).json({ message: 'Audience not found' });

        const { name, description, rules, isActive } = req.body;

        if (rules !== undefined && !Array.isArray(rules)) {
            return res.status(400).json({ message: 'Rules must be an array' });
        }

        const updated = await prisma.audience.update({
            where: { id: req.params.id },
            data: {
                name: name?.trim() ?? audience.name,
                description: description !== undefined ? description?.trim() || null : audience.description,
                rules: rules ?? audience.rules,
                isActive: isActive !== undefined ? Boolean(isActive) : audience.isActive,
            }
        });

        // Invalidate cache so serve engine picks up changes on next impression
        invalidateAudienceCache(req.params.id);

        res.json(updated);
    } catch (error) {
        console.error('updateAudience error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── DELETE /advertiser/audiences/:id ────────────────────────────────────────

export const deleteAudience = async (req, res) => {
    try {
        const advertiser = await getAdvertiser(req.user.id);
        if (!advertiser) return res.status(404).json({ message: 'Advertiser not found' });

        const audience = await prisma.audience.findFirst({
            where: { id: req.params.id, advertiserId: advertiser.id }
        });

        if (!audience) return res.status(404).json({ message: 'Audience not found' });

        // Soft delete: deactivate instead of drop (campaigns referencing it won't break)
        await prisma.audience.update({
            where: { id: req.params.id },
            data: { isActive: false }
        });

        invalidateAudienceCache(req.params.id);

        res.json({ message: 'Audience deleted successfully' });
    } catch (error) {
        console.error('deleteAudience error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
