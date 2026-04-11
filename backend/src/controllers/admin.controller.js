import prisma from '../lib/prisma.js'

// Helper: write audit log
async function writeAudit(adminId, action, entityType, entityId, details, ip) {
    try {
        await prisma.auditLog.create({
            data: { adminId, action, entityType, entityId, details, ip: ip || null }
        });
    } catch (e) { /* non-blocking */ }
}

/**
 * Admin Dashboard Statistics
 * GET /api/admin/dashboard
 */
export const getDashboard = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const last7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const [totalUsers, publishersCount, advertisersCount,
            totalSites, pendingSites, totalCampaigns, pendingCampaigns,
            totalImpressions, totalClicks, revenueData,
            pendingPayments, openTickets, newUsersThisMonth] = await Promise.all([
                prisma.user.count(),
                prisma.user.count({ where: { role: 'PUBLISHER' } }),
                prisma.user.count({ where: { role: 'ADVERTISER' } }),
                prisma.site.count(),
                prisma.site.count({ where: { status: 'PENDING' } }),
                prisma.campaign.count(),
                prisma.campaign.count({ where: { status: 'PENDING_APPROVAL' } }),
                prisma.impression.count(),
                prisma.impression.count({ where: { clicked: true } }),
                prisma.impression.aggregate({
                    _sum: { revenue: true, publisherRevenue: true, systemProfit: true }
                }),
                prisma.payment.count({ where: { status: 'PENDING' } }),
                prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
                prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
            ]);

        // Last 7 days revenue sparkline
        const dailyRevenue = await prisma.impression.groupBy({
            by: ['createdAt'],
            where: { createdAt: { gte: last7 } },
            _sum: { systemProfit: true, publisherRevenue: true, revenue: true },
        });

        // Group by date string
        const revenueByDay = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const key = d.toISOString().slice(0, 10);
            revenueByDay[key] = { date: key, profit: 0, revenue: 0, payout: 0 };
        }
        dailyRevenue.forEach(r => {
            const key = new Date(r.createdAt).toISOString().slice(0, 10);
            if (revenueByDay[key]) {
                revenueByDay[key].profit += Number(r._sum.systemProfit || 0);
                revenueByDay[key].revenue += Number(r._sum.revenue || 0);
                revenueByDay[key].payout += Number(r._sum.publisherRevenue || 0);
            }
        });

        // Top publishers this month
        const topPublishers = await prisma.impression.groupBy({
            by: ['zoneId'],
            where: { createdAt: { gte: startOfMonth } },
            _sum: { publisherRevenue: true },
            orderBy: { _sum: { publisherRevenue: 'desc' } },
            take: 5,
        });

        // Recent activity
        const recentActivity = await prisma.auditLog.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { admin: { select: { email: true } } }
        });

        res.json({
            users: { total: totalUsers, publishers: publishersCount, advertisers: advertisersCount, newThisMonth: newUsersThisMonth },
            sites: { total: totalSites, pending: pendingSites },
            campaigns: { total: totalCampaigns, pending: pendingCampaigns },
            performance: {
                totalImpressions,
                totalClicks,
                ctr: totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00'
            },
            revenue: {
                publisherEarnings: Number(revenueData._sum.publisherRevenue || 0),
                advertiserSpent: Number(revenueData._sum.revenue || 0),
                platformProfit: Number(revenueData._sum.systemProfit || 0),
            },
            pendingActions: {
                campaigns: pendingCampaigns,
                sites: pendingSites,
                payments: pendingPayments,
                tickets: openTickets,
                total: pendingCampaigns + pendingSites + pendingPayments + openTickets,
            },
            sparkline: Object.values(revenueByDay),
            recentActivity,
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
};

/**
 * Get Notification Counts (for bell icon)
 * GET /api/admin/notifications
 */
export const getNotifications = async (req, res) => {
    try {
        const [campaigns, sites, payments, tickets] = await Promise.all([
            prisma.campaign.count({ where: { status: 'PENDING_APPROVAL' } }),
            prisma.site.count({ where: { status: 'PENDING' } }),
            prisma.payment.count({ where: { status: 'PENDING' } }),
            prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
        ]);
        res.json({ campaigns, sites, payments, tickets, total: campaigns + sites + payments + tickets });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

/**
 * Get All Sites (with filters)
 * GET /api/admin/sites
 */
export const getSites = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;

        const where = {};
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { url: { contains: search } },
                { name: { contains: search } }
            ];
        }

        const [sites, total] = await Promise.all([
            prisma.site.findMany({
                where,
                include: {
                    publisher: { include: { user: { select: { email: true } } } },
                    zones: { select: { id: true, type: true } },
                },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.site.count({ where })
        ]);

        res.json({
            sites,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
        });
    } catch (error) {
        console.error('Get sites error:', error);
        res.status(500).json({ error: 'Failed to fetch sites' });
    }
};

/**
 * Approve Site
 */
export const approveSite = async (req, res) => {
    try {
        const { id } = req.params;
        const site = await prisma.site.update({ where: { id }, data: { status: 'ACTIVE' } });
        await writeAudit(req.user.id, 'APPROVE_SITE', 'site', id, { siteName: site.name }, req.ip);
        res.json({ message: 'Site approved successfully', site });
    } catch (error) {
        console.error('Approve site error:', error);
        res.status(500).json({ error: 'Failed to approve site' });
    }
};

/**
 * Reject Site
 */
export const rejectSite = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const site = await prisma.site.update({
            where: { id },
            data: { status: 'REJECTED', rejectionReason: reason || 'Does not meet our quality standards' }
        });
        await writeAudit(req.user.id, 'REJECT_SITE', 'site', id, { reason }, req.ip);
        res.json({ message: 'Site rejected', site });
    } catch (error) {
        console.error('Reject site error:', error);
        res.status(500).json({ error: 'Failed to reject site' });
    }
};

