import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
    getPublicKey,
    subscribe,
    unsubscribe,
    trackClick,
    getPushStats,
    getPublisherPushOverview,
    getAdvertiserPushStats,
} from '../controllers/push.controller.js';

const router = express.Router();

// ── Public endpoints (no auth — called from publisher sites) ──────────────
router.get('/vapid-public-key', getPublicKey);
router.post('/subscribe', subscribe);
router.delete('/unsubscribe', unsubscribe);
router.post('/click/:deliveryId', trackClick);

// ── Publisher protected endpoints ─────────────────────────────────────────
// Per-site stats
router.get('/stats/:siteId', authenticate, getPushStats);

// All-sites overview for publisher dashboard
router.get('/publisher/overview', authenticate, getPublisherPushOverview);

// ── Advertiser protected endpoints ───────────────────────────────────────
// Push campaign analytics (all campaigns or filtered by ?campaignId=)
router.get('/advertiser/stats', authenticate, getAdvertiserPushStats);

export default router;
