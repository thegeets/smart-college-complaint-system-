import { generateCsrfToken } from '../utils/crypto.js';

/**
 * Middleware: ensureCsrfToken
 * Ensures a CSRF token is attached to the current session.
 */
export function ensureCsrfToken(req, res, next) {
  if (req.session && !req.session.csrfToken) {
    req.session.csrfToken = generateCsrfToken();
  }
  next();
}

/**
 * Middleware: verifyCsrfToken
 * Validates the CSRF token on state-changing administrative requests (POST, PATCH, PUT, DELETE).
 * Compares the 'x-csrf-token' header against the token stored in the server-side session.
 */
export function verifyCsrfToken(req, res, next) {
  const method = req.method.toUpperCase();

  // Safe HTTP methods do not require CSRF token
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return next();
  }

  // Login endpoint establishes the session and is protected by credentials + rate-limiting
  if (req.path === '/login' || req.path === '/api/v1/admin/auth/login') {
    return next();
  }

  const clientToken = req.headers['x-csrf-token'] || req.body?._csrf;
  const sessionToken = req.session?.csrfToken;

  if (!sessionToken || !clientToken || clientToken !== sessionToken) {
    return res.status(403).json({
      success: false,
      code: 'CSRF_INVALID',
      message: 'Invalid or missing CSRF security token. Please refresh the page and try again.',
    });
  }

  next();
}
