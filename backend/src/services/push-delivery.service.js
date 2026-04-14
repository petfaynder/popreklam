import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import webpush from 'web-push';
import prisma from '../lib/prisma.js';


// ── Redis Connection ────────────────────────────────────────────────────────
let redisAvailable = false;
let pushRedisErrorLogged = false;

const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
    lazyConnect: true,
    retryStrategy(times) {
        if (times > 3) {
            if (!pushRedisErrorLogged) {
                console.warn('⚠️  [PushDelivery] Redis unavailable — push notifications disabled. Start Redis to enable.');
                pushRedisErrorLogged = true;
            }
            return null; // Stop retrying — no more logs
        }
        return Math.min(times * 1000, 3000);
    },
});

redisConnection.on('connect', () => {
    redisAvailable = true;
    pushRedisErrorLogged = false;
    console.log('✅ [PushDelivery] Redis connected — push notifications enabled.');
});

redisConnection.on('error', (err) => {
    redisAvailable = false;
    // Only log once — retryStrategy handles the silence after max retries
    if (!pushRedisErrorLogged && err.code === 'ECONNREFUSED') {
        // Will be logged by retryStrategy after 3 attempts
    } else if (err.code !== 'ECONNREFUSED') {
        console.error('[PushDelivery] Redis error:', err.message);
    }
});

// ── Queue (only created if Redis becomes available) ─────────────────────────
// We create the Queue object upfront since BullMQ requires it,
// but all enqueue calls are guarded by redisAvailable check.
export const pushQueue = new Queue('push-delivery', {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 500,
    }
});

// ── Worker ──────────────────────────────────────────────────────────────────
export const startPushWorker = () => {
    const worker = new Worker('push-delivery', async (job) => {
        const { deliveryId, subscriptionId, payload } = job.data;

        const sub = await prisma.pushSubscription.findUnique({
            where: { id: subscriptionId }
        });

        if (!sub || !sub.isActive) {
            console.log(`[PushWorker] Skipping inactive subscription ${subscriptionId}`);
            return;
        }

        try {
            await webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: { p256dh: sub.p256dh, auth: sub.auth }
                },
                JSON.stringify(payload)
            );

            // Mark as sent, update campaign totalClicks tracking for revenue
            await prisma.pushDelivery.update({
                where: { id: deliveryId },
                data: {
                    status: 'SENT',
                    sentAt: new Date()
                }
            });

            // Update subscriber's lastPushedAt
            await prisma.pushSubscription.update({
                where: { id: subscriptionId },
                data: { lastPushedAt: new Date() }
            });

        } catch (err) {
            if (err.statusCode === 410 || err.statusCode === 404) {
                // Subscription expired or invalid — deactivate permanently
                console.log(`[PushWorker] Expired subscription ${subscriptionId} — deactivating.`);
                await prisma.pushSubscription.update({
                    where: { id: subscriptionId },
                    data: { isActive: false }
                });
                await prisma.pushDelivery.update({
                    where: { id: deliveryId },
                    data: { status: 'EXPIRED' }
                });
            } else {
                // Transient error — increment fail counter, BullMQ will retry
                await prisma.pushSubscription.update({
                    where: { id: subscriptionId },
                    data: { failCount: { increment: 1 } }
                });
                await prisma.pushDelivery.update({
                    where: { id: deliveryId },
                    data: { status: 'FAILED' }
                });
                throw err; // Re-throw so BullMQ retries
            }
        }
    }, {
        connection: redisConnection,
        concurrency: 20,
    });

    worker.on('completed', (job) => {
        console.log(`[PushWorker] Job ${job.id} completed.`);
    });

    worker.on('failed', (job, err) => {
        console.error(`[PushWorker] Job ${job?.id} failed: ${err.message}`);
    });

    console.log('✅ Push Delivery Worker started (concurrency: 20).');
    return worker;
};

// ── Enqueue Campaign ────────────────────────────────────────────────────────
/**
 * Finds eligible push subscribers for a campaign and enqueues delivery jobs.
 * Uses targeting rules: country, device, subscription age.
 */
export const enqueuePushCampaign = async (campaign) => {
    if (!redisAvailable) return 0; // Redis not running — skip silently

    const targeting = campaign.targeting || {};
    const freqCap = Number(campaign.freqCap || 3);

    // Build subscriber filter
    const where = {
        isActive: true,
        // Only subscribers from sites that allow this campaign's traffic type
        site: {
            status: 'ACTIVE',
        }
    };

    // Geo targeting
    if (targeting.countries?.length > 0) {
        where.country = { in: targeting.countries };
    }

    // Device targeting
    if (targeting.devices?.length > 0) {
        where.device = { in: targeting.devices };
    }

    // Subscription age targeting (only push to recent subscribers if configured)
    if (targeting.subscriptionAgeDays) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - parseInt(targeting.subscriptionAgeDays));
        where.createdAt = { gte: cutoff };
    }

    // Check click limits
    const totalClicksOk = !campaign.totalClicksLimit || campaign.totalClicks < campaign.totalClicksLimit;
    const dailyClicksOk = !campaign.dailyClicksLimit || campaign.dailyClicks < campaign.dailyClicksLimit;
    if (!totalClicksOk || !dailyClicksOk) {
        console.log(`[PushQueue] Campaign ${campaign.id} reached click limit — skipping.`);
        return 0;
    }

    // Check budget
    if (Number(campaign.totalSpent) >= Number(campaign.totalBudget)) {
        console.log(`[PushQueue] Campaign ${campaign.id} budget exhausted — skipping.`);
        return 0;
    }

    // Batch subscribers (10k at a time to avoid memory issues)
    const subscribers = await prisma.pushSubscription.findMany({
        where,
        take: 10000,
        select: { id: true, endpoint: true, p256dh: true, auth: true }
    });

    if (subscribers.length === 0) {
        return 0;
    }

    const batchJobs = [];

    for (const sub of subscribers) {
        // Frequency cap: skip if already delivered today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const deliveredToday = await prisma.pushDelivery.count({
            where: {
                campaignId: campaign.id,
                subscriptionId: sub.id,
                createdAt: { gte: todayStart },
                status: { in: ['SENT', 'CLICKED'] }
            }
        });

        if (deliveredToday >= freqCap) continue;

        // Create delivery record
        const delivery = await prisma.pushDelivery.create({
            data: {
                campaignId: campaign.id,
                subscriptionId: sub.id,
                status: 'PENDING',
            }
        });

        batchJobs.push({
            name: 'push',
            data: {
                deliveryId: delivery.id,
                subscriptionId: sub.id,
                campaignId: campaign.id,
                payload: {
                    title: campaign.pushTitle || campaign.name,
                    body: campaign.pushBody || '',
                    icon: campaign.pushIcon || '',
                    image: campaign.pushImage || '',
                    url: campaign.targetUrl,
                    deliveryId: delivery.id,
                }
            }
        });
    }

    if (batchJobs.length > 0) {
        await pushQueue.addBulk(batchJobs);
        console.log(`[PushQueue] Enqueued ${batchJobs.length} push jobs for campaign "${campaign.name}".`);
    }

    return batchJobs.length;
};
