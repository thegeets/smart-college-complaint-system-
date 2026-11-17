import express from 'express';
import { Student, ALLOWED_SEMESTERS } from '../models/Student.js';
import { hashPassword, verifyPassword, generateNumericToken } from '../utils/crypto.js';
import { requireStudentAuth } from '../middleware/auth.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';
import { logger } from '../utils/logger.js';
import { isEmailConfigured, sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService.js';

const router = express.Router();

/**
 * POST /api/v1/student/auth/register
 * Student self-registration (no admin approval required).
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, studentId, email, password, semester, avatar, phone } = req.body;

    const errors = {};
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.name = 'Full name must be at least 2 characters.';
    }
    if (!studentId || typeof studentId !== 'string' || studentId.trim().length < 2) {
      errors.studentId = 'Student ID or roll number is required.';
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    if (semester && !ALLOWED_SEMESTERS.includes(semester)) {
      errors.semester = 'Invalid semester selected.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        errors,
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await Student.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(409).json({
        success: false,
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'A student account with this email address already exists. Please sign in.',
      });
    }

    const isProd = process.env.NODE_ENV === 'production';
    const hasEmail = isEmailConfigured();

    if (isProd && !hasEmail) {
      return res.status(503).json({
        success: false,
        code: 'EMAIL_SERVICE_NOT_CONFIGURED',
        message: 'Automated email delivery is not configured on this server. Registration cannot dispatch verification codes. Please contact campus IT administration.',
      });
    }

    const passwordHash = await hashPassword(password);
    const verificationToken = generateNumericToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const student = new Student({
      name: name.trim(),
      studentId: studentId.trim(),
      email: cleanEmail,
      passwordHash,
      semester: semester || '1st Semester',
      program: 'BSc CSIT',
      avatar: avatar || '',
      phone: phone ? phone.trim() : '',
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    await student.save();

    let emailDelivery = null;
    if (hasEmail) {
      const sendResult = await sendVerificationEmail({
        to: cleanEmail,
        studentName: student.name,
        token: verificationToken,
      });

      if (!sendResult.success) {
        if (isProd) {
          await Student.findByIdAndDelete(student._id);
          return res.status(502).json({
            success: false,
            code: 'EMAIL_SEND_FAILED',
            message: 'Campus email service failed to accept the verification email. Please try again later or contact IT support.',
          });
        }
        logger.warn(`[Student Registration] Verification email could not be sent to ${cleanEmail}: ${sendResult.error}`);
        emailDelivery = { status: 'SEND_FAILED', error: sendResult.error };
      } else {
        emailDelivery = { status: 'ACCEPTED', messageId: sendResult.messageId };
      }
    }

    if (isProd) {
      logger.info(`[Student Registration] New student registered: ${student.email} (${student.studentId}). Verification code dispatched.`);
    } else {
      logger.info(`[Student Registration] New student registered: ${student.email} (${student.studentId}). Verification code generated.`);
    }

    const responsePayload = {
      success: true,
      message: 'Student account created successfully. Please verify your email to activate full complaint services.',
      student: student.toSafeObject(),
    };

    if (emailDelivery) {
      responsePayload.emailDelivery = emailDelivery;
    }

    // In production, NEVER expose verification tokens in API response
    if (!isProd) {
      responsePayload.verificationToken = verificationToken;
    }

    return res.status(201).json(responsePayload);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/student/auth/verify-email
 * Verifies email ownership via token.
 */
router.post('/verify-email', async (req, res, next) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_FIELDS',
        message: 'Email and verification token are required.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = token.trim();

    const student = await Student.findOne({
      email: cleanEmail,
      emailVerificationToken: cleanToken,
      emailVerificationExpires: { $gt: new Date() },
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!student) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_TOKEN',
        message: 'Verification code is invalid or has expired. Please request a new code.',
      });
    }

    student.isEmailVerified = true;
    student.emailVerificationToken = undefined;
    student.emailVerificationExpires = undefined;
    await student.save();

    // Log the student in directly upon verification
    req.session.studentId = student._id.toString();
    req.session.role = 'student';

    return res.status(200).json({
      success: true,
      message: 'Email address verified successfully. Welcome to Soch College IT Complaint Portal.',
      student: student.toSafeObject(),
      csrfToken: req.session.csrfToken,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/student/auth/resend-verification
 */
router.post('/resend-verification', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_EMAIL',
        message: 'Email address is required.',
      });
    }

    const student = await Student.findOne({ email: email.trim().toLowerCase() });
    if (!student) {
      return res.status(404).json({
        success: false,
        code: 'STUDENT_NOT_FOUND',
        message: 'No student account found with this email address.',
      });
    }

    if (student.isEmailVerified) {
      return res.status(200).json({
        success: true,
        message: 'Email is already verified. You can log in.',
        alreadyVerified: true,
      });
    }

    const isProd = process.env.NODE_ENV === 'production';
    const hasEmail = isEmailConfigured();

    if (isProd && !hasEmail) {
      return res.status(503).json({
        success: false,
        code: 'EMAIL_SERVICE_NOT_CONFIGURED',
        message: 'Automated email delivery is not configured on this server. Verification codes cannot be dispatched. Please contact campus IT administration.',
      });
    }

    const newToken = generateNumericToken();
    student.emailVerificationToken = newToken;
    student.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    let emailDelivery = null;
    if (hasEmail) {
      const sendResult = await sendVerificationEmail({
        to: student.email,
        studentName: student.name,
        token: newToken,
      });

      if (!sendResult.success) {
        if (isProd) {
          return res.status(502).json({
            success: false,
            code: 'EMAIL_SEND_FAILED',
            message: 'Campus email service failed to accept the verification email. Please try again later or contact IT support.',
          });
        }
        logger.warn(`[Resend Verification] Verification email could not be sent to ${student.email}: ${sendResult.error}`);
        emailDelivery = { status: 'SEND_FAILED', error: sendResult.error };
      } else {
        emailDelivery = { status: 'ACCEPTED', messageId: sendResult.messageId };
      }
    }

    await student.save();

    if (isProd) {
      logger.info(`[Resend Verification] Verification code dispatched to ${student.email}`);
    } else {
      logger.info(`[Resend Verification] Verification code generated for ${student.email}`);
    }

    const responsePayload = {
      success: true,
      message: 'New verification code generated and sent.',
    };

    if (emailDelivery) {
      responsePayload.emailDelivery = emailDelivery;
    }

    if (!isProd) {
      responsePayload.verificationToken = newToken;
    }

    return res.status(200).json(responsePayload);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/student/auth/login
 * Real student authentication with Argon2id and session handling.
 */
