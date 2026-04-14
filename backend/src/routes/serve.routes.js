import express from 'express';
import prisma from '../lib/prisma.js';
import { getCountryFromIP, detectDevice, detectBrowser, detectOS } from '../utils/deviceDetection.js';
import { getBackfillAd } from '../services/backfill.service.js';
import { getSetting } from '../controllers/admin-settings.controller.js';
import NodeCache from 'node-cache';
import { conversionPixel } from '../controllers/campaign-analytics.controller.js';
import { botUaGuard, computeFraudScore, getIpHourlyStats, incrementIpCounters, incrementClickCounter } from '../services/ip-reputation.service.js';
import { checkAudienceTargeting } from '../services/audience.service.js';
import { recordCommission } from '../services/referral-commission.service.js';

const router = express.Router();

// Cache active campaigns for 10 seconds
const adCache = new NodeCache({ stdTTL: 10, checkperiod: 15 });

/**
 * SmartCPM Second-Price Auction
 * Returns { campaign, effectiveBid } or null if no SmartCPM candidates.
 *
 * Winner pays: second-highest maxBid + $0.0001 (Vickrey auction)
 * If only one bidder: geoFloor + $0.0001
 * Final bid is always capped at winner's own maxBid.
 */
function runSmartCpmAuction(candidates, geoFloor) {
    if (!candidates || candidates.length === 0) return null;

    // Sort by maxBid descending
    const sorted = [...candidates].sort(
        (a, b) => Number(b.smartCpmMaxBid) - Number(a.smartCpmMaxBid)
    );

    const winner = sorted[0];
    const winnerMax = Number(winner.smartCpmMaxBid);

    // Second price = second bidder's max (or geoFloor if winner is the only bidder)
    const secondPrice = sorted[1] ? Number(sorted[1].smartCpmMaxBid) : geoFloor;
    const effectiveBid = Math.min(winnerMax, Math.max(secondPrice + 0.0001, geoFloor + 0.0001));

    return { campaign: winner, effectiveBid: +effectiveBid.toFixed(4) };
}

// ─── CORS: Ad serve endpoints must be accessible from any publisher site ───
// NOTE: We set these headers BEFORE helmet runs on this router.
// We also configure helmet in server.js to not override access-control headers.
router.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

/**
 * POST /api/serve/impression
 *
 * Schema field naming (legacy, don't change DB):
 *   revenue  = what advertiser is charged (= bidAmount / CPM cost per impression)
 *   cost     = publisher's share (= revenue * 0.70)
 *   publisherRevenue = same as cost, explicit field added later
 *   systemProfit     = revenue - cost
 */
