import DodoPayments from 'dodopayments';
import axios from 'axios';
import crypto from 'crypto';
import { getSetting } from '../controllers/admin-settings.controller.js';

const IS_DEV = process.env.NODE_ENV !== 'production';
// APP_URL = backend (5000), CORS_ORIGIN / FRONTEND_URL = frontend (3000)
const FRONTEND_URL = process.env.CORS_ORIGIN || 'http://localhost:3000';
const BACKEND_URL = process.env.APP_URL || 'http://localhost:5000';

/**
 * In development, when no API key is configured, return a mock checkout
 * URL so the UI flow can be tested without real gateway credentials.
 * This NEVER runs in production.
 */
function mockCheckoutUrl(paymentId, gateway) {
    if (!IS_DEV) return null;
    console.warn(`⚠️  [DEV] ${gateway} API key not set — using mock checkout URL for payment ${paymentId}`);
    return `${FRONTEND_URL}/advertiser/billing?success=true&payment_id=${paymentId}&mock=1`;
}

// ─── DODO PAYMENTS (Credit Card / MoR) ─────────────────────────────────────
// Docs: https://docs.dodopayments.com
// SDK:  npm install dodopayments
//
// Flow: createCheckoutSession → checkout_url (hosted Dodo page) → webhook payment.succeeded

export async function createDodoSession(amount, paymentId, userEmail) {
    const apiKey = await getSetting('dodo_api_key');
    if (!apiKey) {
        const mock = mockCheckoutUrl(paymentId, 'Dodo Payments');
        if (mock) return mock;
        throw new Error('Dodo Payments is not configured by the admin.');
    }

    const productId = await getSetting('dodo_product_id');
    if (!productId) throw new Error('Dodo product_id is not configured. Create a product in the Dodo dashboard first.');

    // Use test_mode when not in production
    const client = new DodoPayments({
        bearerToken: apiKey,
        environment: IS_DEV ? 'test_mode' : 'live_mode',
    });

    const session = await client.checkoutSessions.create({
        product_cart: [{ product_id: productId, quantity: 1 }],
        customer: {
            email: userEmail,
            name: userEmail.split('@')[0],
        },
        return_url: `${FRONTEND_URL}/advertiser/billing?success=true&payment_id=${paymentId}`,
        cancel_url: `${FRONTEND_URL}/advertiser/billing?canceled=true`,
        metadata: { payment_id: paymentId },
    });

    if (!session?.checkout_url) {
        throw new Error('Dodo Payments: No checkout_url in response');
    }

    return session.checkout_url;
}

// ─── OXAPAY (Crypto) ────────────────────────────────────────────────────────
// Docs: https://docs.oxapay.com/api-reference/payment/generate-invoice
//
// Corrected vs original:
//   endpoint : /v1/payment/invoice  (not /merchants/request)
//   auth     : merchant_api_key header  (not body field)
//   fields   : fee_paid_by_payer, under_paid_coverage, order_id, callback_url, return_url
//   sandbox  : true → no real crypto sent, test mode

export async function createOxaPayInvoice(amount, paymentId) {
    const merchantApiKey = await getSetting('oxapay_merchant_api_key');
    if (!merchantApiKey) {
        const mock = mockCheckoutUrl(paymentId, 'OxaPay');
        if (mock) return mock;
        throw new Error('OxaPay is not configured by the admin.');
    }

    const currency = await getSetting('currency_code', 'USD');

    const response = await axios.post(
        'https://api.oxapay.com/v1/payment/invoice',
        {
            amount: Number(amount),
            currency,                                    // fiat currency (USD, EUR…)
            lifetime: 30,                                // 30 minutes to pay
            fee_paid_by_payer: 0,                        // merchant absorbs fee
            under_paid_coverage: 2.5,                    // allow 2.5% underpayment
            mixed_payment: true,                         // allow paying remainder with diff coin
            callback_url: `${BACKEND_URL}/api/webhooks/oxapay`,
            return_url: `${FRONTEND_URL}/advertiser/billing?success=true&payment_id=${paymentId}`,
            order_id: paymentId,
            description: `PopReklam Ad Balance Deposit #${paymentId}`,
            sandbox: IS_DEV,                             // ← test mode when developing
        },
        {
            headers: {
                'merchant_api_key': merchantApiKey,      // ← correct auth header
                'Content-Type': 'application/json',
            },
        }
    );

    // OxaPay v1 API response structure:
    // { status: 200, message: "...", data: { track_id: "...", payment_url: "https://pay.oxapay.com/...", expired_at: ... } }
    const paymentUrl = response.data?.data?.payment_url;
    const trackId = response.data?.data?.track_id;

    if (response.data?.status === 200 && paymentUrl) {
        return { url: paymentUrl, trackId };
    }

    throw new Error(
        response.data?.message || `OxaPay error: status=${response.data?.status}`
    );
}

// ─── VOLET.COM (Alternative / Crypto + Fiat Wallet) ─────────────────────────
// Docs: https://volet.com → For Developers → Hosted Checkout (SCI)
//
// SCI URL  : https://account.volet.com/sci/
// Auth     : SHA-256 signature of concatenated fields with secret
// Params   : ac_account_email, ac_sci_name, ac_amount, ac_currency, ac_order_id, ac_sign
// Callbacks: ac_success_url, ac_fail_url, ac_status_url (webhook)
// Webhook  : POST with ac_transfer, ac_order_id, ac_transaction_status, ac_hash
//
// Required admin settings:
//   volet_account_email  — the merchant's Volet account email
//   volet_sci_name       — the SCI name created in the Volet merchant panel
//   volet_secret_key     — the secret key associated with the SCI

export async function createVoletInvoice(amount, paymentId, userEmail) {
    const accountEmail = await getSetting('volet_account_email');
    const sciName = await getSetting('volet_sci_name');
    const secretKey = await getSetting('volet_secret_key');

    if (!accountEmail || !sciName || !secretKey) {
        const mock = mockCheckoutUrl(paymentId, 'Volet');
        if (mock) return mock;
        throw new Error('Volet is not fully configured (requires account_email, sci_name, secret_key).');
    }

    const currency = await getSetting('currency_code', 'USD');
    const amountStr = Number(amount).toFixed(2);

    // SHA-256 signature: ac_account_email:ac_sci_name:ac_amount:ac_currency:secret:ac_order_id
    const signatureInput = `${accountEmail}:${sciName}:${amountStr}:${currency}:${secretKey}:${paymentId}`;
    const acSign = crypto.createHash('sha256').update(signatureInput).digest('hex');

    const params = new URLSearchParams({
        ac_account_email: accountEmail,
        ac_sci_name: sciName,
        ac_amount: amountStr,
        ac_currency: currency,
        ac_order_id: paymentId,
        ac_sign: acSign,
        ac_success_url: `${FRONTEND_URL}/advertiser/billing?success=true&payment_id=${paymentId}`,
        ac_success_url_method: 'GET',
        ac_fail_url: `${FRONTEND_URL}/advertiser/billing?canceled=true`,
        ac_fail_url_method: 'GET',
        ac_status_url: `${BACKEND_URL}/api/webhooks/volet`,
        ac_status_url_method: 'POST',
    });

    return `https://account.volet.com/sci/?${params.toString()}`;
}
