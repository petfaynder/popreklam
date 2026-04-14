import prisma from '../lib/prisma.js'
import NodeCache from 'node-cache';
import { invalidatePriorityCache } from '../services/priority.service.js';

// Cache settings for 5 minutes (300 seconds) — prevents DB overload during ad serving
const settingsCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Default platform settings
const DEFAULT_SETTINGS = [
    // General
    { key: 'platform_name', value: 'MrPop.io', type: 'string', group: 'general', label: 'Platform Name' },
    { key: 'site_title', value: 'MrPop.io - Premium Ad Network', type: 'string', group: 'general', label: 'Site Title (SEO)' },
    { key: 'site_description', value: 'The leading premium ad network for publishers and advertisers.', type: 'text', group: 'general', label: 'Site Description (SEO)' },
    { key: 'platform_email', value: 'admin@mrpop.io', type: 'string', group: 'general', label: 'Contact Email' },
    { key: 'maintenance_mode', value: 'false', type: 'boolean', group: 'general', label: 'Maintenance Mode' },
    { key: 'maintenance_message', value: 'We are currently undergoing scheduled maintenance. Please check back soon.', type: 'text', group: 'general', label: 'Maintenance Message' },
    { key: 'global_theme', value: 'theme-brutalist', type: 'string', group: 'general', label: 'Global Platform Theme (e.g. theme-brutalist, theme-saas, theme-editorial)' },
    { key: 'terms_url', value: '/terms', type: 'string', group: 'general', label: 'Terms of Service URL' },
    { key: 'privacy_url', value: '/privacy', type: 'string', group: 'general', label: 'Privacy Policy URL' },

    // Financial
    { key: 'currency_symbol', value: '$', type: 'string', group: 'financial', label: 'Currency Symbol' },
    { key: 'currency_code', value: 'USD', type: 'string', group: 'financial', label: 'Currency Code (e.g. USD, EUR)' },
    { key: 'publisher_revenue_share', value: '70', type: 'number', group: 'financial', label: 'Publisher Revenue Share (%)' },
    { key: 'min_publisher_payout', value: '50', type: 'number', group: 'financial', label: 'Minimum Publisher Payout' },
    { key: 'min_advertiser_deposit', value: '50', type: 'number', group: 'financial', label: 'Minimum Advertiser Deposit' },
    { key: 'cpm_popunder', value: '2.00', type: 'number', group: 'financial', label: 'Default CPM — Popunder' },
    { key: 'cpm_popup', value: '1.80', type: 'number', group: 'financial', label: 'Default CPM — Popup' },
    { key: 'cpm_native', value: '1.50', type: 'number', group: 'financial', label: 'Default CPM — Native' },
    { key: 'cpm_in_page_push', value: '1.20', type: 'number', group: 'financial', label: 'Default CPM — In-Page Push' },
    { key: 'cpm_banner', value: '0.80', type: 'number', group: 'financial', label: 'Default CPM — Banner' },
    { key: 'cpm_direct_link', value: '1.00', type: 'number', group: 'financial', label: 'Default CPM — Direct Link' },
    { key: 'auto_approve_withdrawal', value: 'false', type: 'boolean', group: 'financial', label: 'Auto-Approve Withdrawals Under Threshold' },
    { key: 'auto_approve_withdrawal_limit', value: '100', type: 'number', group: 'financial', label: 'Auto-Approve Withdrawal Limit' },

    // Ad Server
    { key: 'max_impressions_per_ip', value: '50', type: 'number', group: 'adserver', label: 'Max Impressions per IP/Hour (Rate Cap)' },
    { key: 'fraud_pending_score_threshold', value: '40', type: 'number', group: 'adserver', label: 'Fraud Score Threshold → PENDING (40–79 = hold publisher pay 24h)' },
    { key: 'fraud_block_score_threshold', value: '80', type: 'number', group: 'adserver', label: 'Fraud Score Threshold → BLOCK (80+ = reject impression)' },
    { key: 'fraud_audit_enabled', value: 'true', type: 'boolean', group: 'adserver', label: 'Enable 24h Fraud Audit Cron (auto-refund advertisers for confirmed fraud)' },
    { key: 'default_rejection_reason', value: 'Your campaign does not meet our advertising standards. Please review our policies and resubmit.', type: 'text', group: 'adserver', label: 'Default Campaign Rejection Reason' },

    // Notifications
    { key: 'smtp_host', value: 'smtp.mailgun.org', type: 'string', group: 'notifications', label: 'SMTP Host' },
    { key: 'smtp_port', value: '587', type: 'number', group: 'notifications', label: 'SMTP Port' },
    { key: 'smtp_user', value: 'postmaster@mrpop.io', type: 'string', group: 'notifications', label: 'SMTP Username' },
    { key: 'smtp_pass', value: '', type: 'password', group: 'notifications', label: 'SMTP Password' },
    { key: 'smtp_from_email', value: 'noreply@mrpop.io', type: 'string', group: 'notifications', label: 'SMTP From Email' },
    { key: 'smtp_from_name', value: 'MrPop.io System', type: 'string', group: 'notifications', label: 'SMTP From Name' },
    { key: 'notify_new_user', value: 'true', type: 'boolean', group: 'notifications', label: 'Notify on New User Registration' },
    { key: 'notify_new_campaign', value: 'true', type: 'boolean', group: 'notifications', label: 'Notify on New Campaign' },
    { key: 'notify_withdrawal', value: 'true', type: 'boolean', group: 'notifications', label: 'Notify on Withdrawal Request' },
    { key: 'notification_email', value: 'admin@mrpop.io', type: 'string', group: 'notifications', label: 'Admin Notification Email' },

    // Security
    { key: 'session_timeout', value: '60', type: 'number', group: 'security', label: 'Session Timeout (minutes)' },
    { key: 'max_login_attempts', value: '5', type: 'number', group: 'security', label: 'Max Failed Login Attempts' },
    { key: 'audit_log_retention', value: '90', type: 'number', group: 'security', label: 'Audit Log Retention (days)' },
    { key: 'recaptcha_site_key', value: '', type: 'string', group: 'security', label: 'Google reCAPTCHA Site Key' },
    { key: 'recaptcha_secret_key', value: '', type: 'password', group: 'security', label: 'Google reCAPTCHA Secret Key' },

    // Ad Networks (Third-Party Backfill — Adsterra SmartLink)
    // SmartLink works on ANY publisher domain without domain registration.
    // Get your SmartLink from: Adsterra dashboard → SmartLinks → Copy URL
    { key: 'adsterra_smartlink_enabled', value: 'false', type: 'boolean', group: 'ad_networks', label: 'Enable Adsterra SmartLink Backfill', description: 'Serve Adsterra ads when no internal campaign matches' },
    { key: 'adsterra_smartlink_popunder', value: '', type: 'text', group: 'ad_networks', label: 'Adsterra SmartLink URL (Popunder)', description: 'From Adsterra dashboard → SmartLinks. Works on all publisher domains.' },
    { key: 'adsterra_smartlink_inpage', value: '', type: 'text', group: 'ad_networks', label: 'Adsterra SmartLink URL (In-Page Push)', description: 'Optional. Falls back to popunder SmartLink if empty.' },
    { key: 'adsterra_api_key', value: '', type: 'password', group: 'ad_networks', label: 'Adsterra API Key', description: 'For pulling revenue statistics (Settings → API in Adsterra dashboard)' },
    { key: 'adsterra_estimated_cpm', value: '0.50', type: 'number', group: 'ad_networks', label: 'Adsterra Estimated CPM (USD)', description: 'Avg CPM used for publisher balance estimates. Reconcile monthly with actual Adsterra payout.' },

    // Traffic Split: percentage of ALL impressions sent to Adsterra SmartLink
    // even when internal campaigns exist. 0 = no split (pure backfill only).
    // Example: 40 = 40% Adsterra, 60% internal campaigns
    { key: 'adsterra_traffic_split_percent', value: '0', type: 'number', group: 'ad_networks', label: 'Traffic Split → Adsterra (%)', description: 'Force X% of impressions to Adsterra even when internal campaigns exist. 0 = backfill only.' },

    // Invoice & Branding
    { key: 'invoice_company_name', value: 'MrPop.io Ltd.', type: 'string', group: 'invoice', label: 'Company Name' },
    { key: 'invoice_company_email', value: 'billing@mrpop.io', type: 'string', group: 'invoice', label: 'Billing Contact Email' },
    { key: 'invoice_company_reg_no', value: '', type: 'string', group: 'invoice', label: 'Business Registration Number' },
    { key: 'invoice_address_line1', value: '', type: 'string', group: 'invoice', label: 'Address Line 1 (Street)' },
    { key: 'invoice_address_line2', value: '', type: 'string', group: 'invoice', label: 'Address Line 2 (City, ZIP)' },
    { key: 'invoice_country', value: '', type: 'string', group: 'invoice', label: 'Country' },
    { key: 'invoice_tax_rate', value: '0', type: 'number', group: 'invoice', label: 'Tax Rate (%)' },
    { key: 'invoice_tax_label', value: 'TAX', type: 'string', group: 'invoice', label: 'Tax Label (e.g. VAT, GST, TAX)' },
    { key: 'invoice_bank_name', value: '', type: 'string', group: 'invoice', label: 'Bank Name' },
    { key: 'invoice_bank_iban', value: '', type: 'string', group: 'invoice', label: 'IBAN / Account Number' },
    { key: 'invoice_bank_swift', value: '', type: 'string', group: 'invoice', label: 'SWIFT / BIC Code' },
    { key: 'invoice_footer_note', value: 'Thank you for your business!', type: 'string', group: 'invoice', label: 'Invoice Footer Note' },
    { key: 'invoice_logo_url', value: '', type: 'string', group: 'invoice', label: 'Logo URL (leave blank for text logo)' },

    // Payment Gateways — Dodo Payments (Credit Card / MoR)
    { key: 'dodo_enabled', value: 'false', type: 'boolean', group: 'payments', label: 'Enable Dodo Payments (Credit Card)', description: 'Merchant of Record — no company required. Dashboard: app.dodopayments.com' },
    { key: 'dodo_api_key', value: '', type: 'password', group: 'payments', label: 'Dodo Payments API Key', description: 'Settings → API Keys → Live Secret Key' },
    { key: 'dodo_webhook_secret', value: '', type: 'password', group: 'payments', label: 'Dodo Webhook Secret', description: 'Settings → Webhooks → Signing Secret' },
    { key: 'dodo_product_id', value: '', type: 'string', group: 'payments', label: 'Dodo Product ID', description: 'Create a one-time product in Dodo dashboard and paste its product_id here' },

    // Payment Gateways — OxaPay (Crypto)
    { key: 'oxapay_enabled', value: 'false', type: 'boolean', group: 'payments', label: 'Enable OxaPay (Crypto)', description: 'Supports BTC, ETH, USDT, LTC, DOGE and 20+ coins. Dashboard: oxapay.com' },
    { key: 'oxapay_merchant_api_key', value: '', type: 'password', group: 'payments', label: 'OxaPay Merchant API Key', description: 'Dashboard → Merchant → Create Merchant → Copy API Key' },

    // Payment Gateways — Volet.com (Crypto + Fiat Wallet)
    { key: 'volet_enabled', value: 'false', type: 'boolean', group: 'payments', label: 'Enable Volet.com (Crypto + Fiat)', description: 'Alternative wallet-based payment. Dashboard: volet.com → For Developers → Hosted Checkout (SCI)' },
    { key: 'volet_account_email', value: '', type: 'string', group: 'payments', label: 'Volet Account Email', description: 'The email address of your Volet merchant account' },
    { key: 'volet_sci_name', value: '', type: 'string', group: 'payments', label: 'Volet SCI Name', description: 'The SCI name you created in Volet merchant panel (case-sensitive)' },
    { key: 'volet_secret_key', value: '', type: 'password', group: 'payments', label: 'Volet SCI Secret Key', description: 'The secret key associated with your SCI — used for SHA-256 signature' },
];

