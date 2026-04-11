/**
 * audience.service.js
 *
 * Provides audience rule evaluation for the serve engine.
 * All results are cached in NodeCache to prevent N+1 DB queries under load.
 *
 * Rule types supported:
 *   GEO_INCLUDE      { type, values: ['TR','US'] }
 *   GEO_EXCLUDE      { type, values: ['RU'] }
 *   DEVICE_MATCH     { type, values: ['mobile','desktop','tablet'] }
 *   OS_MATCH         { type, values: ['Android','iOS','Windows'] }
 *   BROWSER_MATCH    { type, values: ['Chrome','Firefox','Safari'] }
 *   CAMPAIGN_SAW     { type, campaignId }  → IP has an impression for this campaign
 *   CAMPAIGN_CLICKED { type, campaignId }  → IP has a clicked impression
 *   CAMPAIGN_SAW_NOT { type, campaignId }  → IP has NOT seen this campaign
 */

import NodeCache from 'node-cache';
import prisma from '../lib/prisma.js';

// Shared cache instance — 60s TTL for audience rules, 300s for match results
const audienceCache = new NodeCache({ stdTTL: 60, checkperiod: 30 });

/**
 * Fetch multiple audiences by IDs (with 60s cache).
 */
export async function getAudiencesByIds(audienceIds) {
    if (!audienceIds || audienceIds.length === 0) return [];

    const sorted = [...audienceIds].sort();
    const cacheKey = `aud_rules_${sorted.join('_')}`;
    let audiences = audienceCache.get(cacheKey);

    if (audiences === undefined) {
        audiences = await prisma.audience.findMany({
            where: { id: { in: audienceIds }, isActive: true },
            select: { id: true, rules: true }
        });
        audienceCache.set(cacheKey, audiences, 60);
    }

    return audiences;
}

/**
 * Evaluate whether a visitor context matches a single audience.
 * Results are cached per {ip}_{audienceId} for 5 minutes.
 *
 * @param {object} ctx  - { ip, country, device, os, browser }
 * @param {object} aud  - { id, rules: Array }
 * @returns {Promise<boolean>}
 */
export async function evaluateAudienceMatch(ctx, aud) {
    const cacheKey = `aud_match_${ctx.ip}_${aud.id}`;
    const cached = audienceCache.get(cacheKey);
    if (cached !== undefined) return cached;

    const rules = Array.isArray(aud.rules) ? aud.rules : [];
    let result = true;

    for (const rule of rules) {
        let pass = true;

        switch (rule.type) {
            case 'GEO_INCLUDE':
                pass = Array.isArray(rule.values) && rule.values.includes(ctx.country);
                break;

            case 'GEO_EXCLUDE':
                pass = !Array.isArray(rule.values) || !rule.values.includes(ctx.country);
                break;

            case 'DEVICE_MATCH':
                pass = Array.isArray(rule.values) && rule.values.includes(ctx.device);
                break;

            case 'OS_MATCH':
                pass = Array.isArray(rule.values) && rule.values.includes(ctx.os);
                break;

            case 'BROWSER_MATCH':
                pass = Array.isArray(rule.values) && rule.values.includes(ctx.browser);
                break;

            case 'CAMPAIGN_SAW': {
                if (!rule.campaignId) { pass = false; break; }
                const count = await prisma.impression.count({
                    where: { campaignId: rule.campaignId, ip: ctx.ip }
                });
                pass = count > 0;
                break;
            }

            case 'CAMPAIGN_CLICKED': {
                if (!rule.campaignId) { pass = false; break; }
                const count = await prisma.impression.count({
                    where: { campaignId: rule.campaignId, ip: ctx.ip, clicked: true }
                });
                pass = count > 0;
                break;
            }

            case 'CAMPAIGN_SAW_NOT': {
                if (!rule.campaignId) { pass = true; break; }
                const count = await prisma.impression.count({
                    where: { campaignId: rule.campaignId, ip: ctx.ip }
                });
                pass = count === 0;
                break;
            }

            default:
                // Unknown rule type: skip (permissive)
                pass = true;
        }

        if (!pass) {
            result = false;
            break; // Short-circuit: all rules must pass (AND logic)
        }
    }

    audienceCache.set(cacheKey, result, 300); // 5-min cache per IP+audience
    return result;
}

/**
 * Check whether a visitor context matches the audience targeting
 * configured on a campaign's targeting JSON.
 *
 * targeting.audiences = { include: [audienceId,...], exclude: [audienceId,...] }
 *
 * Include logic: at least one included audience must match (OR inside include list).
 * Exclude logic: none of the excluded audiences may match.
 *
 * @returns {Promise<boolean>}
 */
export async function checkAudienceTargeting(campaign, ctx) {
    const audienceTargeting = campaign.targeting?.audiences;
    if (!audienceTargeting) return true; // No audience targeting → allow all

    const { include = [], exclude = [] } = audienceTargeting;
    if (include.length === 0 && exclude.length === 0) return true;

    // Fetch all needed audiences in one cached call
    const allIds = [...new Set([...include, ...exclude])];
    const audiences = await getAudiencesByIds(allIds);
    const audById = Object.fromEntries(audiences.map(a => [a.id, a]));

    // Exclude check (any match → block)
    for (const audId of exclude) {
        const aud = audById[audId];
        if (!aud) continue;
        const matched = await evaluateAudienceMatch(ctx, aud);
        if (matched) return false;
    }

    // Include check (at least one must match)
    if (include.length > 0) {
        let anyMatch = false;
        for (const audId of include) {
            const aud = audById[audId];
            if (!aud) continue;
            const matched = await evaluateAudienceMatch(ctx, aud);
            if (matched) { anyMatch = true; break; }
        }
        if (!anyMatch) return false;
    }

    return true;
}

/**
 * Invalidate cached audience rules (call after audience update/delete).
 */
export function invalidateAudienceCache(audienceId) {
    // NodeCache doesn't support partial key invalidation easily;
    // flush all audience rule caches (acceptable given 60s TTL).
    const keys = audienceCache.keys().filter(k => k.startsWith('aud_rules_') || k.includes(`_${audienceId}`));
    audienceCache.del(keys);
}
