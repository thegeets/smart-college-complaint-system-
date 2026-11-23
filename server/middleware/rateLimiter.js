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
 * Rate Limiter: Admin & Student Login Attempts
 * Mitigates brute-force credential stuffing.
 * 20 attempts per 15 minutes by default for college environment.
 */
export const loginRateLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: ENV.RATE_LIMIT_MAX_LOGINS, // 20 attempts
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  skip: () => process.env.NODE_ENV === 'test' && !process.env.TEST_RATE_LIMIT,
  handler: (req, res, _next, options) => {
    res.status(options.statusCode).json({
      success: false,
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many attempts, try again later',
    });
  },
  message: {
    success: false,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many attempts, try again later',
  },
});

/**
 * Rate Limiter: Authenticated Student Complaint Submissions
 * Enforces max 5 complaint submissions per hour per student.
 */
export const studentSubmissionRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
  keyGenerator: (req) => {
    if (req.student && req.student._id) {
      return `student_${req.student._id.toString()}`;
    }
    return req.ip || '127.0.0.1';
  },
  skip: () => process.env.NODE_ENV === 'test' && !process.env.TEST_RATE_LIMIT,
  message: {
    success: false,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Submission limit reached. You can submit up to 5 complaints per hour.',
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
