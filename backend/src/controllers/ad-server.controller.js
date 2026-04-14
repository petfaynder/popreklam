import prisma from '../lib/prisma.js';
import { getSetting } from './admin-settings.controller.js';
import { getDeliveryWeight } from '../services/priority.service.js';
import { recordCommission } from '../services/referral-commission.service.js';

// ================ AD SERVING LOGIC ================

// 1. SERVE AD
export const serveAd = async (req, res) => {
    try {
        const { zoneId } = req.query; // Changed from siteId to zoneId
        const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        if (!zoneId) {
            return res.status(400).json({ error: 'Missing zoneId' });
        }

        // 1. Validate Zone & Site
        const zone = await prisma.zone.findUnique({
            where: { id: zoneId },
            include: {
                site: {
                    include: { publisher: { include: { user: true } } }
                }
            }
        });

        // FIXED: don't check status 'APPROVED' — schema Site.status uses 'ACTIVE'
        if (!zone || !zone.site || zone.site.status !== 'ACTIVE') {
            return res.status(404).json({ error: 'Invalid or inactive zone/site' });
        }

        // 2. Find Candidate Campaigns
        // FIXED: fetch all active + JS filter (prisma.campaign.fields is not valid API)
        const allCampaigns = await prisma.campaign.findMany({
            where: {
                status: 'ACTIVE',
                adFormat: zone.type,
            },
            include: {
                advertiser: true,
                creatives: true
            }
        });

        // JS budget and traffic type filter
        const siteCategory = zone.site?.category === 'Adult' ? 'ADULT' : 'MAINSTREAM';

        // Helper: parse zone list from string (newline/comma separated) or array
        const parseZoneList = (val) => {
            if (!val) return [];
            if (Array.isArray(val)) return val.map(s => String(s).trim()).filter(Boolean);
            return String(val).split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
        };

        const validCampaigns = allCampaigns.filter(c => {
            const budgetCheck = Number(c.totalSpent) < Number(c.totalBudget);
            const advertiserBalanceCheck = Number(c.advertiser.totalSpent) < Number(c.advertiser.totalDeposit) || true;

            // Traffic Type Check
            const trafficTypes = c.targeting?.trafficTypes || ['MAINSTREAM'];
            const trafficCheck = trafficTypes.includes(siteCategory);

            // Click Limit Checks
            const totalClicksOk = !c.totalClicksLimit || c.totalClicks < c.totalClicksLimit;
            const dailyClicksOk = !c.dailyClicksLimit || c.dailyClicks < c.dailyClicksLimit;

            // ── ZONE TARGETING ──
            const includeZones = parseZoneList(c.targeting?.includeZones);
            const excludeZones = parseZoneList(c.targeting?.excludeZones);

            // If whitelist is set, zone MUST be in it
            if (includeZones.length > 0 && !includeZones.includes(zone.id)) return false;
            // If blacklist is set, zone must NOT be in it
            if (excludeZones.length > 0 && excludeZones.includes(zone.id)) return false;

            return budgetCheck && advertiserBalanceCheck && trafficCheck && totalClicksOk && dailyClicksOk;
        });

        if (validCampaigns.length === 0) {
            return res.status(404).json({ error: 'No ads available' });
        }

        // 3. Weighted Priority Selection (tier × bid)
        const weightedCampaigns = await Promise.all(
            validCampaigns.map(async (c) => {
                const tierWeight = await getDeliveryWeight(c.advertiser.tier || 'STARTER');
                return { campaign: c, weight: tierWeight * Number(c.bidAmount) };
            })
        );

        const totalWeight = weightedCampaigns.reduce((sum, wc) => sum + wc.weight, 0);
        let random = Math.random() * totalWeight;
        let selectedCampaign = weightedCampaigns[0].campaign;
        for (const wc of weightedCampaigns) {
            random -= wc.weight;
            if (random <= 0) { selectedCampaign = wc.campaign; break; }
        }

        // 4. Construct Response (include creative for InPagePush)
        const creative = selectedCampaign.creatives?.[0] || null;
        res.json({
            adId: selectedCampaign.id,
            targetUrl: selectedCampaign.targetUrl,
            trackUrl: `${process.env.APP_URL || 'http://localhost:5000'}/api/ads/track/impression?cid=${selectedCampaign.id}&zid=${zone.id}`,
            type: selectedCampaign.adFormat,
            creative: creative ? {
                title: creative.title,
                description: creative.description,
                iconUrl: creative.iconUrl,
                imageUrl: creative.imageUrl,
            } : null
        });

    } catch (error) {
        console.error('Serve ad error:', error);
        res.status(500).json({ error: 'Ad serving failed' });
    }
};

