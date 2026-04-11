import prisma from '../lib/prisma.js';
import {
    getTierBenefits,
    getTierProgress,
    getFullBenefitsMatrix,
} from '../services/priority.service.js';

// GET /advertiser/priority — Full priority page data
export const getPriorityInfo = async (req, res) => {
    try {
        const userId = req.user.id;

        const advertiser = await prisma.advertiser.findUnique({
            where: { userId },
        });

        if (!advertiser) {
            return res.status(404).json({ message: 'Advertiser not found' });
        }

        const benefits = await getTierBenefits(advertiser.tier);
        const progress = await getTierProgress(advertiser.tier, advertiser.monthlySpend);
        const matrix = await getFullBenefitsMatrix();

        // Recent tier history (last 20)
        const history = await prisma.advertiserTierHistory.findMany({
            where: { advertiserId: advertiser.id },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });

        res.json({
            tier: advertiser.tier,
            monthlySpend: Number(advertiser.monthlySpend),
            tierUpdatedAt: advertiser.tierUpdatedAt,
            creditLineEnabled: advertiser.creditLineEnabled,
            creditUsed: Number(advertiser.creditUsed),
            benefits,
            progress,
            matrix,
            history,
        });
    } catch (error) {
        console.error('Error getting priority info:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /advertiser/priority/history — Tier change history
export const getTierHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const advertiser = await prisma.advertiser.findUnique({
            where: { userId },
        });

        if (!advertiser) {
            return res.status(404).json({ message: 'Advertiser not found' });
        }

        const history = await prisma.advertiserTierHistory.findMany({
            where: { advertiserId: advertiser.id },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        res.json({ history });
    } catch (error) {
        console.error('Error getting tier history:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
