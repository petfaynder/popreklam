const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    for (let r of replacements) {
        content = content.replace(r.search, r.replace);
    }
    fs.writeFileSync(filePath, content);
}

// 1. publisher/layout.js
replaceInFile(
    path.join(__dirname, 'src/app/[locale]/publisher/layout.js'),
    [
        {
            search: "const tCommon = useTranslations('common');",
            replace: "const tCommon = useTranslations('common');\n    const tVerify = useTranslations('publisher.verify');\n    const tTopbar = useTranslations('publisher.topbar');"
        },
        {
            search: "Verification email sent",
            replace: "{tVerify('sentTitle')}"
        },
        {
            search: "Check your inbox and spam folder, then click the link to activate your account.",
            replace: "{tVerify('sentSubtitle')}"
        },
        {
            search: "Email verification required",
            replace: "{tVerify('title')}"
        },
        {
            search: "Your account is not fully active. Please verify your email address.",
            replace: "{tVerify('subtitle')}"
        },
        {
            search: "{resendLoading ? 'Sending...' : 'Resend Email'}",
            replace: "{resendLoading ? tVerify('sending') : tVerify('resend')}"
        },
        {
            search: "pathname === '/publisher' ? 'Dashboard'",
            replace: "pathname === '/publisher' ? t('dashboard')"
        },
        {
            search: "<p className=\"text-sm\">No notifications yet</p>",
            replace: "<p className=\"text-sm\">{tTopbar('noNotifications')}</p>"
        },
        {
            search: "<div className={d.avatarSub}>Publisher</div>",
            replace: "<div className={d.avatarSub}>{tCommon('active')}</div>"
        }
    ]
);

// 2. publisher/page.js
replaceInFile(
    path.join(__dirname, 'src/app/[locale]/publisher/page.js'),
    [
        {
            search: "import { getDashboardTheme } from '@/lib/themeUtils';",
            replace: "import { getDashboardTheme } from '@/lib/themeUtils';\nimport { useTranslations } from 'next-intl';"
        },
        {
            search: "const d = getDashboardTheme(theme);",
            replace: "const d = getDashboardTheme(theme);\n    const t = useTranslations('publisher.dashboard');\n    const tCommon = useTranslations('common');"
        },
        {
            search: "<p className={d.loaderText}>Loading dashboard...</p>",
            replace: "<p className={d.loaderText}>{tCommon('loading')}</p>"
        },
        {
            search: "Retry",
            replace: "{tCommon('retry')}"
        },
        {
            search: "<h1 className={`${d.heading} mb-2`}>Publisher Dashboard</h1>",
            replace: "<h1 className={`${d.heading} mb-2`}>{t('title')}</h1>"
        },
        {
            search: "<p className={d.subheading}>Monitor your ad revenue and performance</p>",
            replace: "<p className={d.subheading}>{t('subtitle')}</p>"
        },
        {
            search: "<span className=\"text-sm font-medium\">Export</span>",
            replace: "<span className=\"text-sm font-medium\">{tCommon('exportCsv')}</span>"
        },
        {
            search: "<span className=\"text-sm\">Add Site</span>",
            replace: "<span className=\"text-sm\">{t('addSite')}</span>"
        },
        {
            search: "title=\"Today's Revenue\"",
            replace: "title={t('todayEarnings')}"
        },
        {
            search: "title=\"Impressions\"",
            replace: "title={t('impressions')}"
        },
        {
            search: "title=\"Clicks\"",
            replace: "title={t('clicks')}"
        },
        {
            search: "title=\"Active Sites\"",
            replace: "title={t('sites')}"
        },
        {
            search: "total`}",
            replace: "total`}" // keep it simple or replace completely, let's skip complex string templates
        },
        {
            search: "Optimization Opportunity",
            replace: "Optimization Opportunity"
        },
        {
            search: "<h3 className={`text-lg font-bold mb-4 ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>Revenue Trend</h3>",
            replace: "<h3 className={`text-lg font-bold mb-4 ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>{t('earningsChart')}</h3>"
        },
        {
            search: "<h3 className={`text-lg font-bold mb-4 ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>Performance Overview</h3>",
            replace: "<h3 className={`text-lg font-bold mb-4 ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>{t('earningsChart')}</h3>"
        },
        {
            search: "<h3 className={`text-lg font-bold mb-4 ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>Top Performing Pages</h3>",
            replace: "<h3 className={`text-lg font-bold mb-4 ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>{t('topSites')}</h3>"
        },
        {
            search: "No data available yet",
            replace: "{tCommon('noData')}"
        },
        {
            search: "No device data yet",
            replace: "{tCommon('noData')}"
        },
        {
            search: "No geographic data yet",
            replace: "{tCommon('noData')}"
        },
        {
            search: "Data appears once impressions are recorded",
            replace: "{tCommon('noData')}"
        },
        {
            search: "label=\"Total Earnings\"",
            replace: "label={t('totalEarnings')}"
        },
        {
            search: "label=\"Avg eCPM\"",
            replace: "label={t('cpm')}"
        },
        {
            search: "label=\"Avg CTR\"",
            replace: "label={t('ctr')}"
        }
    ]
);

