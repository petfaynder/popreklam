/**
 * Backfill Ad Service
 *
 * When PopReklam has no matching internal campaign for a zone impression,
 * this service provides a fallback ad via Adsterra SmartLink.
 *
 * ─── HOW THIS WORKS ──────────────────────────────────────────────────────────
 *
 * Adsterra SmartLink is a domain-independent redirect URL that:
 *   1. Works on ANY publisher domain without domain registration
 *   2. Automatically picks the highest-paying offer for the visitor's geo/device
 *   3. Supports sub-parameters for tracking (sub1, sub2, sub3...)
 *
 * Flow:
 *   Publisher site → PopReklam ad tag → no internal campaign →
 *   backfill fires → browser opens SmartLink with ?sub1=zoneId →
 *   Adsterra redirects user to best CPA/CPM offer
 *
 * Revenue tracking:
 *   Adsterra stats API (group_by=placement_sub_id) → per-zone revenue →
 *   distribute 70% to publisher via hourly cron job
 *
 * ─── ADMIN SETUP ─────────────────────────────────────────────────────────────
 *
 * In admin panel → System Settings, configure:
 *
 *   Key: adsterra_smartlink_popunder
 *   Value: https://www.profitablecpmratenetwork.com/f2mttsdwp8?key=YOUR_KEY
 *   (Get this from Adsterra dashboard → SmartLinks → copy URL)
 *
 *   Key: adsterra_smartlink_inpage
 *   Value: https://www.profitablecpmratenetwork.com/XXXX?key=YOUR_KEY
 *   (Use a separate SmartLink zone for in-page push if available)
 *
 *   Key: adsterra_smartlink_enabled
 *   Value: true
 *
 *   Key: adsterra_estimated_cpm
 *   Value: 0.50  (estimated CPM in USD — reconcile monthly with actual payout)
 */

import { getSetting } from '../controllers/admin-settings.controller.js';

/**
 * Append sub-tracking parameters to a SmartLink URL.
 * Adsterra supports sub1..sub5 — we use sub1 for zone tracking.
 *
 * @param {string} baseUrl - The SmartLink URL from Adsterra
 * @param {string} zoneId  - PopReklam zone ID (for stats reconciliation)
 * @returns {string} - URL with sub parameters appended
 */
function buildSmartLinkUrl(baseUrl, zoneId) {
    try {
        const url = new URL(baseUrl);
        // sub1 = zone ID so Adsterra stats API can group by placement_sub_id
        url.searchParams.set('sub1', zoneId);
        return url.toString();
    } catch {
        // Fallback: manual append
        const sep = baseUrl.includes('?') ? '&' : '?';
        return `${baseUrl}${sep}sub1=${encodeURIComponent(zoneId)}`;
    }
}

/**
 * Get a backfill ad for the given zone/format.
 *
 * Returns:
 *   {
 *     source: 'adsterra',
 *     format: 'POPUNDER',
 *     smartLinkUrl: 'https://...',   ← browser opens this in popup
 *     estimatedCpm: 0.50
 *   }
 * or null if no backfill is configured.
 *
 * @param {string} format  - 'POPUNDER' | 'IN_PAGE_PUSH' | 'NATIVE'
 * @param {string} country - ISO country code (informational)
 * @param {string} device  - 'mobile' | 'desktop' | 'tablet'
 * @param {string} zoneId  - PopReklam zone ID (for sub-tracking)
 * @returns {object|null}
 */
export async function getBackfillAd(format, country, device, zoneId = '') {
    // Only backfill formats that can use a SmartLink redirect
    if (!['POPUNDER', 'IN_PAGE_PUSH', 'NATIVE', 'DIRECT_LINK'].includes(format)) return null;

    const isEnabled = await getSetting('adsterra_smartlink_enabled', 'false');
    if (isEnabled !== 'true') {
        // Silent skip — log only in dev
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[Backfill] adsterra_smartlink_enabled=false, skipping. Format: ${format}`);
        }
        return null;
    }

    // Pick the right SmartLink URL for the format
    // POPUNDER → onclick SmartLink (opens in new tab on click)
    // IN_PAGE_PUSH / NATIVE → can use same or a separate inpage SmartLink
    const settingKey = (format === 'POPUNDER' || format === 'DIRECT_LINK')
        ? 'adsterra_smartlink_popunder'
        : 'adsterra_smartlink_inpage';

    let baseUrl = await getSetting(settingKey, null);

    // Fallback: if no inpage SmartLink configured, try popunder one
    if (!baseUrl && settingKey === 'adsterra_smartlink_inpage') {
        baseUrl = await getSetting('adsterra_smartlink_popunder', null);
    }

    if (!baseUrl || baseUrl.trim().length < 10) {
        console.log(`[Backfill] No SmartLink URL configured for key: ${settingKey}`);
        return null;
    }

    const estimatedCpm = parseFloat(
        await getSetting('adsterra_estimated_cpm', '0.50')
    );

    // Append sub1=zoneId for Adsterra stats API tracking
    const smartLinkUrl = buildSmartLinkUrl(baseUrl.trim(), zoneId);

    console.log(`[Backfill] Adsterra SmartLink fill: ${format} / ${country} / ${device}`);

    return {
        source: 'adsterra',
        format,
        smartLinkUrl,   // browser opens this — works on any publisher domain
        estimatedCpm,
        creative: null
    };
}
