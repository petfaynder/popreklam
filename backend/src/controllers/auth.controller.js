import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';
import { logger } from '../utils/logger.js';
import { sendEmail } from '../services/email.service.js';

// Generate JWT token — always pass a user object with .id
export const generateToken = (user) => {
    const userId = typeof user === 'string' ? user : user.id;
    return jwt.sign(
        { userId },
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
            message: 'Registration successful.',
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                status: user.status,
                isVerified: user.isVerified
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
            // Generate a short-lived challenge token instead of exposing raw userId
            const challengePayload = `${user.id}:${Date.now()}`;
            const hmac = crypto.createHmac('sha256', process.env.JWT_SECRET)
                .update(challengePayload).digest('hex');
            const challengeToken = Buffer.from(`${challengePayload}:${hmac}`).toString('base64url');

            return res.json({
                requiresTwoFactor: true,
                challengeToken,  // Opaque token — userId is hidden
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
                balance: user.balance,
                isVerified: user.isVerified
            },
            token
        });
    } catch (error) {
        next(error);
    }
};

// Verify email via token link
export const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;
        const user = await prisma.user.findFirst({
            where: {
                verificationToken: token,
                verificationTokenExpiry: { gt: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({
                error: 'Invalid or expired verification link',
                message: 'This verification link is invalid or has expired. Please request a new one.'
            });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null,
                verificationTokenExpiry: null
            }
        });

        logger.info(`Email verified for user: ${user.email}`);

        // Redirect to the appropriate dashboard with success flag
        const dashboardPath = user.role === 'PUBLISHER' ? '/publisher' : '/advertiser';
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}${dashboardPath}?verified=1`);
    } catch (error) {
        next(error);
    }
};

// Resend verification email
export const resendVerification = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: 'Email is already verified' });
        }

        // Generate a fresh token (1 hour)
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

        await prisma.user.update({
            where: { id: user.id },
            data: { verificationToken, verificationTokenExpiry }
        });

        const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/auth/verify/${verificationToken}`;

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0d16; color: #e2e8f0;">
                <div style="text-align: center; padding: 30px 0 20px;">
                    <span style="font-size: 24px; font-weight: 700; color: #f1f5f9;">MrPop.io</span>
                </div>
                <div style="background: #111827; border: 1px solid #1e293b; border-radius: 16px; padding: 32px;">
                    <h2 style="color: #f1f5f9; margin: 0 0 12px;">Verify Your Email</h2>
                    <p style="color: #64748b; margin: 0 0 24px; line-height: 1.6;">Click the button below to verify your email address and activate your account.</p>
                    <div style="text-align: center; margin: 28px 0;">
                        <a href="${verifyUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 10px; color: #fff; font-weight: 600; text-decoration: none;">Verify My Email &rarr;</a>
                    </div>
                    <p style="color: #475569; font-size: 13px; margin: 0;">This link expires in 1 hour. If you didn't create an account, ignore this email.</p>
                </div>
            </div>
        `;

        await sendEmail(user.email, 'MrPop.io — Verify Your Email', emailHtml);
        logger.info(`Verification email resent to: ${user.email}`);

        res.json({ message: 'Verification email sent successfully' });
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