router.post('/impression', botUaGuard, async (req, res) => {
    try {
        const { zoneId, url, referrer, userAgent } = req.body;

        if (!zoneId) {
            return res.json({ ad: null, message: 'Missing zoneId' });
        }

        // 1. Verify zone exists and site is active
        const zone = await prisma.zone.findUnique({
            where: { id: zoneId },
            include: {
                site: {
                    include: {
                        publisher: {
                            include: { user: true }
                        }
                    }
                }
            }
        });

        if (!zone || !zone.site || zone.site.status !== 'ACTIVE') {
            return res.json({ ad: null, message: 'Site not active' });
        }

        // 2. Detect visitor info
        const rawIp = req.headers['x-forwarded-for'] || req.ip || '127.0.0.1';
        const ip = rawIp.split(',')[0].trim();
        const ua = userAgent || req.headers['user-agent'] || '';
        const country = await getCountryFromIP(ip);
        const device = detectDevice(ua);
        const browser = detectBrowser(ua);
        const os = detectOS(ua);

        // ── 2.5 Multi-Signal Fraud Scoring ───────────────────────────────────
        const maxImpressionsPerIp = Number(await getSetting('max_impressions_per_ip', 50));
        const acceptLanguage = req.headers['accept-language'] || '';

        // Fetch hourly stats for this IP (cached 30s — no DB hit per impression)
        const { impressions: recentImpCount, clicks: recentClkCount } = await getIpHourlyStats(ip);

        // Hard rate-cap: if IP already exceeded the configured hourly max, reject outright.
        // This is separate from fraud scoring — it protects publisher inventory.
        if (recentImpCount >= maxImpressionsPerIp) {
            return res.json({ ad: null, message: 'Rate limit exceeded for this IP' });
        }

        // Compute composite fraud score
        const fraudResult = computeFraudScore({
            ip,
            ua,
            acceptLanguage,
            adFormat: zone.type,
            recentImpCount,
            recentClkCount,
            maxImpPerIp: maxImpressionsPerIp,
        });

        // INVALID → don't serve, don't charge, don't log
        if (fraudResult.status === 'INVALID') {
            console.warn(`[Fraud] BLOCK ip=${ip} score=${fraudResult.score} reasons=${fraudResult.reasons.join(', ')}`);
            return res.json({ ad: null, message: 'Traffic quality check failed' });
        }
        // PENDING / CLEAN → continue serving (difference handled at impression recording below)

        // ── TRAFFIC SPLIT ─────────────────────────────────────────────────────
        // Route X% of ALL impressions to Adsterra SmartLink (even with internal campaigns).
        // Publisher balance is NOT updated here — handled by hourly Adsterra sync.
        const splitPercent = parseFloat(await getSetting('adsterra_traffic_split_percent', '0'));
        if (splitPercent > 0 && Math.random() * 100 < splitPercent) {
            const splitBackfill = await getBackfillAd(zone.type, country, device, zoneId);
            if (splitBackfill) {
                // Record impression for counting — revenue credited by hourly sync
                await prisma.backfillImpression.create({
                    data: {
                        zoneId,
                        source: `${splitBackfill.source}_split`,
                        format: zone.type,
                        country: country || null,
                        device: device || null,
                        networkRevenue: 0,
                        publisherRevenue: 0,
                        systemProfit: 0
                    }
                });

                return res.json({
                    ad: { format: splitBackfill.format, smartLinkUrl: splitBackfill.smartLinkUrl, source: splitBackfill.source },
                    impressionId: null
                });
            }
        }
        // ─────────────────────────────────────────────────────────────────────

        // 3. Find matching active campaigns (WITH 10-SECOND CACHE)
        const cacheKey = `campaigns_${zone.type}`;
        let campaigns = adCache.get(cacheKey);

        if (!campaigns) {
            campaigns = await prisma.campaign.findMany({
                where: {
                    status: 'ACTIVE',
                    adFormat: zone.type
                },
                include: {
                    creatives: true,
                    advertiser: { select: { userId: true } }  // Needed for referral commission
                },
                orderBy: {
                    bidAmount: 'desc'
                }
            });
            adCache.set(cacheKey, campaigns);
        }

        // FIXED: Budget check in JS (Prisma doesn't support field-to-field comparison natively)
        const budgetValid = campaigns.filter(c =>
            Number(c.totalSpent) < Number(c.totalBudget)
        );

        // Site category → traffic type matching
        const siteCategoryForTraffic = zone.site?.category === 'Adult' ? 'ADULT' : 'MAINSTREAM';

        // 3.5 Check Geo Floor for this country and format (Cached)
        let geoFloor = 0;
        if (country) {
            const floorCacheKey = `geo_floor_${country.toUpperCase()}_${zone.type}`;
            let cachedFloor = adCache.get(floorCacheKey);
            if (cachedFloor === undefined) {
                const floorRecord = await prisma.geoFloor.findUnique({
                    where: { countryCode_adFormat: { countryCode: country.toUpperCase(), adFormat: zone.type } }
                });
                cachedFloor = floorRecord ? Number(floorRecord.minBid) : 0;
                adCache.set(floorCacheKey, cachedFloor);
            }
            geoFloor = cachedFloor;
        }

        // 4. Filter by targeting rules — separate into CPM and SMART_CPM buckets
        const cpmCandidates = [];
        const smartCpmCandidates = [];

        const visitorCtx = { ip, country, device, os, browser };

        for (const campaign of budgetValid) {
            // Geo Floor Enforcement
            // For SmartCPM: use smartCpmMaxBid as the effective ceiling bid for floor comparison
            // (the system may bid lower than geoFloor in auction, but the advertiser must be
            //  WILLING to pay at least geoFloor — hence we check their max ceiling)
            const effectiveBidForFloor = (campaign.biddingStrategy === 'SMART_CPM' && campaign.smartCpmMaxBid)
                ? Number(campaign.smartCpmMaxBid)
                : Number(campaign.bidAmount);
            if (effectiveBidForFloor < geoFloor) continue;


            const targeting = campaign.targeting || {};

            // Zone blacklist
            const excludedZones = Array.isArray(targeting.excludeZones)
                ? targeting.excludeZones
                : (targeting.excludeZones
                    ? targeting.excludeZones.split(',').map(s => s.trim()).filter(Boolean)
                    : []);
            if (excludedZones.includes(zoneId)) continue;

            // Standard geo/device/os/browser targeting
            if (targeting.countries?.length > 0 && !targeting.countries.includes(country)) continue;
            if (targeting.devices?.length > 0 && !targeting.devices.includes(device)) continue;
            if (targeting.os?.length > 0 && !targeting.os.includes(os)) continue;
            if (targeting.browsers?.length > 0 && !targeting.browsers.includes(browser)) continue;

            // ── Frequency Cap ─────────────────────────────────────────────────
            const freqCap = Number(campaign.freqCap || 3);
            const freqInterval = Number(campaign.freqInterval || 24);
            const hourlyKey = `fcap_1h_${ip}_${campaign.id}`;
            const intervalKey = `fcap_${freqInterval}h_${ip}_${campaign.id}`;
            const hourlyCount = adCache.get(hourlyKey) || 0;
            const intervalCount = adCache.get(intervalKey) || 0;
            if (hourlyCount >= 1) continue;
            if (intervalCount >= freqCap) continue;

            // Daily budget check (cached — avoids N+1 DB queries per impression)
            if (campaign.dailyBudget) {
                const dailyCacheKey = `daily_spend_${campaign.id}`;
                let cachedSpend = adCache.get(dailyCacheKey);
                if (cachedSpend === undefined) {
                    // First check today — seed from DB (happens once per campaign per 10s cache TTL)
                    const todayStart = new Date();
                    todayStart.setHours(0, 0, 0, 0);
                    const todaySpent = await prisma.impression.aggregate({
                        where: { campaignId: campaign.id, createdAt: { gte: todayStart } },
                        _sum: { revenue: true }
                    });
                    cachedSpend = Number(todaySpent._sum.revenue || 0);
                    adCache.set(dailyCacheKey, cachedSpend);
                }
                if (cachedSpend >= Number(campaign.dailyBudget)) continue;
            }

            // Traffic Type filtering
            const campaignTrafficTypes = campaign.targeting?.trafficTypes || ['MAINSTREAM'];
            if (!campaignTrafficTypes.includes(siteCategoryForTraffic)) continue;

            // Click Limit checks
            if (campaign.totalClicksLimit && campaign.totalClicks >= campaign.totalClicksLimit) continue;
            if (campaign.dailyClicksLimit && campaign.dailyClicks >= campaign.dailyClicksLimit) continue;

            // ── Audience Targeting ────────────────────────────────────────────
            // Only run audience check if campaign has audience targeting configured
            const hasAudienceTargeting = (
                (targeting.audiences?.include?.length > 0) ||
                (targeting.audiences?.exclude?.length > 0)
            );
            if (hasAudienceTargeting) {
                const audiencePass = await checkAudienceTargeting(campaign, visitorCtx);
                if (!audiencePass) continue;
            }

            // Bucket by bidding strategy
            if (campaign.biddingStrategy === 'SMART_CPM' && campaign.smartCpmMaxBid) {
                smartCpmCandidates.push(campaign);
            } else {
                cpmCandidates.push(campaign);
            }
        }

        // ── SmartCPM RTB Auction ──────────────────────────────────────────────
        const smartCpmResult = runSmartCpmAuction(smartCpmCandidates, geoFloor);

        // ── Winner Selection: compare best CPM vs SmartCPM winner ─────────────
        let matchedCampaign = null;
        let advertiserCharge = 0;

        const bestCpm = cpmCandidates.length > 0 ? cpmCandidates[0] : null; // already sorted by bidAmount desc
        const bestCpmBid = bestCpm ? Number(bestCpm.bidAmount) : 0;
        const smartCpmBid = smartCpmResult ? smartCpmResult.effectiveBid : 0;

        if (bestCpmBid === 0 && smartCpmBid === 0) {
            matchedCampaign = null;
        } else if (smartCpmBid >= bestCpmBid) {
            matchedCampaign = smartCpmResult.campaign;
            advertiserCharge = smartCpmResult.effectiveBid; // Pay effective (auction) price
        } else {
            matchedCampaign = bestCpm;
            advertiserCharge = bestCpmBid; // Pay fixed CPM bid
        }

        // Increment FreqCap counters for the winner
        if (matchedCampaign) {
            const _freqInterval = Number(matchedCampaign.freqInterval || 24);
            const _hourlyKey = `fcap_1h_${ip}_${matchedCampaign.id}`;
            const _intervalKey = `fcap_${_freqInterval}h_${ip}_${matchedCampaign.id}`;
            adCache.set(_hourlyKey, (adCache.get(_hourlyKey) || 0) + 1, 3600);
            adCache.set(_intervalKey, (adCache.get(_intervalKey) || 0) + 1, _freqInterval * 3600);
        }

        // 5. No internal campaign → attempt backfill via Adsterra SmartLink
        if (!matchedCampaign) {
            try {
                const backfillAd = await getBackfillAd(zone.type, country, device, zoneId);

                if (backfillAd) {
                    // Record impression for counting/audit only.
                    // Publisher balance is NOT touched here.
                    // Real revenue is credited by hourly adsterra-sync.service.js
                    // based on actual Adsterra stats API data (group_by=placement_sub_id).
                    await prisma.backfillImpression.create({
                        data: {
                            zoneId,
                            source: backfillAd.source,
                            format: zone.type,
                            country: country || null,
                            device: device || null,
                            networkRevenue: 0,
                            publisherRevenue: 0,
                            systemProfit: 0
                        }
                    });

                    // SmartLink URL — publisher's browser opens this.
                    // sub1=zoneId already appended by backfill.service.js for tracking.
                    return res.json({
                        ad: {
                            format: backfillAd.format,
                            smartLinkUrl: backfillAd.smartLinkUrl,
                            source: backfillAd.source
                        },
                        impressionId: null
                    });
                }
            } catch (backfillErr) {
                console.error('[Serve] Backfill error:', backfillErr.message);
            }

            return res.json({ ad: null, message: 'No matching campaign' });
        }

        // 6. Record impression
        // SCHEMA FIELD MAPPING (legacy naming — do not change DB names):
        //   revenue = advertiser charge per impression (effectiveBid for SmartCPM, bidAmount for CPM)
        //   cost    = publisher share (= revenue * 70%)
        //   publisherRevenue = same as cost
        //   systemProfit     = margin
        const publisherRevShare = await getSetting('publisher_revenue_share', 70);
        const revShareMultiplier = Number(publisherRevShare) / 100;

        const publisherPay = advertiserCharge * revShareMultiplier;
        const margin = advertiserCharge - publisherPay;

        const impression = await prisma.impression.create({
            data: {
                campaignId: matchedCampaign.id,
                zoneId,
                ip,
                userAgent: ua,
                country: country || null,
                device: device || null,
                browser: browser || null,
                os: os || null,
                revenue: advertiserCharge,   // revenue = what advertiser pays
                cost: publisherPay,          // cost = publisher share (legacy naming)
                publisherRevenue: publisherPay,
                systemProfit: margin,
                clicked: false,
                // Fraud tracking fields
                fraudScore: fraudResult.score,
                trafficStatus: fraudResult.status, // 'CLEAN' | 'PENDING'
            }
        });

        // Increment in-memory IP counters (reduces DB queries for subsequent requests)
        incrementIpCounters(ip);

        // 7. Update campaign stats
        await prisma.campaign.update({
            where: { id: matchedCampaign.id },
            data: {
                totalImpressions: { increment: 1 },
                totalSpent: { increment: advertiserCharge }
            }
        });

        // 7a. Update daily spend cache (keeps budget check accurate without DB query)
        const dailyCacheKey = `daily_spend_${matchedCampaign.id}`;
        const currentDailySpend = adCache.get(dailyCacheKey) || 0;
        adCache.set(dailyCacheKey, currentDailySpend + advertiserCharge);

        // 7b. Deduct from advertiser balance (BUG-12 fix — was never decremented)
        // Fire-and-forget to avoid blocking the ad response
        if (matchedCampaign.advertiser?.userId) {
            prisma.user.update({
                where: { id: matchedCampaign.advertiser.userId },
                data: { balance: { decrement: advertiserCharge } }
            }).catch((err) => console.error('[Serve] Balance decrement failed:', err.message));
        }

        // 7c. Record referral commission (fire-and-forget, non-blocking)
        if (matchedCampaign.advertiser?.userId) {
            recordCommission(matchedCampaign.advertiser.userId, advertiserCharge).catch(() => {});
        }

        // 8. Credit publisher — PENDING traffic holds pay in pendingBalance for 24h audit
        if (zone.site?.publisher?.id) {
            if (fraudResult.status === 'PENDING') {
                // Hold in pendingBalance — cron job will release or refund after 24h
                await prisma.publisher.update({
                    where: { id: zone.site.publisher.id },
                    data: { totalRevenue: { increment: publisherPay } } // track total, but don't pay yet
                });
                await prisma.user.update({
                    where: { id: zone.site.publisher.userId },
                    data: { pendingBalance: { increment: publisherPay } } // hold in pending
                });
            } else {
                // CLEAN → credit immediately
                await prisma.publisher.update({
                    where: { id: zone.site.publisher.id },
                    data: { totalRevenue: { increment: publisherPay } }
                });
                await prisma.user.update({
                    where: { id: zone.site.publisher.userId },
                    data: { balance: { increment: publisherPay } }
                });
            }
        }

        // 9. Build response — pick creative using A/B weighted rotation
        const creatives = matchedCampaign.creatives || [];
        let creative = null;

        if (creatives.length > 0) {
            const totalWeight = creatives.reduce((sum, c) => sum + (Number(c.weight) || 1), 0);
            let rand = Math.random() * totalWeight;
            for (const c of creatives) {
                rand -= (Number(c.weight) || 1);
                if (rand <= 0) { creative = c; break; }
            }
            if (!creative) creative = creatives[creatives.length - 1]; // fallback
        }

        return res.json({
            ad: {
                id: impression.id,
                format: matchedCampaign.adFormat,
                targetUrl: matchedCampaign.targetUrl,
                campaignId: matchedCampaign.id,
                creative: creative ? {
                    title: creative.title,
                    description: creative.description,
                    iconUrl: creative.iconUrl,
                    imageUrl: creative.imageUrl,
                } : null
            },
            impressionId: impression.id
        });

    } catch (error) {
        console.error('[Serve] Impression error:', error);
        return res.status(500).json({ error: 'Failed to serve ad' });
    }
});

