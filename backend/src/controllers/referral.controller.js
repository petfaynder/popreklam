import { randomBytes } from 'crypto';
import prisma from '../utils/db.js';

function generateCode() {
    return randomBytes(5).toString('hex').toUpperCase();
}

// Get or create referral code + base link info
export const getMyReferralInfo = async (req, res) => {
    try {
        const userId = req.user.id;

        let user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Lazy-generate referral code
        if (!user.referralCode) {
            let code;
            let exists = true;
            while (exists) {
                code = generateCode();
                const found = await prisma.user.findUnique({ where: { referralCode: code } });
                exists = !!found;
            }
            user = await prisma.user.update({
                where: { id: userId },
                data: { referralCode: code },
            });
        }

        // Get referral settings for commission rates
        const [pubSetting, advSetting, enabledSetting] = await Promise.all([
            prisma.systemSetting.findUnique({ where: { key: 'referral_publisher_commission' } }),
            prisma.systemSetting.findUnique({ where: { key: 'referral_advertiser_commission' } }),
            prisma.systemSetting.findUnique({ where: { key: 'referral_enabled' } }),
        ]);

        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

        res.json({
            referralCode: user.referralCode,
            referralLink: `${baseUrl}/register?ref=${user.referralCode}`,
            publisherCommission: pubSetting ? parseFloat(pubSetting.value) : 5,
            advertiserCommission: advSetting ? parseFloat(advSetting.value) : 3,
            programEnabled: enabledSetting ? enabledSetting.value === 'true' : true,
        });
    } catch (error) {
        console.error('getMyReferralInfo error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Aggregate stats for current user
export const getReferralStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const [totalCount, activeCount, paidCount, aggregate] = await Promise.all([
            prisma.referral.count({ where: { referrerId: userId } }),
            prisma.referral.count({ where: { referrerId: userId, status: 'ACTIVE' } }),
            prisma.referral.count({ where: { referrerId: userId, status: 'PAID' } }),
            prisma.referral.aggregate({
                where: { referrerId: userId },
                _sum: { totalEarned: true },
            }),
        ]);

        const pendingEarnings = await prisma.referral.aggregate({
            where: { referrerId: userId, status: { in: ['ACTIVE'] } },
            _sum: { totalEarned: true },
        });

        res.json({
            totalReferrals: totalCount,
            activeReferrals: activeCount,
            paidReferrals: paidCount,
            totalEarned: Number(aggregate._sum.totalEarned || 0),
            pendingEarnings: Number(pendingEarnings._sum.totalEarned || 0),
        });
    } catch (error) {
        console.error('getReferralStats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// List referrals with referred user info
export const getMyReferrals = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [referrals, total] = await Promise.all([
            prisma.referral.findMany({
                where: { referrerId: userId },
                include: {
                    referred: { select: { email: true, status: true, createdAt: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.referral.count({ where: { referrerId: userId } }),
        ]);

        const formatted = referrals.map(r => ({
            id: r.id,
            referredEmail: r.referred.email.replace(/(.{2}).*(@.*)/, '$1***$2'),
            referredStatus: r.referred.status,
            type: r.type,
            status: r.status,
            commissionRate: Number(r.commissionRate),
            totalEarned: Number(r.totalEarned),
            joinedAt: r.referred.createdAt,
            qualifiedAt: r.qualifiedAt,
            createdAt: r.createdAt,
        }));

        res.json({
            referrals: formatted,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('getMyReferrals error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
