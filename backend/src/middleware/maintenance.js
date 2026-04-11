import { getSetting } from '../controllers/admin-settings.controller.js';

export const maintenanceMiddleware = async (req, res, next) => {
    try {
        // Skip maintenance mode for admin routes so admins can still login and disable it
        if (req.originalUrl.startsWith('/api/admin')) {
            return next();
        }

        const isMaintenance = await getSetting('maintenance_mode', 'false');

        if (isMaintenance === 'true' || isMaintenance === true) {
            const message = await getSetting('maintenance_message', 'We are currently undergoing scheduled maintenance. Please check back soon.');
            return res.status(503).json({
                error: 'Service Unavailable',
                message: message,
                maintenance: true
            });
        }

        next();
    } catch (error) {
        next(); // Failsafe: if DB is down, just proceed or let generic error handler catch it
    }
};
