import express from 'express';
import path from 'path';
import fs from 'fs';
import { Complaint, ALLOWED_CATEGORIES } from '../models/Complaint.js';
import { requireStudentAuth, requireEmailVerified } from '../middleware/auth.js';
import { uploadAttachment, verifyUploadedFileSignature, safeDeleteFile } from '../middleware/upload.js';
import { submissionRateLimiter } from '../middleware/rateLimiter.js';
import { generateComplaintReference, verifyTrackingSecret } from '../utils/crypto.js';

const router = express.Router();

// All routes in this router require authenticated student session
router.use(requireStudentAuth);

/**
 * GET /api/v1/student/complaints
 * Returns all complaints filed by or claimed by the authenticated student.
 */
router.get('/', async (req, res, next) => {
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
 * POST /api/v1/student/complaints
 * Submits a new authenticated complaint for this student.
 * Requires verified email ownership.
 */
router.post(
  '/',
  requireEmailVerified,
  submissionRateLimiter,
  uploadAttachment,
  verifyUploadedFileSignature,
  async (req, res, next) => {
    let uploadedFilePath = req.file ? req.file.path : null;

    try {
      const { category, title, description, priority } = req.body;

      const errors = {};
      if (!category || !ALLOWED_CATEGORIES.includes(category)) {
        errors.category = 'Please select a valid IT issue category.';
      }
      if (!title || typeof title !== 'string' || title.trim().length < 5) {
        errors.title = 'Title must be at least 5 characters.';
      }
      if (!description || typeof description !== 'string' || description.trim().length < 15) {
        errors.description = 'Description must be at least 15 characters.';
      }

      if (Object.keys(errors).length > 0) {
        if (uploadedFilePath) await safeDeleteFile(uploadedFilePath);
        return res.status(400).json({
          success: false,
          code: 'VALIDATION_ERROR',
          errors,
        });
      }

      // Generate unique reference
      let reference;
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 5) {
        attempts++;
        const candidate = generateComplaintReference();
        const existing = await Complaint.findOne({ reference: candidate });
        if (!existing) {
          reference = candidate;
          isUnique = true;
        }
      }

      if (!reference) {
        throw new Error('Failed to allocate unique complaint reference code. Please retry.');
      }

      // Build attachment metadata if present
      let attachmentData = null;
      if (req.file) {
        attachmentData = {
          originalName: req.file.originalname,
          storageFilename: req.file.filename,
          mimeType: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
          uploadedAt: new Date(),
        };
      }

      const complaint = new Complaint({
        reference,
        studentId: req.student._id,
        student: {
          name: req.student.name,
          studentId: req.student.studentId,
          email: req.student.email,
          program: 'BSc CSIT',
        },
        program: 'BSc CSIT',
        category,
        title: title.trim(),
        description: description.trim(),
        priority: priority || 'Medium',
        status: 'Submitted',
        attachment: attachmentData,
        responses: [],
        internalNotes: [],
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

      return res.status(201).json({
        success: true,
        message: 'Complaint submitted successfully.',
        reference,
        complaint: complaint.toStudentOwnerView(),
      });
    } catch (error) {
      if (uploadedFilePath) {
        await safeDeleteFile(uploadedFilePath);
      }
      next(error);
    }
  }
);

/**
 * GET /api/v1/student/complaints/:id
 * Retrieves full details for a single complaint.
 * Strictly verifies ownership by studentId.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Search by ObjectId or reference code
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: id } : { reference: id.toUpperCase() };

    const complaint = await Complaint.findOne(query);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        code: 'COMPLAINT_NOT_FOUND',
        message: 'Complaint record not found.',
      });
    }

    // Authorization check: student can only view their own complaint
    if (!complaint.studentId || !complaint.studentId.equals(req.student._id)) {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        message: 'You are not authorized to view this complaint.',
      });
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
 * GET /api/v1/student/complaints/:id/attachment
 * Securely streams an attachment file ONLY to the owning student.
 */
router.get('/:id/attachment', async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: id } : { reference: id.toUpperCase() };

    const complaint = await Complaint.findOne(query);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        code: 'COMPLAINT_NOT_FOUND',
        message: 'Complaint not found.',
      });
    }

    // Ownership check
    if (!complaint.studentId || !complaint.studentId.equals(req.student._id)) {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        message: 'You are not authorized to access this attachment.',
      });
    }

    if (!complaint.attachment || !complaint.attachment.path) {
      return res.status(404).json({
        success: false,
        code: 'NO_ATTACHMENT',
        message: 'This complaint has no attachment file.',
      });
    }

    const resolvedPath = path.resolve(complaint.attachment.path);
    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({
        success: false,
        code: 'FILE_MISSING_ON_DISK',
        message: 'The requested attachment file is missing from the storage disk.',
      });
    }

    res.setHeader('Content-Type', complaint.attachment.mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(complaint.attachment.originalName)}"`
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const fileStream = fs.createReadStream(resolvedPath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/student/complaints/claim-legacy
 * Securely links an old guest complaint to this student's account.
 * Requires the legacy Reference ID AND private Tracking Secret to authenticate ownership.
 */
router.post('/claim-legacy', async (req, res, next) => {
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

    const complaint = await Complaint.findOne({ reference: cleanRef }).select('+trackingSecretHash');
    if (!complaint) {
      return res.status(404).json({
        success: false,
        code: 'NOT_FOUND',
        message: 'No complaint found matching the provided Reference ID.',
      });
    }

    if (complaint.studentId && complaint.studentId.equals(req.student._id)) {
      return res.status(200).json({
        success: true,
        message: 'This complaint is already linked to your student account.',
        complaint: complaint.toStudentOwnerView(),
      });
    }

    if (!complaint.trackingSecretHash) {
      return res.status(400).json({
        success: false,
        code: 'CANNOT_CLAIM',
        message: 'This complaint does not have an eligible legacy secret for automated claim. Please contact administration.',
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