/**
 * Get All Campaigns (with filters)
 * GET /api/admin/campaigns
 */
export const getCampaigns = async (req, res) => {
    try {
        const { status, search, format, page = 1, limit = 20 } = req.query;

        const where = {};
        if (status) where.status = status;
        if (format) where.adFormat = format;
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { targetUrl: { contains: search } }
            ];
        }

        const [campaigns, total] = await Promise.all([
            prisma.campaign.findMany({
                where,
                include: {
                    advertiser: { include: { user: { select: { email: true } } } },
                    creatives: { take: 1 },
                },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.campaign.count({ where })
        ]);

        res.json({
            campaigns,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
        });
    } catch (error) {
        console.error('Get campaigns error:', error);
        res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
};

/**
 * Approve Campaign
 */
export const approveCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const campaign = await prisma.campaign.update({
            where: { id },
            data: { status: 'ACTIVE' },
            include: { advertiser: true }
        });
        await writeAudit(req.user.id, 'APPROVE_CAMPAIGN', 'campaign', id, { name: campaign.name }, req.ip);

        // ✅ Immediately trigger push delivery if this is a push campaign
        if (campaign.adFormat === 'PUSH_NOTIFICATION') {
            try {
                const { enqueuePushCampaign } = await import('../services/push-delivery.service.js');
                const count = await enqueuePushCampaign(campaign);
                console.log(`🔔 Push campaign approved + immediately queued: ${count} jobs`);
            } catch (e) {
                console.warn('⚠️  Push trigger on approve skipped (Redis unavailable):', e.message);
            }
        }

        res.json({ message: 'Campaign approved successfully', campaign });
    } catch (error) {
        console.error('Approve campaign error:', error);
        res.status(500).json({ error: 'Failed to approve campaign' });
    }
};

/**
 * Reject Campaign
 */
export const rejectCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const campaign = await prisma.campaign.update({
            where: { id },
            data: { status: 'REJECTED', rejectionReason: reason || 'Does not meet advertising standards' }
        });
        await writeAudit(req.user.id, 'REJECT_CAMPAIGN', 'campaign', id, { reason }, req.ip);
        res.json({ message: 'Campaign rejected', campaign });
    } catch (error) {
        console.error('Reject campaign error:', error);
        res.status(500).json({ error: 'Failed to reject campaign' });
    }
};

