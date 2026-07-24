/**
 * Unified Redis Connection
 * ========================
 * Single shared Redis connection used by:
 *   - Health check (admin-health.controller.js)
 *   - Push delivery service (BullMQ queue + worker)
 *   - Any future Redis-dependent features
 *
 * DESIGN NOTES:
 *   - lazyConnect: true → Redis is not contacted until first command.
 *     This prevents startup crashes when Redis is unavailable.
 *   - maxRetriesPerRequest: null → Required by BullMQ (it manages retries internally).
 *   - enableOfflineQueue: false → Commands fail immediately when disconnected
 *     instead of queueing in memory (which would cause a memory leak).
 *   - retryStrategy: stops after 5 attempts, logs once, then stops.
 *   - Exports both the connection and a `redisAvailable` flag for
 *     feature guards (push delivery, caching, etc.)
 */

import Redis from 'ioredis';
import { logger } from './logger.js';

let redisErrorLogged = false;
let _redisAvailable = false;

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,  // Required by BullMQ
    enableReadyCheck: false,
    lazyConnect: true,           // Don't connect until first command — prevents startup crash
    enableOfflineQueue: false,   // Fail immediately when disconnected (no memory leak)
    retryStrategy(times) {
        if (times > 5) {
            if (!redisErrorLogged) {
                logger.warn('⚠️ Redis unavailable after 5 retries — stopping reconnect. Push notifications and caching will not work.');
                redisErrorLogged = true;
            }
            return null; // Stop retrying
        }
        return Math.min(times * 500, 3000);
    },
});

redis.on('connect', () => {
    _redisAvailable = true;
    redisErrorLogged = false;
    logger.info('✅ Redis connected successfully');
});

redis.on('error', (err) => {
    _redisAvailable = false;
    if (!redisErrorLogged && err.code === 'ECONNREFUSED') {
        logger.warn('⚠️ Redis is not running (ECONNREFUSED). Features requiring Redis will be unavailable.');
        redisErrorLogged = true;
    } else if (err.code !== 'ECONNREFUSED') {
        logger.error('❌ Redis connection error:', err.message);
    }
});

redis.on('close', () => {
    _redisAvailable = false;
});

/** Whether Redis is currently connected and ready for commands. */
export function isRedisAvailable() {
    return _redisAvailable;
}

export default redis;
