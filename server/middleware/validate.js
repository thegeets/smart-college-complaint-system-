import mongoose from 'mongoose';
import { z } from 'zod';
import { ALLOWED_CATEGORIES, ALLOWED_PROGRAMS, Complaint } from '../models/Complaint.js';

/**
 * Recursively mutate object in-place to remove NoSQL query operator injection ($where, $gt, etc.).
 * Compatible with Express 5 where req.query is a getter.
 */
export function sanitizeInPlace(obj) {
  if (!obj || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === 'object' && obj[i] !== null) {
        sanitizeInPlace(obj[i]);
      }
    }
    return;
  }

  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeInPlace(obj[key]);
    }
  }
}

/**
 * Middleware: sanitizeInputs
 * Sanitizes req.body, req.query, and req.params against NoSQL injection.
 */
export function sanitizeInputs(req, res, next) {
  if (req.body && typeof req.body === 'object') sanitizeInPlace(req.body);
  if (req.query && typeof req.query === 'object') sanitizeInPlace(req.query);
  if (req.params && typeof req.params === 'object') sanitizeInPlace(req.params);
  next();
}

/**
 * Middleware: validateComplaintSubmission
 * Validates public complaint submission payload and enforces a strict whitelist of fields.
 * Prevents mass-assignment of status, internal notes, roles, or responses.
 */
export function validateComplaintSubmission(req, res, next) {
  const {
    studentName,
    studentId,
    email,
    category,
    title,
    description,
    priority,
    program,
  } = req.body || {};

  const errors = {};

  // 1. Student Name
  if (!studentName || typeof studentName !== 'string' || studentName.trim().length < 2) {
    errors.studentName = 'Student full name is required and must be at least 2 characters.';
  } else if (studentName.trim().length > 100) {
    errors.studentName = 'Student name cannot exceed 100 characters.';
  }

  // 2. Student ID
  if (!studentId || typeof studentId !== 'string' || studentId.trim().length < 1) {
    errors.studentId = 'Student ID or roll number is required.';
  } else if (studentId.trim().length > 50) {
    errors.studentId = 'Student ID cannot exceed 50 characters.';
  }

  // 3. Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    errors.email = 'A valid email address is required.';
  } else if (email.trim().length > 120) {
    errors.email = 'Email address cannot exceed 120 characters.';
  }

  // 4. Academic Program: Soch College of IT exclusively offers BSc CSIT
  if (program !== undefined && program !== null && String(program).trim() !== '') {
    if (!ALLOWED_PROGRAMS.includes(String(program).trim())) {
      errors.program = `Unsupported academic program "${program}". Soch College of IT offers only BSc CSIT.`;
    }
  }

  // 5. Category
  if (!category || !ALLOWED_CATEGORIES.includes(category.trim())) {
    errors.category = `Please select a valid IT category. Allowed: ${ALLOWED_CATEGORIES.join(', ')}`;
  }

  // 6. Title
  if (!title || typeof title !== 'string' || title.trim().length < 5) {
    errors.title = 'Complaint title is required and must be at least 5 characters.';
  } else if (title.trim().length > 150) {
    errors.title = 'Title cannot exceed 150 characters.';
  }

  // 7. Description
  if (!description || typeof description !== 'string' || description.trim().length < 15) {
    errors.description = 'Complaint description is required and must be at least 15 characters.';
  } else if (description.trim().length > 4000) {
    errors.description = 'Description cannot exceed 4000 characters.';
  }

  // 8. Priority (Optional, default Medium)
  const allowedPriorities = ['Low', 'Medium', 'High', 'Urgent'];
  const cleanPriority = priority && allowedPriorities.includes(priority) ? priority : 'Medium';

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'One or more required fields are invalid or missing.',
      errors,
    });
  }

  // Whitelisted payload only (strip any malicious/unsupported fields, enforce BSc CSIT server-side)
  req.sanitizedComplaint = {
    student: {
      name: studentName.trim(),
      studentId: studentId.trim(),
      email: email.trim().toLowerCase(),
      program: 'BSc CSIT',
    },
    program: 'BSc CSIT',
    category: category.trim(),
    title: title.trim(),
    description: description.trim(),
    priority: cleanPriority,
  };

  next();
}

