import express from 'express';
import path from 'path';
import fs from 'fs';
import { Complaint } from '../models/Complaint.js';
import { Admin } from '../models/Admin.js';
import { Student } from '../models/Student.js';
import { requireStudentAuth, requireEmailVerified } from '../middleware/auth.js';
import {
  uploadComplaintAttachments,
  getUploadedFiles,
  verifyUploadedFileSignature,
  safeDeleteFile,
} from '../middleware/upload.js';
import { studentSubmissionRateLimiter } from '../middleware/rateLimiter.js';
import {
  validateComplaintSubmissionZod,
  duplicateSubmissionGuard,
} from '../middleware/validate.js';
import { getNextComplaintReference } from '../models/Counter.js';
import { sendComplaintConfirmationEmail } from '../utils/emailService.js';
import { generateComplaintReference, verifyTrackingSecret } from '../utils/crypto.js';

const router = express.Router();

/**
 * Middleware: requireStudentOrAdminAuth
 * Allows either authenticated student (who will be checked for ownership)
 * or active administrator to access complaint details.
 */
async function requireStudentOrAdminAuth(req, res, next) {
  if (req.session?.studentId) {
    const student = await Student.findById(req.session.studentId);
    if (student && student.isActive) {
      req.student = student;
      return next();
    }
  }

  if (req.session?.adminId) {
    const admin = await Admin.findById(req.session.adminId);
    if (admin && admin.isActive) {
      req.admin = admin;
      return next();
    }
  }

  return res.status(401).json({
    success: false,
    code: 'UNAUTHORIZED',
    message: 'Authentication required to access complaint records.',
  });
}

/**
 * GET / (or /api/v1/student/complaints)
 * Returns all complaints filed by or claimed by the authenticated student.
 */
