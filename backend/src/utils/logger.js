import winston from 'winston';

import fs from 'fs';
import path from 'path';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Ensure logs directory exists to prevent Winston crash
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${stack || message}`;
});

// Create logger
export const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
        errors({ stack: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [
        // Console transport
        new winston.transports.Console({
            format: combine(
                colorize(),
                logFormat
            )
        }),
        // File transports — with rotation to prevent unbounded disk growth
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 10 * 1024 * 1024,   // 10 MB per file
            maxFiles: 5,                  // Keep 5 rotated files (50 MB max)
            tailable: true
        }),
        new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 20 * 1024 * 1024,   // 20 MB per file
            maxFiles: 10,                 // Keep 10 rotated files (200 MB max)
            tailable: true
        })
    ]
});

// If we're not in production, log to the console with colors
if (process.env.NODE_ENV !== 'production') {
    logger.debug('Logger initialized in development mode');
}