// 2. TRACK IMPRESSION
export const trackImpression = async (req, res) => {
    try {
        const { cid: campaignId, zid: zoneId } = req.query;
        const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        if (!campaignId || !zoneId) return res.status(400).send('Missing params');

        // 1. Get Campaign Pricing
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            include: { advertiser: true }
        });

        if (!campaign) return res.status(404).send('Campaign not found');

        // 1.5 Rate Limiting & Fraud Check
        const maxImpressionsPerIp = await getSetting('max_impressions_per_ip', 50);
        const fraudSensitivity = await getSetting('fraud_sensitivity', 'MEDIUM');

        let timeWindowHrs = 1;
        if (fraudSensitivity === 'HIGH') timeWindowHrs = 2;
        if (fraudSensitivity === 'LOW') timeWindowHrs = 0.5;

        const timeLimit = new Date();
        timeLimit.setHours(timeLimit.getHours() - timeWindowHrs);
        const parsedIp = typeof ip === 'string' ? ip : 'unknown';

        const recentImpressions = await prisma.impression.count({
            where: {
                ip: parsedIp,
                createdAt: { gte: timeLimit }
            }
        });

        if (recentImpressions >= Number(maxImpressionsPerIp)) {
            return res.status(429).send('Rate limit exceeded');
        }

        // 2. Calculate Cost & Revenue (CPM)
        const cpm = Number(campaign.cpmRate || 2.0);
        const cost = cpm / 1000;

        // Revenue Share
        const publisherRevShare = await getSetting('publisher_revenue_share', 70);
        const revShare = Number(publisherRevShare) / 100;
        const revenue = cost * revShare;
        const profit = cost - revenue;

        // 3. Record Impression
        await prisma.impression.create({
            data: {
                campaignId,
                zoneId,
                ip: typeof ip === 'string' ? ip : 'unknown',
                userAgent: req.headers['user-agent'] || 'unknown',
                revenue: cost,        // Advertiser pays this
                cost: revenue,        // Publisher gets this (Legacy naming kept for schema compat)
                publisherRevenue: revenue,
                systemProfit: profit,
                clicked: false
            }
        });

        // Let's re-align with schema comments:
        // revenue = Advertiser pays this
        // cost = We pay this to publisher
        // publisherRevenue = explicitly added field for clarity
        // systemProfit = explicitly added field

        // 4. Update Campaign Stats (Total + Daily)
        await prisma.campaign.update({
            where: { id: campaignId },
            data: {
                totalSpent: { increment: cost },
                dailySpent: { increment: cost },
                totalImpressions: { increment: 1 }
            }
        });

        // 5. Update Advertiser Spent
        const updatedAdvertiser = await prisma.advertiser.update({
            where: { id: campaign.advertiserId },
            data: { totalSpent: { increment: cost } },
            select: { userId: true },
        });

        // 5b. Referral Commission (buffered — non-blocking)
        // Fire-and-forget: never let a commission error break ad serving
        recordCommission(updatedAdvertiser.userId, cost).catch(() => { });

        // 6. Update Publisher Revenue
        // First find publisher via zone -> site
        const zone = await prisma.zone.findUnique({
            where: { id: zoneId },
            include: { site: { include: { publisher: true } } }
        });

        if (zone && zone.site && zone.site.publisher) {
            await prisma.publisher.update({
                where: { id: zone.site.publisher.id },
                data: {
                    totalRevenue: { increment: revenue }
                }
            });

            await prisma.user.update({
                where: { id: zone.site.publisher.userId },
                data: {
                    balance: { increment: revenue }
                }
            });
        }

        // Return 1x1 pixel
        const img = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
        res.writeHead(200, {
            'Content-Type': 'image/gif',
            'Content-Length': img.length
        });
        res.end(img);

    } catch (error) {
        console.error('Track impression error:', error);
        res.status(500).send('Tracking failed');
    }
};

// 3. GENERATE AD SCRIPT
export const getAdScript = (req, res) => {
    const { siteId } = req.params; // Kept siteId in param name, but logic uses it as zoneId or we need to change route param
    // Actually route is /script/:siteId, but usually ad tags are per Zone.
    // Let's assume the param passed is actually a ZONE ID for better precision.
    const zoneId = siteId;

    // In real world, we might have /script/:zoneId

    const script = `
(function() {
    var zoneId = "${zoneId}";
    var apiUrl = "${process.env.API_URL || 'https://api.mrpop.io'}";
    
    // Popunder Logic
    document.addEventListener('click', function(e) {
        if (window.mrpop_clicked) return;
        window.mrpop_clicked = true;

        fetch(apiUrl + '/ads/serve?zoneId=' + zoneId)
            .then(res => res.json())
            .then(data => {
                if (data.targetUrl) {
                    var win = window.open(data.targetUrl, '_blank');
                    if (win) {
                        win.focus();
                        // Trigger Tracking
                        new Image().src = data.trackUrl;
                    } else {
                        console.log('Pop-up blocked');
                    }
                }
            })
            .catch(err => console.error('Ad error', err));
    }, { once: true });
})();
    `;
    res.setHeader('Content-Type', 'application/javascript');
    res.send(script);
};
