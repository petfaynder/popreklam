import { PrismaClient } from '@prisma/client';

/**
 * Singleton Prisma Client — SINGLE SOURCE
 *
 * All files must import this module: import prisma from '../lib/prisma.js'
 *
 * Features:
 *  - deduplicate with globalThis -> prevents connection leaks on hot-reload (nodemon)
 *  - connection_limit=30 -> sufficient pool for heavy ad traffic
 *  - pool_timeout=10 -> wait 10 seconds for connection, then throw error (prevents long queues)
 *  - query + error log in development, only error in production
 */

const CONNECTION_LIMIT = parseInt(process.env.PRISMA_CONNECTION_LIMIT || '30', 10);
const POOL_TIMEOUT = parseInt(process.env.PRISMA_POOL_TIMEOUT || '10', 10);

function createPrismaClient() {
    // Add connection_limit and pool_timeout to DATABASE_URL (if not exists)
    let dbUrl = process.env.DATABASE_URL || '';
    const separator = dbUrl.includes('?') ? '&' : '?';

    if (!dbUrl.includes('connection_limit')) {
        dbUrl += `${separator}connection_limit=${CONNECTION_LIMIT}`;
    }
    if (!dbUrl.includes('pool_timeout')) {
        dbUrl += `&pool_timeout=${POOL_TIMEOUT}`;
    }

    return new PrismaClient({
        datasources: {
            db: { url: dbUrl },
        },
        log: process.env.NODE_ENV === 'development'
            ? ['error', 'warn']       // query logs are too noisy even in development, disabled
            : ['error'],
    });
}

// Singleton: prevent recreating multiple times in the same process with globalThis
const globalForPrisma = globalThis;
const prisma = globalForPrisma.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.__prisma = prisma;
}

export default prisma;
