import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

// Singleton pattern for Prisma Client
const prismaClientSingleton = () => {
    return new PrismaClient({
        log: process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error']
    });
};

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

// Test database connection
prisma.$connect()
    .then(() => {
        logger.info('✅ Database connected successfully');
    })
    .catch((error) => {
        logger.error('❌ Database connection failed:', error);
        process.exit(1);
    });

export default prisma;