router.post('/login', loginRateLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_CREDENTIALS',
        message: 'Email and password are required.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const student = await Student.findOne({ email: cleanEmail }).select('+passwordHash');

    if (!student) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email address or password.',
      });
    }

    const isMatch = await verifyPassword(student.passwordHash, password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email address or password.',
      });
    }

    if (!student.isActive) {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_SUSPENDED',
        message: 'This student account has been deactivated. Please contact college IT administration.',
      });
    }

    // Update last login
    student.lastLoginAt = new Date();
    await student.save();

    // Establish student session
    req.session.studentId = student._id.toString();
    req.session.role = 'student';

    return res.status(200).json({
      success: true,
      message: 'Signed in successfully.',
      student: student.toSafeObject(),
      csrfToken: req.session.csrfToken,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/student/auth/logout
 */
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        code: 'LOGOUT_ERROR',
        message: 'Could not log out session cleanly.',
      });
    }
    res.clearCookie('sccs_admin_sid');
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  });
});

/**
 * GET /api/v1/student/auth/me
 * Retrieves active authenticated student profile.
 */
router.get('/me', requireStudentAuth, (req, res) => {
  return res.status(200).json({
    success: true,
    student: req.student.toSafeObject(),
    csrfToken: req.session.csrfToken,
  });
});

/**
 * PATCH / PUT /api/v1/student/auth/profile
 * Allows student to edit their profile (name, semester, avatar, phone).
 */
const updateProfileHandler = async (req, res, next) => {
  try {
    const { name, semester, avatar, phone } = req.body;

    if (name && typeof name === 'string' && name.trim().length >= 2) {
      req.student.name = name.trim();
    }
    if (semester && ALLOWED_SEMESTERS.includes(semester)) {
      req.student.semester = semester;
    }
    if (typeof avatar === 'string') {
      req.student.avatar = avatar;
    }
    if (typeof phone === 'string') {
      req.student.phone = phone.trim();
    }

    await req.student.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      student: req.student.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

router.patch('/profile', requireStudentAuth, updateProfileHandler);
router.put('/profile', requireStudentAuth, updateProfileHandler);

/**
 * POST /api/v1/student/auth/forgot-password
 */
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_EMAIL',
        message: 'Please provide your registered student email address.',
      });
    }

    const student = await Student.findOne({ email: email.trim().toLowerCase() });
    if (!student) {
      // Return ambiguous success for security
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset code has been sent.',
      });
    }

    const isProd = process.env.NODE_ENV === 'production';
    const hasEmail = isEmailConfigured();

    if (isProd && !hasEmail) {
      return res.status(503).json({
        success: false,
        code: 'EMAIL_SERVICE_NOT_CONFIGURED',
        message: 'Automated email delivery is not configured on this server. Password reset codes cannot be dispatched. Please contact campus IT administration.',
      });
    }

    const resetToken = generateNumericToken();
    student.resetPasswordToken = resetToken;
    student.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    let emailDelivery = null;
    if (hasEmail) {
      const sendResult = await sendPasswordResetEmail({
        to: student.email,
        studentName: student.name,
        token: resetToken,
      });

      if (!sendResult.success) {
        if (isProd) {
          return res.status(502).json({
            success: false,
            code: 'EMAIL_SEND_FAILED',
            message: 'Campus email service failed to accept the password reset email. Please try again later or contact IT support.',
          });
        }
        logger.warn(`[Forgot Password] Password reset email could not be sent to ${student.email}: ${sendResult.error}`);
        emailDelivery = { status: 'SEND_FAILED', error: sendResult.error };
      } else {
        emailDelivery = { status: 'ACCEPTED', messageId: sendResult.messageId };
      }
    }

    await student.save();

    if (isProd) {
      logger.info(`[Forgot Password] Reset instructions dispatched to ${student.email}`);
    } else {
      logger.info(`[Forgot Password] Reset token generated for ${student.email}`);
    }

    const responsePayload = {
      success: true,
      message: 'Password reset code generated and dispatched.',
    };

    if (emailDelivery) {
      responsePayload.emailDelivery = emailDelivery;
    }

    if (!isProd) {
      responsePayload.resetToken = resetToken;
    }

    return res.status(200).json(responsePayload);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/student/auth/reset-password
 */
router.post('/reset-password', async (req, res, next) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_FIELDS',
        message: 'Email, reset code, and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        code: 'PASSWORD_TOO_SHORT',
        message: 'New password must be at least 6 characters.',
      });
    }

    const student = await Student.findOne({
      email: email.trim().toLowerCase(),
      resetPasswordToken: token.trim(),
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!student) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_RESET_TOKEN',
        message: 'Password reset code is invalid or has expired.',
      });
    }

    student.passwordHash = await hashPassword(newPassword);
    student.resetPasswordToken = undefined;
    student.resetPasswordExpires = undefined;
    await student.save();

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now sign in with your new password.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
