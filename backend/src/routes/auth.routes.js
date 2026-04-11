import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller.js';
import { verifyRecaptcha } from '../middleware/recaptcha.js';
import { authenticate } from '../middleware/auth.js';
import * as twoFAController from '../controllers/2fa.controller.js';

const router = express.Router();

// Register
router.post('/register',
    [
        verifyRecaptcha,
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 }),
        body('role').isIn(['PUBLISHER', 'ADVERTISER'])
    ],
    authController.register
);

// Login
router.post('/login',
    [
        verifyRecaptcha,
        body('email').isEmail().normalizeEmail(),
        body('password').notEmpty()
    ],
    authController.login
);

// Verify email
router.get('/verify/:token', authController.verifyEmail);

// Forgot password
router.post('/forgot-password',
    [
        verifyRecaptcha,
        body('email').isEmail().normalizeEmail()
    ],
    authController.forgotPassword
);

// Reset password
router.post('/reset-password',
    [body('password').isLength({ min: 6 })],
    authController.resetPassword
);

// Public settings (like global platform theme)
router.get('/public-settings', authController.getPublicSettings);

// ─── 2FA Routes ────────────────────────────────────────────────
// Step 1: Generate QR code (authenticated)
router.post('/2fa/setup', authenticate, twoFAController.setup2FA);

// Step 2: Verify OTP & activate 2FA (authenticated)
router.post('/2fa/verify-setup', authenticate, twoFAController.verifySetup2FA);

// Disable 2FA (authenticated, requires current OTP)
router.post('/2fa/disable', authenticate, twoFAController.disable2FA);

// Get 2FA status (authenticated)
router.get('/2fa/status', authenticate, twoFAController.get2FAStatus);

// Login challenge: verify OTP after password check (public)
router.post('/2fa/verify', twoFAController.verify2FALogin);

export default router;
