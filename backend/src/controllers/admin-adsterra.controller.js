import prisma from '../lib/prisma.js';


/**
 * GET /api/admin/adsterra/stats
 *
 * Returns Adsterra backfill stats for admin panel:
 * - Total impressions per day
 * - Per-country breakdown
 * - Publisher payout log (from SystemSetting adsterra_paid_* keys)
 * - Last sync timestamp
 */
export const getAdsterraStats = async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const daysInt = Math.min(parseInt(days) || 7, 90);

        const since = new Date();
        since.setDate(since.getDate() - daysInt);
        since.setHours(0, 0, 0, 0);

        // ─── Backfill impressions per day ────────────────────────────────────
        const dailyImpressions = await prisma.backfillImpression.groupBy({
            by: ['createdAt'],
            where: {
                source: { in: ['adsterra', 'adsterra_split'] },
                createdAt: { gte: since }
            },
            _count: { id: true }
        });

        // ─── Total impressions by country ────────────────────────────────────
        const countryBreakdown = await prisma.backfillImpression.groupBy({
            by: ['country'],
            where: {
                source: { in: ['adsterra', 'adsterra_split'] },
                createdAt: { gte: since }
            },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 20
        });

        // ─── Publisher payouts from log keys ─────────────────────────────────
        // Keys look like: adsterra_paid_YYYY-MM-DD_pub_USER_ID
        const payLogs = await prisma.systemSetting.findMany({
            where: {
                key: { startsWith: 'adsterra_paid_' },
                group: 'adsterra_paylog'
            },
            orderBy: { key: 'desc' },
            take: 200
        });

        // Parse payout logs into structured data
        let totalPaidToPublishers = 0;
        const payoutsByDate = {};
        const payoutsByPublisher = {};

        for (const log of payLogs) {
            // Key format: adsterra_paid_YYYY-MM-DD_pub_USERID
            const parts = log.key.split('_paid_')[1]?.split('_pub_');
            if (!parts || parts.length < 2) continue;

            const [date, userId] = parts;
            const amount = parseFloat(log.value || 0);

            totalPaidToPublishers += amount;

            if (!payoutsByDate[date]) payoutsByDate[date] = 0;
            payoutsByDate[date] += amount;

            if (!payoutsByPublisher[userId]) payoutsByPublisher[userId] = 0;
            payoutsByPublisher[userId] += amount;
        }

        // Resolve publisher emails
        const userIds = Object.keys(payoutsByPublisher);
        const users = userIds.length > 0
            ? await prisma.user.findMany({
                where: { id: { in: userIds } },
                select: { id: true, email: true }
            })
            : [];

        const userEmailMap = Object.fromEntries(users.map(u => [u.id, u.email]));

        const publisherPayouts = Object.entries(payoutsByPublisher)
            .map(([userId, amount]) => ({
                userId,
                email: userEmailMap[userId] || 'Unknown',
                totalPaid: amount
            }))
            .sort((a, b) => b.totalPaid - a.totalPaid);

        // ─── Daily timeline ──────────────────────────────────────────────────
        // Aggregate by date string
        const byDate = {};
        for (const row of dailyImpressions) {
            const d = row.createdAt.toISOString().split('T')[0];
            byDate[d] = (byDate[d] || 0) + row._count.id;
        }

        const timeline = Object.entries(byDate)
            .map(([date, impressions]) => ({
                date,
                impressions,
                paidToPublishers: payoutsByDate[date] || 0
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // ─── Totals ──────────────────────────────────────────────────────────
        const totalImpressions = Object.values(byDate).reduce((s, n) => s + n, 0);

        // Last sync time: find most recently updated pay log
        const lastSyncLog = payLogs[0];
        const lastSync = lastSyncLog
            ? lastSyncLog.key.split('_paid_')[1]?.split('_pub_')[0]
            : null;

        res.json({
            period: daysInt,
            totalImpressions,
            totalPaidToPublishers,
            timeline,
            countryBreakdown: countryBreakdown.map(c => ({
                country: c.country || 'UNKNOWN',
                impressions: c._count.id
            })),
            publisherPayouts,
            lastSync
        });

    } catch (error) {
        console.error('Adsterra stats error:', error);
        res.status(500).json({ error: 'Failed to fetch Adsterra stats' });
    }
};

/**
 * POST /api/admin/adsterra/sync
 * Manually trigger Adsterra revenue sync (admin only)
 */
export const triggerAdsterraSync = async (req, res) => {
    try {
        const { syncAdsterraRevenue } = await import('../services/adsterra-sync.service.js');
        const [todayResult, yesterdayResult] = await Promise.all([
            syncAdsterraRevenue({ daysAgo: 0 }),
            syncAdsterraRevenue({ daysAgo: 1 })
        ]);
        res.json({
            message: 'Sync complete',
            today: todayResult,
            yesterday: yesterdayResult
        });
    } catch (error) {
        console.error('Manual Adsterra sync error:', error);
        res.status(500).json({ error: 'Sync failed: ' + error.message });
    }
};
