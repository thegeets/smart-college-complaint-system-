import express from 'express';
import { Admin } from '../models/Admin.js';
import { requireAdminAuth } from '../middleware/auth.js';
import { verifyCsrfToken } from '../middleware/csrf.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';
import { verifyPassword, hashPassword, generateCsrfToken } from '../utils/crypto.js';

const router = express.Router();

/**
 * GET /api/v1/admin/auth/csrf
 * Returns the current CSRF token for the session.
 */
router.get('/csrf', (req, res) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCsrfToken();
  }
  res.status(200).json({
    success: true,
    csrfToken: req.session.csrfToken,
  });
});

/**
 * POST /api/v1/admin/auth/login
 * Real server-side administrative login using Argon2id and express-session.
 */
router.post('/login', loginRateLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        code: 'MISSING_CREDENTIALS',
        message: 'Email and password are required.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const admin = await Admin.findOne({ email: cleanEmail }).select('+passwordHash');

    if (!admin || !admin.isActive) {
      // Generic invalid-login message
      return res.status(401).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid administrative email or password.',
      });
    }

    const isMatch = await verifyPassword(admin.passwordHash, password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid administrative email or password.',
      });
    }

    // Regenerate session upon successful login to prevent session fixation
    req.session.regenerate((err) => {
      if (err) {
        return next(err);
      }

      req.session.adminId = admin._id;
      req.session.csrfToken = generateCsrfToken();

      // Update lastLoginAt
      admin.lastLoginAt = new Date();
      admin.save().catch(() => {});

      return res.status(200).json({
        success: true,
        message: 'Administrative login successful.',
        admin: admin.toSafeObject(),
        csrfToken: req.session.csrfToken,
      });
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/admin/auth/logout
 * Destroys administrative session and clears session cookie.
 */
router.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      res.clearCookie('sccs_admin_sid', {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
      });
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully.',
      });
    });
  } else {
    return res.status(200).json({ success: true, message: 'No active session.' });
  }
});

/**
 * GET /api/v1/admin/auth/me
 * Checks session and returns currently authenticated administrator profile.
 */
router.get('/me', requireAdminAuth, (req, res) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCsrfToken();
  }
  res.status(200).json({
    success: true,
    admin: req.admin.toSafeObject(),
    csrfToken: req.session.csrfToken,
  });
});

/**
 * PATCH /api/v1/admin/auth/password
 * Changes admin password verifying current password and invalidating prior sessions.
 */
router.patch('/password', requireAdminAuth, verifyCsrfToken, async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_FIELDS',
        message: 'Both current password and new password are required.',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        code: 'PASSWORD_TOO_SHORT',
        message: 'New password must be at least 8 characters long.',
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        code: 'PASSWORD_MISMATCH',
        message: 'New password and confirmation password do not match.',
      });
    }

    const admin = await Admin.findById(req.admin._id).select('+passwordHash');
    const isCurrentValid = await verifyPassword(admin.passwordHash, currentPassword);

    if (!isCurrentValid) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_CURRENT_PASSWORD',
        message: 'Current password is incorrect.',
      });
    }

    admin.passwordHash = await hashPassword(newPassword);
    await admin.save();

    // Regenerate session to invalidate any old session identifiers
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.adminId = admin._id;
      req.session.csrfToken = generateCsrfToken();

      return res.status(200).json({
        success: true,
        message: 'Password changed successfully. Your administrative session has been refreshed.',
        csrfToken: req.session.csrfToken,
      });
    });
  } catch (error) {
    next(error);
  }
});

export default router;
