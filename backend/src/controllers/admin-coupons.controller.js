import prisma from '../lib/prisma.js';

// ─── List all coupons ────────────────────────────────────────────────────────
export const getCoupons = async (req, res) => {
    try {
        const { page = 1, limit = 20, active } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (active === 'true') where.isActive = true;
        if (active === 'false') where.isActive = false;

        const [coupons, total] = await Promise.all([
            prisma.coupon.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
                include: {
                    _count: { select: { usages: true } }
                }
            }),
            prisma.coupon.count({ where })
        ]);

        res.json({
            coupons,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get coupons error:', error);
        res.status(500).json({ error: 'Failed to fetch coupons' });
    }
};

// ─── Get a single coupon with usages ────────────────────────────────────────
export const getCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await prisma.coupon.findUnique({
            where: { id },
            include: {
                usages: {
                    orderBy: { createdAt: 'desc' },
                    take: 50,
                    include: {
                        coupon: { select: { code: true } }
                    }
                }
            }
        });

        if (!coupon) return res.status(404).json({ error: 'Coupon not found' });

        // Enrich usages with user emails
        const userIds = [...new Set(coupon.usages.map(u => u.userId))];
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, email: true }
        });
        const userMap = Object.fromEntries(users.map(u => [u.id, u.email]));

        const enrichedUsages = coupon.usages.map(u => ({
            ...u,
            userEmail: userMap[u.userId] || u.userId
        }));

        res.json({ ...coupon, usages: enrichedUsages });
    } catch (error) {
        console.error('Get coupon error:', error);
        res.status(500).json({ error: 'Failed to fetch coupon' });
    }
};

// ─── Create coupon ───────────────────────────────────────────────────────────
export const createCoupon = async (req, res) => {
    try {
        const adminId = req.user.id;
        const {
            code, description, type, value,
            minDeposit, maxBonus, maxUses, maxUsesPerUser,
            startDate, endDate
        } = req.body;

        if (!code || !type || value === undefined || value === null) {
            return res.status(400).json({ error: 'Code, type and value are required' });
        }

        if (!['PERCENTAGE', 'FIXED'].includes(type)) {
            return res.status(400).json({ error: 'Type must be PERCENTAGE or FIXED' });
        }

        if (type === 'PERCENTAGE' && (Number(value) <= 0 || Number(value) > 100)) {
            return res.status(400).json({ error: 'Percentage value must be between 1 and 100' });
        }

        const existing = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase().trim() }
        });
        if (existing) {
            return res.status(409).json({ error: 'A coupon with this code already exists' });
        }

        const coupon = await prisma.coupon.create({
            data: {
                code: code.toUpperCase().trim(),
                description: description || null,
                type,
                value: Number(value),
                minDeposit: minDeposit ? Number(minDeposit) : null,
                maxBonus: maxBonus ? Number(maxBonus) : null,
                maxUses: maxUses ? Number(maxUses) : null,
                maxUsesPerUser: maxUsesPerUser ? Number(maxUsesPerUser) : 1,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                createdBy: adminId,
            }
        });

        res.status(201).json(coupon);
    } catch (error) {
        console.error('Create coupon error:', error);
        res.status(500).json({ error: 'Failed to create coupon' });
    }
};

// ─── Update coupon ───────────────────────────────────────────────────────────
export const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            description, isActive, maxUses, maxUsesPerUser,
            minDeposit, maxBonus, startDate, endDate
        } = req.body;

        const coupon = await prisma.coupon.update({
            where: { id },
            data: {
                ...(description !== undefined && { description }),
                ...(isActive !== undefined && { isActive }),
                ...(maxUses !== undefined && { maxUses: maxUses === null ? null : Number(maxUses) }),
                ...(maxUsesPerUser !== undefined && { maxUsesPerUser: Number(maxUsesPerUser) }),
                ...(minDeposit !== undefined && { minDeposit: minDeposit === null ? null : Number(minDeposit) }),
                ...(maxBonus !== undefined && { maxBonus: maxBonus === null ? null : Number(maxBonus) }),
                ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
                ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
            }
        });

        res.json(coupon);
    } catch (error) {
        console.error('Update coupon error:', error);
        res.status(500).json({ error: 'Failed to update coupon' });
    }
};

// ─── Delete / deactivate coupon ──────────────────────────────────────────────
export const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        // Soft-disable instead of hard delete to preserve usage history
        await prisma.coupon.update({
            where: { id },
            data: { isActive: false }
        });

        res.json({ message: 'Coupon deactivated successfully' });
    } catch (error) {
        console.error('Delete coupon error:', error);
        res.status(500).json({ error: 'Failed to deactivate coupon' });
    }
};

// ─── Get coupon usages ───────────────────────────────────────────────────────
export const getCouponUsages = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [usages, total] = await Promise.all([
            prisma.couponUsage.findMany({
                where: { couponId: id },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.couponUsage.count({ where: { couponId: id } })
        ]);

        const userIds = [...new Set(usages.map(u => u.userId))];
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, email: true }
        });
        const userMap = Object.fromEntries(users.map(u => [u.id, u.email]));

        const enriched = usages.map(u => ({ ...u, userEmail: userMap[u.userId] || u.userId }));

        res.json({
            usages: enriched,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get coupon usages error:', error);
        res.status(500).json({ error: 'Failed to fetch coupon usages' });
    }
};
