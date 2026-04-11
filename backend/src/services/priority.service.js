import prisma from '../lib/prisma.js';

// ═══════════════════════════════════════════════════
//  TIER CONFIGURATION (defaults — overridden by DB)
// ═══════════════════════════════════════════════════

const DEFAULT_CONFIG = {
    STARTER: {
        minSpend: 0,
        maxSpend: 500,
        dailyCampaigns: 3,
        deliveryWeight: 1.0,
        supportSLA: 48,
        apiAccess: false,
        detailedGeoReports: false,
        autoApprove: false,
        instantApprove: false,
        creditLine: false,
        accountManager: false,
        earlyAccess: false,
        liveChatPriority: 'standard',   // standard | priority | instant
    },
    PRO: {
        minSpend: 500,
        maxSpend: 2000,
        dailyCampaigns: 10,
        deliveryWeight: 1.3,
        supportSLA: 24,
        apiAccess: true,
        detailedGeoReports: false,
        autoApprove: false,
        instantApprove: false,
        creditLine: false,
        accountManager: false,
        earlyAccess: false,
        liveChatPriority: 'standard',
    },
    ELITE: {
        minSpend: 2000,
        maxSpend: 10000,
        dailyCampaigns: 30,
        deliveryWeight: 1.6,
        supportSLA: 12,
        apiAccess: true,
        detailedGeoReports: true,
        autoApprove: true,       // auto-approve if AI passes
        instantApprove: false,
        creditLine: false,
        accountManager: false,
        earlyAccess: false,
        liveChatPriority: 'priority',
    },
    VIP: {
        minSpend: 10000,
        maxSpend: Infinity,
        dailyCampaigns: 100,
        deliveryWeight: 2.0,
        supportSLA: 4,
        apiAccess: true,
        detailedGeoReports: true,
        autoApprove: true,
        instantApprove: true,     // instant approve regardless of AI
        creditLine: true,
        accountManager: true,
        earlyAccess: true,
        liveChatPriority: 'instant',
    },
};

// ═══════════════════════════════════════════════════
//  LOAD CONFIG FROM SYSTEM SETTINGS (admin-editable)
// ═══════════════════════════════════════════════════

let _cachedConfig = null;
let _cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/** Call this when admin updates any priority_* setting to force-reload immediately */
export function invalidatePriorityCache() {
    _cachedConfig = null;
    _cacheTime = 0;
}

