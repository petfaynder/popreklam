/**
 * IP Reputation & Multi-Signal Fraud Scoring Service
 *
 * Philosophy:
 *   - No single signal blocks traffic on its own (except hard-coded bot UAs).
 *   - Signals are weighted and combined into a composite score (0–100).
 *   - The score maps to a traffic status:
 *       0–39  → CLEAN   (serve + credit publisher immediately)
 *       40–79 → PENDING (serve + hold publisher pay for 24h audit)
 *       80+   → INVALID (don't serve, don't charge)
 *
 * False-positive safeguards:
 *   - Minimum sample thresholds before rate-based rules fire.
 *   - Format-aware rules (popunder click rates are naturally high → skipped).
 *   - Private/shared IPs (10.x, 192.168.x) are not penalised for IP rate limits.
 *   - All thresholds are configurable via admin SystemSettings.
 */

import NodeCache from 'node-cache';
import prisma from '../lib/prisma.js';

// ── Caches ────────────────────────────────────────────────────────────────────
// IP reputation results: 1 hour TTL (reduced to 10 min for PENDING so audit can reassess quickly)
const reputationCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

// Short-term rolling counters for the current request window (in-memory, fast)
// Key: `cnt_imp_<ip>`  or `cnt_clk_<ip>` — value: integer count in last hour
const rollingCounters = new NodeCache({ stdTTL: 3600, checkperiod: 60 });

// ── Known high-risk prefix lists ───────────────────────────────────────────────
// TOR exit nodes — real production would query torproject.org/exit-addresses daily
const KNOWN_TOR_PREFIXES = [
    '185.220.', '23.142.', '171.25.', '192.42.', '51.15.', '45.56.',
    '199.87.', '162.247.', '204.8.', '176.10.',
];

// Known datacenter / hosting / VPN provider prefixes
const KNOWN_DATACENTER_PREFIXES = [
    // Major cloud providers
    '18.', '34.', '35.', '52.', '54.',      // AWS
    '104.196.', '35.185.', '35.186.',       // Google Cloud
    '20.', '40.', '52.', '104.40.',         // Azure
    // Hosting / VPN providers
    '104.200.', '103.145.', '198.251.', '194.165.', '209.141.',
    '45.152.', '45.145.', '146.70.',
    '185.159.', '185.156.', '195.206.',
    // Hetzner (large German DC used heavily for bots)
    '5.9.', '5.135.', '5.196.', '5.230.',
    '78.46.', '88.99.', '95.216.',
    '136.243.', '138.201.',
    '148.251.', '176.9.',
    // DigitalOcean
    '64.225.', '68.183.', '138.68.', '139.59.', '165.22.', '167.99.',
    '174.138.', '178.62.', '188.166.', '206.189.',
    // Vultr
    '45.76.', '45.77.', '96.30.', '104.207.', '207.246.',
    // OVH
    '178.32.', '167.114.', '51.68.', '51.77.', '51.79.',
];

// Private / CGNAT ranges — shared (office, mobile NAT) — low-risk, don't penalise heavily
const PRIVATE_RANGES = [
    '10.', '172.16.', '172.17.', '172.18.', '172.19.', '172.20.',
    '172.21.', '172.22.', '172.23.', '172.24.', '172.25.', '172.26.',
    '172.27.', '172.28.', '172.29.', '172.30.', '172.31.', '192.168.',
    '100.64.', // CGNAT (carrier-grade NAT)
];

// ── Traffic status from score ──────────────────────────────────────────────────
export function statusFromScore(score) {
    if (score >= 80) return 'INVALID';
    if (score >= 40) return 'PENDING';
    return 'CLEAN';
}

/**
 * Compute a composite fraud score for an impression request.
 *
 * @param {object} ctx
 * @param {string} ctx.ip
 * @param {string} ctx.ua              — User-Agent header value
 * @param {string} ctx.acceptLanguage  — Accept-Language header value (or empty)
 * @param {string} ctx.adFormat        — 'POPUNDER' | 'IN_PAGE_PUSH' | etc.
 * @param {number} ctx.recentImpCount  — Impressions this IP sent in the last hour (from DB)
 * @param {number} ctx.recentClkCount  — Clicks this IP sent in the last hour (from DB)
 * @param {number} ctx.maxImpPerIp     — Admin setting: max impressions/hour per IP
 * @returns {{ score: number, status: string, reasons: string[] }}
 */
