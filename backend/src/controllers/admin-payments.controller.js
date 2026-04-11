import prisma from '../lib/prisma.js'

// Get all payments for admin (with summary stats)
export const getPayments = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, type, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (status) where.status = status;
        if (type) where.type = type;
        if (search) {
            where.user = { email: { contains: search } };
        }

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const [payments, total, pendingStats, completedTotal, rejectedCount] = await Promise.all([
            prisma.payment.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
                include: {
                    user: {
                        select: { email: true, id: true, role: true }
                    }
                }
            }),
            prisma.payment.count({ where }),
            // Pending summary
            prisma.payment.aggregate({
                where: { status: 'PENDING', type: 'WITHDRAWAL' },
                _count: true,
                _sum: { amount: true },
            }),
            // Completed last 30 days
            prisma.payment.aggregate({
                where: { status: 'COMPLETED', createdAt: { gte: thirtyDaysAgo } },
                _sum: { amount: true },
            }),
            // Rejected last 30 days
            prisma.payment.count({
                where: { status: 'REJECTED', createdAt: { gte: thirtyDaysAgo } }
            }),
        ]);

        res.json({
            payments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            },
            summary: {
                pendingCount: pendingStats._count ?? 0,
                pendingAmount: Number(pendingStats._sum?.amount ?? 0),
                approvedTotal: Number(completedTotal._sum?.amount ?? 0),
                rejectedCount: rejectedCount,
            }
        });
    } catch (error) {
        console.error('Get admin payments error:', error);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
};

// Approve withdrawal — sets status to COMPLETED (PaymentStatus enum)
export const approvePayment = async (req, res) => {
    try {
        const adminId = req.user.id;
        const { id } = req.params;

        const payment = await prisma.payment.findUnique({ where: { id } });

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        if (payment.status !== 'PENDING') {
            return res.status(400).json({ error: `Payment is already ${payment.status}` });
        }

        const updatedPayment = await prisma.payment.update({
            where: { id },
            data: {
                status: 'COMPLETED',   // PaymentStatus enum: COMPLETED
                processedBy: adminId,
                processedAt: new Date()
            }
        });

        // Update publisher total payout if withdrawal
        if (payment.type === 'WITHDRAWAL') {
            try {
                await prisma.publisher.update({
                    where: { userId: payment.userId },
                    data: {
                        totalPayout: { increment: Number(payment.amount) }
                    }
                });
            } catch (e) { /* might not be a publisher */ }

            // Remove from pending balance
            await prisma.user.update({
                where: { id: payment.userId },
                data: {
                    pendingBalance: { decrement: Number(payment.amount) }
                }
            });
        }

        res.json({ message: 'Payment approved', payment: updatedPayment });
    } catch (error) {
        console.error('Approve payment error:', error);
        res.status(500).json({ error: 'Failed to approve payment' });
    }
};

// Reject withdrawal
export const rejectPayment = async (req, res) => {
    try {
        const adminId = req.user.id;
        const { id } = req.params;
        const { reason } = req.body;

        const payment = await prisma.payment.findUnique({ where: { id } });

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        if (payment.status !== 'PENDING') {
            return res.status(400).json({ error: 'Payment is not pending' });
        }

        await prisma.payment.update({
            where: { id },
            data: {
                status: 'FAILED',          // PaymentStatus enum: FAILED (used for rejections)
                rejectionReason: reason,
                processedBy: adminId,
                processedAt: new Date()
            }
        });

        // Refund balance if withdrawal was rejected
        if (payment.type === 'WITHDRAWAL') {
            await prisma.user.update({
                where: { id: payment.userId },
                data: {
                    balance: { increment: Number(payment.amount) },
                    pendingBalance: { decrement: Number(payment.amount) }
                }
            });
        }

        res.json({ message: 'Payment rejected and balance refunded' });
    } catch (error) {
        console.error('Reject payment error:', error);
        res.status(500).json({ error: 'Failed to reject payment' });
    }
};
