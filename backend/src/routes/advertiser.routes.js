import express from 'express';
import { authenticate, authorize, requireApiAccess, requireGeoReports, requireVerified } from '../middleware/auth.js';
import * as advertiserController from '../controllers/advertiser.controller.js';
import * as advertiserStatsController from '../controllers/advertiser-stats.controller.js';
import * as advertiserBillingController from '../controllers/advertiser-billing.controller.js';
import * as advertiserSettingsController from '../controllers/advertiser-settings.controller.js';
import * as referralController from '../controllers/referral.controller.js';
import * as campaignAnalyticsController from '../controllers/campaign-analytics.controller.js';
import * as creativesController from '../controllers/advertiser-creatives.controller.js';
import * as priorityController from '../controllers/advertiser-priority.controller.js';
import * as audienceController from '../controllers/audience.controller.js';
import * as trackingController from '../controllers/tracking.controller.js';
import * as notificationController from '../controllers/notification.controller.js';

const router = express.Router();

// All routes require authentication and ADVERTISER role
router.use(authenticate);
router.use(authorize('ADVERTISER'));

// Dashboard stats
router.get('/dashboard', advertiserController.getDashboard);

// Notifications
router.get('/notifications', notificationController.getNotifications);
router.post('/notifications/:id/read', notificationController.markAsRead);

// Campaigns management
router.get('/campaigns', advertiserController.getCampaigns);
router.get('/campaigns/bid-recommendation', advertiserController.getBidRecommendation);
router.post('/campaigns', requireVerified, advertiserController.createCampaign);
router.put('/campaigns/:id', advertiserController.updateCampaign);
router.delete('/campaigns/:id', advertiserController.deleteCampaign);

// Statistics
router.get('/stats', advertiserController.getStats);
router.get('/stats/campaign-performance', advertiserStatsController.getCampaignPerformance);
router.get('/stats/roi-analysis', advertiserStatsController.getROIAnalysis);
router.get('/stats/geographic', advertiserStatsController.getGeographicPerformance);
router.get('/stats/device-performance', advertiserStatsController.getDevicePerformance);
router.get('/stats/zones', advertiserStatsController.getZonePerformance);
router.get('/stats/browser-performance', advertiserStatsController.getBrowserPerformance);
router.get('/stats/os-performance', advertiserStatsController.getOSPerformance);
router.get('/stats/inpage-push', advertiserStatsController.getInPagePushStats);
router.get('/stats/export-csv', advertiserStatsController.exportCSV);
router.get('/stats/filter-options', advertiserStatsController.getFilterOptions);

// Per-Campaign Analytics, Conversion Pixel & Creative A/B Management
router.get('/campaigns/:id/analytics', campaignAnalyticsController.getCampaignAnalytics);
router.get('/campaigns/:id/conversion-tag', campaignAnalyticsController.getConversionTag);

// Tracking — S2S Postback + Pixel management
router.get('/campaigns/:id/tracking', trackingController.getTrackingInfo);
router.post('/campaigns/:id/tracking/regenerate-token', trackingController.regenerateToken);
router.post('/campaigns/:id/tracking/test', trackingController.sendTestConversion);
router.get('/campaigns/:id/postback-logs', trackingController.getPostbackLogs);
router.get('/campaigns/:id/creatives', creativesController.getCreatives);
router.post('/campaigns/:id/creatives', creativesController.addCreative);
router.put('/campaigns/:id/creatives/:creativeId', creativesController.updateCreativeWeight);
router.delete('/campaigns/:id/creatives/:creativeId', creativesController.deleteCreative);

// Billing & Deposits
router.get('/billing', advertiserBillingController.getBillingOverview);
router.post('/billing/deposit', requireVerified, advertiserBillingController.createDeposit);
router.post('/billing/verify/:paymentId', advertiserBillingController.verifyPayment);
router.post('/billing/auto-recharge', requireVerified, advertiserBillingController.configureAutoRecharge);
router.get('/billing/invoices/:id/download', advertiserBillingController.downloadInvoice);
router.get('/billing/invoices', advertiserBillingController.getInvoices);
router.post('/billing/validate-coupon', advertiserBillingController.validateCoupon);

// Payment Methods
router.post('/billing/payment-methods', advertiserBillingController.addPaymentMethod);
router.delete('/billing/payment-methods/:id', advertiserBillingController.deletePaymentMethod);


// Campaign actions (pause / resume)
router.put('/campaigns/:id/pause', advertiserController.pauseCampaign);
router.put('/campaigns/:id/resume', advertiserController.resumeCampaign);

// Settings
router.get('/settings/profile', advertiserSettingsController.getProfile);
router.put('/settings/profile', advertiserSettingsController.updateProfile);
router.put('/settings/password', advertiserSettingsController.changePassword);
router.put('/settings/billing', advertiserSettingsController.updateBillingInfo);
router.post('/settings/api-token', advertiserSettingsController.generateApiToken);

// Support Tickets
router.post('/support/tickets', advertiserSettingsController.createSupportTicket);
router.get('/support/tickets', advertiserSettingsController.getSupportTickets);
router.post('/support/tickets/:id/reply', advertiserSettingsController.replyToTicket);

// Referrals
router.get('/referrals/info', referralController.getMyReferralInfo);
router.get('/referrals/stats', referralController.getReferralStats);
router.get('/referrals', referralController.getMyReferrals);

// Priority System
router.get('/priority', priorityController.getPriorityInfo);
router.get('/priority/history', priorityController.getTierHistory);

// ==================== AUDIENCES ====================
// IMPORTANT: eligible-campaigns must be before /:id to avoid route conflict
router.get('/audiences/eligible-campaigns', audienceController.getEligibleCampaigns);
router.get('/audiences', audienceController.getAudiences);
router.post('/audiences', audienceController.createAudience);
router.get('/audiences/:id', audienceController.getAudienceDetail);
router.get('/audiences/:id/size', audienceController.getAudienceSize);
router.put('/audiences/:id', audienceController.updateAudience);
router.delete('/audiences/:id', audienceController.deleteAudience);


export default router;