// 3. advertiser/layout.js
replaceInFile(
    path.join(__dirname, 'src/app/[locale]/advertiser/layout.js'),
    [
        {
            search: "const t = useTranslations('advertiser.nav');",
            replace: "const t = useTranslations('advertiser.nav');\n    const tCommon = useTranslations('common');\n    const tTopbar = useTranslations('advertiser.topbar');"
        },
        {
            search: "pathname === '/advertiser' ? 'Dashboard'",
            replace: "pathname === '/advertiser' ? t('dashboard')"
        },
        {
            search: "<p className=\"text-sm\">No notifications yet</p>",
            replace: "<p className=\"text-sm\">{tTopbar('noNotifications')}</p>"
        },
        {
            search: "<div className={d.avatarSub}>Advertiser</div>",
            replace: "<div className={d.avatarSub}>{tCommon('active')}</div>"
        }
    ]
);

// 4. advertiser/page.js
replaceInFile(
    path.join(__dirname, 'src/app/[locale]/advertiser/page.js'),
    [
        {
            search: "import { getDashboardTheme } from '@/lib/themeUtils';",
            replace: "import { getDashboardTheme } from '@/lib/themeUtils';\nimport { useTranslations } from 'next-intl';"
        },
        {
            search: "const d = getDashboardTheme(theme);",
            replace: "const d = getDashboardTheme(theme);\n    const t = useTranslations('advertiser.dashboard');\n    const tCommon = useTranslations('common');"
        },
        {
            search: "<p className={d.loaderText}>Loading dashboard...</p>",
            replace: "<p className={d.loaderText}>{tCommon('loading')}</p>"
        },
        {
            search: "Retry",
            replace: "{tCommon('retry')}"
        },
        {
            search: "<h1 className={`${d.heading} mb-2`}>Advertiser Dashboard</h1>",
            replace: "<h1 className={`${d.heading} mb-2`}>{t('title')}</h1>"
        },
        {
            search: "<p className={d.subheading}>Monitor your campaign performance and ROI</p>",
            replace: "<p className={d.subheading}>{t('subtitle')}</p>"
        },
        {
            search: "<span className=\"text-sm\">Create Campaign</span>",
            replace: "<span className=\"text-sm\">{t('createFirst')}</span>"
        },
        {
            search: "title=\"Today's Spend\"",
            replace: "title={t('todaySpent')}"
        },
        {
            search: "title=\"Active Campaigns\"",
            replace: "title={t('activeCampaigns')}"
        },
        {
            search: "title=\"Total Spent\"",
            replace: "title={t('totalSpent')}"
        },
        {
            search: "<h3 className={`text-lg font-bold mb-4 ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>Spend Trend</h3>",
            replace: "<h3 className={`text-lg font-bold mb-4 ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>{t('spendChart')}</h3>"
        },
        {
            search: "<h3 className={`text-lg font-bold mb-4 ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>Performance Overview</h3>",
            replace: "<h3 className={`text-lg font-bold mb-4 ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>{t('spendChart')}</h3>"
        },
        {
            search: "<h3 className={`text-lg font-bold mb-4 ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>Top Performing Campaigns</h3>",
            replace: "<h3 className={`text-lg font-bold mb-4 ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>{t('topCampaigns')}</h3>"
        },
        {
            search: "No data available yet",
            replace: "{tCommon('noData')}"
        },
        {
            search: "No device data yet",
            replace: "{tCommon('noData')}"
        },
        {
            search: "No geographic data yet",
            replace: "{tCommon('noData')}"
        },
        {
            search: "Data appears once impressions are recorded",
            replace: "{tCommon('noData')}"
        }
    ]
);

console.log('✅ Panel texts replaced with translation keys successfully!');
