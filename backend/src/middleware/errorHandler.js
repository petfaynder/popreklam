import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    });

    // Prisma errors
    if (err.code === 'P2002') {
        return res.status(409).json({
            error: 'Duplicate entry',
            message: 'A record with this information already exists'
        });
    }

    if (err.code === 'P2025') {
        return res.status(404).json({
            error: 'Not found',
            message: 'The requested resource was not found'
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Invalid token',
            message: 'Authentication token is invalid'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token expired',
            message: 'Authentication token has expired'
        });
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation error',
            message: err.message,
            details: err.details
        });
    }

    // Default error
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    res.status(statusCode).json({
        error: process.env.NODE_ENV === 'production' ? 'Server error' : err.name,
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