/**
 * Get All Users (with filters)
 */
export const getUsers = async (req, res) => {
    try {
        const { role, status, search, page = 1, limit = 20, sort = 'newest' } = req.query;

        const where = {};
        if (role) where.role = role;
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { email: { contains: search } },
                { publisher: { companyName: { contains: search } } },
                { advertiser: { companyName: { contains: search } } },
            ];
        }

        const orderBy = sort === 'balance' ? { balance: 'desc' }
            : sort === 'oldest' ? { createdAt: 'asc' }
                : sort === 'lastLogin' ? { lastLogin: 'desc' }
                    : { createdAt: 'desc' };

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true, email: true, role: true, status: true,
                    balance: true, pendingBalance: true, createdAt: true, lastLogin: true,
                    publisher: { select: { id: true, companyName: true, totalRevenue: true } },
                    advertiser: { select: { id: true, companyName: true, totalSpent: true } },
                    _count: { select: { supportTickets: true } }
                },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
                orderBy
            }),
            prisma.user.count({ where })
        ]);

        res.json({
            users,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

/**
 * Get single user detail
 * GET /api/admin/users/:id
 */
export const getUserDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true, email: true, role: true, status: true,
                balance: true, pendingBalance: true, createdAt: true, lastLogin: true,
                publisher: {
                    include: { sites: { include: { zones: { select: { id: true } } } } }
                },
                advertiser: {
                    include: { campaigns: { orderBy: { createdAt: 'desc' }, take: 10 } }
                },
                transactions: { orderBy: { createdAt: 'desc' }, take: 20 },
                paymentMethods: true,
                supportTickets: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    select: { id: true, subject: true, status: true, priority: true, createdAt: true }
                },
            }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user });
    } catch (error) {
        console.error('Get user detail error:', error);
        res.status(500).json({ error: 'Failed to fetch user details' });
    }
};

/**
 * Update User Status
 */
export const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;

        if (!['ACTIVE', 'SUSPENDED', 'PENDING', 'BANNED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const user = await prisma.user.update({ where: { id }, data: { status } });
        const action = status === 'BANNED' ? 'BAN_USER'
            : status === 'SUSPENDED' ? 'SUSPEND_USER'
                : status === 'ACTIVE' ? 'ACTIVATE_USER'
                    : 'UPDATE_USER_STATUS';
        await writeAudit(req.user.id, action, 'user', id, { status, reason }, req.ip);

        res.json({ message: 'User status updated', user });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ error: 'Failed to update user status' });
    }
};

/**
 * Manually adjust user balance
 * PUT /api/admin/users/:id/balance
 */
export const adjustUserBalance = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, type, reason } = req.body; // type: 'credit' | 'debit'

        if (!amount || !type || !['credit', 'debit'].includes(type)) {
            return res.status(400).json({ error: 'Invalid amount or type' });
        }

        const delta = type === 'credit' ? Math.abs(parseFloat(amount)) : -Math.abs(parseFloat(amount));

        const user = await prisma.user.update({
            where: { id },
            data: { balance: { increment: delta } }
        });

        // Create transaction record
        await prisma.transaction.create({
            data: {
                userId: id,
                type: type === 'credit' ? 'BONUS' : 'REFUND',
                status: 'COMPLETED',
                amount: Math.abs(delta),
                description: `Admin ${type}: ${reason || 'Manual adjustment'}`,
                completedAt: new Date(),
            }
        });

        await writeAudit(req.user.id, 'ADJUST_BALANCE', 'user', id, { amount, type, reason }, req.ip);
        res.json({ message: `Balance ${type}ed successfully`, newBalance: user.balance });
    } catch (error) {
        console.error('Adjust balance error:', error);
        res.status(500).json({ error: 'Failed to adjust balance' });
    }
};

/**
 * Get Platform Statistics
 * GET /api/admin/stats
 */
