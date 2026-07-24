import prisma from '../lib/prisma.js';
import os from 'os';
import redis from '../utils/redis.js';
import { getSetting } from './admin-settings.controller.js';

/**
 * Get System Health Status
 * Returns real-time metrics for DB, Redis, CPU, RAM, Services, and Uptime
 */
export const getSystemHealth = async (req, res) => {
    try {
        const startTime = Date.now();

        // 1. Database Health Check
        let dbStatus = 'OPERATIONAL';
        let dbLatency = 0;
        try {
            const dbStart = Date.now();
            await prisma.$queryRaw`SELECT 1`;
            dbLatency = Date.now() - dbStart;
        } catch (error) {
            console.error('[HealthCheck] Database Error:', error);
            dbStatus = 'DEGRADED';
        }

        // 2. Redis Health Check (Live Ping with 1s timeout)
        let redisStatus = 'OFFLINE';
        let redisLatency = 0;
        let redisMessage = 'Redis container is unreachable (ECONNREFUSED). Push Notification BullMQ queue is currently offline.';
        try {
            const redisStart = Date.now();
            const pingRes = await Promise.race([
                redis.ping(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1000))
            ]);
            if (pingRes === 'PONG') {
                redisStatus = 'OPERATIONAL';
                redisLatency = Date.now() - redisStart;
                redisMessage = 'Redis 7 Server Running (BullMQ Push Queue Active)';
            }
        } catch (error) {
            redisStatus = 'OFFLINE';
            redisMessage = `Redis Unreachable (${error.message}). Push notifications will stay queued in memory or skip.`;
        }

        // 3. Web Push (VAPID) Status
        const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || await getSetting('vapid_public_key');
        const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || await getSetting('vapid_private_key');
        const vapidConfigured = Boolean(vapidPublicKey && vapidPrivateKey && vapidPublicKey.length > 20);

        // 4. Adsterra Backfill Status
        const adsterraEnabled = (await getSetting('adsterra_smartlink_enabled', 'false')) === 'true';
        const adsterraPopunderUrl = await getSetting('adsterra_smartlink_popunder', '');
        const adsterraApiKey = await getSetting('adsterra_api_key', '');
        const adsterraStatus = adsterraEnabled
            ? (adsterraPopunderUrl && adsterraApiKey ? 'OPERATIONAL' : 'CONFIGURED_NO_API')
            : 'DISABLED';

        // 5. Rate Limits Config
        const strictMax = parseInt(await getSetting('rate_limit_strict_max', '100'), 10);
        const apiMax = parseInt(await getSetting('rate_limit_api_max', '600'), 10);
        const adMax = parseInt(await getSetting('rate_limit_ad_max', '3000'), 10);

        // 6. Payment Gateways Status
        const dodoEnabled = (await getSetting('dodo_enabled', 'false')) === 'true';
        const oxapayEnabled = (await getSetting('oxapay_enabled', 'false')) === 'true';
        const voletEnabled = (await getSetting('volet_enabled', 'false')) === 'true';

        // 7. System Resource Usage
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memUsagePercent = ((usedMem / totalMem) * 100).toFixed(1);

        const cpus = os.cpus();
        const cpuModel = cpus[0]?.model || 'Unknown CPU';
        const loadAvg = os.platform() === 'win32' ? [0, 0, 0] : os.loadavg();

        // 8. Process Uptime
        const uptimeSeconds = process.uptime();
        const uptimeDays = Math.floor(uptimeSeconds / 86400);
        const uptimeHours = Math.floor((uptimeSeconds % 86400) / 3600);
        const uptimeMinutes = Math.floor(((uptimeSeconds % 86400) % 3600) / 60);

        // 9. API Response Latency
        const apiLatency = Date.now() - startTime;

        res.json({
            status: dbStatus === 'OPERATIONAL' && redisStatus === 'OPERATIONAL' ? 'HEALTHY' : 'WARNING',
            timestamp: new Date().toISOString(),
            components: {
                database: {
                    status: dbStatus,
                    latency: `${dbLatency}ms`,
                    engine: 'MySQL 8.0 (Prisma ORM)'
                },
                redis: {
                    status: redisStatus,
                    latency: redisStatus === 'OPERATIONAL' ? `${redisLatency}ms` : 'N/A',
                    engine: redisStatus === 'OPERATIONAL' ? 'Redis 7 (BullMQ Queue Active)' : 'Offline',
                    message: redisMessage
                },
                api: {
                    status: 'OPERATIONAL',
                    latency: `${apiLatency}ms`,
                    version: '1.2.0'
                },
                vapid: {
                    status: vapidConfigured ? 'OPERATIONAL' : 'NOT_CONFIGURED',
                    subject: process.env.VAPID_SUBJECT || 'mailto:admin@mrpop.io'
                },
                adsterra: {
                    status: adsterraStatus,
                    enabled: adsterraEnabled,
                    popunderUrl: adsterraPopunderUrl ? 'Configured' : 'Missing',
                    hasApiKey: Boolean(adsterraApiKey)
                },
                rateLimits: {
                    strict: `${strictMax} req / 15m`,
                    api: `${apiMax} req / 15m`,
                    adServer: `${adMax} req / 1m`
                },
                payments: {
                    dodo: dodoEnabled ? 'ACTIVE' : 'DISABLED',
                    oxapay: oxapayEnabled ? 'ACTIVE' : 'DISABLED',
                    volet: voletEnabled ? 'ACTIVE' : 'DISABLED'
                }
            },
            system: {
                hostname: os.hostname(),
                platform: os.platform(),
                uptime: `${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m`,
                cpu: {
                    model: cpuModel,
                    cores: cpus.length,
                    load: loadAvg[0].toFixed(2)
                },
                memory: {
                    total: `${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
                    used: `${(usedMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
                    free: `${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
                    percent: `${memUsagePercent}%`
                }
            }
        });
    } catch (error) {
        console.error('System health check error:', error);
        res.status(500).json({ status: 'ERROR', message: 'Failed to fetch system metrics' });
    }
};

