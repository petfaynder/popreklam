import Redis from 'ioredis';
import { logger } from './logger.js';

let redisErrorLogged = false;

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        if (times > 5) {
            // Stop retrying after 5 attempts
            if (!redisErrorLogged) {
                logger.warn('⚠️ Redis unavailable after 5 retries — disabling reconnect. Push notifications and caching will not work.');
                redisErrorLogged = true;
            }
            return null; // Stop retrying
        }
        const delay = Math.min(times * 500, 3000);
        return delay;
    },
    lazyConnect: false,
    enableOfflineQueue: false,
});

redis.on('connect', () => {
    redisErrorLogged = false;
    logger.info('✅ Redis connected successfully');
});

redis.on('error', (err) => {
    // Only log once to prevent terminal spam
    if (!redisErrorLogged && err.code === 'ECONNREFUSED') {
        logger.warn('⚠️ Redis is not running (ECONNREFUSED on port 6379). Features requiring Redis will be unavailable.');
        redisErrorLogged = true;
    } else if (err.code !== 'ECONNREFUSED') {
        logger.error('❌ Redis connection error:', err.message);
    }
});

export default redis;
