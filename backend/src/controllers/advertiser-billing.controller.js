import prisma from '../lib/prisma.js'
import axios from 'axios';
import { generateInvoiceHTML } from '../services/invoice.service.js';
import { getSetting } from './admin-settings.controller.js';
import { createDodoSession, createOxaPayInvoice, createVoletInvoice } from '../services/payment.service.js';

// ─── Coupon Helpers ──────────────────────────────────────────────────────────

/**
 * Validate a coupon code for a specific user and deposit amount.
 * Returns { valid: true, coupon, bonusAmount } or { valid: false, error }
 */
export async function validateCouponForDeposit(code, userId, depositAmount) {
    const coupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase().trim() }
    });

    if (!coupon) return { valid: false, error: 'Invalid coupon code' };
    if (!coupon.isActive) return { valid: false, error: 'This coupon is no longer active' };

    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) {
        return { valid: false, error: 'This coupon is not yet active' };
    }
    if (coupon.endDate && now > coupon.endDate) {
        return { valid: false, error: 'This coupon has expired' };
    }
    if (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses) {
        return { valid: false, error: 'This coupon has reached its maximum usage limit' };
    }
    if (coupon.minDeposit !== null && Number(depositAmount) < Number(coupon.minDeposit)) {
        return { valid: false, error: `Minimum deposit of $${Number(coupon.minDeposit).toFixed(2)} is required for this coupon` };
    }

    // Check per-user usage limit
    const userUsageCount = await prisma.couponUsage.count({
        where: { couponId: coupon.id, userId }
    });
    if (userUsageCount >= coupon.maxUsesPerUser) {
        return { valid: false, error: 'You have already used this coupon' };
    }

    // Calculate bonus
    let bonusAmount = 0;
    if (coupon.type === 'PERCENTAGE') {
        bonusAmount = (Number(depositAmount) * Number(coupon.value)) / 100;
        if (coupon.maxBonus !== null) {
            bonusAmount = Math.min(bonusAmount, Number(coupon.maxBonus));
        }
    } else {
        // FIXED
        bonusAmount = Number(coupon.value);
    }

    bonusAmount = Math.round(bonusAmount * 100) / 100; // round to 2 decimals
    return { valid: true, coupon, bonusAmount };
}

// Download Invoice (HTML View — users print to PDF via Ctrl+P)
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
            include: { advertiser: true }
        });

        // Fetch all invoice branding settings from admin in parallel
        const invoiceSettingKeys = [
            'invoice_company_name', 'invoice_company_email', 'invoice_company_reg_no',
            'invoice_address_line1', 'invoice_address_line2', 'invoice_country',
            'invoice_tax_rate', 'invoice_tax_label',
            'invoice_bank_name', 'invoice_bank_iban', 'invoice_bank_swift',
            'invoice_footer_note', 'invoice_logo_url',
        ];

        const settingRecords = await prisma.systemSetting.findMany({
            where: { key: { in: invoiceSettingKeys } }
        });

        const settings = {};
        settingRecords.forEach(s => { settings[s.key] = s.value; });

        const html = generateInvoiceHTML(invoice, user, 'ADVERTISER', settings);

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
    } catch (error) {
        console.error('Download invoice error:', error);
        res.status(500).send('Failed to generate invoice');
    }
};


// ─── Validate Coupon (advertiser pre-checkout check) ─────────────────────────
export const validateCoupon = async (req, res) => {
    try {
        const userId = req.user.id;
        const { code, amount } = req.body;

        if (!code || !amount) {
            return res.status(400).json({ error: 'Code and amount are required' });
        }

        const result = await validateCouponForDeposit(code, userId, amount);
        if (!result.valid) {
            return res.status(400).json({ error: result.error });
        }

        res.json({
            valid: true,
            code: result.coupon.code,
            type: result.coupon.type,
            value: Number(result.coupon.value),
            bonusAmount: result.bonusAmount,
            description: result.coupon.description,
        });
    } catch (error) {
        console.error('Validate coupon error:', error);
        res.status(500).json({ error: 'Failed to validate coupon' });
    }
};

// ================ DEPOSITS & BILLING ================

