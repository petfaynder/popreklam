import prisma from '../lib/prisma.js';
import crypto from 'crypto';

const APP_URL = process.env.APP_URL || 'https://api.popreklam.com';

// Tracker-specific postback URL templates
// Each tracker uses different macro names for click_id and payout
const TRACKER_TEMPLATES = {
    keitaro:      { name: 'Keitaro',      clickMacro: '{click_id}',   payoutMacro: '{payout}' },
    voluum:       { name: 'Voluum',       clickMacro: '{cid}',        payoutMacro: '{revenue}' },
    binom:        { name: 'Binom',        clickMacro: '{click_id}',   payoutMacro: '{payout}' },
    thrivetracker:{ name: 'ThriveTracker',clickMacro: '{click_id}',   payoutMacro: '{payout}' },
    bemob:        { name: 'BeMob',        clickMacro: '{externalid}', payoutMacro: '{payout}' },
    redtrack:     { name: 'RedTrack',     clickMacro: '{clickid}',    payoutMacro: '{payout}' },
    funnelflux:   { name: 'FunnelFlux',   clickMacro: '{hitid}',      payoutMacro: '{revenue}' },
    peerclick:    { name: 'PeerClick',    clickMacro: '{clickid}',    payoutMacro: '{payout}' },
    landingtrack: { name: 'LandingTrack', clickMacro: '{click_id}',   payoutMacro: '{payout}' },
    trackingdesk: { name: 'TrackingDesk', clickMacro: '{s1}',         payoutMacro: '{payout}' },
    kintura:      { name: 'KINTURA',      clickMacro: '{click_id}',   payoutMacro: '{payout}' },
    appsflyer:    { name: 'AppsFlyer',    clickMacro: '{clickid}',    payoutMacro: '{payout}' },
    cplab:        { name: 'CPLab',        clickMacro: '{click_id}',   payoutMacro: '{payout}' },
    maxconv:      { name: 'MaxConv',      clickMacro: '{click_id}',   payoutMacro: '{payout}' },
    manual:       { name: 'Manual / Other', clickMacro: '{CLICK_ID}', payoutMacro: '{PAYOUT}' },
};

/**
 * GET /api/advertiser/campaigns/:id/tracking
 * Returns tracking config + generated postback URLs for all trackers
 */
export const getTrackingInfo = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id: campaignId } = req.params;

        const campaign = await prisma.campaign.findFirst({
            where: { id: campaignId, advertiser: { userId } },
            select: {
                id: true, name: true, adFormat: true, status: true,
                postbackSecretToken: true,
                totalConversions: true,
            }
        });

        if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

        // Auto-generate secret token if missing
        let token = campaign.postbackSecretToken;
        if (!token) {
            token = crypto.randomBytes(24).toString('hex');
            await prisma.campaign.update({
                where: { id: campaignId },
                data: { postbackSecretToken: token }
            });
        }

        // Build postback URLs for every supported tracker
        const baseUrl = `${APP_URL}/api/postback`;
        const pixelBase = `${APP_URL}/api/serve/pixel`;

        const trackerUrls = Object.entries(TRACKER_TEMPLATES).reduce((acc, [key, tmpl]) => {
            acc[key] = {
                name: tmpl.name,
                postbackUrl: `${baseUrl}?click_id=${tmpl.clickMacro}&payout=${tmpl.payoutMacro}`,
                postbackUrlWithToken: `${baseUrl}?click_id=${tmpl.clickMacro}&payout=${tmpl.payoutMacro}&token=${token}`,
            };
            return acc;
        }, {});

        const pixelTag = `<!-- PopReklam Conversion Pixel | Campaign: ${campaign.name} -->\n<img src="${pixelBase}/{CLICK_ID}" width="1" height="1" style="display:none;" alt="" />`;

        res.json({
            campaign: { id: campaign.id, name: campaign.name, adFormat: campaign.adFormat },
            secretToken: token,
            totalConversions: campaign.totalConversions,
            basePostbackUrl: `${baseUrl}?click_id={CLICK_ID}&payout={PAYOUT}`,
            pixelTag,
            trackers: trackerUrls,
        });

    } catch (err) {
        console.error('[Tracking] getTrackingInfo error:', err);
        res.status(500).json({ error: 'Failed to get tracking info' });
    }
};

/**
 * POST /api/advertiser/campaigns/:id/tracking/regenerate-token
 * Generates a new secret token (invalidates old one)
 */
export const regenerateToken = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id: campaignId } = req.params;

        const campaign = await prisma.campaign.findFirst({
            where: { id: campaignId, advertiser: { userId } }
        });
        if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

        const newToken = crypto.randomBytes(24).toString('hex');
        await prisma.campaign.update({
            where: { id: campaignId },
            data: { postbackSecretToken: newToken }
        });

        res.json({ success: true, secretToken: newToken });

    } catch (err) {
        res.status(500).json({ error: 'Failed to regenerate token' });
    }
};

/**
 * GET /api/advertiser/campaigns/:id/postback-logs
 * Returns recent postback logs for this campaign
 */
export const getPostbackLogs = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id: campaignId } = req.params;
        const limit = Math.min(parseInt(req.query.limit) || 50, 200);

        const campaign = await prisma.campaign.findFirst({
            where: { id: campaignId, advertiser: { userId } }
        });
        if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

        const logs = await prisma.postbackLog.findMany({
            where: { campaignId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: {
                id: true, clickId: true, status: true,
                errorMsg: true, ip: true, createdAt: true,
            }
        });

        res.json({ logs });

    } catch (err) {
        res.status(500).json({ error: 'Failed to get postback logs' });
    }
};

/**
 * POST /api/advertiser/campaigns/:id/tracking/test
 * Fires a synthetic test conversion (no real click needed)
 */
export const sendTestConversion = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id: campaignId } = req.params;

        const campaign = await prisma.campaign.findFirst({
            where: { id: campaignId, advertiser: { userId } }
        });
        if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

        const testConv = await prisma.conversion.create({
            data: {
                impressionId: null,
                campaignId,
                trackingMethod: 'TEST',
                payout: 1.00,
                goal: 'test',
                status: 'TEST',
                ip: req.ip || '127.0.0.1',
                postbackRaw: { source: 'tracking_page_test', initiatedBy: userId },
            }
        });

        await prisma.postbackLog.create({
            data: {
                campaignId,
                clickId: 'TEST',
                rawQuery: 'test=true&source=tracking_page',
                ip: req.ip || '127.0.0.1',
                status: 'SUCCESS',
                errorMsg: 'Test conversion generated via Tracking page',
            }
        });

        res.json({
            success: true,
            conversionId: testConv.id,
            message: 'Test conversion recorded successfully',
        });

    } catch (err) {
        console.error('[Tracking] sendTestConversion error:', err);
        res.status(500).json({ error: 'Test conversion failed' });
    }
};
