import jwt from 'jsonwebtoken';
const JWT_ERRORS = new Set(['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError']);
import prisma from '../lib/prisma.js';
import { hasApiAccess, hasDetailedGeoReports } from '../services/priority.service.js';

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'No token provided',
                message: 'Please provide a valid authentication token'
            });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, role: true, status: true, isVerified: true }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid token', message: 'User not found' });
        }

        if (user.status !== 'ACTIVE') {
            return res.status(403).json({ error: 'Account suspended', message: 'Your account is not active' });
        }

        req.user = user;
        next();
    } catch (error) {
        // JWT-specific errors should be 401, not 500
        if (JWT_ERRORS.has(error.name)) {
            return res.status(401).json({
                error: 'Invalid token',
                message: error.name === 'TokenExpiredError'
                    ? 'Session expired. Please log in again.'
                    : 'Authentication token is invalid. Please log in again.',
            });
        }
        next(error);
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to access this resource' });
        }
        next();
    };
};

// ─── Tier-based middleware helpers ────────────────────────────────────────────

/** Resolves the advertiser record and tier for a logged-in ADVERTISER user */
async function _getAdvertiserTier(userId) {
    const adv = await prisma.advertiser.findUnique({
        where: { userId },
        select: { tier: true }
    });
    return adv?.tier || 'STARTER';
}

/**
 * Middleware: requires PRO+ tier for API access.
 * Apply to any route that should be gated behind API Access benefit.
 */
export const requireApiAccess = async (req, res, next) => {
    try {
        const tier = await _getAdvertiserTier(req.user.id);
        const allowed = await hasApiAccess(tier);
        if (!allowed) {
            return res.status(403).json({
                error: 'API_ACCESS_REQUIRED',
                message: `API access requires PRO tier or above. Your current tier is ${tier}.`,
                upgradeUrl: '/advertiser/priority',
            });
        }
        next();
    } catch (err) {
        next(err);
    }
};

/**
 * Middleware: requires ELITE+ tier for detailed geo reports.
 */
export const requireGeoReports = async (req, res, next) => {
    try {
        const tier = await _getAdvertiserTier(req.user.id);
        const allowed = await hasDetailedGeoReports(tier);
        if (!allowed) {
            return res.status(403).json({
                error: 'GEO_REPORTS_REQUIRED',
                message: `Detailed geo reports require ELITE tier or above. Your current tier is ${tier}.`,
                upgradeUrl: '/advertiser/priority',
            });
        }
        next();
    } catch (err) {
        next(err);
    }
};

/**
 * Middleware: requires the user to have verified their email.
 * Apply to routes that should be blocked for unverified accounts.
 */
export const requireVerified = (req, res, next) => {
    if (!req.user?.isVerified) {
        return res.status(403).json({
            error: 'EMAIL_NOT_VERIFIED',
            message: 'Please verify your email address to use this feature.'
        });
    }
    next();
};
