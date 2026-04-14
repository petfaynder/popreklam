import prisma from '../lib/prisma.js';
import NodeCache from 'node-cache';
import crypto from 'crypto';

// Rate limiting: per-IP postback counts, 1-minute TTL
const rlCache = new NodeCache({ stdTTL: 60, checkperiod: 30 });

const MAX_PER_IP_PER_MIN = 100;

/**
 * GET /api/postback
 *
 * Industry-standard S2S Postback URL.
 * Compatible with: Keitaro, Voluum, Binom, BeMob, RedTrack, FunnelFlux, etc.
 *
 * Parameters:
 *   click_id  — MrPop.io impression ID (required)
 *   payout    — Advertiser-reported conversion value in USD (optional)
 *   goal      — Conversion goal label, e.g. "purchase", "signup" (optional)
 *   status    — 1=confirmed conversion, 0=rejected/cancelled (optional, default 1)
 *   token     — Per-campaign secret token for extra security (optional)
 *
 * Tracker-specific aliases (all mapped to click_id internally):
 *   cid         → Voluum
 *   externalid  → BeMob
 *   s1          → TrackingDesk, Manual setups
 *
 * Returns: 1x1 transparent GIF (trackers require image/gif response)
 */
export const handlePostback = async (req, res) => {
    const GIF_1x1 = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

    // Always return 200 + GIF — even on error — so tracker doesn't retry
    const respond = () => {
        res.setHeader('Content-Type', 'image/gif');
        res.setHeader('Cache-Control', 'no-store');
        res.end(GIF_1x1);
    };

    const rawIp = req.headers['x-forwarded-for'] || req.ip || '';
    const ip = rawIp.split(',')[0].trim().substring(0, 45);
    const rawQuery = req.url.split('?')[1] || '';

    // Extract click_id — support multiple tracker aliases
    const q = req.query;
    const clickId = q.click_id || q.cid || q.externalid || q.s1 || q.clickid || null;
    const payoutRaw = q.payout || q.revenue || q.amount || null;
    const goal = q.goal || q.goal_id || null;
    const statusStr = q.status !== undefined ? String(q.status) : '1';
    const secretToken = q.token || q.secret || null;

    // Parse payout safely
    const payout = payoutRaw ? parseFloat(payoutRaw) : null;
    const isValidPayout = payout !== null && !isNaN(payout) && payout >= 0;

    // Determine if this is a rejection
    const isRejected = statusStr === '0' || statusStr === 'rejected' || statusStr === 'cancel';

    // Log helper
    const logPostback = async (status, errorMsg = null, resolvedCampaignId = null) => {
        try {
            await prisma.postbackLog.create({
                data: {
                    campaignId: resolvedCampaignId,
                    clickId: clickId,
                    rawQuery,
                    ip,
                    status,
                    errorMsg: errorMsg?.substring(0, 255) || null,
                }
            });
        } catch (e) {
            // Never block on log failure
            console.warn('[Postback] Log write failed:', e.message);
        }
    };

    try {
        // ── 1. Rate Limiting ─────────────────────────────────────────────
        const rlKey = `pb_${ip}`;
        const currentCount = rlCache.get(rlKey) || 0;
        if (currentCount >= MAX_PER_IP_PER_MIN) {
            await logPostback('RATE_LIMITED', `IP rate limit exceeded (${currentCount}/min)`);
            return respond();
        }
        rlCache.set(rlKey, currentCount + 1);

        // ── 2. click_id required ─────────────────────────────────────────
        if (!clickId) {
            await logPostback('NO_CLICK_ID', 'Missing click_id parameter');
            return respond();
        }

        // ── 3. Find Impression ───────────────────────────────────────────
        const impression = await prisma.impression.findUnique({
            where: { id: clickId },
            include: { campaign: true }
        });

        if (!impression) {
            await logPostback('INVALID_CLICK_ID', `Impression not found: ${clickId}`);
            return respond();
        }

        const campaign = impression.campaign;

        // ── 4. Verify click happened ─────────────────────────────────────
        if (!impression.clicked) {
            await logPostback('NO_CLICK', 'Impression exists but no click recorded', campaign.id);
            return respond();
        }

        // ── 5. Time window: max 30 days after click ──────────────────────
        const daysSinceImpression = (Date.now() - impression.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceImpression > 30) {
            await logPostback('EXPIRED', `Click too old: ${Math.floor(daysSinceImpression)} days`, campaign.id);
            return respond();
        }

        // ── 6. Optional secret token validation ──────────────────────────
        if (campaign.postbackSecretToken && secretToken) {
            if (secretToken !== campaign.postbackSecretToken) {
                await logPostback('INVALID_TOKEN', 'Secret token mismatch', campaign.id);
                return respond();
            }
        }

        // ── 7. Duplicate conversion check ────────────────────────────────
        const existingConversion = await prisma.conversion.findUnique({
            where: { impressionId: clickId }
        });

        if (existingConversion) {
            await logPostback('DUPLICATE', `Already converted (convId: ${existingConversion.id})`, campaign.id);
            return respond();
        }

        // ── 8. Record conversion ─────────────────────────────────────────
        const convStatus = isRejected ? 'REJECTED' : 'CONFIRMED';

        await prisma.conversion.create({
            data: {
                impressionId: clickId,
                campaignId: campaign.id,
                trackingMethod: 'S2S',
                payout: isValidPayout ? payout : null,
                goal: goal?.substring(0, 100) || null,
                status: convStatus,
                ip,
                userAgent: req.headers['user-agent']?.substring(0, 500) || null,
                postbackRaw: Object.fromEntries(
                    Object.entries(q).map(([k, v]) => [k, String(v)])
                ),
            }
        });

        // ── 9. Update campaign counter (only for confirmed conversions) ───
        if (!isRejected) {
            await prisma.campaign.update({
                where: { id: campaign.id },
                data: { totalConversions: { increment: 1 } }
            });
        }

        await logPostback('SUCCESS', null, campaign.id);
        console.log(`[Postback] ✅ ${convStatus} | campaign=${campaign.id} | payout=${payout ?? '—'} | goal=${goal ?? '—'}`);

    } catch (err) {
        console.error('[Postback] Error:', err.message);
        try {
            await logPostback('ERROR', err.message.substring(0, 255));
        } catch (_) {}
    }

    return respond();
};

/**
 * GET /api/postback/test
 * Internal test conversion — generates a proper test record
 * Used by the advertiser Tracking page "Trace" feature
 */
export const handleTestPostback = async (req, res) => {
    const GIF_1x1 = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

    try {
        const { campaignId } = req.query;
        if (!campaignId) {
            return res.status(400).json({ error: 'campaignId required' });
        }

        const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        // Create a TEST conversion (no impressionId — this is synthetic)
        const testConversion = await prisma.conversion.create({
            data: {
                impressionId: null,
                campaignId,
                trackingMethod: 'TEST',
                payout: 1.00,
                goal: 'test',
                status: 'TEST',
                ip: req.ip || '127.0.0.1',
                postbackRaw: { test: 'true', source: 'tracking_page' },
            }
        });

        await prisma.postbackLog.create({
            data: {
                campaignId,
                clickId: 'TEST',
                rawQuery: `campaignId=${campaignId}&test=true`,
                ip: req.ip || '127.0.0.1',
                status: 'SUCCESS',
                errorMsg: 'Test conversion',
            }
        });

        return res.json({ success: true, conversionId: testConversion.id });

    } catch (err) {
        console.error('[Postback Test] Error:', err.message);
        return res.status(500).json({ error: 'Test conversion failed' });
    }
};