/**
 * POST /api/serve/click/:impressionId
 */
router.post('/click/:impressionId', async (req, res) => {
    try {
        const { impressionId } = req.params;

        const impression = await prisma.impression.findUnique({
            where: { id: impressionId }
        });

        if (!impression || impression.clicked) {
            return res.status(404).json({ error: 'Impression not found or already clicked' });
        }

        // Anti-Fraud: Time-to-Click validation (block clicks < 1.5s after impression shown)
        const timeSinceImpression = Date.now() - impression.createdAt.getTime();
        if (timeSinceImpression < 1500) {
            console.warn(`[Anti-Fraud] Blocked fast click (${timeSinceImpression}ms) on impression ${impressionId}`);
            return res.json({ success: false, message: 'Invalid click pattern detected' });
        }

        // Anti-Fraud: INVALID impressions should not receive click credit
        if (impression.trafficStatus === 'INVALID') {
            return res.json({ success: false, message: 'Invalid traffic' });
        }

        // Track IP click for fraud scoring
        const rawClickIp = req.headers['x-forwarded-for'] || req.ip || '';
        const clickIp = rawClickIp.split(',')[0].trim();
        if (clickIp) incrementClickCounter(clickIp);

        await prisma.impression.update({
            where: { id: impressionId },
            data: { clicked: true }
        });

        await prisma.campaign.update({
            where: { id: impression.campaignId },
            data: {
                totalClicks: { increment: 1 },
                dailyClicks: { increment: 1 }
            }
        });

        return res.json({ success: true });
    } catch (error) {
        console.error('[Serve] Click error:', error);
        return res.status(500).json({ error: 'Failed to track click' });
    }
});

