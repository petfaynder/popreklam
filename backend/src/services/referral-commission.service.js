/**
 * Referral Commission Service
 * ===========================
 * Accumulates referral commissions in-memory (per advertiserId) and flushes
 * them to the database in batches to avoid per-impression DB writes.
 *
 * Flow:
 *   1. trackImpression() calls recordCommission(advertiserId, cost)
 *   2. This service checks cache for the advertiser's referrer.
 *   3. If a referrer exists, commission is accumulated in the pendingFlush map.
 *   4. flushCommissions() is called by the cron job every 5 min (or when
 *      the buffer hits FLUSH_THRESHOLD entries).
 */

import prisma from '../lib/prisma.js';
import NodeCache from 'node-cache';

// ── Constants ─────────────────────────────────────────────────────────────────
const FLUSH_THRESHOLD    = 500;   // Flush when buffer reaches this many entries
const REFERRER_TTL_SEC   = 600;   // Cache referrer lookups for 10 min
const MAX_FLUSH_RETRIES  = 3;     // Drop entry after this many consecutive flush failures

// ── In-memory stores ──────────────────────────────────────────────────────────

/**
 * referrerCache: advertiserId → { referralId, referrerId, commissionRate }
 * Uses NodeCache with automatic TTL eviction — prevents unbounded Map growth.
 * maxKeys caps the cache at 50k entries to bound memory even under extreme load.
 */
const referrerCache = new NodeCache({ stdTTL: REFERRER_TTL_SEC, checkperiod: 120, maxKeys: 50000 });

/**
 * pendingFlush: referralId → { referrerId, earned, retries }
 * Accumulates earned amounts per referral record until flush.
 * retries field tracks consecutive DB failures — entries are dropped after MAX_FLUSH_RETRIES.
 */
const pendingFlush = new Map();

let totalBuffered = 0; // Total impression-level entries buffered since last flush

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Looks up the referral row for a given advertiser user.
 * Returns null if no referral exists.
 */
async function fetchReferral(advertiserUserId) {
    const cached = referrerCache.get(advertiserUserId);
    if (cached !== undefined) return cached; // NodeCache handles TTL automatically

    // Only ADVERTISER-type referrals matter here
    // NOTE: referredId is a direct scalar field on Referral (maps to referred_id column)
    const referral = await prisma.referral.findFirst({
        where: {
            referredId: advertiserUserId,
            type: 'ADVERTISER',
            status: { in: ['ACTIVE', 'PENDING'] },
        },
        select: {
            id: true,
            referrerId: true,
            commissionRate: true,
        },
    });

    if (!referral) {
        // Cache negative result too (null marker) to avoid repeated DB hits
        referrerCache.set(advertiserUserId, { referralId: null });
        return null;
    }

    const entry = {
        referralId: referral.id,
        referrerId: referral.referrerId,
        commissionRate: Number(referral.commissionRate),
    };
    referrerCache.set(advertiserUserId, entry);
    return entry;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Called once per impression.
 * @param {string} advertiserUserId  - The User.id of the advertiser (not Advertiser.id)
 * @param {number} cost              - The raw CPM cost of this impression (e.g. 0.002)
 */
export async function recordCommission(advertiserUserId, cost) {
    try {
        const referral = await fetchReferral(advertiserUserId);
        if (!referral || !referral.referralId) return; // No referrer

        const commission = (cost * referral.commissionRate) / 100;
        if (commission <= 0) return;

        // Accumulate in pending map
        const existing = pendingFlush.get(referral.referralId);
        if (existing) {
            existing.earned += commission;
        } else {
            pendingFlush.set(referral.referralId, {
                referrerId: referral.referrerId,
                earned: commission,
                retries: 0,
            });
        }

        totalBuffered++;

        // Auto-flush when threshold hit.
        // flushCommissions() resets totalBuffered at start of its own run,
        // so fire-and-forget is safe — no double-reset here.
        if (totalBuffered >= FLUSH_THRESHOLD) {
            flushCommissions().catch(err =>
                console.error('[ReferralCommission] Auto-flush error:', err.message)
            );
        }
    } catch (err) {
        // Never let a commission bug break ad serving
        console.error('[ReferralCommission] recordCommission error:', err.message);
    }
}

/**
 * Flushes all buffered commissions to the database.
 * Called by cron job every 5 minutes and on auto-flush threshold.
 * @returns {{ flushed: number, totalEarned: number }}
 */
export async function flushCommissions() {
    if (pendingFlush.size === 0) return { flushed: 0, totalEarned: 0 };

    // Snapshot and clear the buffer atomically.
    // Reset totalBuffered FIRST so impressions arriving during this async
    // flush correctly increment from 0 into the now-empty pendingFlush map.
    const snapshot = new Map(pendingFlush);
    pendingFlush.clear();
    totalBuffered = 0;

    let flushed = 0;
    let totalEarned = 0;

    for (const [referralId, { referrerId, earned, retries = 0 }] of snapshot) {
        // Round to 2 decimal places — matches DB Decimal(10,2) for totalEarned
        const roundedEarned = Math.round(earned * 100) / 100;
        if (roundedEarned <= 0) continue;

        try {
            await prisma.$transaction([
                // 1. Increment earned on the Referral record
                prisma.referral.update({
                    where: { id: referralId },
                    data: { totalEarned: { increment: roundedEarned } },
                }),
                // 2. Add to referrer's balance (advertiser can spend it immediately)
                prisma.user.update({
                    where: { id: referrerId },
                    data: { balance: { increment: roundedEarned } },
                }),
                // 3. Create a BONUS transaction for auditability
                prisma.transaction.create({
                    data: {
                        userId: referrerId,
                        type: 'BONUS',
                        status: 'COMPLETED',
                        amount: roundedEarned,
                        description: `Referral commission batch payout`,
                        metadata: { referralId, source: 'referral_commission_flush' },
                    },
                }),
            ]);

            flushed++;
            totalEarned += roundedEarned;
        } catch (err) {
            const newRetries = retries + 1;
            if (newRetries >= MAX_FLUSH_RETRIES) {
                // Drop the entry after max retries to prevent unbounded memory growth
                console.error(`[ReferralCommission] DROPPED referralId=${referralId} after ${MAX_FLUSH_RETRIES} retries ($${roundedEarned}):`, err.message);
            } else {
                console.error(`[ReferralCommission] Failed to flush referralId=${referralId} (retry ${newRetries}/${MAX_FLUSH_RETRIES}):`, err.message);
                // Re-queue with incremented retry counter
                const existing = pendingFlush.get(referralId);
                if (existing) {
                    existing.earned += roundedEarned;
                    existing.retries = Math.max(existing.retries, newRetries);
                } else {
                    pendingFlush.set(referralId, { referrerId, earned: roundedEarned, retries: newRetries });
                }
            }
        }
    }

    if (flushed > 0) {
        console.log(`[ReferralCommission] Flushed ${flushed} referrals — total $${totalEarned.toFixed(6)} credited`);
    }

    return { flushed, totalEarned };
}

/**
 * Returns current buffer size (for monitoring/logging).
 */
export function getBufferSize() {
    return { pendingReferrals: pendingFlush.size, bufferedImpressions: totalBuffered };
}
