import express from 'express';
import crypto from 'crypto';
import DodoPayments from 'dodopayments';
import prisma from '../lib/prisma.js';
import { getSetting } from '../controllers/admin-settings.controller.js';

const router = express.Router();

// ─── DODO PAYMENTS WEBHOOK ──────────────────────────────────────────────────
// Docs: https://docs.dodopayments.com/developer-resources/webhooks
//
// Dodo uses the official SDK's webhooks.unwrap() for signature verification.
// Headers: webhook-id, webhook-timestamp, webhook-signature
// Event  : payment.succeeded → data.metadata.payment_id → fulfillDeposit

router.post('/dodo', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const webhookSecret = await getSetting('dodo_webhook_secret');
        if (!webhookSecret) {
            console.error('[Dodo] Webhook secret not configured');
            return res.status(400).send('Dodo Payments not configured');
        }

        const rawBody = req.body.toString('utf8');

        // Use official SDK to verify — handles timestamp tolerance + multi-sig automatically
        const client = new DodoPayments({
            bearerToken: await getSetting('dodo_api_key') || 'placeholder',
            webhookKey: webhookSecret,
        });

        let event;
        try {
            event = client.webhooks.unwrap(rawBody, {
                headers: {
                    'webhook-id': req.headers['webhook-id'] || '',
                    'webhook-signature': req.headers['webhook-signature'] || '',
                    'webhook-timestamp': req.headers['webhook-timestamp'] || '',
                },
            });
        } catch (verifyError) {
            console.error('[Dodo] Webhook signature verification failed:', verifyError.message);
            return res.status(401).send('Invalid signature');
        }

        if (event.type === 'payment.succeeded') {
            const paymentId = event.data?.metadata?.payment_id;
            const externalId = event.data?.payment_id || event.data?.id;
            if (paymentId) {
                await fulfillDeposit(paymentId, externalId);
            }
        }

        res.json({ received: true });
    } catch (error) {
        console.error('[Dodo] Webhook error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// ─── OXAPAY WEBHOOK ─────────────────────────────────────────────────────────
// Docs: https://docs.oxapay.com/webhook
//
// Auth  : HMAC-SHA512 of raw POST body, key = merchant_api_key, sent in header "HMAC"
// Status: "Paying" (partial/confirming) → "paid" (final confirmed)
// Fields: data.order_id = our paymentId, data.track_id = OxaPay transaction ID

router.post('/oxapay', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const merchantApiKey = await getSetting('oxapay_merchant_api_key');
        if (!merchantApiKey) {
            return res.status(400).send('OxaPay not configured');
        }

        const rawBody = req.body.toString('utf8');
        const hmacHeader = req.headers['hmac']; // OxaPay sends lowercase 'hmac' header

        if (!hmacHeader) {
            return res.status(400).send('Missing HMAC header');
        }

        // Verify: HMAC-SHA512(rawBody, merchantApiKey)
        const computedHmac = crypto
            .createHmac('sha512', merchantApiKey)
            .update(rawBody)
            .digest('hex');

        if (computedHmac !== hmacHeader) {
            console.error('[OxaPay] HMAC mismatch');
            return res.status(400).send('Invalid HMAC signature');
        }

        const payload = JSON.parse(rawBody);

        // "paid" = final confirmed payment (lowercase, as per docs)
        if (payload.status === 'paid' || payload.status === 'Paid') {
            const paymentId = payload.order_id;  // We set order_id = paymentId when creating invoice
            const trackId = payload.track_id;
            if (paymentId) {
                await fulfillDeposit(paymentId, trackId);
            }
        }

        // OxaPay requires HTTP 200 with body "ok"
        res.status(200).send('ok');
    } catch (error) {
        console.error('[OxaPay] Webhook error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// ─── VOLET WEBHOOK ──────────────────────────────────────────────────────────
// Docs: https://volet.com → For Developers → Hosted Checkout (SCI)
//
// Actual webhook fields:
//   ac_transfer           — Volet transaction ID
//   ac_order_id           — our paymentId
//   ac_transaction_status — COMPLETED | PENDING | PROCESS | CANCELED
//   ac_hash               — SHA-256(ac_transfer:ac_start_date:ac_sci_name:ac_merchant_currency:ac_amount:ac_order_id:ac_transaction_status:secret)
//
// Volet sends as URL-encoded form POST

router.post('/volet', express.urlencoded({ extended: true }), async (req, res) => {
    try {
        const payload = req.body;
        const secretKey = await getSetting('volet_secret_key');
        const sciName = await getSetting('volet_sci_name');

        // Verify signature if secret is configured
        if (secretKey && payload.ac_hash) {
            const signatureInput = [
                payload.ac_transfer,
                payload.ac_start_date,
                sciName || payload.ac_sci_name,
                payload.ac_merchant_currency,
                payload.ac_amount,
                payload.ac_order_id,
                payload.ac_transaction_status,
                secretKey,
            ].join(':');

            const expectedHash = crypto.createHash('sha256').update(signatureInput).digest('hex');

            if (expectedHash !== payload.ac_hash) {
                console.error('[Volet] Webhook hash mismatch');
                return res.status(400).send('Invalid signature');
            }
        }

        if (payload.ac_transaction_status === 'COMPLETED') {
            const paymentId = payload.ac_order_id;
            if (paymentId) {
                await fulfillDeposit(paymentId, payload.ac_transfer);
            }
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('[Volet] Webhook error:', error);
        res.status(500).send('Internal Server Error');
    }
});


// ─── FULFILL DEPOSIT (shared, idempotent) ───────────────────────────────────
export async function fulfillDeposit(paymentId, externalTransactionId) {
    await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.findUnique({ where: { id: paymentId } });

        if (!payment) {
            console.error(`[fulfillDeposit] Payment not found: ${paymentId}`);
            return;
        }

        // Idempotency — already completed
        if (payment.status === 'COMPLETED') {
            console.log(`[fulfillDeposit] Payment ${paymentId} already completed, skipping.`);
            return;
        }

        await tx.payment.update({
            where: { id: paymentId },
            data: {
                status: 'COMPLETED',
                transactionId: externalTransactionId,
                processedAt: new Date(),
            },
        });

        await tx.user.update({
            where: { id: payment.userId },
            data: { balance: { increment: payment.amount } },
        });

        await tx.advertiser.update({
            where: { userId: payment.userId },
            data: { totalDeposit: { increment: payment.amount } },
        });

        // Auto-generate invoice (race-safe: timestamp + random suffix instead of count-based)
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
        const randomSuffix = String(Math.floor(Math.random() * 90000) + 10000); // 5-digit random
        const timestamp = String(Date.now()).slice(-6); // Last 6 digits of epoch

        const invoiceNo = `INV-${currentYear}-${currentMonth}-${timestamp}-${randomSuffix}`;

        await tx.invoice.create({
            data: {
                userId: payment.userId,
                paymentId: payment.id,
                invoiceNo,
                amount: payment.amount,
                tax: 0,
                total: payment.amount,
                status: 'PAID',
                dueDate: now,
                paidAt: now,
                items: [
                    {
                        description: 'MrPop.io Ad Balance Deposit',
                        quantity: 1,
                        price: Number(payment.amount),
                        amount: Number(payment.amount),
                    },
                ],
            },
        });

        console.log(`✅ Deposit fulfilled: ${paymentId} | $${payment.amount} | tx: ${externalTransactionId}`);
    });
}

export default router;