// Get billing overview (balance, recent transactions, payment methods)
export const getBillingOverview = async (req, res) => {
    try {
        const userId = req.user.id;

        const [advertiser, transactions, paymentMethods] = await Promise.all([
            prisma.advertiser.findUnique({
                where: { userId },
                select: {
                    totalSpent: true,
                    totalDeposit: true,
                    autoRecharge: true,
                    rechargeThreshold: true,
                    rechargeAmount: true
                }
            }),
            prisma.payment.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: {
                    invoice: {
                        select: { id: true, invoiceNo: true }
                    }
                }
            }),
            prisma.userPaymentMethod.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' }
            })
        ]);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { balance: true }
        });

        res.json({
            balance: Number(user.balance),
            stats: {
                totalSpent: Number(advertiser.totalSpent),
                totalDeposit: Number(advertiser.totalDeposit)
            },
            settings: {
                autoRecharge: advertiser.autoRecharge,
                rechargeThreshold: Number(advertiser.rechargeThreshold || 0),
                rechargeAmount: Number(advertiser.rechargeAmount || 0)
            },
            transactions,
            paymentMethods
        });
    } catch (error) {
        console.error('Get billing overview error:', error);
        res.status(500).json({ error: 'Failed to fetch billing overview' });
    }
};

// Create deposit (add funds)
export const createDeposit = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, paymentMethodId, methodType, couponCode } = req.body;

        const globalMinDeposit = await getSetting('min_advertiser_deposit', 50);

        if (!amount || Number(amount) < Number(globalMinDeposit)) {
            return res.status(400).json({ error: `Minimum deposit is $${globalMinDeposit}` });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });

        // Validate coupon if provided (before creating payment)
        let resolvedCouponId = null;
        if (couponCode) {
            const couponResult = await validateCouponForDeposit(couponCode, userId, amount);
            if (!couponResult.valid) {
                return res.status(400).json({ error: couponResult.error });
            }
            resolvedCouponId = couponResult.coupon.id;
        }

        // Method 1: Existing saved manual payment method logic (Backward compatibility)
        if (paymentMethodId) {
            const paymentMethod = await prisma.userPaymentMethod.findFirst({
                where: { id: paymentMethodId, userId }
            });

            if (!paymentMethod) {
                return res.status(404).json({ error: 'Payment method not found' });
            }

            const payment = await prisma.payment.create({
                data: {
                    userId,
                    type: 'DEPOSIT',
                    amount: Number(amount),
                    method: paymentMethod.type,
                    status: 'PENDING',
                    details: paymentMethod.details,
                    ...(resolvedCouponId && { couponId: resolvedCouponId }),
                }
            });
            return res.json({ message: 'Manual deposit initiated. Awaiting admin approval.', payment });
        }

        // Method 2: Automated Gateway Flow (Dodo Payments, OxaPay, Volet)
        if (!methodType) {
            return res.status(400).json({ error: 'Payment method type is required' });
        }

        const METHOD = methodType.toUpperCase();
        const supportedMethods = ['DODO', 'OXAPAY', 'VOLET'];
        if (!supportedMethods.includes(METHOD)) {
            return res.status(400).json({ error: `Unsupported gateway: ${METHOD}` });
        }

        // Pre-check: verify gateway is configured before creating DB record
        // In development, we skip this check — mock URLs handle the missing key case
        const IS_DEV = process.env.NODE_ENV !== 'production';
        if (!IS_DEV) {
            const gatewaySettingKey = { DODO: 'dodo_api_key', OXAPAY: 'oxapay_merchant_api_key', VOLET: 'volet_wallet_id' }[METHOD];
            const gatewayKey = await getSetting(gatewaySettingKey);
            if (!gatewayKey) {
                return res.status(503).json({
                    error: `Payment gateway not configured. Please contact support.`,
                    gateway: METHOD
                });
            }
        }

        const payment = await prisma.payment.create({
            data: {
                userId,
                type: 'DEPOSIT',
                amount: Number(amount),
                method: METHOD,
                status: 'PENDING',
                ...(resolvedCouponId && { couponId: resolvedCouponId }),
            }
        });

        let checkoutUrl = '';

        try {
            if (METHOD === 'DODO') {
                checkoutUrl = await createDodoSession(amount, payment.id, user.email);
            } else if (METHOD === 'OXAPAY') {
                const result = await createOxaPayInvoice(amount, payment.id);
                // result is { url, trackId } for real API, or a plain string for mock
                if (typeof result === 'string') {
                    checkoutUrl = result;
                } else {
                    checkoutUrl = result.url;
                    // Store OxaPay track_id so we can verify on return
                    if (result.trackId) {
                        await prisma.payment.update({
                            where: { id: payment.id },
                            data: { transactionId: String(result.trackId) }
                        });
                    }
                }
            } else if (METHOD === 'VOLET') {
                checkoutUrl = await createVoletInvoice(amount, payment.id, user.email);
            }
        } catch (gatewayError) {
            // If gateway call fails, mark the payment as FAILED so it doesn't linger as PENDING
            await prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'FAILED' }
            });
            throw gatewayError;
        }

        res.json({
            message: 'Checkout session created',
            checkoutUrl,
            paymentId: payment.id
        });
    } catch (error) {
        console.error('Create deposit error:', error);
        res.status(500).json({ error: error.message || 'Failed to process deposit' });
    }
};