export async function loadTierConfig() {
    const now = Date.now();
    if (_cachedConfig && (now - _cacheTime) < CACHE_TTL) {
        return _cachedConfig;
    }

    try {
        const config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

        // All settings keys to load from DB
        const keys = [
            'priority_starter_max_spend', 'priority_pro_max_spend', 'priority_elite_max_spend',
            'priority_starter_daily_campaigns', 'priority_pro_daily_campaigns',
            'priority_elite_daily_campaigns', 'priority_vip_daily_campaigns',
            'priority_starter_weight', 'priority_pro_weight',
            'priority_elite_weight', 'priority_vip_weight',
            'priority_starter_sla', 'priority_pro_sla',
            'priority_elite_sla', 'priority_vip_sla',
            // Boolean feature flags
            'priority_starter_api_access', 'priority_pro_api_access', 'priority_elite_api_access', 'priority_vip_api_access',
            'priority_starter_geo_reports', 'priority_pro_geo_reports', 'priority_elite_geo_reports', 'priority_vip_geo_reports',
            'priority_vip_credit_line', 'priority_vip_account_manager', 'priority_vip_early_access',
            'priority_elite_auto_approve', 'priority_vip_instant_approve',
        ];

        const settings = await prisma.systemSetting.findMany({
            where: { key: { in: keys } }
        });

        const map = {};
        for (const s of settings) {
            map[s.key] = s.value;
        }

        const bool = (key) => map[key] === 'true';

        // ── Spend thresholds ──
        if (map.priority_starter_max_spend) { config.STARTER.maxSpend = Number(map.priority_starter_max_spend); config.PRO.minSpend = Number(map.priority_starter_max_spend); }
        if (map.priority_pro_max_spend) { config.PRO.maxSpend = Number(map.priority_pro_max_spend); config.ELITE.minSpend = Number(map.priority_pro_max_spend); }
        if (map.priority_elite_max_spend) { config.ELITE.maxSpend = Number(map.priority_elite_max_spend); config.VIP.minSpend = Number(map.priority_elite_max_spend); }

        // ── Daily campaign limits ──
        if (map.priority_starter_daily_campaigns) config.STARTER.dailyCampaigns = Number(map.priority_starter_daily_campaigns);
        if (map.priority_pro_daily_campaigns) config.PRO.dailyCampaigns = Number(map.priority_pro_daily_campaigns);
        if (map.priority_elite_daily_campaigns) config.ELITE.dailyCampaigns = Number(map.priority_elite_daily_campaigns);
        if (map.priority_vip_daily_campaigns) config.VIP.dailyCampaigns = Number(map.priority_vip_daily_campaigns);

        // ── Delivery weights ──
        if (map.priority_starter_weight) config.STARTER.deliveryWeight = Number(map.priority_starter_weight);
        if (map.priority_pro_weight) config.PRO.deliveryWeight = Number(map.priority_pro_weight);
        if (map.priority_elite_weight) config.ELITE.deliveryWeight = Number(map.priority_elite_weight);
        if (map.priority_vip_weight) config.VIP.deliveryWeight = Number(map.priority_vip_weight);

        // ── Support SLA ──
        if (map.priority_starter_sla) config.STARTER.supportSLA = Number(map.priority_starter_sla);
        if (map.priority_pro_sla) config.PRO.supportSLA = Number(map.priority_pro_sla);
        if (map.priority_elite_sla) config.ELITE.supportSLA = Number(map.priority_elite_sla);
        if (map.priority_vip_sla) config.VIP.supportSLA = Number(map.priority_vip_sla);

        // ── Boolean feature flags (only override if key exists in DB) ──
        if ('priority_starter_api_access' in map) config.STARTER.apiAccess = bool('priority_starter_api_access');
        if ('priority_pro_api_access' in map) config.PRO.apiAccess = bool('priority_pro_api_access');
        if ('priority_elite_api_access' in map) config.ELITE.apiAccess = bool('priority_elite_api_access');
        if ('priority_vip_api_access' in map) config.VIP.apiAccess = bool('priority_vip_api_access');

        if ('priority_starter_geo_reports' in map) config.STARTER.detailedGeoReports = bool('priority_starter_geo_reports');
        if ('priority_pro_geo_reports' in map) config.PRO.detailedGeoReports = bool('priority_pro_geo_reports');
        if ('priority_elite_geo_reports' in map) config.ELITE.detailedGeoReports = bool('priority_elite_geo_reports');
        if ('priority_vip_geo_reports' in map) config.VIP.detailedGeoReports = bool('priority_vip_geo_reports');

        if ('priority_vip_credit_line' in map) config.VIP.creditLine = bool('priority_vip_credit_line');
        if ('priority_vip_account_manager' in map) config.VIP.accountManager = bool('priority_vip_account_manager');
        if ('priority_vip_early_access' in map) config.VIP.earlyAccess = bool('priority_vip_early_access');

        if ('priority_elite_auto_approve' in map) config.ELITE.autoApprove = bool('priority_elite_auto_approve');
        if ('priority_vip_instant_approve' in map) config.VIP.instantApprove = bool('priority_vip_instant_approve');

        _cachedConfig = config;
        _cacheTime = now;
        return config;
    } catch (err) {
        console.error('[PriorityService] Failed to load config:', err);
        return DEFAULT_CONFIG;
    }
}


// ═══════════════════════════════════════════════════
//  CORE TIER LOGIC
// ═══════════════════════════════════════════════════

