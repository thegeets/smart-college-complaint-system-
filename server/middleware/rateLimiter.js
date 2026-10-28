import rateLimit from 'express-rate-limit';
import { ENV } from '../config/env.js';

/**
 * Rate Limiter: Public Complaint Submission
 * Prevents spam and bot flooding of new complaints.
 */
export const submissionRateLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: ENV.RATE_LIMIT_MAX_SUBMISSIONS,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    success: false,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many complaint submissions from this network. Please wait 15 minutes before submitting another issue.',
  },
});

/**
 * Rate Limiter: Private Complaint Tracking
 * Prevents brute-force guessing of reference codes or tracking secrets.
 */
export const trackingRateLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT_WINDOW_MS,
  max: ENV.RATE_LIMIT_MAX_TRACKING,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    success: false,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many tracking attempts from this network. Please wait a few minutes before trying again.',
  },
});

/**
 * Rate Limiter: Admin Login Attempts
 * Mitigates brute-force credential stuffing.
 */
export const loginRateLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT_WINDOW_MS,
  max: ENV.RATE_LIMIT_MAX_LOGINS,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    success: false,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many sign-in attempts. For security, administrative login is temporarily throttled. Please try again in 15 minutes.',
  },
});

/**
 * General API Limiter
 */
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    success: false,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many API requests from this client. Please slow down.',
  },
});