/**
 * Middleware: validateTrackingInput
 */
export function validateTrackingInput(req, res, next) {
  const { reference, trackingSecret } = req.body || {};

  if (!reference || typeof reference !== 'string' || !reference.trim()) {
    return res.status(400).json({
      success: false,
      code: 'MISSING_REFERENCE',
      message: 'Complaint reference is required (e.g. CMP-2026-ABC12).',
    });
  }

  if (!trackingSecret || typeof trackingSecret !== 'string' || !trackingSecret.trim()) {
    return res.status(400).json({
      success: false,
      code: 'MISSING_TRACKING_SECRET',
      message: 'Private tracking secret is required to view this complaint.',
    });
  }

  req.trackingQuery = {
    reference: reference.trim().toUpperCase(),
    trackingSecret: trackingSecret.trim(),
  };

  next();
}

/**
 * Validate MongoDB ObjectId
 */
export function validateObjectId(paramName = 'id') {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_ID',
        message: `Invalid ID format for parameter "${paramName}".`,
      });
    }
    next();
  };
}

/**
 * Zod schema for authenticated student complaint submissions.
 */
export const complaintSubmissionZodSchema = z.object({
  category: z.enum(ALLOWED_CATEGORIES, {
    errorMap: () => ({ message: 'Please select a valid IT issue category.' }),
  }),
  title: z
    .string({ required_error: 'Complaint title is required.' })
    .trim()
    .min(5, { message: 'Title must be at least 5 characters.' })
    .max(100, { message: 'Title cannot exceed 100 characters.' }),
  description: z
    .string({ required_error: 'Complaint description is required.' })
    .trim()
    .min(20, { message: 'Description must be at least 20 characters.' })
    .max(1500, { message: 'Description cannot exceed 1500 characters.' }),
  location: z
    .string()
    .trim()
    .min(2, { message: 'Location must be at least 2 characters.' })
    .max(100, { message: 'Location cannot exceed 100 characters.' })
    .optional()
    .default('General Campus'),
  pcNumber: z
    .string()
    .trim()
    .max(30, { message: 'PC/Workstation number cannot exceed 30 characters.' })
    .optional()
    .default(''),
  priority: z
    .enum(['Low', 'Medium', 'High', 'Urgent'], {
      errorMap: () => ({ message: 'Priority must be Low, Medium, High, or Urgent.' }),
    })
    .optional()
    .default('Medium'),
});

/**
 * Middleware: validateComplaintSubmissionZod
 * Enforces Zod schema on complaint submission payloads.
 */
export function validateComplaintSubmissionZod(req, res, next) {
  const result = complaintSubmissionZodSchema.safeParse(req.body);
  if (!result.success) {
    const errors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] || 'general';
      if (!errors[field]) {
        errors[field] = issue.message;
      }
    }
    return res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed for complaint submission.',
      errors,
    });
  }

  req.validatedComplaint = result.data;
  next();
}

/**
 * Middleware: duplicateSubmissionGuard
 * Guards against double submissions (same student + title + category within 2 minutes).
 */
export async function duplicateSubmissionGuard(req, res, next) {
  try {
    const studentId = req.student?._id;
    const { title, category } = req.body || {};
    if (!studentId || !title || !category) {
      return next();
    }

    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const existing = await Complaint.findOne({
      studentId,
      category,
      title: typeof title === 'string' ? title.trim() : title,
      createdAt: { $gte: twoMinutesAgo },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        code: 'DUPLICATE_SUBMISSION',
        message: 'A complaint with this category and title was submitted in the last 2 minutes. Please check your dashboard or wait before resubmitting.',
        referenceId: existing.referenceId || existing.reference,
      });
    }

    next();
  } catch (error) {
    next(error);
  }
}
