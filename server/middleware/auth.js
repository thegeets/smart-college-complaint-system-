import { Admin } from '../models/Admin.js';

/**
 * Middleware: requireAdminAuth
 * Enforces server-side session authentication for administrative endpoints.
 * Never trusts client cookies alone; verifies session record in MongoDB session store
 * and confirms that the admin account is active in the database.
 */
export async function requireAdminAuth(req, res, next) {
  try {
    if (!req.session || !req.session.adminId) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Administrative session expired or not authenticated. Please sign in.',
      });
    }

    const admin = await Admin.findById(req.session.adminId);
    if (!admin || !admin.isActive) {
      // Invalidate invalid session
      req.session.destroy(() => {});
      return res.status(401).json({
        success: false,
        code: 'ACCOUNT_INVALID',
        message: 'The administrator account associated with this session is no longer active.',
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: 'AUTH_ERROR',
      message: 'Failed to authenticate administrative session.',
    });
  }
}
