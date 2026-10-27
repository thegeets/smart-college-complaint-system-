import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';

import { ENV } from './config/env.js';
import { sanitizeInputs } from './middleware/validate.js';
import { ensureCsrfToken } from './middleware/csrf.js';
import { errorHandler } from './middleware/errorHandler.js';

import healthRouter from './routes/health.js';
import complaintsRouter from './routes/complaints.js';
import adminAuthRouter from './routes/adminAuth.js';
import adminComplaintsRouter from './routes/adminComplaints.js';
import reportsRouter from './routes/reports.js';

export function createApp() {
  const app = express();

  // 1. Security Headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Served independently in dev or behind reverse proxy
      crossOriginResourcePolicy: { policy: 'same-site' },
    })
  );

  // 2. Explicit CORS origin (strictly no wildcard with credentials: true)
  const allowedOrigins = (ENV.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim());

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, or same-origin)
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
    })
  );

  // 3. Request parsing & limits
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  // 4. NoSQL injection sanitizer
  app.use(sanitizeInputs);

  // 5. Server-side session store with MongoDB
  app.use(
    session({
      name: 'sccs_admin_sid',
      secret: ENV.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: ENV.MONGODB_URI,
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60, // 14 days
        autoRemove: 'native',
      }),
      cookie: {
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 8 * 60 * 60 * 1000, // 8 hours
      },
    })
  );

  // 6. Ensure CSRF token is available on session
  app.use(ensureCsrfToken);

  // 7. Mount API Routes under /api/v1
  app.use('/api/v1', healthRouter);
  app.use('/api/v1/complaints', complaintsRouter);
  app.use('/api/v1/admin/auth', adminAuthRouter);
  app.use('/api/v1/admin/complaints', adminComplaintsRouter);
  app.use('/api/v1/admin/reports', reportsRouter);

  // 8. 404 handler for unknown API routes
  app.use('/api', (req, res) => {
    res.status(404).json({
      success: false,
      code: 'ROUTE_NOT_FOUND',
      message: `API endpoint ${req.method} ${req.originalUrl} does not exist.`,
    });
  });

  // 9. Centralized Error Handling
  app.use(errorHandler);

  return app;
}