// ─── VERIFY PAYMENT ON RETURN ────────────────────────────────────────────────
// Called by the frontend when user returns from OxaPay/Volet with ?success=true
// Queries OxaPay's status API and fulfills the deposit if confirmed.

export const verifyPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const userId = req.user.id;

        const payment = await prisma.payment.findFirst({
            where: { id: paymentId, userId }
        });

        if (!payment) return res.status(404).json({ error: 'Payment not found' });
        if (payment.status === 'COMPLETED') return res.json({ status: 'COMPLETED', balance: null });
        if (payment.status === 'FAILED') return res.status(400).json({ error: 'Payment failed' });

        // For OxaPay: verify via track_id stored in transactionId
        if (payment.method === 'OXAPAY' && payment.transactionId) {
            const merchantApiKey = await getSetting('oxapay_merchant_api_key');
            if (merchantApiKey) {
                try {
                    const statusRes = await axios.post(
                        'https://api.oxapay.com/v1/payment/info',
                        { trackId: payment.transactionId },
                        { headers: { 'merchant_api_key': merchantApiKey, 'Content-Type': 'application/json' } }
                    );
                    console.log('[OxaPay] Verify response:', JSON.stringify(statusRes.data));

                    const txStatus = statusRes.data?.data?.status;
                    // 'paid' or 'Paid' = confirmed
                    if (txStatus === 'paid' || txStatus === 'Paid' || txStatus === 'completed') {
                        // Idempotent: Re-check status INSIDE transaction to prevent double-credit
                        // (webhook may have already fulfilled this payment)
                        const result = await prisma.$transaction(async (tx) => {
                            const freshPayment = await tx.payment.findUnique({ where: { id: paymentId } });
                            if (!freshPayment || freshPayment.status === 'COMPLETED') {
                                return { alreadyDone: true };
                            }

                            await tx.payment.update({
                                where: { id: paymentId },
                                data: { status: 'COMPLETED', processedAt: new Date() }
                            });
                            await tx.user.update({
                                where: { id: userId },
                                data: { balance: { increment: freshPayment.amount } }
                            });
                            await tx.advertiser.update({
                                where: { userId },
                                data: { totalDeposit: { increment: freshPayment.amount } }
                            });
                            return { alreadyDone: false };
                        });

                        const updated = await prisma.user.findUnique({ where: { id: userId }, select: { balance: true } });
                        return res.json({ status: 'COMPLETED', balance: updated?.balance });
                    }

                    // Still pending — return current status
                    return res.json({ status: txStatus || 'PENDING' });
                } catch (apiErr) {
                    console.error('[OxaPay] Verify API error:', apiErr.message);
                }
            }
        }

        // Fallback: if payment exists and is PENDING, just return pending
        res.json({ status: payment.status });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
};
export const configureAutoRecharge = async (req, res) => {
    try {
        const userId = req.user.id;
        const { enabled, threshold, amount } = req.body;

        if (enabled && (!threshold || !amount)) {
            return res.status(400).json({ error: 'Threshold and amount are required for auto-recharge' });
        }

        await prisma.advertiser.update({
            where: { userId },
            data: {
                autoRecharge: enabled,
                rechargeThreshold: enabled ? Number(threshold) : null,
                rechargeAmount: enabled ? Number(amount) : null
            }
        });

        res.json({ message: 'Auto-recharge settings updated' });
    } catch (error) {
        console.error('Auto-recharge config error:', error);
        res.status(500).json({ error: 'Failed to update auto-recharge settings' });
    }
};

// Get invoices
export const getInvoices = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [invoices, total] = await Promise.all([
            prisma.invoice.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
                include: {
                    payment: {
                        select: { type: true, method: true }
                    }
                }
            }),
            prisma.invoice.count({ where: { userId } })
        ]);

        res.json({
            invoices,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get invoices error:', error);
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
};

// Add payment method (reuse publisher logic but for advertiser context)
export const addPaymentMethod = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, details, isDefault } = req.body;

        if (!type || !details) {
            return res.status(400).json({ error: 'Type and details are required' });
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
                isVerified: true // Advertisers add cards which are auto-verified
            }
        });

        res.status(201).json(method);
    } catch (error) {
        console.error('Add payment method error:', error);
        res.status(500).json({ error: 'Failed to add payment method' });
    }
};

export const deletePaymentMethod = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        await prisma.userPaymentMethod.deleteMany({
            where: { id, userId }
        });

        res.json({ message: 'Payment method deleted' });
    } catch (error) {
        console.error('Delete payment method error:', error);
        res.status(500).json({ error: 'Failed to delete payment method' });
    }
};
