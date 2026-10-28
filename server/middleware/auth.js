import { Admin } from '../models/Admin.js';
import { Student } from '../models/Student.js';

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

/**
 * Middleware: requireStudentAuth
 * Enforces server-side session authentication for student endpoints.
 * Verifies studentId in session, loads student, confirms active account.
 */
export async function requireStudentAuth(req, res, next) {
  try {
    if (!req.session || !req.session.studentId) {
      return res.status(401).json({
        success: false,
        code: 'STUDENT_UNAUTHORIZED',
        message: 'Student session expired or not authenticated. Please sign in to your student account.',
      });
    }

    const student = await Student.findById(req.session.studentId);
    if (!student || !student.isActive) {
      req.session.destroy(() => {});
      return res.status(401).json({
        success: false,
        code: 'ACCOUNT_INVALID',
        message: 'This student account is no longer active or could not be found.',
      });
    }

    req.student = student;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: 'AUTH_ERROR',
      message: 'Failed to authenticate student session.',
    });
  }
}

/**
 * Middleware: requireEmailVerified
 * Enforces that student's email address ownership has been verified.
 */
export function requireEmailVerified(req, res, next) {
  if (!req.student) {
    return res.status(401).json({
      success: false,
      code: 'STUDENT_UNAUTHORIZED',
      message: 'Authentication required.',
    });
  }

  if (!req.student.isEmailVerified) {
    return res.status(403).json({
      success: false,
      code: 'EMAIL_NOT_VERIFIED',
      message: 'Please verify your email address to submit complaints and access full student services.',
    });
  }

  next();
}