/** Strip fields not in SystemSetting Prisma model (e.g. description) before DB writes */
const toDbSetting = ({ key, value, type, group, label }) => ({ key, value, type, group, label });

/**
 * Helper: get a setting value (used by other parts of the app)
 * Cached for 5 minutes to prevent DB flooding during impression spikes
 */
export const getSetting = async (key, fallback = null) => {
    try {
        const cachedValue = settingsCache.get(key);
        if (cachedValue !== undefined) {
            return cachedValue;
        }
        const s = await prisma.systemSetting.findUnique({ where: { key } });
        const val = s ? s.value : fallback;
        settingsCache.set(key, val);
        return val;
    } catch { return fallback; }
};

/**
 * Seed default settings (called on first run)
 * POST /api/admin/settings/seed
 */
export const seedDefaultSettings = async (req, res) => {
    try {
        let seeded = 0;
        for (const setting of DEFAULT_SETTINGS) {
            const existing = await prisma.systemSetting.findUnique({ where: { key: setting.key } });
            if (!existing) {
                await prisma.systemSetting.create({ data: toDbSetting(setting) });
                seeded++;
            }
        }
        res.json({ message: `Seeded ${seeded} new settings`, total: DEFAULT_SETTINGS.length });
    } catch (error) {
        console.error('Seed settings error:', error);
        res.status(500).json({ error: 'Failed to seed settings' });
    }
};