router.get('/', requireStudentAuth, async (req, res, next) => {
  try {
    const { status, category, search } = req.query;

    const query = { studentId: req.student._id };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { reference: { $regex: q, $options: 'i' } },
        { referenceId: { $regex: q, $options: 'i' } },
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });

    // Aggregate status counts for student dashboard
    const allStudentComplaints = await Complaint.find({ studentId: req.student._id }, 'status');
    const statusCounts = {
      all: allStudentComplaints.length,
      submitted: 0,
      underReview: 0,
      inProgress: 0,
      resolved: 0,
    };
    for (const c of allStudentComplaints) {
      if (c.status === 'Submitted') statusCounts.submitted++;
      else if (c.status === 'Under Review') statusCounts.underReview++;
      else if (c.status === 'In Progress') statusCounts.inProgress++;
      else if (c.status === 'Resolved') statusCounts.resolved++;
    }

    return res.status(200).json({
      success: true,
      total: complaints.length,
      statusCounts,
      complaints: complaints.map((c) => c.toStudentOwnerView()),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST / (or /api/complaints, /api/v1/student/complaints)
 * Submits a new authenticated complaint for this verified student.
 * Features:
 * - Rate limiting (5/hr)
 * - Multi-attachment upload (up to 3 files, max 5 MB each, JPG/PNG/PDF/WEBP)
 * - Magic byte inspection
 * - Zod schema validation
 * - Duplicate submission guard (2 min window)
 * - Atomic sequential reference ID (SCCS-YYYY-NNN)
 * - Automatic SLA computation (24h Urgent/High, 48h Medium/Low)
 * - Confirmation email dispatch (graceful fallback)
 */
router.post(
  '/',
  requireStudentAuth,
  requireEmailVerified,
  studentSubmissionRateLimiter,
  uploadComplaintAttachments,
  verifyUploadedFileSignature,
  validateComplaintSubmissionZod,
  duplicateSubmissionGuard,
  async (req, res, next) => {
    const uploadedFiles = getUploadedFiles(req);

    try {
      const { category, title, description, location, pcNumber, priority } = req.validatedComplaint;

      // 1. Reference allocation: SCCS-YYYY-NNN for /api/complaints, CMP-YYYY-XXXXX for legacy /api/v1/student/complaints
      let referenceId;
      if (req.baseUrl.includes('student')) {
        let candidate = generateComplaintReference();
        let isUnique = false;
        let attempts = 0;
        while (!isUnique && attempts < 5) {
          attempts++;
          const existing = await Complaint.findOne({ reference: candidate });
          if (!existing) {
            referenceId = candidate;
            isUnique = true;
          } else {
            candidate = generateComplaintReference();
          }
        }
        if (!referenceId) referenceId = await getNextComplaintReference();
      } else {
        referenceId = await getNextComplaintReference();
      }

      // 2. Build attachment metadata
      const attachments = uploadedFiles.map((file) => ({
        originalName: file.originalname,
        storageFilename: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        uploadedAt: new Date(),
      }));

      // 3. Compute SLA due date
      const isUrgent = priority === 'Urgent' || priority === 'High';
      const slaHours = isUrgent ? 24 : 48;
      const slaDueAt = new Date(Date.now() + slaHours * 60 * 60 * 1000);

      // 4. Create Complaint document
      const complaint = new Complaint({
        referenceId,
        reference: referenceId,
        studentId: req.student._id,
        student: {
          name: req.student.name,
          studentId: req.student.studentId,
          email: req.student.email,
          program: 'BSc CSIT',
        },
        program: 'BSc CSIT',
        category,
        title,
        description,
        location: location || 'General Campus',
        pcNumber: pcNumber || '',
        priority,
        status: 'Submitted',
        slaDueAt,
        attachments,
        attachment: attachments[0] || null,
        statusHistory: [
          {
            status: 'Submitted',
            timestamp: new Date(),
            by: req.student.name,
            changedBy: req.student.name,
            note: 'Complaint lodged by student through authenticated portal',
          },
        ],
        timeline: [
          {
            action: 'Complaint Lodged',
            fromStatus: null,
            toStatus: 'Submitted',
            note: 'Complaint registered by student through authenticated portal',
            performedBy: req.student.name,
            timestamp: new Date(),
          },
        ],
      });

      await complaint.save();

      // 5. Asynchronously dispatch confirmation email if configured
      sendComplaintConfirmationEmail({
        to: req.student.email,
        studentName: req.student.name,
        referenceId: complaint.referenceId,
        title: complaint.title,
        category: complaint.category,
        priority: complaint.priority,
        slaDueAt: complaint.slaDueAt,
      }).catch((emailErr) => {
        console.warn(`[Complaint Submission] Failed to send email confirmation: ${emailErr.message}`);
      });

      return res.status(201).json({
        success: true,
        message: 'Complaint lodged successfully.',
        referenceId: complaint.referenceId,
        reference: complaint.reference,
        slaDueAt: complaint.slaDueAt,
        complaint: complaint.toStudentOwnerView(),
      });
    } catch (error) {
      // Clean up uploaded files on error
      for (const file of uploadedFiles) {
        await safeDeleteFile(file.path);
      }
      next(error);
    }
  }
);

/**
 * GET /:id (or /api/complaints/:referenceId)
 * Retrieves full details for a single complaint.
 * Allows student owner or active administrator.
 */
router.get('/:id', requireStudentOrAdminAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const upperId = id.toUpperCase();

    const query = isObjectId
      ? { _id: id }
      : { $or: [{ referenceId: upperId }, { reference: upperId }] };

    const complaint = await Complaint.findOne(query);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        code: 'COMPLAINT_NOT_FOUND',
        message: 'Complaint record not found.',
      });
    }

    // Ownership check: if accessed by student, must match their studentId
    if (req.student) {
      if (!complaint.studentId || !complaint.studentId.equals(req.student._id)) {
        return res.status(404).json({
          success: false,
          code: 'COMPLAINT_NOT_FOUND',
          message: 'Complaint record not found.',
        });
      }
    }

    return res.status(200).json({
      success: true,
      complaint: complaint.toStudentOwnerView(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /:id/attachments/:filename
 * Securely streams an attachment file ONLY to the owning student or admin.
 */
router.get('/:id/attachments/:filename', requireStudentOrAdminAuth, async (req, res, next) => {
  try {
    const { id, filename } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const upperId = id.toUpperCase();

    const query = isObjectId
      ? { _id: id }
      : { $or: [{ referenceId: upperId }, { reference: upperId }] };

    const complaint = await Complaint.findOne(query);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        code: 'COMPLAINT_NOT_FOUND',
        message: 'Complaint not found.',
      });
    }

    if (req.student && (!complaint.studentId || !complaint.studentId.equals(req.student._id))) {
      return res.status(404).json({
        success: false,
        code: 'COMPLAINT_NOT_FOUND',
        message: 'Complaint not found.',
      });
    }

    // Find requested attachment in attachments array or legacy attachment field
    let matchedAttachment = null;
    if (Array.isArray(complaint.attachments)) {
      matchedAttachment = complaint.attachments.find(
        (att) => att.storageFilename === filename || att.originalName === filename
      );
    }
    if (!matchedAttachment && complaint.attachment) {
      if (
        complaint.attachment.storageFilename === filename ||
        complaint.attachment.originalName === filename
      ) {
        matchedAttachment = complaint.attachment;
      }
    }

    if (!matchedAttachment || !matchedAttachment.path) {
      return res.status(404).json({
        success: false,
        code: 'ATTACHMENT_NOT_FOUND',
        message: 'The requested attachment does not exist on this complaint.',
      });
    }

    const resolvedPath = path.resolve(matchedAttachment.path);
    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({
        success: false,
        code: 'FILE_MISSING_ON_DISK',
        message: 'The attachment file could not be found in storage.',
      });
    }

    res.setHeader('Content-Type', matchedAttachment.mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(matchedAttachment.originalName)}"`
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const fileStream = fs.createReadStream(resolvedPath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /:id/attachment
 * Legacy route: Securely streams the primary attachment file.
 */
router.get('/:id/attachment', requireStudentOrAdminAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const upperId = id.toUpperCase();

    const query = isObjectId
      ? { _id: id }
      : { $or: [{ referenceId: upperId }, { reference: upperId }] };

    const complaint = await Complaint.findOne(query);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        code: 'COMPLAINT_NOT_FOUND',
        message: 'Complaint not found.',
      });
    }

    if (req.student && (!complaint.studentId || !complaint.studentId.equals(req.student._id))) {
      return res.status(404).json({
        success: false,
        code: 'COMPLAINT_NOT_FOUND',
        message: 'Complaint not found.',
      });
    }

    const primaryAttachment =
      complaint.attachment || (complaint.attachments && complaint.attachments[0]);
    if (!primaryAttachment || !primaryAttachment.path) {
      return res.status(404).json({
        success: false,
        code: 'NO_ATTACHMENT',
        message: 'This complaint has no attachment file.',
      });
    }

    const resolvedPath = path.resolve(primaryAttachment.path);
    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({
        success: false,
        code: 'FILE_MISSING_ON_DISK',
        message: 'The requested attachment file is missing from the storage disk.',
      });
    }

    res.setHeader('Content-Type', primaryAttachment.mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(primaryAttachment.originalName)}"`
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const fileStream = fs.createReadStream(resolvedPath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /claim-legacy
 * Securely links an old guest complaint to this student's account.
 */
router.post('/claim-legacy', requireStudentAuth, async (req, res, next) => {
  try {
    const { reference, trackingSecret } = req.body;

    if (!reference || !trackingSecret) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_FIELDS',
        message: 'Complaint Reference ID and Private Tracking Secret are required.',
      });
    }

    const cleanRef = reference.trim().toUpperCase();
    const cleanSecret = trackingSecret.trim();

    const complaint = await Complaint.findOne({
      $or: [{ reference: cleanRef }, { referenceId: cleanRef }],
    }).select('+trackingSecretHash');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        code: 'COMPLAINT_NOT_FOUND',
        message: 'No complaint found matching this reference code and tracking secret.',
      });
    }

    if (complaint.studentId && !complaint.studentId.equals(req.student._id)) {
      return res.status(403).json({
        success: false,
        code: 'ALREADY_CLAIMED',
        message: 'This complaint has already been claimed by another student account.',
      });
    }

    const isValid = await verifyTrackingSecret(complaint.trackingSecretHash, cleanSecret);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_SECRET',
        message: 'Incorrect tracking secret. Claim request rejected.',
      });
    }

    // Link complaint to authenticated student
    complaint.studentId = req.student._id;
    complaint.student = {
      name: req.student.name,
      studentId: req.student.studentId,
      email: req.student.email,
      program: 'BSc CSIT',
    };
    complaint.timeline.push({
      action: 'Account Ownership Claimed',
      fromStatus: complaint.status,
      toStatus: complaint.status,
      note: `Claimed and linked to student account (${req.student.email})`,
      performedBy: req.student.name,
      timestamp: new Date(),
    });

    await complaint.save();

    return res.status(200).json({
      success: true,
      message: 'Complaint successfully claimed and linked to your student dashboard.',
      complaint: complaint.toStudentOwnerView(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
