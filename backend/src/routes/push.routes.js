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
    getPushServiceWorker,
    getPushInitScript,
} from '../controllers/push.controller.js';

const router = express.Router();

// ── Public endpoints (no auth — called from publisher sites) ──────────────
router.get('/vapid-public-key', getPublicKey);
router.post('/subscribe', subscribe);
router.delete('/unsubscribe', unsubscribe);
router.post('/click/:deliveryId', trackClick);

// Serve push service worker (downloaded by publishers and placed at their site root)
router.get('/pr-sw.js', getPushServiceWorker);

// Serve push init script (embedded in publisher pages <head>)
router.get('/push-init.js', getPushInitScript);

// ── Publisher protected endpoints ─────────────────────────────────────────
// Per-site stats
router.get('/stats/:siteId', authenticate, getPushStats);

// All-sites overview for publisher dashboard
router.get('/publisher/overview', authenticate, getPublisherPushOverview);

// ── Advertiser protected endpoints ───────────────────────────────────────
// Push campaign analytics (all campaigns or filtered by ?campaignId=)
router.get('/advertiser/stats', authenticate, getAdvertiserPushStats);

export default router;
