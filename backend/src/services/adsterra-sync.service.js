/**
 * Adsterra Revenue Sync Service — Country-Proportional Attribution
 *
 * ─── MANTIK ──────────────────────────────────────────────────────────────────
 *
 * Adsterra bize ülke bazlı toplam geliri söyler:
 *   TR → $20.00
 *   US → $40.00
 *   DE → $15.00
 *
 * Bizim BackfillImpression tablosu o günkü backfill hit'lerinin ülkesini bilir:
 *   Publisher 1 (Zone A) → TR: 300 hit, US: 100 hit
 *   Publisher 2 (Zone B) → TR: 200 hit, US: 400 hit
 *
 * Attribution (her ülkedeki haşımın oranına göre):
 *   TR havuzu ($20):
 *     Publisher 1: 300/500 × $20 × %70 = $8.40
 *     Publisher 2: 200/500 × $20 × %70 = $5.60
 *   US havuzu ($40):
 *     Publisher 1: 100/500 × $40 × %70 = $5.60
 *     Publisher 2: 400/500 × $40 × %70 = $22.40
 *
 * DOUBLE-PAY ENGELLEMESİ:
 *   Her (publisher + tarih) için ne kadar ödendiği SystemSetting'de log olarak saklanır.
 *   Saatlik sync çalışınca yalnızca "yeni" kazanç farkı ödenir.
 *   Aynı veri iki kez eklenmez.
 *
 * ─── API ─────────────────────────────────────────────────────────────────────
 * URL:  GET https://api3.adsterratools.com/publisher/stats.json
 * Auth: X-API-Key header
 * Param: group_by=country → ülke bazlı gelir
 */

import prisma from '../lib/prisma.js';
import { getSetting } from '../controllers/admin-settings.controller.js';


const ADSTERRA_STATS_URL = 'https://api3.adsterratools.com/publisher/stats.json';

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

/**
 * Pull Adsterra stats for a specific day (grouped by country).
 * Returns: Map<countryCode, revenue>
 */
