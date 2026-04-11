import { PrismaClient } from '@prisma/client';

// Singleton Prisma instance — shared across all services to avoid connection pool exhaustion
const prisma = new PrismaClient();

export default prisma;
