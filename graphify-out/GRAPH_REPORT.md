# Graph Report - .  (2026-05-05)

## Corpus Check
- Large corpus: 300 files · ~635,509 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 860 nodes · 962 edges · 175 communities (152 shown, 23 thin omitted)
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 142 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 147|Community 147]]
- [[_COMMUNITY_Community 148|Community 148]]
- [[_COMMUNITY_Community 149|Community 149]]

## God Nodes (most connected - your core abstractions)
1. `useTheme()` - 46 edges
2. `getDashboardTheme()` - 43 edges
3. `getSetting()` - 25 edges
4. `writeAudit()` - 10 edges
5. `getTierBenefits()` - 10 edges
6. `buildDateFilter()` - 9 edges
7. `loadTierConfig()` - 9 edges
8. `getAdvertiser()` - 8 edges
9. `buildFilterSQL()` - 7 edges
10. `syncAdsterraRevenue()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `generateInvoiceHTML()` --calls--> `formatMoney()`  [INFERRED]
  backend/src/services/invoice.service.js → frontend-landing/src/app/admin/users/page.js
- `ThemePageWrapper()` --calls--> `useTheme()`  [INFERRED]
  frontend-landing/src/components/ThemePageWrapper.js → frontend-landing/src/hooks/useTheme.js
- `trackImpression()` --calls--> `getSetting()`  [INFERRED]
  backend/src/controllers/ad-server.controller.js → backend/src/controllers/admin-settings.controller.js
- `triggerAdsterraSync()` --calls--> `syncAdsterraRevenue()`  [INFERRED]
  backend/src/controllers/admin-adsterra.controller.js → backend/src/services/adsterra-sync.service.js
- `verifyPayment()` --calls--> `getSetting()`  [INFERRED]
  backend/src/controllers/advertiser-billing.controller.js → backend/src/controllers/admin-settings.controller.js

## Communities (175 total, 23 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (28): createCampaign(), getDashboard(), resumeCampaign(), triggerPushDelivery(), getPriorityInfo(), createSupportTicket(), authenticate(), authorize() (+20 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (25): triggerAdsterraSync(), getSetting(), createDeposit(), downloadInvoice(), validateCoupon(), validateCouponForDeposit(), verifyPayment(), downloadInvoice() (+17 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (12): AzureLogin(), AzureRegister(), BrutalistLogin(), BrutalistRegister(), EditorialLogin(), EditorialRegister(), useLoginForm(), useRegisterForm() (+4 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (11): adjustUserBalance(), adminUpdateSite(), adminVerifyAdsTxt(), adminVerifySite(), approveCampaign(), approveSite(), rejectCampaign(), rejectSite() (+3 more)

### Community 4 - "Community 4"
Cohesion: 0.1
Nodes (10): CampaignAnalyticsPage(), AdFormatSelect(), CreativesSection(), DataTable(), DateRangePicker(), StatsCard(), TargetingSection(), ReachGauge() (+2 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (11): trackImpression(), errorHandler(), initCronJobs(), getDeliveryWeight(), startPushWorker(), fetchReferral(), flushCommissions(), getBufferSize() (+3 more)

### Community 6 - "Community 6"
Cohesion: 0.1
Nodes (10): PublisherAdCodesPage(), AdvertiserBilling(), GeneralInfo(), MacroHelper(), ThemeRouter(), ZoneTargeting(), AdminConversionsPage(), useTheme() (+2 more)

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (8): verify2FALogin(), forgotPassword(), generateToken(), login(), register(), resendVerification(), createTransporter(), sendEmail()

### Community 8 - "Community 8"
Cohesion: 0.16
Nodes (11): conversionPixel(), botUaGuard(), computeFraudScore(), getIpHourlyStats(), incrementClickCounter(), incrementIpCounters(), statusFromScore(), detectBrowser() (+3 more)

### Community 9 - "Community 9"
Cohesion: 0.14
Nodes (6): AdvertiserStatistics(), AnimatedNumber(), dateToStr(), daysAgo(), PublisherStatistics(), useNotify()

### Community 10 - "Community 10"
Cohesion: 0.26
Nodes (13): getAdvertiserPushStats(), getPublicKey(), getPublisherPushOverview(), getPushInitScript(), getPushServiceWorker(), getPushStats(), parseBrowser(), parseDevice() (+5 more)

### Community 11 - "Community 11"
Cohesion: 0.19
Nodes (8): CatLabel(), cc(), CenterCard(), GridCard(), isNew(), LeftCard(), Pill(), RightCard()

### Community 12 - "Community 12"
Cohesion: 0.26
Nodes (12): createAudience(), deleteAudience(), getAdvertiser(), getAudienceDetail(), getAudiences(), getAudienceSize(), getEligibleCampaigns(), updateAudience() (+4 more)

### Community 13 - "Community 13"
Cohesion: 0.33
Nodes (10): buildDateFilter(), buildFilterSQL(), exportCSV(), getBrowserPerformance(), getCampaignPerformance(), getDevicePerformance(), getGeographicPerformance(), getInPagePushStats() (+2 more)

### Community 18 - "Community 18"
Cohesion: 0.24
Nodes (3): BlogPostClient(), catColor(), RelatedCard()

### Community 20 - "Community 20"
Cohesion: 0.31
Nodes (5): AdvertiserSupport(), PublisherSupport(), SupportPage(), TicketPanel(), timeAgo()

### Community 22 - "Community 22"
Cohesion: 0.39
Nodes (6): bulkUpdateSettings(), getSettings(), seedDefaultSettings(), toDbSetting(), updateSetting(), invalidatePriorityCache()

### Community 24 - "Community 24"
Cohesion: 0.32
Nodes (4): AdsterraStatsPage(), AdminTrafficInsightsPage(), fmt(), fmtInt()

### Community 25 - "Community 25"
Cohesion: 0.32
Nodes (4): CampaignsPage(), fmt(), fmtDate(), useIsVerified()

### Community 26 - "Community 26"
Cohesion: 0.29
Nodes (4): get404Classes(), getThemeClasses(), LocaleLayout(), NotFound()

### Community 27 - "Community 27"
Cohesion: 0.39
Nodes (4): estimateReadTime(), getPostBySlug(), normalizePost(), stripHtml()

### Community 32 - "Community 32"
Cohesion: 0.29
Nodes (3): AdvertiserSettingsPage(), PublisherSettingsPage(), Toast()

### Community 33 - "Community 33"
Cohesion: 0.38
Nodes (4): getCountriesByContinent(), getCountryByCode(), getCountryCodesByContinent(), CountrySelect()

### Community 34 - "Community 34"
Cohesion: 0.29
Nodes (3): AdvertiserReferralsPage(), PublisherReferralsPage(), StatusBadge()

### Community 43 - "Community 43"
Cohesion: 0.9
Nodes (4): main(), random(), randomDate(), randomElement()

### Community 46 - "Community 46"
Cohesion: 0.6
Nodes (4): buildGtmSnippet(), LOGO_SOURCES(), TrackerLogo(), TrackingPage()

### Community 51 - "Community 51"
Cohesion: 0.83
Nodes (3): getPathsAndValues(), main(), setValue()

## Knowledge Gaps
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSetting()` connect `Community 1` to `Community 8`, `Community 5`, `Community 22`, `Community 7`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `useTheme()` connect `Community 6` to `Community 4`, `Community 9`, `Community 15`, `Community 147`, `Community 20`, `Community 149`, `Community 148`, `Community 25`, `Community 26`, `Community 32`, `Community 33`, `Community 34`, `Community 40`, `Community 46`, `Community 55`, `Community 56`, `Community 57`, `Community 58`, `Community 72`, `Community 73`, `Community 74`, `Community 75`, `Community 76`, `Community 77`, `Community 78`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `authenticate()` connect `Community 0` to `Community 1`, `Community 10`, `Community 3`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Are the 45 inferred relationships involving `useTheme()` (e.g. with `AdminConversionsPage()` and `SystemHealthPage()`) actually correct?**
  _`useTheme()` has 45 INFERRED edges - model-reasoned connections that need verification._
- **Are the 42 inferred relationships involving `getDashboardTheme()` (e.g. with `AdminConversionsPage()` and `SystemHealthPage()`) actually correct?**
  _`getDashboardTheme()` has 42 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `getSetting()` (e.g. with `trackImpression()` and `createDeposit()`) actually correct?**
  _`getSetting()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._