/**
 * GET /api/serve/script/:zoneId
 * Returns the JavaScript ad tag to embed on publisher sites
 */
router.get('/script/:zoneId', async (req, res) => {
    try {
        const { zoneId } = req.params;

        const zone = await prisma.zone.findUnique({
            where: { id: zoneId },
            include: { site: true }
        });

        if (!zone) {
            return res.status(404).type('text/javascript').send('// Zone not found');
        }

        if (!zone.site || zone.site.status !== 'ACTIVE') {
            return res.status(403).type('text/javascript').send('// Site not active');
        }

        const API_URL = process.env.APP_URL || 'http://localhost:5000';

        // NOTE: Template literal with variables baked in — no runtime env lookup on client
        const script = `/* MrPop.io Ad Tag | Zone: ${zoneId} */
(function() {
    'use strict';
    var _pr = {
        api: '${API_URL}/api/serve',
        zone: '${zoneId}',
        type: '${zone.type}'
    };

    function _prLoad() {
        fetch(_pr.api + '/impression', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                zoneId: _pr.zone,
                url: window.location.href,
                referrer: document.referrer,
                userAgent: navigator.userAgent
            })
        })
        .then(function(r) { return r.ok ? r.json() : null; })
        .then(function(data) {
            if (data && data.ad) _prDisplay(data.ad, data.impressionId);
        })
        .catch(function(e) { /* silent fail */ });
    }

    function _prDisplay(ad, iid) {
        var fmt = ad.format || _pr.type;

        // ── BACKFILL (Adsterra SmartLink) ─────────────────────
        // No internal campaign matched — open SmartLink as popunder.
        // SmartLink works on ANY domain, no registration needed.
        // Publisher never sees this URL — it's served from MrPop.io's JS.
        if (ad.smartLinkUrl) {
            document.addEventListener('click', function _bf() {
                document.removeEventListener('click', _bf);
                var w = window.open(ad.smartLinkUrl, '_blank');
                if (w) { w.blur(); window.focus(); }
            }, { once: true });
            return;
        }

        // ── POPUNDER ─────────────────────────────────────────
        if (fmt === 'POPUNDER') {
            document.addEventListener('click', function _once() {
                document.removeEventListener('click', _once);
                var url = ad.targetUrl + (ad.targetUrl.indexOf('?') !== -1 ? '&' : '?') + 'click_id=' + (iid || '');
                var w = window.open(url, '_blank');
                if (w) { w.blur(); window.focus(); }
                if (iid) _prClick(iid);
            }, { once: true });

        // ── IN-PAGE PUSH ──────────────────────────────────────
        } else if (fmt === 'IN_PAGE_PUSH') {
            var c = ad.creative || {};
            var ttl = c.title || 'New Notification';
            var dsc = c.description || 'Click to learn more';
            var ico = c.iconUrl || '';
            var img = c.imageUrl || '';

            var el = document.createElement('div');
            el.setAttribute('style', [
                'position:fixed', 'bottom:20px', 'right:20px', 'width:340px',
                'max-width:calc(100vw - 40px)', 'background:#ffffff',
                'border-radius:14px', 'box-shadow:0 12px 40px rgba(0,0,0,0.15)',
                'padding:16px', 'z-index:2147483647', 'cursor:pointer',
                'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
                'border:1px solid rgba(0,0,0,0.08)', 'box-sizing:border-box',
                'transform:translateX(400px)', 'transition:transform 0.35s cubic-bezier(.34,1.56,.64,1)'
            ].join(';'));

            el.innerHTML = (
                '<div style="display:flex;gap:12px;align-items:flex-start;">' +
                    (ico ? '<img src="' + ico + '" width="48" height="48" style="border-radius:10px;flex-shrink:0;object-fit:cover;" onerror="this.remove()">' : '') +
                    '<div style="flex:1;min-width:0;">' +
                        '<div style="font-size:14px;font-weight:600;color:#111;margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + ttl + '</div>' +
                        '<div style="font-size:12px;color:#555;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">' + dsc + '</div>' +
                    '</div>' +
                    '<button onclick="event.stopPropagation();document.getElementById(\'_prn\').remove();" style="background:none;border:none;width:20px;height:20px;cursor:pointer;flex-shrink:0;font-size:18px;line-height:1;color:#aaa;padding:0;">&times;</button>' +
                '</div>' +
                (img ? '<img src="' + img + '" style="width:100%;height:130px;object-fit:cover;border-radius:10px;margin-top:12px;display:block;" onerror="this.remove()">' : '') +
                '<div style="font-size:10px;color:#bbb;margin-top:10px;text-transform:uppercase;letter-spacing:.5px;">Sponsored &bull; Ad</div>'
            );
            el.id = '_prn';

            el.onclick = function() {
                if (iid) _prClick(iid);
                var url = ad.targetUrl + (ad.targetUrl.indexOf('?') !== -1 ? '&' : '?') + 'click_id=' + (iid || '');
                window.open(url, '_blank');
                el.remove();
            };

            document.body.appendChild(el);
            // Animate in
            requestAnimationFrame(function() {
                requestAnimationFrame(function() { el.style.transform = 'translateX(0)'; });
            });

            // Auto-dismiss
            setTimeout(function() {
                el.style.transform = 'translateX(400px)';
                setTimeout(function() { if (el.parentNode) el.remove(); }, 400);
            }, 15000);
        }
    }

    function _prClick(iid) {
        fetch(_pr.api + '/click/' + iid, { method: 'POST' }).catch(function(){});
    }

    // Load when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _prLoad);
    } else {
        setTimeout(_prLoad, 0);
    }
})();`;

        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        return res.send(script);

    } catch (error) {
        console.error('[Serve] Script error:', error);
        return res.status(500).type('text/javascript').send('// Server error');
    }
});

