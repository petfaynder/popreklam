const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'messages', 'en.json');
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// PUBLISHER NEW KEYS
enData.publisher['ad-codes'] = {
    title: "Ad Codes",
    subtitle: "Generate and manage your integration codes",
    generate: "Generate Code",
    site: "Select Site",
    format: "Ad Format",
    copy: "Copy Code",
    copied: "Copied!",
    noCodes: "No ad codes generated yet."
};
enData.publisher.analytics = {
    title: "Analytics",
    subtitle: "Deep dive into your traffic performance",
    views: "Total Views",
    clicks: "Total Clicks",
    revenue: "Total Revenue",
    ecpm: "Average eCPM",
    dateRange: "Date Range",
    export: "Export Data"
};
enData.publisher.reports = {
    title: "Reports",
    subtitle: "Downloadable reports and summaries",
    generate: "Generate Report",
    download: "Download PDF",
    noReports: "No reports available."
};
enData.publisher.statistics = {
    title: "Statistics",
    subtitle: "Real-time statistics overview",
    today: "Today",
    yesterday: "Yesterday",
    thisMonth: "This Month",
    lastMonth: "Last Month"
};

// ADVERTISER NEW KEYS
enData.advertiser.audiences = {
    title: "Audiences",
    subtitle: "Manage your target audiences and retargeting lists",
    create: "Create Audience",
    name: "Audience Name",
    size: "Estimated Size",
    noAudiences: "No audiences created yet."
};
enData.advertiser.creatives = {
    title: "Creative Library",
    subtitle: "All your In-Page Push, Popunder, and Push Notification creatives in one place",
    total: "Total Creatives",
    search: "Search by title, label, or campaign...",
    allFormats: "All Formats",
    allStatuses: "All Statuses",
    noCreatives: "No creatives found",
    adjustFilters: "Try adjusting your filters",
    firstCampaign: "Create your first campaign to add creatives",
    showing: "Showing",
    of: "of",
    creatives: "creatives",
    untitled: "Untitled Creative",
    customHtml: "Custom HTML creative",
    edit: "Edit",
    active: "Active",
    paused: "Paused",
    pending: "Pending",
    rejected: "Rejected"
};
enData.advertiser.priority = {
    title: "Priority Rules",
    subtitle: "Manage campaign priority and traffic allocation",
    create: "New Rule",
    noRules: "No priority rules configured."
};
enData.advertiser.statistics = {
    title: "Statistics",
    subtitle: "Detailed campaign performance metrics",
    dateRange: "Date Range",
    export: "Export CSV"
};
enData.advertiser.tracking = {
    title: "Tracking",
    subtitle: "Setup conversion tracking and postbacks",
    globalPostback: "Global Postback URL",
    testPostback: "Test Postback",
    save: "Save Tracking Settings"
};

fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
console.log("✅ Added missing keys to en.json");
