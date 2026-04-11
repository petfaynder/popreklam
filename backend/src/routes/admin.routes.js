import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as adminController from '../controllers/admin.controller.js';
import * as adminPaymentsController from '../controllers/admin-payments.controller.js';
import * as adminSupportController from '../controllers/admin-support.controller.js';
import * as adminSettingsController from '../controllers/admin-settings.controller.js';
import * as adminAnalyticsController from '../controllers/admin-analytics.controller.js';
import * as adminReferralController from '../controllers/admin-referral.controller.js';
import * as geoFloorController from '../controllers/geo-floor.controller.js';
import * as adminTrafficController from '../controllers/admin-traffic.controller.js';
import * as adminExportController from '../controllers/admin-export.controller.js';
import * as adminHealthController from '../controllers/admin-health.controller.js';
import * as adminAdsterraController from '../controllers/admin-adsterra.controller.js';
import * as adminConversionsController from '../controllers/admin-conversions.controller.js';

const router = express.Router();

// All admin routes require authentication and ADMIN role
router.use(authenticate);
router.use(authorize('ADMIN'));

// ==================== DASHBOARD ====================
router.get('/dashboard', adminController.getDashboard);
router.get('/notifications', adminController.getNotifications);

// ==================== SITES ====================
router.get('/sites', adminController.getSites);
router.post('/sites/:id/approve', adminController.approveSite);
router.post('/sites/:id/reject', adminController.rejectSite);

// ==================== CAMPAIGNS ====================
router.get('/campaigns', adminController.getCampaigns);
router.post('/campaigns/:id/approve', adminController.approveCampaign);
router.post('/campaigns/:id/reject', adminController.rejectCampaign);

// Campaigns Export
router.get('/campaigns/export/csv', adminExportController.exportCampaignsCsv);

// ==================== USER MANAGEMENT ====================
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetail);
router.put('/users/:id/status', adminController.updateUserStatus);
router.put('/users/:id/balance', adminController.adjustUserBalance);

// ==================== PAYMENTS ====================
router.get('/payments', adminPaymentsController.getPayments);
router.post('/payments/:id/approve', adminPaymentsController.approvePayment);
router.post('/payments/:id/reject', adminPaymentsController.rejectPayment);

// ==================== STATISTICS & REPORTS ====================
router.get('/stats', adminController.getStats);
router.get('/reports', adminController.getSystemReports);
router.get('/transactions', adminController.getTransactions);

// ==================== AUDIT LOG ====================
router.get('/audit', adminController.getAuditLog);

// ==================== ANALYTICS ====================
router.get('/analytics/revenue', adminAnalyticsController.getRevenueTimeline);
router.get('/analytics/top-publishers', adminAnalyticsController.getTopPublishers);
router.get('/analytics/top-advertisers', adminAnalyticsController.getTopAdvertisers);
router.get('/analytics/geo', adminAnalyticsController.getGeoBreakdown);
router.get('/analytics/formats', adminAnalyticsController.getFormatBreakdown);
router.get('/analytics/health', adminAnalyticsController.getPlatformHealth);
router.get('/analytics/export-csv', adminAnalyticsController.exportRevenueCsv);

// ==================== SUPPORT TICKETS ====================
router.get('/support/stats', adminSupportController.getTicketStats);
router.get('/support/canned-responses', adminSupportController.getCannedResponses);
router.get('/support/tickets', adminSupportController.getTickets);
router.get('/support/tickets/:id', adminSupportController.getTicket);
router.post('/support/tickets/:id/reply', adminSupportController.replyTicket);
router.post('/support/tickets/:id/note', adminSupportController.addInternalNote);
router.put('/support/tickets/:id/status', adminSupportController.updateTicketStatus);
router.put('/support/tickets/:id/priority', adminSupportController.updateTicketPriority);

// ==================== SETTINGS ====================
router.get('/settings', adminSettingsController.getSettings);
router.post('/settings/seed', adminSettingsController.seedDefaultSettings);  // ← must be before /:key routes
router.post('/settings/bulk', adminSettingsController.bulkUpdateSettings);
router.put('/settings/:key', adminSettingsController.updateSetting);
router.post('/settings/:key/reset', adminSettingsController.resetSetting);

// ==================== REFERRALS ====================
router.get('/referrals/stats', adminReferralController.getOverviewStats);
router.get('/referrals/settings', adminReferralController.getSettings);
router.put('/referrals/settings', adminReferralController.updateSettings);
router.get('/referrals', adminReferralController.getAllReferrals);
router.post('/referrals/:id/approve', adminReferralController.approveReferralBonus);

// ==================== GEO FLOORS ====================
router.get('/geo-floors', geoFloorController.getGeoFloors);
router.put('/geo-floors', geoFloorController.upsertGeoFloor);
router.post('/geo-floors/bulk', geoFloorController.bulkUpsertGeoFloors);
router.delete('/geo-floors/:countryCode/:adFormat', geoFloorController.deleteGeoFloor);

// ==================== TRAFFIC INSIGHTS ====================
router.get('/traffic/realtime', adminTrafficController.getTrafficInsights);

// ==================== SYSTEM HEALTH ====================
router.get('/health/status', adminHealthController.getSystemHealth);

// ==================== ADSTERRA BACKFILL ====================
router.get('/adsterra/stats', adminAdsterraController.getAdsterraStats);
router.post('/adsterra/sync', adminAdsterraController.triggerAdsterraSync);

// ==================== CONVERSIONS & POSTBACK LOGS ====================
router.get('/conversions/overview', adminConversionsController.getConversionOverview);
router.get('/conversions/postback-logs', adminConversionsController.getPostbackLogs);
router.delete('/conversions/test', adminConversionsController.deleteTestConversions);

export default router;
