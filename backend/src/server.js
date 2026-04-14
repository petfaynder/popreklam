import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes.js';
import adServerRoutes from './routes/ad-server.routes.js';
import publisherRoutes from './routes/publisher.routes.js';
import advertiserRoutes from './routes/advertiser.routes.js';
import adminRoutes from './routes/admin.routes.js';
import serveRoutes from './routes/serve.routes.js';
import webhooksRoutes from './routes/webhooks.routes.js';
import { initCronJobs } from './services/cron.service.js';
import { initWebPush } from './services/vapid.service.js';
import { startPushWorker } from './services/push-delivery.service.js';
import pushRoutes from './routes/push.routes.js';
import postbackRoutes from './routes/postback.routes.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
import { maintenanceMiddleware } from './middleware/maintenance.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Cron Jobs
initCronJobs();

// Initialize Web Push (VAPID) and BullMQ Worker
// Wrapped in async to allow graceful failure if Redis is unavailable at startup
(async () => {
  try {
    await initWebPush();
    startPushWorker();
  } catch (err) {
    console.warn('⚠️  Push notification service unavailable:', err.message);
  }
})();

// ========== MIDDLEWARE ==========

// Security — configure helmet to allow cross-origin ad script loading
app.use(helmet({
  crossOriginResourcePolicy: false,   // Allow 3rd-party sites to load our ad script
  crossOriginOpenerPolicy: false,     // Allow popunder to open new windows
  contentSecurityPolicy: false,       // CSP managed per-route, not globally
}));

// CORS
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean)
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, same-server requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true
}));

// Rate limiting — 3 tiers:
//   strictLimiter : auth + admin endpoints (login, register, admin actions)
//   apiLimiter    : authenticated panel routes (publisher, advertiser)
//   adLimiter     : public ad-serving (very high volume)
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 req / 15 min — login, register, admin
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many requests, please try again in 15 minutes.' });
  }
});

// Authenticated dashboard users make ~10 parallel API calls per page navigation
// 600 / 15 min = 40 req/min — comfortable for power users, still blocks abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 600,                   // 600 req / 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many requests, please try again shortly.' });
  }
});

const adLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 3000,             // 3000 req/min per IP for ad serving
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ error: 'Ad server rate limit exceeded.' });
  }
});

// Mount webhooks BEFORE global json parsing so Stripe gets the raw body buffer
app.use('/api/webhooks', webhooksRoutes);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
}

// ========== ROUTES ==========

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', strictLimiter, maintenanceMiddleware, authRoutes);     // login/register — strict
app.use('/api/publisher', apiLimiter, maintenanceMiddleware, publisherRoutes);   // dashboard — relaxed
app.use('/api/advertiser', apiLimiter, maintenanceMiddleware, advertiserRoutes); // dashboard — relaxed
app.use('/api/admin', strictLimiter, adminRoutes);                          // admin — strict
app.use('/api/ads', adLimiter, adServerRoutes);    // Public ad serving — high limit
app.use('/api/serve', adLimiter, serveRoutes);     // Public ad serving — high limit
app.use('/api/push', apiLimiter, pushRoutes);      // Push notification endpoints
app.use('/api/postback', adLimiter, postbackRoutes); // S2S Postback — open to all advertiser servers

// Ad serving routes (no /api prefix for performance)
//app.use('/ad', adServingRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// ========== START SERVER ==========

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
  logger.info(`✅ Server is ready to accept connections`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

export default app;