export async function calculateTier(monthlySpend) {
    const config = await loadTierConfig();
    const spend = Number(monthlySpend);

    if (spend >= config.VIP.minSpend) return 'VIP';
    if (spend >= config.ELITE.minSpend) return 'ELITE';
    if (spend >= config.PRO.minSpend) return 'PRO';
    return 'STARTER';
}

export async function getTierBenefits(tier) {
    const config = await loadTierConfig();
    return config[tier] || config.STARTER;
}

export async function getDeliveryWeight(tier) {
    const config = await loadTierConfig();
    return (config[tier] || config.STARTER).deliveryWeight;
}

export async function getMaxCampaignsPerDay(tier) {
    const config = await loadTierConfig();
    return (config[tier] || config.STARTER).dailyCampaigns;
}

export async function getSupportSLA(tier) {
    const config = await loadTierConfig();
    return (config[tier] || config.STARTER).supportSLA;
}

export async function shouldAutoApprove(tier, moderationResult) {
    const config = await loadTierConfig();
    const benefits = config[tier] || config.STARTER;

    // VIP: instant approve regardless of AI result
    if (benefits.instantApprove) return true;

    // ELITE: auto-approve only if AI says it's safe (not REJECT)
    if (benefits.autoApprove && moderationResult?.action !== 'REJECT') return true;

    return false;
}

export async function hasApiAccess(tier) {
    const benefits = await getTierBenefits(tier);
    return benefits.apiAccess;
}

export async function hasDetailedGeoReports(tier) {
    const benefits = await getTierBenefits(tier);
    return benefits.detailedGeoReports;
}

export async function hasCreditLine(tier) {
    const benefits = await getTierBenefits(tier);
    return benefits.creditLine;
}

export async function hasAccountManager(tier) {
    const benefits = await getTierBenefits(tier);
    return benefits.accountManager;
}

export async function hasEarlyAccess(tier) {
    const benefits = await getTierBenefits(tier);
    return benefits.earlyAccess;
}

export async function getLiveChatPriority(tier) {
    const benefits = await getTierBenefits(tier);
    return benefits.liveChatPriority;
}

// ═══════════════════════════════════════════════════
//  TIER PROGRESS HELPERS
// ═══════════════════════════════════════════════════

export async function getTierProgress(tier, monthlySpend) {
    const config = await loadTierConfig();
    const current = config[tier] || config.STARTER;
    const spend = Number(monthlySpend);

    const tiers = ['STARTER', 'PRO', 'ELITE', 'VIP'];
    const currentIndex = tiers.indexOf(tier);
    const nextTier = currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
    const nextConfig = nextTier ? config[nextTier] : null;

    if (!nextTier) {
        return {
            currentTier: tier,
            nextTier: null,
            nextTierThreshold: null,
            progress: 100,
            remaining: 0,
        };
    }

    const rangeStart = current.minSpend;
    const rangeEnd = nextConfig.minSpend;
    const progress = Math.min(100, Math.max(0, ((spend - rangeStart) / (rangeEnd - rangeStart)) * 100));

    return {
        currentTier: tier,
        nextTier,
        nextTierThreshold: rangeEnd,
        progress: Math.round(progress * 10) / 10,
        remaining: Math.max(0, rangeEnd - spend),
    };
}

// ═══════════════════════════════════════════════════
//  FULL BENEFITS MATRIX (for frontend table)
// ═══════════════════════════════════════════════════

