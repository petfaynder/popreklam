import prisma from '../utils/db.js';

// Platform-wide overview stats
export const getOverviewStats = async (req, res) => {
    try {
        const [total, active, paid, pendingCount, aggregate] = await Promise.all([
            prisma.referral.count(),
            prisma.referral.count({ where: { status: 'ACTIVE' } }),
            prisma.referral.count({ where: { status: 'PAID' } }),
            prisma.referral.count({ where: { status: 'PENDING' } }),
            prisma.referral.aggregate({ _sum: { totalEarned: true } }),
        ]);

        res.json({
            totalReferrals: total,
            activeReferrals: active,
            paidReferrals: paid,
            pendingReferrals: pendingCount,
            totalPaidOut: Number(aggregate._sum.totalEarned || 0),
        });
    } catch (error) {
        console.error('getOverviewStats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// All referrals, filterable
export const getAllReferrals = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const skip = (page - 1) * limit;
        const { status, type, search } = req.query;

        const where = {};
        if (status) where.status = status;
        if (type) where.type = type;
        if (search) {
            where.OR = [
                { referrer: { email: { contains: search } } },
                { referred: { email: { contains: search } } },
            ];
        }

        const [referrals, total] = await Promise.all([
            prisma.referral.findMany({
                where,
                include: {
                    referrer: { select: { id: true, email: true, role: true } },
                    referred: { select: { id: true, email: true, role: true, status: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.referral.count({ where }),
        ]);

        res.json({
            referrals,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('getAllReferrals error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get referral program settings
export const getSettings = async (req, res) => {
    try {
        const keys = [
            'referral_enabled',
            'referral_publisher_commission',
            'referral_advertiser_commission',
            'referral_min_payout',
        ];
        const settings = await prisma.systemSetting.findMany({
            where: { key: { in: keys } },
        });

        const result = {
            enabled: true,
            publisherCommission: 5,
            advertiserCommission: 3,
            minPayout: 10,
        };

        settings.forEach(s => {
            if (s.key === 'referral_enabled') result.enabled = s.value === 'true';
            if (s.key === 'referral_publisher_commission') result.publisherCommission = parseFloat(s.value);
            if (s.key === 'referral_advertiser_commission') result.advertiserCommission = parseFloat(s.value);
            if (s.key === 'referral_min_payout') result.minPayout = parseFloat(s.value);
        });

        res.json(result);
    } catch (error) {
        console.error('getSettings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Upsert referral program settings
export const updateSettings = async (req, res) => {
    try {
        const { enabled, publisherCommission, advertiserCommission, minPayout } = req.body;

        const upsert = (key, value, label, group = 'referral') =>
            prisma.systemSetting.upsert({
                where: { key },
                update: { value: String(value) },
                create: { key, value: String(value), label, group, type: 'string' },
            });

        await Promise.all([
            upsert('referral_enabled', enabled ?? true, 'Referral Program Enabled'),
            upsert('referral_publisher_commission', publisherCommission ?? 5, 'Publisher Referral Commission %'),
            upsert('referral_advertiser_commission', advertiserCommission ?? 3, 'Advertiser Referral Commission %'),
            upsert('referral_min_payout', minPayout ?? 10, 'Referral Min Payout'),
        ]);

        res.json({ message: 'Settings updated' });
    } catch (error) {
        console.error('updateSettings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Approve referral bonus → mark PAID, credit referrer
export const approveReferralBonus = async (req, res) => {
    try {
        const { id } = req.params;

        const referral = await prisma.referral.findUnique({
            where: { id },
            include: { referrer: true },
        });

        if (!referral) return res.status(404).json({ message: 'Referral not found' });
        if (referral.status === 'PAID') return res.status(400).json({ message: 'Already paid' });

        const amount = Number(referral.totalEarned);

        await prisma.$transaction([
            prisma.referral.update({
                where: { id },
                data: { status: 'PAID' },
            }),
            prisma.user.update({
                where: { id: referral.referrerId },
                data: { balance: { increment: amount } },
            }),
            prisma.transaction.create({
                data: {
                    userId: referral.referrerId,
                    type: 'BONUS',
                    status: 'COMPLETED',
                    amount,
                    description: `Referral commission payout`,
                    metadata: { referralId: id, referredUserId: referral.referredId },
                },
            }),
        ]);

        res.json({ message: 'Referral bonus approved and credited' });
    } catch (error) {
        console.error('approveReferralBonus error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
