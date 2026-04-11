import prisma from '../lib/prisma.js';
import { generateInvoiceHTML } from '../services/invoice.service.js';
import { getSetting } from './admin-settings.controller.js';


// Download Invoice (HTML View)
export const downloadInvoice = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Find invoice belonging to this user
        const invoice = await prisma.invoice.findFirst({
            where: { id, userId },
            include: { payment: true }
        });

        if (!invoice) {
            return res.status(404).send('Invoice not found');
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { publisher: true }
        });

        const html = generateInvoiceHTML(invoice, user, 'PUBLISHER');

        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (error) {
        console.error('Download invoice error:', error);
        res.status(500).send('Failed to generate invoice');
    }
};

// ================ PAYMENT METHODS ================

// Get all payment methods for a publisher
export const getPaymentMethods = async (req, res) => {
    try {
        const userId = req.user.id;

        const methods = await prisma.userPaymentMethod.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        res.json(methods);
    } catch (error) {
        console.error('Get payment methods error:', error);
        res.status(500).json({ error: 'Failed to fetch payment methods' });
    }
};

// Add a new payment method
export const addPaymentMethod = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, details, isDefault } = req.body;

        // Validate required fields
        if (!type || !details) {
            return res.status(400).json({ error: 'Type and details are required' });
        }

        // Validate type
        const validTypes = ['PAYPAL', 'BANK_TRANSFER', 'STRIPE'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ error: 'Invalid payment method type' });
        }

        // If setting as default, unset other defaults
        if (isDefault) {
            await prisma.userPaymentMethod.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false }
            });
        }

        const method = await prisma.userPaymentMethod.create({
            data: {
                userId,
                type,
                details,
                isDefault: isDefault || false,
                isVerified: false // Admin can verify later
            }
        });

        res.status(201).json(method);
    } catch (error) {
        console.error('Add payment method error:', error);
        res.status(500).json({ error: 'Failed to add payment method' });
    }
};

// Update payment method
export const updatePaymentMethod = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { details, isDefault } = req.body;

        // Check ownership
        const existing = await prisma.userPaymentMethod.findFirst({
            where: { id, userId }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Payment method not found' });
        }

        // If setting as default, unset other defaults
        if (isDefault) {
            await prisma.userPaymentMethod.updateMany({
                where: { userId, isDefault: true, id: { not: id } },
                data: { isDefault: false }
            });
        }

        const updated = await prisma.userPaymentMethod.update({
            where: { id },
            data: {
                ...(details && { details }),
                ...(isDefault !== undefined && { isDefault })
            }
        });

        res.json(updated);
    } catch (error) {
        console.error('Update payment method error:', error);
        res.status(500).json({ error: 'Failed to update payment method' });
    }
};

// Delete payment method
export const deletePaymentMethod = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Check ownership
        const existing = await prisma.userPaymentMethod.findFirst({
            where: { id, userId }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Payment method not found' });
        }

        await prisma.userPaymentMethod.delete({
            where: { id }
        });

        res.json({ message: 'Payment method deleted successfully' });
    } catch (error) {
        console.error('Delete payment method error:', error);
        res.status(500).json({ error: 'Failed to delete payment method' });
    }
};

// ================ PAYMENTS & WITHDRAWALS ================

// Get payment history (withdrawals and earnings)
export const getPaymentHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20, status, type } = req.query;

        const where = { userId };
        if (status) where.status = status;
        if (type) where.type = type;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [payments, total] = await Promise.all([
            prisma.payment.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
                include: {
                    invoice: {
                        select: {
                            id: true,
                            invoiceNo: true,
                            pdfUrl: true
                        }
                    }
                }
            }),
            prisma.payment.count({ where })
        ]);

        // Get user balance and totals
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { balance: true, pendingBalance: true }
        });

        const publisher = await prisma.publisher.findUnique({
            where: { userId },
            select: { totalRevenue: true, totalPayout: true }
        });

        // Calculate stats
        const totalEarnings = publisher?.totalRevenue || 0;
        const totalWithdrawn = publisher?.totalPayout || 0;

        res.json({
            stats: {
                balance: Number(user.balance),
                pendingBalance: Number(user.pendingBalance),
                totalEarnings: Number(totalEarnings),
                totalWithdrawn: Number(totalWithdrawn)
            },
            payments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({ error: 'Failed to fetch payment history' });
    }
};

