import express from 'express';
import { Complaint } from '../models/Complaint.js';
import { uploadAttachment, verifyUploadedFileSignature, safeDeleteFile } from '../middleware/upload.js';
import { validateComplaintSubmission, validateTrackingInput } from '../middleware/validate.js';
import { submissionRateLimiter, trackingRateLimiter } from '../middleware/rateLimiter.js';
import {
  generateComplaintReference,
  generateTrackingSecret,
  hashTrackingSecret,
  verifyTrackingSecret,
} from '../utils/crypto.js';

const router = express.Router();

/**
 * POST /api/v1/complaints
 * Public complaint submission. Students do not need an account.
 */
router.post(
  '/',
  submissionRateLimiter,
  uploadAttachment,
  verifyUploadedFileSignature,
  validateComplaintSubmission,
  async (req, res, next) => {
    let uploadedFilePath = req.file ? req.file.path : null;

    try {
      const sanitized = req.sanitizedComplaint;

      // Generate unique reference (retry up to 3 times in rare collision event)
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
        throw new Error('Failed to allocate a unique complaint reference code. Please retry.');
      }

      // Generate high-entropy tracking secret and its Argon2id hash
      const trackingSecret = generateTrackingSecret();
      const trackingSecretHash = await hashTrackingSecret(trackingSecret);

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
        trackingSecretHash,
        student: sanitized.student,
        program: sanitized.program || 'BSc CSIT',
        category: sanitized.category,
        title: sanitized.title,
        description: sanitized.description,
        priority: sanitized.priority,
        status: 'Submitted',
        attachment: attachmentData,
        responses: [],
        internalNotes: [],
        timeline: [
          {
            action: 'Complaint Submitted',
            fromStatus: null,
            toStatus: 'Submitted',
            note: 'Complaint registered by student',
            performedBy: 'Student',
            timestamp: new Date(),
          },
        ],
      });

      await complaint.save();

      return res.status(201).json({
        success: true,
        reference: complaint.reference,
        trackingSecret, // Returned strictly once upon creation
        message: 'Complaint submitted successfully. Please store your Reference and Tracking Secret safely.',
        submittedAt: complaint.createdAt,
      });
    } catch (error) {
      // Clean up orphaned upload on any failure
      if (uploadedFilePath) {
        await safeDeleteFile(uploadedFilePath);
      }
      next(error);
    }
  }
);

/**
 * POST /api/v1/complaints/track
 * Private complaint tracking via POST body (reference + tracking secret).
 * Never exposes complaints without matching secret, nor exposes internal notes or attachments.
 */
router.post('/track', trackingRateLimiter, validateTrackingInput, async (req, res, next) => {
  try {
    const { reference, trackingSecret } = req.trackingQuery;

    const complaint = await Complaint.findOne({ reference }).select('+trackingSecretHash');

    if (!complaint) {
      // Generic error to avoid enumerating references
      return res.status(404).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'No complaint found matching the provided reference and tracking secret.',
      });
    }

    const isValidSecret = await verifyTrackingSecret(complaint.trackingSecretHash, trackingSecret);
    if (!isValidSecret) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'No complaint found matching the provided reference and tracking secret.',
      });
    }

    // Return safe student-visible projection
    return res.status(200).json({
      success: true,
      complaint: complaint.toStudentTrackingView(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
