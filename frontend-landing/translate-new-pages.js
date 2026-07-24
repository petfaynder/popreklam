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
        if (content.includes("const d = getDashboardTheme(theme);")) {
            content = content.replace(
                /const d = getDashboardTheme\(theme\);/,
                "const d = getDashboardTheme(theme);\n    " + hooks.join("\n    ")
            );
        } else if (content.includes("const d = getThemeTokens(theme);")) {
            content = content.replace(
                /const d = getThemeTokens\(theme\);/,
                "const d = getThemeTokens(theme);\n    " + hooks.join("\n    ")
            );
        }
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

// Publisher Ad Codes
translateFile(p('publisher/ad-codes/page.js'), [
    "const t = useTranslations('publisher.ad-codes');",
    "const tCommon = useTranslations('common');"
], [
    { search: ">Ad Codes<", replace: ">{t('title')}<" },
    { search: ">Generate and manage your integration codes<", replace: ">{t('subtitle')}<" },
    { search: ">Generate Code<", replace: ">{t('generate')}<" },
    { search: ">Select Site<", replace: ">{t('site')}<" },
    { search: ">Ad Format<", replace: ">{t('format')}<" },
    { search: ">Copy Code<", replace: ">{t('copy')}<" },
    { search: ">Copied!<", replace: ">{t('copied')}<" },
    { search: ">No ad codes generated yet.<", replace: ">{t('noCodes')}<" }
]);

// Publisher Analytics
translateFile(p('publisher/analytics/page.js'), [
    "const t = useTranslations('publisher.analytics');",
    "const tCommon = useTranslations('common');"
], [
    { search: ">Analytics<", replace: ">{t('title')}<" },
    { search: ">Deep dive into your traffic performance<", replace: ">{t('subtitle')}<" },
    { search: ">Total Views<", replace: ">{t('views')}<" },
    { search: ">Total Clicks<", replace: ">{t('clicks')}<" },
    { search: ">Total Revenue<", replace: ">{t('revenue')}<" },
    { search: ">Average eCPM<", replace: ">{t('ecpm')}<" },
    { search: ">Date Range<", replace: ">{t('dateRange')}<" },
    { search: ">Export Data<", replace: ">{t('export')}<" }
]);

// Publisher Reports
translateFile(p('publisher/reports/page.js'), [
    "const t = useTranslations('publisher.reports');",
    "const tCommon = useTranslations('common');"
], [
    { search: ">Reports<", replace: ">{t('title')}<" },
    { search: ">Downloadable reports and summaries<", replace: ">{t('subtitle')}<" },
    { search: ">Generate Report<", replace: ">{t('generate')}<" },
    { search: ">Download PDF<", replace: ">{t('download')}<" },
    { search: ">No reports available.<", replace: ">{t('noReports')}<" }
]);

// Publisher Statistics
translateFile(p('publisher/statistics/page.js'), [
    "const t = useTranslations('publisher.statistics');",
    "const tCommon = useTranslations('common');"
], [
    { search: ">Statistics<", replace: ">{t('title')}<" },
    { search: ">Real-time statistics overview<", replace: ">{t('subtitle')}<" },
    { search: ">Today<", replace: ">{t('today')}<" },
    { search: ">Yesterday<", replace: ">{t('yesterday')}<" },
    { search: ">This Month<", replace: ">{t('thisMonth')}<" },
    { search: ">Last Month<", replace: ">{t('lastMonth')}<" }
]);

// Advertiser Audiences
translateFile(p('advertiser/audiences/page.js'), [
    "const t = useTranslations('advertiser.audiences');",
    "const tCommon = useTranslations('common');"
], [
    { search: ">Audiences<", replace: ">{t('title')}<" },
    { search: ">Manage your target audiences and retargeting lists<", replace: ">{t('subtitle')}<" },
    { search: ">Create Audience<", replace: ">{t('create')}<" },
    { search: ">Audience Name<", replace: ">{t('name')}<" },
    { search: ">Estimated Size<", replace: ">{t('size')}<" },
    { search: ">No audiences created yet.<", replace: ">{t('noAudiences')}<" }
]);

// Advertiser Creatives
translateFile(p('advertiser/creatives/page.js'), [
    "const t = useTranslations('advertiser.creatives');",
    "const tCommon = useTranslations('common');"
], [
    { search: ">Creative Library<", replace: ">{t('title')}<" },
    { search: ">All your In-Page Push, Popunder, and Push Notification creatives in one place<", replace: ">{t('subtitle')}<" },
    { search: ">Total Creatives<", replace: ">{t('total')}<" },
    { search: "placeholder=\"Search by title, label, or campaign...\"", replace: "placeholder={t('search')}" },
    { search: ">All Formats<", replace: ">{t('allFormats')}<" },
    { search: ">All Statuses<", replace: ">{t('allStatuses')}<" },
    { search: ">No creatives found<", replace: ">{t('noCreatives')}<" },
    { search: ">Try adjusting your filters<", replace: ">{t('adjustFilters')}<" },
    { search: ">Create your first campaign to add creatives<", replace: ">{t('firstCampaign')}<" },
    { search: ">Showing <", replace: ">{t('showing')} <" },
    { search: "> of <", replace: "> {t('of')} <" },
    { search: "> creatives<", replace: "> {t('creatives')}<" },
    { search: "'Untitled Creative'", replace: "t('untitled')" },
    { search: ">Custom HTML creative<", replace: ">{t('customHtml')}<" },
    { search: ">Edit <", replace: ">{t('edit')} <" },
    { search: ">Active<", replace: ">{t('active')}<" },
    { search: ">Paused<", replace: ">{t('paused')}<" },
    { search: ">Pending<", replace: ">{t('pending')}<" },
    { search: ">Rejected<", replace: ">{t('rejected')}<" }
]);

// Advertiser Priority
translateFile(p('advertiser/priority/page.js'), [
    "const t = useTranslations('advertiser.priority');",
    "const tCommon = useTranslations('common');"
], [
    { search: ">Priority Rules<", replace: ">{t('title')}<" },
    { search: ">Manage campaign priority and traffic allocation<", replace: ">{t('subtitle')}<" },
    { search: ">New Rule<", replace: ">{t('create')}<" },
    { search: ">No priority rules configured.<", replace: ">{t('noRules')}<" }
]);

// Advertiser Statistics
translateFile(p('advertiser/statistics/page.js'), [
    "const t = useTranslations('advertiser.statistics');",
    "const tCommon = useTranslations('common');"
], [
    { search: ">Statistics<", replace: ">{t('title')}<" },
    { search: ">Detailed campaign performance metrics<", replace: ">{t('subtitle')}<" },
    { search: ">Date Range<", replace: ">{t('dateRange')}<" },
    { search: ">Export CSV<", replace: ">{t('export')}<" }
]);

// Advertiser Tracking
translateFile(p('advertiser/tracking/page.js'), [
    "const t = useTranslations('advertiser.tracking');",
    "const tCommon = useTranslations('common');"
], [
    { search: ">Tracking<", replace: ">{t('title')}<" },
    { search: ">Setup conversion tracking and postbacks<", replace: ">{t('subtitle')}<" },
    { search: ">Global Postback URL<", replace: ">{t('globalPostback')}<" },
    { search: ">Test Postback<", replace: ">{t('testPostback')}<" },
    { search: ">Save Tracking Settings<", replace: ">{t('save')}<" }
]);

console.log("All replacements executed.");
