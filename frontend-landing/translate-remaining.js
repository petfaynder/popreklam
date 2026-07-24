const fs = require('fs');
const path = require('path');

function translateFile(filePath, hooks, replacements) {
    if (!fs.existsSync(filePath)) {
        console.log("File not found:", filePath);
        return;
    }
    let content = fs.readFileSync(filePath, 'utf8');

    // Inject next-intl imports
    if (!content.includes("import { useTranslations }")) {
        content = content.replace(
            /(import [^\n]+ from ['"]@\/lib\/themeUtils['"];?)/,
            "$1\nimport { useTranslations } from 'next-intl';"
        );
    }
    
    // Inject hooks
    if (!content.includes(hooks[0])) {
        content = content.replace(
            /const d = getDashboardTheme\(theme\);/,
            "const d = getDashboardTheme(theme);\n    " + hooks.join("\n    ")
        );
    }

    // Replace strings safely
    for (let r of replacements) {
        if (typeof r.search === 'string') {
            content = content.split(r.search).join(r.replace);
        } else {
            content = content.replace(r.search, r.replace);
        }
    }
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${filePath}`);
}

const p = (fp) => path.join(__dirname, 'src/app/[locale]', fp);

// --- 1. Publisher Payments ---
translateFile(p('publisher/payments/page.js'), [
    "const t = useTranslations('publisher.payments');",
    "const tCommon = useTranslations('common');"
], [
    { search: ">Payments<", replace: ">{t('title')}<" },
    { search: "Manage your revenue and request payouts", replace: "Manage your revenue and request payouts" }, // skip sub if no key
    { search: ">Current Balance<", replace: ">{t('currentBalance')}<" },
    { search: ">Pending Balance<", replace: ">{t('pendingBalance')}<" },
    { search: ">Request Payout<", replace: ">{t('requestPayout')}<" },
    { search: ">Payment History<", replace: ">{t('paymentHistory')}<" },
    { search: ">Amount<", replace: ">{t('amount')}<" },
    { search: ">Status<", replace: ">{t('status')}<" },
    { search: ">Date<", replace: ">{t('date')}<" },
    { search: "header: 'Amount'", replace: "header: t('amount')" },
    { search: "header: 'Status'", replace: "header: t('status')" },
    { search: "header: 'Date'", replace: "header: t('date')" },
    { search: "header: 'Method'", replace: "header: t('method')" },
    { search: ">No payment history yet<", replace: ">{t('noPayments')}<" },
    { search: ">Loading payments...<", replace: ">{tCommon('loading')}<" }
]);

// --- 2. Publisher Referrals ---
translateFile(p('publisher/referrals/page.js'), [
    "const t = useTranslations('publisher.referrals');",
    "const tCommon = useTranslations('common');"
], [
    { search: ">Referral Program<", replace: ">{t('title')}<" },
    { search: ">Earn commission by referring new publishers and advertisers<", replace: ">{t('subtitle')}<" },
    { search: ">Your Referral Code<", replace: ">{t('yourCode')}<" },
    { search: ">Referral Link<", replace: ">{t('referralLink')}<" },
    { search: ">Total Earned<", replace: ">{t('totalEarned')}<" },
    { search: ">Total Referrals<", replace: ">{t('totalReferrals')}<" },
    { search: ">Commission Rate<", replace: ">{t('commissionRate')}<" },
    { search: ">Referred Users<", replace: ">{t('referredUsers')}<" },
    { search: ">No referrals yet", replace: ">{t('noReferrals')}" },
    { search: ">Loading referrals...<", replace: ">{tCommon('loading')}<" }
]);

// --- 3. Publisher Settings ---
translateFile(p('publisher/settings/page.js'), [
    "const t = useTranslations('publisher.settings');",
    "const tCommon = useTranslations('common');"
], [
    { search: ">Account Settings<", replace: ">{t('title')}<" },
    { search: ">Profile<", replace: ">{t('profile')}<" },
    { search: ">Security<", replace: ">{t('security')}<" },
    { search: ">Notifications<", replace: ">{t('notifications')}<" },
    { search: ">Payment Info<", replace: ">{t('payment')}<" },
    { search: "label: 'Profile'", replace: "label: t('profile')" },
    { search: "label: 'Security'", replace: "label: t('security')" },
    { search: "label: 'Notifications'", replace: "label: t('notifications')" },
    { search: "label: 'Payment'", replace: "label: t('payment')" },
    { search: ">First Name<", replace: ">{t('firstName')}<" },
    { search: ">Last Name<", replace: ">{t('lastName')}<" },
    { search: ">Company Name<", replace: ">{t('company')}<" },
    { search: ">Current Password<", replace: ">{t('currentPassword')}<" },
    { search: ">New Password<", replace: ">{t('newPassword')}<" },
    { search: ">Confirm New Password<", replace: ">{t('confirmPassword')}<" },
    { search: ">Two-Factor Authentication<", replace: ">{t('twoFactor')}<" },
    { search: ">Email Notifications<", replace: ">{t('emailNotifications')}<" },
    { search: "Save Changes", replace: "{tCommon('save')}" },
    { search: ">Loading settings...<", replace: ">{tCommon('loading')}<" }
]);

// --- 4. Publisher Support ---
translateFile(p('publisher/support/page.js'), [
    "const t = useTranslations('publisher.support');",
    "const tCommon = useTranslations('common');"
], [
    { search: ">Support<", replace: ">{t('title')}<" },
    { search: ">New Ticket<", replace: ">{t('newTicket')}<" },
    { search: ">Open Tickets<", replace: ">{t('openTickets')}<" },
    { search: ">Closed Tickets<", replace: ">{t('closedTickets')}<" },
    { search: ">Subject<", replace: ">{t('subject')}<" },
    { search: ">Category<", replace: ">{t('category')}<" },
    { search: ">Priority<", replace: ">{t('priority')}<" },
    { search: ">Message<", replace: ">{t('message')}<" },
    { search: "header: 'Subject'", replace: "header: t('subject')" },
    { search: "header: 'Category'", replace: "header: t('category')" },
    { search: "header: 'Status'", replace: "header: tCommon('status')" },
    { search: "header: 'Date'", replace: "header: tCommon('date')" },
    { search: ">No support tickets yet<", replace: ">{t('noTickets')}<" },
    { search: ">Loading support<", replace: ">{tCommon('loading')}<" }
]);

// --- 5. Advertiser Campaigns ---
translateFile(p('advertiser/campaigns/page.js'), [
    "const t = useTranslations('advertiser.campaigns');",
    "const tCommon = useTranslations('common');"
], [
    { search: ">Campaigns<", replace: ">{t('title')}<" },
    { search: ">Create Campaign<", replace: ">{t('create')}<" },
    { search: ">Campaign Name<", replace: ">{t('name')}<" },
    { search: ">Ad Format<", replace: ">{t('format')}<" },
    { search: ">Daily Budget<", replace: ">{t('dailyBudget')}<" },
    { search: ">Total Budget<", replace: ">{t('totalBudget')}<" },
    { search: ">Bid Amount", replace: ">{t('bidAmount')}" },
    { search: ">Spent<", replace: ">{t('spent')}<" },
    { search: ">Impressions<", replace: ">{t('impressions')}<" },
    { search: ">Clicks<", replace: ">{t('clicks')}<" },
    { search: ">CTR<", replace: ">{t('ctr')}<" },
    { search: "header: 'Campaign'", replace: "header: t('name')" },
    { search: "header: 'Format'", replace: "header: t('format')" },
    { search: "header: 'Status'", replace: "header: tCommon('status')" },
    { search: "header: 'Spent'", replace: "header: t('spent')" },
    { search: "header: 'Impressions'", replace: "header: t('impressions')" },
    { search: "header: 'Actions'", replace: "header: tCommon('actions')" },
    { search: ">No campaigns yet", replace: ">{t('noCampaigns')}" },
    { search: ">Loading campaigns...<", replace: ">{tCommon('loading')}<" }
]);

// --- 6. Advertiser Billing ---
translateFile(p('advertiser/billing/page.js'), [
    "const t = useTranslations('advertiser.billing');",
    "const tCommon = useTranslations('common');"
], [
    { search: ">Billing & Payments<", replace: ">{t('title')}<" },
    { search: ">Billing &amp; Payments<", replace: ">{t('title')}<" },
    { search: ">Add Funds<", replace: ">{t('deposit')}<" },
    { search: ">Current Balance<", replace: ">{t('currentBalance')}<" },
    { search: ">Total Deposited<", replace: ">{t('totalDeposited')}<" },
    { search: ">Total Spent<", replace: ">{t('totalSpent')}<" },
    { search: ">Transaction History<", replace: ">{t('history')}<" },
    { search: ">Deposit Amount<", replace: ">{t('amount')}<" },
    { search: ">Payment Method<", replace: ">{t('method')}<" },
    { search: ">Promo Code<", replace: ">{t('coupon')}<" },
    { search: ">Apply<", replace: ">{t('applyCoupon')}<" },
    { search: "header: 'Amount'", replace: "header: t('amount')" },
    { search: "header: 'Method'", replace: "header: t('method')" },
    { search: "header: 'Date'", replace: "header: tCommon('date')" },
    { search: ">No transactions yet<", replace: ">{t('noHistory')}<" },
    { search: ">Loading billing...<", replace: ">{tCommon('loading')}<" }
]);

// --- 7. Advertiser Settings ---
translateFile(p('advertiser/settings/page.js'), [
    "const t = useTranslations('advertiser.settings');",
    "const tCommon = useTranslations('common');"
], [
    { search: ">Account Settings<", replace: ">{t('title')}<" },
    { search: ">Company Name<", replace: ">{t('company')}<" },
    { search: ">Billing Address<", replace: ">{t('billingAddress')}<" },
    { search: ">Tax ID / VAT Number<", replace: ">{t('taxId')}<" },
    { search: ">Auto-Recharge<", replace: ">{t('autoRecharge')}<" },
    { search: "Save Changes", replace: "{tCommon('save')}" },
    { search: ">Loading settings...<", replace: ">{tCommon('loading')}<" }
]);

console.log("All replacements executed.");
