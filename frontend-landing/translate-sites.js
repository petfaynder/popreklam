const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) {
        console.log("File not found:", filePath);
        return;
    }
    let content = fs.readFileSync(filePath, 'utf8');
    for (let r of replacements) {
        content = content.replace(r.search, r.replace);
    }
    fs.writeFileSync(filePath, content);
}

// 1. publisher/sites/page.js
replaceInFile(
    path.join(__dirname, 'src/app/[locale]/publisher/sites/page.js'),
    [
        {
            search: "import { getDashboardTheme } from '@/lib/themeUtils';",
            replace: "import { getDashboardTheme } from '@/lib/themeUtils';\nimport { useTranslations } from 'next-intl';"
        },
        {
            search: "const d = getDashboardTheme(theme);",
            replace: "const d = getDashboardTheme(theme);\n    const t = useTranslations('publisher.sites');\n    const tCommon = useTranslations('common');"
        },
        {
            search: "title=\"Delete Site?\"",
            replace: "title={tCommon('delete')}"
        },
        {
            search: "message=\"This will permanently remove the site and all associated data. This action cannot be undone.\"",
            replace: "message={t('deleteConfirm')}"
        },
        {
            search: "confirmText=\"Delete Site\"",
            replace: "confirmText={tCommon('confirm')}"
        },
        {
            search: "cancelText=\"Cancel\"",
            replace: "cancelText={tCommon('cancel')}"
        },
        {
            search: "<h1 className={`${d.heading} mb-2`}>My Sites</h1>",
            replace: "<h1 className={`${d.heading} mb-2`}>{t('title')}</h1>"
        },
        {
            search: "Add New Site",
            replace: "{t('addSite')}"
        },
        {
            search: "Add Your First Site",
            replace: "{t('addSite')}"
        },
        {
            search: "title=\"Total Sites\"",
            replace: "title={t('title')}"
        },
        {
            search: "title=\"Total Impressions\"",
            replace: "title={t('impressionsToday')}"
        },
        {
            search: "title=\"Total Revenue\"",
            replace: "title={t('earningsToday')}"
        },
        {
            search: "title=\"No sites added yet\"",
            replace: "title={t('noSites')}"
        },
        {
            search: "description=\"Add your first website to start monetizing your traffic\"",
            replace: "description=\"\""
        },
        {
            search: "<p className={d.loaderText}>Loading sites...</p>",
            replace: "<p className={d.loaderText}>{tCommon('loading')}</p>"
        },
        {
            search: "header: 'Site'",
            replace: "header: t('siteName')"
        },
        {
            search: "header: 'Category'",
            replace: "header: t('category')"
        },
        {
            search: "header: 'Status'",
            replace: "header: tCommon('status')"
        },
        {
            search: "header: 'Impressions'",
            replace: "header: t('impressionsToday')"
        },
        {
            search: "header: 'Revenue'",
            replace: "header: t('earningsToday')"
        },
        {
            search: "header: 'Added'",
            replace: "header: tCommon('date')"
        },
        {
            search: "header: 'Actions'",
            replace: "header: tCommon('actions')"
        },
        {
            search: "title=\"Add New Site\"",
            replace: "title={t('addSite')}"
        },
        {
            search: "title=\"Edit Site\"",
            replace: "title={tCommon('edit')}"
        },
        {
            search: "<label className={d.labelCls}>Website URL *</label>",
            replace: "<label className={d.labelCls}>{t('siteUrl')} *</label>"
        },
        {
            search: "<label className={d.labelCls}>Site Name *</label>",
            replace: "<label className={d.labelCls}>{t('siteName')} *</label>"
        },
        {
            search: "<label className={d.labelCls}>Category *</label>",
            replace: "<label className={d.labelCls}>{t('category')} *</label>"
        },
        {
            search: "Cancel</button>",
            replace: "{tCommon('cancel')}</button>"
        },
        {
            search: "Save Changes</button>",
            replace: "{tCommon('save')}</button>"
        },
        {
            search: "Verified</span>",
            replace: "{t('verified')}</span>"
        },
        {
            search: "Unverified</span>",
            replace: "{t('unverified')}</span>"
        }
    ]
);

console.log('✅ publisher/sites/page.js successfully localized!');
