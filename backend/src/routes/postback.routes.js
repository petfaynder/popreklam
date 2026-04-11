import express from 'express';
import { handlePostback, handleTestPostback } from '../controllers/postback.controller.js';

const router = express.Router();

// Wide-open CORS — postbacks come from any advertiser server
router.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

/**
 * GET /api/postback
 * S2S Postback receiver — compatible with Keitaro, Voluum, Binom, BeMob, RedTrack, etc.
 * Returns 1x1 GIF (industry standard response for trackers).
 */
router.get('/', handlePostback);

/**
 * GET /api/postback/test
 * Internal test conversion for the advertiser Tracking page.
 * Requires auth — called from front-end only.
 */
router.get('/test', handleTestPostback);

export default router;
