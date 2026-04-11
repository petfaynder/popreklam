import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { validationResult } from 'express-validator';
import prisma from '../utils/db.js';
import { logger } from '../utils/logger.js';
import { sendEmail } from '../services/email.service.js';

// Generate JWT token
export const generateToken = (user) => {
    return jwt.sign(
        { userId: user.id || user },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Register
export const register = async (req, res, next) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, role, companyName, referralCode } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(409).json({
                error: 'User already exists',
                message: 'An account with this email already exists'
            });
        }

        // Resolve referrer (if referral code provided)
        let referrer = null;
        if (referralCode) {
            referrer = await prisma.user.findUnique({ where: { referralCode } });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user and related profile in a transaction
        const user = await prisma.$transaction(async (tx) => {
            // Create user
            const newUser = await tx.user.create({
                data: {
                    email,
                    passwordHash,
                    role,
                    status: 'ACTIVE', // Auto-activate for development
                    ...(referrer ? { referredBy: referrer.id } : {}),
                }
            });

            // Create publisher or advertiser profile
            if (role === 'PUBLISHER') {
                await tx.publisher.create({
                    data: {
                        userId: newUser.id,
                        companyName: companyName || null
                    }
                });
            } else if (role === 'ADVERTISER') {
                await tx.advertiser.create({
                    data: {
                        userId: newUser.id,
                        companyName: companyName || null
                    }
                });
            }

            // Create referral record if we have a valid referrer
            if (referrer) {
                // Get commission rate from settings (fallback to defaults)
                const commissionKey = role === 'PUBLISHER'
                    ? 'referral_publisher_commission'
                    : 'referral_advertiser_commission';
                const setting = await tx.systemSetting.findUnique({ where: { key: commissionKey } });
                const commissionRate = setting ? parseFloat(setting.value) : (role === 'PUBLISHER' ? 5 : 3);

                await tx.referral.create({
                    data: {
                        referrerId: referrer.id,
                        referredId: newUser.id,
                        type: role, // 'PUBLISHER' or 'ADVERTISER'
                        status: 'ACTIVE', // Active immediately since we auto-activate
                        commissionRate,
                        qualifiedAt: new Date(),
                    }
                });
            }

            return newUser;
        });

        logger.info(`New user registered: ${user.email} (${user.role})${referrer ? ` via referral from ${referrer.email}` : ''}`);

        // Generate token
        const token = generateToken(user.id);

        res.status(201).json({
            message: 'Registration successful. Please wait for account approval.',
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                status: user.status
            },
            token
        });
    } catch (error) {
        next(error);
    }
};

// Login
export const login = async (req, res, next) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, role } = req.body;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                publisher: true,
                advertiser: true
            }
        });

        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
            });
        }

        // Validate role if provided (from login form toggle)
        if (role && role !== user.role && user.role !== 'ADMIN') {
            const requestedLabel = role === 'PUBLISHER' ? 'publisher' : 'advertiser';
            return res.status(401).json({
                error: 'Invalid credentials',
                message: `No ${requestedLabel} account found with this email. Please check your account type or create a new ${requestedLabel} account.`
            });
        }

        // Check if account is active
        if (user.status === 'SUSPENDED') {
            return res.status(403).json({
                error: 'Account suspended',
                message: 'Your account has been suspended. Please contact support.'
            });
        }

        if (user.status === 'PENDING') {
            return res.status(403).json({
                error: 'Account pending',
                message: 'Your account is pending approval. Please wait for admin approval.'
            });
        }

        // ── 2FA Challenge ──────────────────────────────────────
        if (user.twoFactorEnabled) {
            // Do NOT issue a session token yet — wait for OTP verification
            return res.json({
                requiresTwoFactor: true,
                userId: user.id,  // Passed to /api/auth/2fa/verify
                message: 'Two-factor authentication required'
            });
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });

        logger.info(`User logged in: ${user.email}`);

        // Generate token
        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                status: user.status,
                balance: user.balance
            },
            token
        });
    } catch (error) {
        next(error);
    }
};

// Verify email (placeholder)
export const verifyEmail = async (req, res, next) => {
    try {
        // TODO: Implement email verification logic
        res.json({ message: 'Email verification - Coming soon' });
    } catch (error) {
        next(error);
    }
};

// Forgot password — generates a secure token, saves to DB, logs reset link
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        // Always return success to prevent email enumeration
        if (user) {
            // Generate a secure random token
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

            await prisma.user.update({
                where: { id: user.id },
                data: { resetToken, resetTokenExpiry }
            });

            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

            // Log for dev tracing
            logger.info(`[Password Reset] ${email} → ${resetUrl}`);

            // Send Real Email using DB SMTP Settings
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2>Password Reset Request</h2>
                    <p>We received a request to reset your password. Click the button below to choose a new password:</p>
                    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            `;
            await sendEmail(email, 'Password Reset Request', emailHtml);
        }

        res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    } catch (error) {
        next(error);
    }
};

// Reset password
export const resetPassword = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { token, password } = req.body;

        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gt: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({
                error: 'Invalid or expired reset token',
                message: 'Please request a new password reset link'
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        logger.error('Reset password error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get public platform settings (like theme and recaptcha)
export const getPublicSettings = async (req, res) => {
    try {
        const themeSetting = await prisma.systemSetting.findUnique({ where: { key: 'global_theme' } });
        const recaptchaSetting = await prisma.systemSetting.findUnique({ where: { key: 'recaptcha_site_key' } });

        res.json({
            theme: themeSetting ? themeSetting.value : 'theme-brutalist',
            recaptcha_site_key: recaptchaSetting ? recaptchaSetting.value : ''
        });
    } catch (error) {
        res.json({
            theme: 'theme-brutalist',
            recaptcha_site_key: ''
        });
    }
};