export function computeFraudScore({
    ip,
    ua,
    acceptLanguage,
    adFormat,
    recentImpCount,
    recentClkCount,
    maxImpPerIp,
}) {
    const reasons = [];
    let score = 0;

    const isPrivate = PRIVATE_RANGES.some(p => ip.startsWith(p))
        || ip === '127.0.0.1'
        || ip === '::1'
        || ip.startsWith('::ffff:127');

    // ── SIGNAL 1: TOR exit node (very high confidence) ────────────────────────
    if (KNOWN_TOR_PREFIXES.some(p => ip.startsWith(p))) {
        score += 85;
        reasons.push('TOR exit node');
    }

    // ── SIGNAL 2: Datacenter / hosting IP ─────────────────────────────────────
    if (!isPrivate && KNOWN_DATACENTER_PREFIXES.some(p => ip.startsWith(p))) {
        score += 40;
        reasons.push('Datacenter/hosting IP');
    }

    // ── SIGNAL 3: Missing or empty User-Agent ─────────────────────────────────
    const lowerUa = (ua || '').toLowerCase().trim();
    if (!lowerUa) {
        score += 30;
        reasons.push('Missing User-Agent');
    }

    // ── SIGNAL 4: Missing Accept-Language (headless browser fingerprint) ───────
    if (!acceptLanguage || acceptLanguage.trim() === '') {
        score += 20;
        reasons.push('Missing Accept-Language');
    }

    // ── SIGNAL 5: IP impression rate (shared IPs get a lighter penalty) ────────
    // Only fires when recentImpCount >= 10 to avoid penalising very small samples
    if (!isPrivate && recentImpCount >= 10) {
        const rateRatio = recentImpCount / maxImpPerIp;
        if (rateRatio >= 1.5) {
            score += 35;
            reasons.push(`IP imp rate ${recentImpCount} in 1h (very high)`);
        } else if (rateRatio >= 0.8) {
            score += 20;
            reasons.push(`IP imp rate ${recentImpCount} in 1h (elevated)`);
        }
    } else if (isPrivate && recentImpCount >= 200) {
        // Even shared IPs become suspicious at extreme volumes
        score += 20;
        reasons.push(`Shared IP imp rate ${recentImpCount} in 1h (extreme)`);
    }

    // ── SIGNAL 6: Click rate (format-aware) ───────────────────────────────────
    // POPUNDER: any page click triggers the popunder — naturally high CTR, skip rule
    // IN_PAGE_PUSH + others: genuine notification click → abnormal CTR is a red flag
    const isPopunder = adFormat === 'POPUNDER' || adFormat === 'POPUP';
    if (!isPopunder && recentImpCount >= 5 && recentClkCount > 0) {
        const ctr = recentClkCount / recentImpCount;
        if (ctr > 0.5) {
            score += 35;
            reasons.push(`Abnormal CTR ${(ctr * 100).toFixed(0)}% (${recentClkCount}/${recentImpCount} in 1h)`);
        } else if (ctr > 0.3) {
            score += 15;
            reasons.push(`Elevated CTR ${(ctr * 100).toFixed(0)}% (${recentClkCount}/${recentImpCount} in 1h)`);
        }
    }

    // ── SIGNAL 7: Excessive click volume (any format) ─────────────────────────
    // More than 15 clicks/hour from one IP regardless of impressions = suspicious
    if (recentClkCount >= 15) {
        score += 30;
        reasons.push(`High click volume: ${recentClkCount} clicks in 1h`);
    }

    // Cap at 100
    score = Math.min(100, score);

    return {
        score,
        status: statusFromScore(score),
        reasons,
    };
}

/**
 * Get IP impression + click counters for the last hour.
 * Uses a two-level cache: in-memory rolling counter first, DB fallback.
 *
 * @param {string} ip
 * @returns {{ impressions: number, clicks: number }}
 */
export async function getIpHourlyStats(ip) {
    const impKey = `cnt_imp_${ip}`;
    const clkKey = `cnt_clk_${ip}`;

    let impressions = rollingCounters.get(impKey);
    let clicks = rollingCounters.get(clkKey);

    // Cache miss — query DB (happens ~once/hour per IP, not per request)
    if (impressions === undefined || clicks === undefined) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        try {
            const [impCount, clkCount] = await Promise.all([
                prisma.impression.count({ where: { ip, createdAt: { gte: oneHourAgo } } }),
                prisma.impression.count({ where: { ip, createdAt: { gte: oneHourAgo }, clicked: true } }),
            ]);
            impressions = impCount;
            clicks = clkCount;
            // Cache for 30s — fresh enough without hammering DB every request
            rollingCounters.set(impKey, impressions, 30);
            rollingCounters.set(clkKey, clicks, 30);
        } catch {
            impressions = 0;
            clicks = 0;
        }
    }

    return { impressions, clicks };
}

/**
 * Increment in-memory rolling counters after a successful impression record.
 * Call this AFTER the impression is written to DB so the count stays accurate.
 *
 * @param {string} ip
 * @param {boolean} clicked
 */
export function incrementIpCounters(ip, clicked = false) {
    const impKey = `cnt_imp_${ip}`;
    const clkKey = `cnt_clk_${ip}`;
    rollingCounters.set(impKey, (rollingCounters.get(impKey) || 0) + 1, 3600);
    if (clicked) {
        rollingCounters.set(clkKey, (rollingCounters.get(clkKey) || 0) + 1, 3600);
    }
}

/**
 * Increment click counter when a click is confirmed (call from click endpoint).
 *
 * @param {string} ip
 */
export function incrementClickCounter(ip) {
    const clkKey = `cnt_clk_${ip}`;
    rollingCounters.set(clkKey, (rollingCounters.get(clkKey) || 0) + 1, 3600);
}

/**
 * Express middleware — hard-blocks ONLY known-headless/bot UAs before any
 * other processing. Everything else passes to the full scoring system.
 * Note: TOR/datacenter IPs are scored, not outright blocked here,
 * because they CAN be legitimate (VPN users, dev testing, etc.) —
 * the PENDING hold system handles them appropriately.
 */
export function botUaGuard(req, res, next) {
    if (req.method !== 'POST') return next();

    const ua = (req.body?.userAgent || req.headers['user-agent'] || '').toLowerCase();

    // These signal an automated tool — no legitimate user will have these strings
    const HARD_BLOCK_PATTERNS = [
        'headlesschrome', 'headless', 'puppeteer', 'playwright',
        'phantomjs', 'selenium', 'webdriver', 'crawl', 'spider',
        'scraper', 'wget/', 'curl/', 'python-requests', 'go-http-client',
    ];

    // "bot" as a standalone word — avoid blocking "robot" in product names
    const hasBotWord = /\bbot\b/.test(ua);
    const hasHardBlock = HARD_BLOCK_PATTERNS.some(p => ua.includes(p));

    if (hasBotWord || hasHardBlock) {
        return res.json({ ad: null, message: 'Invalid user agent' });
    }

    next();
}