// Request withdrawal (enhanced version)
export const requestWithdrawal = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, paymentMethodId } = req.body;

        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // Get user and publisher
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        const publisher = await prisma.publisher.findUnique({
            where: { userId }
        });

        if (!publisher) {
            return res.status(404).json({ error: 'Publisher profile not found' });
        }

        // Check minimum payout
        const globalMinPayout = await getSetting('min_publisher_payout', 50);
        const minPayout = Math.max(Number(publisher.minPayout), Number(globalMinPayout));

        if (Number(amount) < minPayout) {
            return res.status(400).json({
                error: `Minimum withdrawal amount is $${minPayout}`
            });
        }

        // Check balance
        if (Number(user.balance) < Number(amount)) {
            return res.status(400).json({
                error: 'Insufficient balance',
                available: Number(user.balance)
            });
        }

        // Get payment method
        let paymentMethod = null;
        if (paymentMethodId) {
            paymentMethod = await prisma.userPaymentMethod.findFirst({
                where: { id: paymentMethodId, userId }
            });

            if (!paymentMethod) {
                return res.status(404).json({ error: 'Payment method not found' });
            }
        } else {
            // Use default payment method
            paymentMethod = await prisma.userPaymentMethod.findFirst({
                where: { userId, isDefault: true }
            });

            if (!paymentMethod) {
                return res.status(400).json({
                    error: 'No payment method found. Please add a payment method first.'
                });
            }
        }

        // Auto-Approve check from settings
        const autoApproveStr = await getSetting('auto_approve_withdrawal', 'false');
        const autoApproveLimit = await getSetting('auto_approve_withdrawal_limit', 100);
        const autoApprove = (autoApproveStr === 'true' && Number(amount) <= Number(autoApproveLimit));

        // Create payment record
        const payment = await prisma.payment.create({
            data: {
                userId,
                type: 'WITHDRAWAL',
                amount: Number(amount),
                method: paymentMethod.type,
                status: autoApprove ? 'COMPLETED' : 'PENDING',
                details: paymentMethod.details
            }
        });

        // Account balances
        if (autoApprove) {
            // Deduct immediately without sending to pending
            await prisma.user.update({
                where: { id: userId },
                data: {
                    balance: { decrement: Number(amount) }
                }
            });
            await prisma.publisher.update({
                where: { userId },
                data: {
                    totalPayout: { increment: Number(amount) }
                }
            });
        } else {
            // Move balance to pending
            await prisma.user.update({
                where: { id: userId },
                data: {
                    balance: { decrement: Number(amount) },
                    pendingBalance: { increment: Number(amount) }
                }
            });
        }

        res.status(201).json({
            message: 'Withdrawal request submitted successfully',
            payment
        });
    } catch (error) {
        console.error('Request withdrawal error:', error);
        res.status(500).json({ error: 'Failed to request withdrawal' });
    }
};

// Cancel pending withdrawal (before admin approval)
export const cancelWithdrawal = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const payment = await prisma.payment.findFirst({
            where: { id, userId, type: 'WITHDRAWAL', status: 'PENDING' }
        });

        if (!payment) {
            return res.status(404).json({
                error: 'Withdrawal not found or cannot be cancelled'
            });
        }

        // Return balance from pending to available
        await prisma.user.update({
            where: { id: userId },
            data: {
                balance: { increment: Number(payment.amount) },
                pendingBalance: { decrement: Number(payment.amount) }
            }
        });

        // Update payment status
        await prisma.payment.update({
            where: { id },
            data: { status: 'CANCELLED' }
        });

        res.json({ message: 'Withdrawal cancelled successfully' });
    } catch (error) {
        console.error('Cancel withdrawal error:', error);
        res.status(500).json({ error: 'Failed to cancel withdrawal' });
    }
};
