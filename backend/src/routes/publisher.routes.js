import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as publisherController from '../controllers/publisher.controller.js';
import * as publisherStatsController from '../controllers/publisher-stats.controller.js';
import * as publisherPaymentsController from '../controllers/publisher-payments.controller.js';
import * as publisherSettingsController from '../controllers/publisher-settings.controller.js';
import * as referralController from '../controllers/referral.controller.js';
import * as publisherAnalyticsController from '../controllers/publisher-analytics.controller.js';
import * as notificationController from '../controllers/notification.controller.js';
import * as publisherReportsController from '../controllers/publisher-reports.controller.js';

const router = express.Router();

// All routes require authentication and PUBLISHER role
router.use(authenticate);
router.use(authorize('PUBLISHER'));

// Dashboard stats
router.get('/dashboard', publisherController.getDashboard);

// Notifications
router.get('/notifications', notificationController.getNotifications);
router.post('/notifications/:id/read', notificationController.markAsRead);

// Sites management
router.get('/sites', publisherController.getSites);
router.post('/sites', publisherController.createSite);
router.put('/sites/:id', publisherController.updateSite);
router.delete('/sites/:id', publisherController.deleteSite);
router.post('/sites/:id/verify', publisherController.verifySite);
router.post('/sites/:id/verify-ads-txt', publisherController.verifyAdsTxt);

// Statistics
router.get('/stats', publisherController.getStats);
router.get('/stats/revenue-trends', publisherStatsController.getRevenueTrends);
router.get('/stats/top-pages', publisherStatsController.getTopPages);
router.get('/stats/geographic', publisherStatsController.getGeographicStats);
router.get('/stats/device-breakdown', publisherStatsController.getDeviceBreakdown);
router.get('/stats/recommendations', publisherStatsController.getYieldRecommendations);

// Real-Time Analytics Dashboard
router.get('/analytics/realtime', publisherAnalyticsController.getRealtimeDashboard);
router.get('/analytics/summary', publisherAnalyticsController.getRevenueSummary);

// Payment Methods (NEW)
router.get('/payments/methods', publisherPaymentsController.getPaymentMethods);
router.post('/payments/methods', publisherPaymentsController.addPaymentMethod);
router.put('/payments/methods/:id', publisherPaymentsController.updatePaymentMethod);
router.delete('/payments/methods/:id', publisherPaymentsController.deletePaymentMethod);

// Payments & Withdrawals (ENHANCED)
router.get('/payments/history', publisherPaymentsController.getPaymentHistory);
router.post('/payments/withdraw', publisherPaymentsController.requestWithdrawal);
router.get('/payments/invoices/:id/download', publisherPaymentsController.downloadInvoice);
router.post('/payments/:id/cancel', publisherPaymentsController.cancelWithdrawal);

// Stats overview
router.get('/stats/overview', publisherSettingsController.getStatsOverview);

// Settings
router.put('/settings/profile', publisherSettingsController.updateProfile);
router.put('/settings/password', publisherSettingsController.changePassword);
router.put('/settings/payment', publisherSettingsController.updatePaymentSettings);
router.post('/settings/api-token', publisherSettingsController.generateApiToken);

// Support Tickets
router.post('/support/tickets', publisherSettingsController.createSupportTicket);
router.get('/support/tickets', publisherSettingsController.getSupportTickets);
router.post('/support/tickets/:id/reply', publisherSettingsController.replyToTicket);

// Referrals
router.get('/referrals/info', referralController.getMyReferralInfo);
router.get('/referrals/stats', referralController.getReferralStats);
router.get('/referrals', referralController.getMyReferrals);

// Legacy routes (keep for backward compatibility)
router.get('/payments', publisherController.getPayments);
router.post('/withdraw', publisherController.requestWithdrawal);

// ==================== AD QUALITY REPORTS ====================
router.post('/reports', publisherReportsController.createReport);
router.get('/reports', publisherReportsController.getMyReports);

export default router;
