import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import compression from 'compression';
import path from 'path';
import fs from 'fs';

import { ENV } from './config/env.js';
import { sanitizeInputs } from './middleware/validate.js';
import { ensureCsrfToken } from './middleware/csrf.js';
import { errorHandler } from './middleware/errorHandler.js';

import healthRouter from './routes/health.js';
import complaintsRouter from './routes/complaints.js';
import adminAuthRouter from './routes/adminAuth.js';
import adminComplaintsRouter from './routes/adminComplaints.js';
import reportsRouter from './routes/reports.js';
import studentAuthRouter from './routes/studentAuth.js';
import studentComplaintsRouter from './routes/studentComplaints.js';

export function createApp() {
  const app = express();

  // 0. Enable reverse proxy trust (Vercel / Render / Load Balancer / Cloudflare)
  // Required so req.secure, X-Forwarded-Proto, and client IP are trusted for secure cookies & rate limiting
  app.set('trust proxy', 1);

  // 1. Gzip/Brotli Compression Middleware for performance
  app.use(compression());

  // 2. Security Headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Served independently in dev or behind reverse proxy
      crossOriginResourcePolicy: { policy: 'same-site' },
    })
  );

  // 2. Explicit CORS origin (strictly no wildcard with credentials: true)
  const allowedOrigins = (ENV.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, '')); // Strip any trailing slashes

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, or same-origin)
        if (!origin) {
          return callback(null, true);
        }
        const normalizedOrigin = origin.replace(/\/+$/, '');
        if (allowedOrigins.includes(normalizedOrigin)) {
          return callback(null, true);
        }
        return callback(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
    })
  );

  // 3. Request parsing & limits (5mb to accommodate base64 student avatars)
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));
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
        secure: ENV.COOKIE_SECURE,
        sameSite: ENV.COOKIE_SAME_SITE,
        maxAge: 8 * 60 * 60 * 1000, // 8 hours
      },
    })
  );

  // 6. Ensure CSRF token is available on session
  app.use(ensureCsrfToken);

  // 7. Mount API Routes under /api/v1 and /api
  app.use('/api/v1', healthRouter);
  app.use('/api/complaints', studentComplaintsRouter);
  app.use('/api/v1/complaints', complaintsRouter);
  app.use('/api/v1/student/auth', studentAuthRouter);
  app.use('/api/v1/student/complaints', studentComplaintsRouter);
  app.use('/api/v1/admin/auth', adminAuthRouter);
  app.use('/api/v1/admin/complaints', adminComplaintsRouter);
  app.use('/api/v1/admin/reports', reportsRouter);

  // 8. Serve Vite production build with performance cache headers
  const distPath = path.resolve(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    app.use(
      express.static(distPath, {
        maxAge: '1d',
        setHeaders: (res, filePath) => {
          if (filePath.includes(`${path.sep}assets${path.sep}`) || filePath.includes('/assets/')) {
            // Immutable content-hashed assets
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          } else if (filePath.endsWith('.html')) {
            // Never cache index.html
            res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
          }
        },
      })
    );

    // React Router SPA HTML fallback for non-API GET/HEAD routes (Express 5 safe)
    app.use((req, res, next) => {
      if ((req.method !== 'GET' && req.method !== 'HEAD') || req.path.startsWith('/api')) {
        return next();
      }
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      res.sendFile(path.join(distPath, 'index.html'), (err) => {
        if (err) next(err);
      });
    });
  }

  // 9. 404 handler for unknown API routes
  app.use('/api', (req, res) => {
    res.status(404).json({
      success: false,
      code: 'ROUTE_NOT_FOUND',
      message: `API endpoint ${req.method} ${req.originalUrl} does not exist.`,
    });
  });

  // 10. Centralized Error Handling
  app.use(errorHandler);

  return app;
}