async function fetchAdsterraCountryRevenue(apiKey, dateStr) {
    const url = new URL(ADSTERRA_STATS_URL);
    url.searchParams.set('start_date', dateStr);
    url.searchParams.set('finish_date', dateStr);
    url.searchParams.append('group_by[]', 'country');

    const res = await fetch(url.toString(), {
        headers: { 'Accept': 'application/json', 'X-API-Key': apiKey }
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Adsterra API ${res.status}: ${body}`);
    }

    const data = await res.json();
    const countryRevenue = new Map();

    for (const item of (data?.items || [])) {
        const country = (item.country || 'UNKNOWN').toUpperCase();
        const revenue = parseFloat(item.revenue || 0);
        if (revenue > 0) {
            countryRevenue.set(country, (countryRevenue.get(country) || 0) + revenue);
        }
    }

    return countryRevenue;
}

/**
 * Count backfill impressions per zone per country for a specific day.
 * Returns: Map<countryCode, Map<publisherUserId, { publisherId, impressions }>>
 *
 * Logic: BackfillImpression → Zone → Site → Publisher → User
 */
async function getBackfillBreakdown(dateStr) {
    const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
    const dayEnd   = new Date(`${dateStr}T23:59:59.999Z`);

    // Aggregate impressions grouped by country + zone
    const rows = await prisma.backfillImpression.groupBy({
        by: ['country', 'zoneId'],
        where: {
            source: { in: ['adsterra', 'adsterra_split'] },
            createdAt: { gte: dayStart, lte: dayEnd }
        },
        _count: { id: true }
    });

    if (rows.length === 0) return new Map();

    // Resolve zoneId → publisher (batch)
    const zoneIds = [...new Set(rows.map(r => r.zoneId).filter(Boolean))];
    const zones = await prisma.zone.findMany({
        where: { id: { in: zoneIds } },
        include: {
            site: {
                include: {
                    publisher: { select: { id: true, userId: true } }
                }
            }
        }
    });

    // Build lookup: zoneId → { publisherId, userId }
    const zonePubMap = new Map();
    for (const z of zones) {
        const pub = z.site?.publisher;
        if (pub) zonePubMap.set(z.id, { publisherId: pub.id, userId: pub.userId });
    }

    // Build: country → Map<userId, { publisherId, impressions }>
    // countryBreakdown: Map<country, Map<userId, { publisherId, count }>>
    const countryBreakdown = new Map();

    for (const row of rows) {
        const country = (row.country || 'UNKNOWN').toUpperCase();
        const pub = zonePubMap.get(row.zoneId);
        if (!pub) continue;

        const count = row._count.id;

        if (!countryBreakdown.has(country)) {
            countryBreakdown.set(country, new Map());
        }

        const pubMap = countryBreakdown.get(country);
        const existing = pubMap.get(pub.userId) || { publisherId: pub.publisherId, count: 0 };
        pubMap.set(pub.userId, { ...existing, count: existing.count + count });
    }

    return countryBreakdown;
}

/**
 * Main sync — called by cron every hour.
 *
 * @param {object} options
 * @param {number} options.daysAgo - 0 = today, 1 = yesterday
 */
export async function syncAdsterraRevenue({ daysAgo = 0 } = {}) {
    const apiKey = await getSetting('adsterra_api_key', null);
    if (!apiKey) return { skipped: true, reason: 'no_api_key' };

    const enabled = await getSetting('adsterra_smartlink_enabled', 'false');
    if (enabled !== 'true') return { skipped: true, reason: 'smartlink_disabled' };

    const targetDate = new Date();
    targetDate.setUTCDate(targetDate.getUTCDate() - daysAgo);
    const dateStr = formatDate(targetDate);

    // ─── 1. Pull country revenue from Adsterra ────────────────────────────
    let countryRevenue;
    try {
        countryRevenue = await fetchAdsterraCountryRevenue(apiKey, dateStr);
    } catch (err) {
        console.error(`[AdsterraSync] ${dateStr} fetch error:`, err.message);
        return { success: false, error: err.message, date: dateStr };
    }

    if (countryRevenue.size === 0) {
        return { success: true, date: dateStr, zones: 0, totalNetworkRevenue: 0, paid: [] };
    }

    const totalNetworkRevenue = [...countryRevenue.values()].reduce((a, b) => a + b, 0);

    // ─── 2. Get our backfill hit breakdown by country + publisher ─────────
    const countryBreakdown = await getBackfillBreakdown(dateStr);

    if (countryBreakdown.size === 0) {
        console.log(`[AdsterraSync] ${dateStr}: Adsterra has revenue ($${totalNetworkRevenue.toFixed(4)}) but no backfill hits in our DB yet.`);
        return { success: true, date: dateStr, zones: 0, totalNetworkRevenue, paid: [] };
    }

    const revShare = parseFloat(await getSetting('publisher_revenue_share', '70')) / 100;

    // ─── 3. Calculate attribution per publisher per country ───────────────
    // publisherEarnings: Map<userId, { publisherId, totalEarning }>
    const publisherEarnings = new Map();

    for (const [country, adsterraRevenue] of countryRevenue) {
        const pubsInCountry = countryBreakdown.get(country);

        if (!pubsInCountry || pubsInCountry.size === 0) {
            // Nobody in our system sent traffic from this country → skip
            // (Could be old traffic that hit Adsterra after we stopped tracking)
            continue;
        }

        // Total hits from this country across ALL publishers
        const totalHits = [...pubsInCountry.values()].reduce((s, p) => s + p.count, 0);

        for (const [userId, { publisherId, count }] of pubsInCountry) {
            // Publisher's share of this country's revenue
            const proportion = count / totalHits;
            const publisherEarning = adsterraRevenue * proportion * revShare;

            const existing = publisherEarnings.get(userId) || { publisherId, totalEarning: 0, breakdown: [] };
            existing.totalEarning += publisherEarning;
            existing.breakdown.push({ country, hits: count, totalHits, proportion: (proportion * 100).toFixed(1) + '%', earning: publisherEarning });
            publisherEarnings.set(userId, existing);
        }
    }

    // ─── 4. Credit each publisher (with double-pay protection) ───────────
    const paid = [];

    for (const [userId, { publisherId, totalEarning, breakdown }] of publisherEarnings) {
        if (totalEarning <= 0) continue;

        // Log key: total amount attributed to this publisher for this date
        const logKey = `adsterra_paid_${dateStr}_pub_${userId}`;
        const alreadyPaid = parseFloat(await getSetting(logKey, '0') || '0');

        const toPay = totalEarning - alreadyPaid;
        if (toPay <= 0.00001) continue; // No new revenue settled

        // Credit publisher
        await prisma.user.update({
            where: { id: userId },
            data: { balance: { increment: toPay } }
        });

        await prisma.publisher.update({
            where: { id: publisherId },
            data: { totalRevenue: { increment: toPay } }
        });

        // Audit transaction
        await prisma.transaction.create({
            data: {
                userId,
                type: 'EARNING',
                amount: toPay,
                description: `Adsterra backfill — ${dateStr} (+$${toPay.toFixed(5)}) [country-proportional]`,
                status: 'COMPLETED'
            }
        });

        // Update pay log
        await prisma.systemSetting.upsert({
            where: { key: logKey },
            update: { value: String(totalEarning) },
            create: {
                key: logKey,
                value: String(totalEarning),
                type: 'string',
                group: 'adsterra_paylog',
                label: `Adsterra pay log: publisher ${userId} / ${dateStr}`
            }
        });

        paid.push({ userId, publisherId, toPay, totalEarning, breakdown });
        console.log(`[AdsterraSync] ${dateStr}: Publisher ${userId.slice(0, 8)} → +$${toPay.toFixed(5)}`);
    }

    return {
        success: true,
        date: dateStr,
        totalNetworkRevenue,
        publishers: paid.length,
        paid
    };
}
