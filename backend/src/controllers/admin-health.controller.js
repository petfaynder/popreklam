import prisma from '../lib/prisma.js'
import os from 'os';

/**
 * Get System Health Status
 * Returns real-time metrics for DB, CPU, RAM, and Uptime
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

        // 2. System Resource Usage
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memUsagePercent = ((usedMem / totalMem) * 100).toFixed(1);

        const cpus = os.cpus();
        const cpuModel = cpus[0].model;
        const loadAvg = os.platform() === 'win32' ? [0, 0, 0] : os.loadavg(); // Returns [1, 5, 15] minute load averages

        // 3. Process Uptime
        const uptimeSeconds = process.uptime();
        const uptimeDays = Math.floor(uptimeSeconds / 86400);
        const uptimeHours = Math.floor((uptimeSeconds % 86400) / 3600);
        const uptimeMinutes = Math.floor(((uptimeSeconds % 86400) % 3600) / 60);

        // 4. API Response Latency
        const apiLatency = Date.now() - startTime;

        res.json({
            status: dbStatus === 'OPERATIONAL' ? 'HEALTHY' : 'WARNING',
            timestamp: new Date().toISOString(),
            components: {
                database: {
                    status: dbStatus,
                    latency: `${dbLatency}ms`,
                    engine: 'MySQL (Prisma ORM)'
                },
                api: {
                    status: 'OPERATIONAL',
                    latency: `${apiLatency}ms`,
                    version: '1.2.0'
                },
                cache: {
                    status: 'OPERATIONAL',
                    engine: 'NodeCache / Redis'
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
