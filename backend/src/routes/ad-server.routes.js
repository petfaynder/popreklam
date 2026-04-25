import express from 'express';
import * as adServerController from '../controllers/ad-server.controller.js';

const router = express.Router();

// 1. Serve Ad (Returns JSON with ad details)
// Access: Public (called by ad script)
router.get('/serve', adServerController.serveAd);

// 2. Track Impression (1x1 pixel)
// Access: Public (called by ad script)
router.get('/track/impression', adServerController.trackImpression);

// 3. Get Ad Script (Dynamic JS generation)
// Access: Public (embedded by publishers)
router.get('/script/:zoneId', adServerController.getAdScript);

export default router;