export async function getFullBenefitsMatrix() {
    const config = await loadTierConfig();

    return {
        tiers: [
            { key: 'STARTER', name: 'Starter', color: '#6B7280', spend: `$0 – $${config.STARTER.maxSpend}` },
            { key: 'PRO', name: 'Pro', color: '#3B82F6', spend: `$${config.PRO.minSpend} – $${config.PRO.maxSpend}` },
            { key: 'ELITE', name: 'Elite', color: '#F59E0B', spend: `$${config.ELITE.minSpend} – $${config.ELITE.maxSpend}` },
            { key: 'VIP', name: 'VIP', color: '#EF4444', spend: `$${config.VIP.minSpend}+` },
        ],
        features: [
            { name: 'New Campaigns / Day', values: [config.STARTER.dailyCampaigns, config.PRO.dailyCampaigns, config.ELITE.dailyCampaigns, config.VIP.dailyCampaigns], type: 'number' },
            { name: 'Campaign Moderation', values: ['Standard', 'Standard', 'Priority (Auto)', 'Instant'], type: 'text' },
            { name: 'Support Ticket SLA', values: [`${config.STARTER.supportSLA}h`, `${config.PRO.supportSLA}h`, `${config.ELITE.supportSLA}h`, `${config.VIP.supportSLA}h`], type: 'text' },
            { name: 'Live Chat Priority', values: ['Standard', 'Standard', 'Priority Queue', 'Instant Priority'], type: 'text' },
            { name: 'API Access', values: [false, true, true, true], type: 'boolean' },
            { name: 'Ad Delivery Priority', values: [`${config.STARTER.deliveryWeight}×`, `${config.PRO.deliveryWeight}×`, `${config.ELITE.deliveryWeight}×`, `${config.VIP.deliveryWeight}×`], type: 'text' },
            { name: 'Detailed Geo Reports', values: [false, false, true, true], type: 'boolean' },
            { name: 'Account Manager', values: [false, false, false, true], type: 'boolean' },
            { name: 'Temporary Credit Line', values: [false, false, false, true], type: 'boolean' },
            { name: 'Early Feature Access', values: [false, false, false, true], type: 'boolean' },
        ],
    };
}

// ═══════════════════════════════════════════════════
//  RECALCULATE TIER (called by cron)
// ═══════════════════════════════════════════════════

export async function recalculateAllTiers() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const advertisers = await prisma.advertiser.findMany({
        include: { campaigns: { select: { id: true } } }
    });

    let changed = 0;

    for (const adv of advertisers) {
        if (adv.campaigns.length === 0) {
            // No campaigns → ensure STARTER
            if (adv.tier !== 'STARTER') {
                await _updateTier(adv, 'STARTER', 0, 'No campaigns — auto-reset');
                changed++;
            } else if (Number(adv.monthlySpend) !== 0) {
                await prisma.advertiser.update({ where: { id: adv.id }, data: { monthlySpend: 0 } });
            }
            continue;
        }

        // Sum revenue from impressions in last 30 days
        const campaignIds = adv.campaigns.map(c => c.id);
        const spendResult = await prisma.impression.aggregate({
            where: {
                campaignId: { in: campaignIds },
                createdAt: { gte: thirtyDaysAgo },
            },
            _sum: { revenue: true },
        });

        const monthlySpend = Number(spendResult._sum.revenue || 0);
        const newTier = await calculateTier(monthlySpend);

        // Update monthlySpend always
        const updateData = { monthlySpend };

        if (newTier !== adv.tier) {
            await _updateTier(adv, newTier, monthlySpend, 'Automated hourly recalculation');
            changed++;
        } else {
            await prisma.advertiser.update({ where: { id: adv.id }, data: updateData });
        }
    }

    return { total: advertisers.length, changed };
}

async function _updateTier(advertiser, newTier, monthlySpend, reason) {
    await prisma.$transaction([
        prisma.advertiser.update({
            where: { id: advertiser.id },
            data: {
                tier: newTier,
                monthlySpend,
                tierUpdatedAt: new Date(),
            },
        }),
        prisma.advertiserTierHistory.create({
            data: {
                advertiserId: advertiser.id,
                previousTier: advertiser.tier,
                newTier,
                monthlySpend,
                reason,
            },
        }),
    ]);
}

// Invalidate config cache (called when admin updates settings)
export function invalidateConfigCache() {
    _cachedConfig = null;
    _cacheTime = 0;
}