/**
 * GET /api/admin/settings
 * Query: ?group=financial
 */
export const getSettings = async (req, res) => {
    try {
        const { group } = req.query;
        const where = group ? { group } : {};

        let settings = await prisma.systemSetting.findMany({ where, orderBy: [{ group: 'asc' }, { key: 'asc' }] });

        // Auto-seed missing settings
        const existingKeys = new Set(settings.map(s => s.key));
        const missingSettings = DEFAULT_SETTINGS.filter(s => !existingKeys.has(s.key));

        if (missingSettings.length > 0) {
            for (const s of missingSettings) {
                await prisma.systemSetting.create({ data: toDbSetting(s) });
            }
            // Refetch after seeding
            settings = await prisma.systemSetting.findMany({ where, orderBy: [{ group: 'asc' }, { key: 'asc' }] });
        }

        // Group by section for frontend convenience
        const grouped = {};
        settings.forEach(s => {
            if (!grouped[s.group]) grouped[s.group] = [];
            grouped[s.group].push(s);
        });

        res.json({ settings, grouped });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Failed to fetch settings', detail: error.message, code: error.code });
    }
};


/**
 * PUT /api/admin/settings/:key
 */
export const updateSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;
        if (value === undefined) return res.status(400).json({ error: 'Value is required' });

        const setting = await prisma.systemSetting.upsert({
            where: { key },
            update: { value: String(value) },
            create: {
                key,
                value: String(value),
                type: 'string',
                group: 'general',
                label: key
            }
        });

        settingsCache.del(key); // Clear cache so next read gets fresh value
        if (key.startsWith('priority_')) invalidatePriorityCache(); // Force priority reload

        res.json({ message: 'Setting updated', setting });
    } catch (error) {
        console.error('Update setting error:', error);
        res.status(500).json({ error: 'Failed to update setting' });
    }
};

