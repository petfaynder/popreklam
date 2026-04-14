import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import prisma from '../lib/prisma.js'
import crypto from 'crypto';
const APP_NAME = 'MrPop.io';

/**
 * POST /api/auth/2fa/setup
 * Generates a TOTP secret and returns QR code (base64 PNG) + manual entry key
 * User must verify before it is activated
 */
export const setup2FA = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, twoFactorEnabled: true } });

        if (user.twoFactorEnabled) {
            return res.status(400).json({ error: '2FA is already enabled on this account.' });
        }

        // Generate a fresh TOTP secret
        const secret = speakeasy.generateSecret({
            name: `${APP_NAME} (${user.email})`,
            issuer: APP_NAME,
            length: 32
        });

        // Store the unverified secret in DB (twoFactorEnabled stays false until verified)
        await prisma.user.update({
            where: { id: userId },
            data: { twoFactorSecret: secret.base32 }
        });

        // Generate QR code as data URL
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

        res.json({
            qrCode: qrCodeUrl,
            manualKey: secret.base32,        // For users who can't scan
            otpauthUrl: secret.otpauth_url   // For debugging
        });
    } catch (error) {
        console.error('[2FA] Setup error:', error);
        res.status(500).json({ error: 'Failed to generate 2FA setup' });
    }
};

/**
 * POST /api/auth/2fa/verify-setup
 * Verify the TOTP code from the authenticator app and activate 2FA
 * Body: { token }
 */
export const verifySetup2FA = async (req, res) => {
    try {
        const userId = req.user.id;
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: 'OTP token is required' });

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { twoFactorSecret: true, twoFactorEnabled: true }
        });

        if (!user.twoFactorSecret) {
            return res.status(400).json({ error: 'No pending 2FA setup. Please run setup first.' });
        }

        // Verify with ±1 window (30-second drift tolerance)
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: String(token).replace(/\s/g, ''),
            window: 1
        });

        if (!verified) {
            return res.status(400).json({ error: 'Invalid OTP code. Please try again.' });
        }

        // Generate 8 backup codes (one-time use, SHA-256 hashed for storage)
        const plainBackupCodes = Array.from({ length: 8 }, () =>
            crypto.randomBytes(4).toString('hex').toUpperCase()
        );
        const hashedBackupCodes = plainBackupCodes.map(c => crypto.createHash('sha256').update(c).digest('hex'));

        await prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: true,
                twoFactorBackupCodes: hashedBackupCodes
            }
        });

        res.json({
            success: true,
            message: '2FA has been activated on your account.',
            backupCodes: plainBackupCodes  // Show ONCE — user must save these
        });
    } catch (error) {
        console.error('[2FA] Verify setup error:', error);
        res.status(500).json({ error: 'Failed to verify 2FA setup' });
    }
};

/**
 * POST /api/auth/2fa/disable
 * Body: { token } — current TOTP code required to disable
 */
export const disable2FA = async (req, res) => {
    try {
        const userId = req.user.id;
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: 'OTP token is required to disable 2FA' });

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { twoFactorSecret: true, twoFactorEnabled: true }
        });

        if (!user.twoFactorEnabled) {
            return res.status(400).json({ error: '2FA is not enabled on this account.' });
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: String(token).replace(/\s/g, ''),
            window: 1
        });

        if (!verified) {
            return res.status(400).json({ error: 'Invalid OTP code.' });
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null,
                twoFactorBackupCodes: null
            }
        });

        res.json({ success: true, message: '2FA has been disabled.' });
    } catch (error) {
        console.error('[2FA] Disable error:', error);
        res.status(500).json({ error: 'Failed to disable 2FA' });
    }
};

/**
 * POST /api/auth/2fa/verify
 * Used during LOGIN when 2FA is enabled
 * Body: { token, userId }
 * Returns: { sessionToken } if valid
 */
export const verify2FALogin = async (req, res) => {
    try {
        const { token, userId } = req.body;
        if (!token || !userId) return res.status(400).json({ error: 'Token and userId are required' });

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true, email: true, role: true, status: true,
                twoFactorSecret: true, twoFactorEnabled: true,
                twoFactorBackupCodes: true
            }
        });

        if (!user || !user.twoFactorEnabled) {
            return res.status(400).json({ error: 'Invalid 2FA state' });
        }

        // Check TOTP token first
        const totpValid = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: String(token).replace(/\s/g, ''),
            window: 1
        });

        if (!totpValid) {
            // Try backup codes
            const cleanToken = String(token).replace(/\s/g, '').toUpperCase();
            const hashed = crypto.createHash('sha256').update(cleanToken).digest('hex');
            const backupCodes = user.twoFactorBackupCodes || [];
            const idx = backupCodes.indexOf(hashed);

            if (idx === -1) {
                return res.status(401).json({ error: 'Invalid verification code.' });
            }

            // Remove used backup code (one-time use)
            const newBackupCodes = [...backupCodes];
            newBackupCodes.splice(idx, 1);
            await prisma.user.update({
                where: { id: userId },
                data: { twoFactorBackupCodes: newBackupCodes }
            });
        }

        // Generate JWT session
        const { generateToken } = await import('./auth.controller.js');
        const sessionToken = generateToken(user);

        // Update last login
        await prisma.user.update({ where: { id: userId }, data: { lastLogin: new Date() } });

        res.json({ success: true, token: sessionToken, user: { id: user.id, email: user.email, role: user.role, status: user.status, balance: user.balance } });
    } catch (error) {
        console.error('[2FA] Login verify error:', error);
        res.status(500).json({ error: 'Failed to verify 2FA' });
    }
};

/**
 * GET /api/auth/2fa/status
 * Returns whether 2FA is enabled for the current user
 */
export const get2FAStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { twoFactorEnabled: true, twoFactorBackupCodes: true }
        });

        const backupCodesCount = user.twoFactorBackupCodes ? (Array.isArray(user.twoFactorBackupCodes) ? user.twoFactorBackupCodes.length : 0) : 0;

        res.json({
            enabled: user.twoFactorEnabled,
            backupCodesRemaining: backupCodesCount
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get 2FA status' });
    }
};