export const getStats = async (req, res) => {
    try {
        const { period = '30' } = req.query;
        const days = parseInt(period);
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const [impressionsByDay, revByFormat] = await Promise.all([
            prisma.impression.findMany({
                where: { createdAt: { gte: startDate } },
                select: { createdAt: true, clicked: true, revenue: true, publisherRevenue: true, systemProfit: true }
            }),
            prisma.impression.groupBy({
                by: ['campaignId'],
                where: { createdAt: { gte: startDate } },
                _sum: { revenue: true, systemProfit: true },
                _count: true,
            })
        ]);

        // Group by date
        const byDay = {};
        impressionsByDay.forEach(imp => {
            const key = new Date(imp.createdAt).toISOString().slice(0, 10);
            if (!byDay[key]) byDay[key] = { date: key, impressions: 0, clicks: 0, revenue: 0, payout: 0, profit: 0 };
            byDay[key].impressions++;
            if (imp.clicked) byDay[key].clicks++;
            byDay[key].revenue += Number(imp.revenue || 0);
            byDay[key].payout += Number(imp.publisherRevenue || 0);
            byDay[key].profit += Number(imp.systemProfit || 0);
        });

        const timeline = Object.values(byDay).map(d => ({
            ...d,
            margin: d.revenue > 0 ? ((d.profit / d.revenue) * 100).toFixed(1) : 0,
            cost: d.payout,
            ctr: d.impressions > 0 ? ((d.clicks / d.impressions) * 100).toFixed(2) : 0,
        })).sort((a, b) => a.date.localeCompare(b.date));

        res.json({ timeline, period: days });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};

/**
 * Get Transactions
 */
export const getTransactions = async (req, res) => {
    try {
        const { type, status, page = 1, limit = 50 } = req.query;
        const where = {};
        if (type) where.type = type;
        if (status) where.status = status;

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                include: { user: { select: { email: true, role: true } } },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.transaction.count({ where })
        ]);

        res.json({
            transactions,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
};

/**
 * Get System Reports
 */
export const getSystemReports = async (req, res) => {
    try {
        const { period = '30d' } = req.query;
        let dateFilter;
        if (period === '7d') dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        else if (period === '90d') dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        else dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const [revenueData, topCampaigns, newUsers] = await Promise.all([
            prisma.impression.aggregate({
                where: { createdAt: { gte: dateFilter } },
                _sum: { revenue: true, publisherRevenue: true, systemProfit: true },
                _count: true,
            }),
            prisma.campaign.findMany({
                take: 10,
                orderBy: { totalSpent: 'desc' },
                include: { advertiser: { include: { user: { select: { email: true } } } } },
            }),
            prisma.user.count({ where: { createdAt: { gte: dateFilter } } }),
        ]);

        res.json({
            revenue: {
                total: Number(revenueData._sum.revenue || 0),
                publisherPayout: Number(revenueData._sum.publisherRevenue || 0),
                profit: Number(revenueData._sum.systemProfit || 0),
                impressions: revenueData._count,
                margin: revenueData._sum.revenue > 0
                    ? ((Number(revenueData._sum.systemProfit) / Number(revenueData._sum.revenue)) * 100).toFixed(1)
                    : '0.0',
            },
            topCampaigns: topCampaigns.map(c => ({
                id: c.id, name: c.name,
                spent: Number(c.totalSpent),
                impressions: c.totalImpressions,
                clicks: c.totalClicks,
                advertiser: c.advertiser?.user?.email || 'N/A',
            })),
            newUsers,
            period,
        });
    } catch (error) {
        console.error('System reports error:', error);
        res.status(500).json({ error: 'Failed to generate system reports' });
    }
};

/**
 * Get Audit Log
 * GET /api/admin/audit
 */
export const getAuditLog = async (req, res) => {
    try {
        const { action, adminId, search, page = 1, limit = 50 } = req.query;
        const where = {};
        if (action) where.action = { contains: action };
        if (adminId) where.adminId = adminId;
        // search filters by admin email
        if (search) {
            where.admin = { email: { contains: search } };
        }

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                include: { admin: { select: { email: true } } },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.auditLog.count({ where })
        ]);

        res.json({
            logs,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
        });
    } catch (error) {
        console.error('Audit log error:', error);
        res.status(500).json({ error: 'Failed to fetch audit log' });
    }
};