/**
 * GET /api/serve/pixel/:clickId
 * Conversion tracking — 1x1 transparent GIF
 * Place on advertiser's Thank You page
 */
router.get('/pixel/:clickId', conversionPixel);

/**
 * GET /api/serve/push.js?z=ZONE_ID
 * Push notification subscription script.
 * Publisher adds: <script src="https://app.mrpop.io/api/serve/push.js?z=ZONE_ID"></script>
 * This script loads on the publisher site, asks for notification permission, and registers the subscriber.
 */
router.get('/push.js', async (req, res) => {
    const zoneId = req.query.z;
    if (!zoneId) {
        return res.status(400).type('text/javascript').send('// Missing zone ID');
    }

    // Serve with CORS headers so any publisher site can load it
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour cache ok
    res.setHeader('Access-Control-Allow-Origin', '*');

    const backendUrl = process.env.APP_URL || 'http://localhost:5000';

    const script = `
(function() {
  'use strict';
  var ZONE_ID = ${JSON.stringify(zoneId)};
  var BACKEND = ${JSON.stringify(backendUrl)};

  // Only run on HTTPS
  if (location.protocol !== 'https:') return;

  // Check browser support
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  // Already denied — do not prompt again
  if (Notification.permission === 'denied') return;

  // Cooldown: don't ask again within 48 hours
  try {
    var lastAsked = localStorage.getItem('_pr_push_asked');
    if (lastAsked && Date.now() - parseInt(lastAsked) < 48 * 3600 * 1000) return;
  } catch(e) {}

  // Wait for page load to avoid blocking critical resources
  window.addEventListener('load', function() {
    setTimeout(function() {
      navigator.serviceWorker.register('/pr-sw.js')
        .then(function(reg) {
          return fetch(BACKEND + '/api/push/vapid-public-key')
            .then(function(r) { return r.json(); })
            .then(function(data) {
              if (!data.publicKey) throw new Error('No VAPID key');
              var key = data.publicKey;
              var convertedKey = urlB64ToUint8Array(key);
              return reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedKey
              });
            });
        })
        .then(function(subscription) {
          try { localStorage.setItem('_pr_push_asked', Date.now().toString()); } catch(e) {}
          return fetch(BACKEND + '/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ zoneId: ZONE_ID, subscription: subscription })
          });
        })
        .catch(function() { /* Silent fail */ });
    }, 3000); // 3s delay after load
  });

  function urlB64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding).replace(/\\-/g, '+').replace(/_/g, '/');
    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);
    for (var i = 0; i < rawData.length; ++i) { outputArray[i] = rawData.charCodeAt(i); }
    return outputArray;
  }
})();
`;

    res.send(script);
});

