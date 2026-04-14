import { PrismaClient } from '@prisma/client';

/**
 * Singleton Prisma Client — TEK KAYNAK
 *
 * Tüm dosyalar bu modülü import etmeli: import prisma from '../lib/prisma.js'
 *
 * Özellikler:
 *  - globalThis ile deduplicate → hot-reload'da (nodemon) bağlantı sızıntısı önlenir
 *  - connection_limit=30 → yoğun reklam trafiğinde yeterli havuz
 *  - pool_timeout=10 → 10 saniye bağlantı bekle, sonra hata ver (uzun kuyruk önlenir)
 *  - Development'ta query + error log, production'da sadece error
 */

const CONNECTION_LIMIT = parseInt(process.env.PRISMA_CONNECTION_LIMIT || '30', 10);
const POOL_TIMEOUT = parseInt(process.env.PRISMA_POOL_TIMEOUT || '10', 10);

function createPrismaClient() {
    // DATABASE_URL'e connection_limit ve pool_timeout ekle (eğer yoksa)
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
            ? ['error', 'warn']       // query logları development'ta bile çok gürültülü, kapalı
            : ['error'],
    });
}

// Singleton: globalThis ile aynı process'te tekrar tekrar oluşturulmasını engelle
const globalForPrisma = globalThis;
const prisma = globalForPrisma.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.__prisma = prisma;
}

export default prisma;