/**
 * POST /api/admin/settings/bulk
 * Body: { settings: [{ key, value }, ...] }
 */
export const bulkUpdateSettings = async (req, res) => {
    try {
        const { settings } = req.body;
        if (!Array.isArray(settings)) return res.status(400).json({ error: 'Settings must be an array' });

        const updated = [];
        for (const { key, value } of settings) {
            if (!key) continue;
            const s = await prisma.systemSetting.upsert({
                where: { key },
                update: { value: String(value ?? '') },
                create: { key, value: String(value ?? ''), type: 'string', group: 'general', label: key }
            });
            settingsCache.del(key); // Clear each updated key from cache
            if (key.startsWith('priority_')) invalidatePriorityCache();
            updated.push(s);
        }

        res.json({ message: `${updated.length} settings updated`, settings: updated });
    } catch (error) {
        console.error('Bulk update settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
};

/**
 * POST /api/admin/settings/:key/reset
 */
export const resetSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const defaultSetting = DEFAULT_SETTINGS.find(s => s.key === key);
        if (!defaultSetting) return res.status(404).json({ error: 'Setting not found in defaults' });

        const setting = await prisma.systemSetting.upsert({
            where: { key },
            update: { value: defaultSetting.value },
            create: defaultSetting
        });

        settingsCache.del(key); // Clear cache

        res.json({ message: 'Setting reset to default', setting });
    } catch (error) {
        console.error('Reset setting error:', error);
        res.status(500).json({ error: 'Failed to reset setting' });
    }
};