/**
 * GET /api/serve/pr-sw.js
 * Downloadable Service Worker file for publisher sites.
 * Publisher downloads this and places it at their domain root (/pr-sw.js).
 */
router.get('/pr-sw.js', (req, res) => {
    const backendUrl = process.env.APP_URL || 'http://localhost:5000';

    const sw = `
// MrPop.io Push Notification Service Worker
// Place this file at your domain root: https://yoursite.com/pr-sw.js
// Do NOT modify this file.

var BACKEND = ${JSON.stringify(backendUrl)};

self.addEventListener('push', function(event) {
  if (!event.data) return;
  try {
    var data = event.data.json();
    var options = {
      body: data.body || '',
      icon: data.icon || BACKEND + '/favicon.ico',
      badge: BACKEND + '/push-badge.png',
      data: { clickUrl: data.url, deliveryId: data.deliveryId },
      requireInteraction: false
    };
    if (data.image) options.image = data.image;
    event.waitUntil(
      self.registration.showNotification(data.title || 'New Notification', options)
    );
  } catch(e) {}
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var clickUrl = event.notification.data && event.notification.data.clickUrl;
  var deliveryId = event.notification.data && event.notification.data.deliveryId;
  if (deliveryId) {
    fetch(BACKEND + '/api/push/click/' + deliveryId, { method: 'POST' }).catch(function(){});
  }
  if (clickUrl) {
    event.waitUntil(clients.openWindow(clickUrl));
  }
});
`;

    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Disposition', 'attachment; filename="pr-sw.js"');
    res.send(sw);
});

export default router;
