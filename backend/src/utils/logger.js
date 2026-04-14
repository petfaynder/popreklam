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
        // File transports
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

// If we're not in production, log to the console with colors
if (process.env.NODE_ENV !== 'production') {
    logger.debug('Logger initialized in development mode');
}
