import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Complaint } from '../models/Complaint.js';
import { Student } from '../models/Student.js';
import { Admin } from '../models/Admin.js';
import { ENV } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Controller: streamComplaintAttachment
 * Securely streams complaint attachments with strict authentication,
 * ownership isolation, path traversal prevention, and proper Content-Disposition.
 */
export async function streamComplaintAttachment(req, res, next) {
  try {
    const { id, filename } = req.params;

    // 1. Path traversal guard on filename (if filename provided)
    if (filename) {
      if (
        typeof filename !== 'string' ||
        filename.includes('..') ||
        filename.includes('/') ||
        filename.includes('\\') ||
        path.basename(filename) !== filename
      ) {
        return res.status(403).json({
          success: false,
          code: 'ACCESS_DENIED',
          message: 'Invalid filename or directory traversal attempt detected.',
        });
      }
    }

    // 2. Authentication check: Either active student or active admin session required
    let authenticatedStudent = null;
    let authenticatedAdmin = null;

    if (req.session?.studentId) {
      const student = await Student.findById(req.session.studentId);
      if (student && student.isActive) {
        authenticatedStudent = student;
      }
    }

    if (req.session?.adminId) {
      const admin = await Admin.findById(req.session.adminId);
      if (admin && admin.isActive) {
        authenticatedAdmin = admin;
      }
    }

    if (!authenticatedStudent && !authenticatedAdmin) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Authentication required to access complaint attachments.',
      });
    }

    // 3. Find complaint by _id or reference/referenceId
    const isObjectId = mongoose.isValidObjectId(id);
    const upperId = typeof id === 'string' ? id.toUpperCase() : '';
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

    // 4. Ownership verification for students:
    // Only the student who submitted or owns this complaint may view it.
    if (authenticatedStudent) {
      const isOwner =
        (complaint.studentId && complaint.studentId.equals(authenticatedStudent._id)) ||
        (complaint.student && complaint.student._id && complaint.student._id.toString() === authenticatedStudent._id.toString()) ||
        (complaint.student?.email && complaint.student.email.toLowerCase() === authenticatedStudent.email.toLowerCase()) ||
        (complaint.student?.studentId && complaint.student.studentId === authenticatedStudent.studentId);

      if (!isOwner) {
        return res.status(404).json({
          success: false,
          code: 'COMPLAINT_NOT_FOUND',
          message: 'Complaint not found.',
        });
      }
    }

    // 5. Match attachment in attachments array or legacy attachment field
    const allAttachments = [
      ...(Array.isArray(complaint.attachments) ? complaint.attachments : []),
      ...(complaint.attachment ? [complaint.attachment] : []),
    ];

    let matched = null;
    if (filename) {
      matched = allAttachments.find(
        (att) => att.storageFilename === filename || att.filename === filename || att.originalName === filename
      );
    } else {
      matched = allAttachments[0] || null;
    }

    if (!matched) {
      return res.status(404).json({
        success: false,
        code: 'ATTACHMENT_NOT_FOUND',
        message: 'The requested attachment does not exist on this complaint.',
      });
    }

    // 6. Resolve absolute file path and verify it is inside allowed upload directory
    const uploadBaseDir = path.resolve(__dirname, '../../', ENV.UPLOAD_DIR);
    const candidatePath = matched.path
      ? path.resolve(matched.path)
      : path.resolve(uploadBaseDir, matched.storageFilename || matched.filename);

    const allowedUploadRoots = [
      uploadBaseDir,
      path.resolve(__dirname, '../../server/uploads'),
      path.resolve(__dirname, '../../uploads'),
    ];

    const isInsideUploadDir = allowedUploadRoots.some((dir) => candidatePath.startsWith(dir));
    if (!isInsideUploadDir) {
      return res.status(403).json({
        success: false,
        code: 'ACCESS_DENIED',
        message: 'Invalid attachment storage location.',
      });
    }

    let resolvedPath = candidatePath;
    if (!fs.existsSync(resolvedPath)) {
      // Fallback: check in uploadBaseDir by filename
      const fallback = path.resolve(uploadBaseDir, matched.storageFilename || matched.filename);
      if (fs.existsSync(fallback)) {
        resolvedPath = fallback;
      } else {
        return res.status(404).json({
          success: false,
          code: 'FILE_MISSING_ON_DISK',
          message: 'The attachment file was not found on disk.',
        });
      }
    }

    // 7. Content-Type and Content-Disposition
    const mimeType = matched.mimetype || matched.mimeType || 'application/octet-stream';
    const isImage = mimeType.startsWith('image/');
    const safeOriginalName = path.basename(matched.originalName || matched.filename || filename || 'attachment').replace(/[^\w.-]/g, '_');

    // Force attachment download if ?download=1 or ?download=true or non-image or legacy /attachment endpoint without filename
    const isDownload = req.query.download === '1' || req.query.download === 'true';
    const dispositionType = (!filename || !isImage || isDownload) ? 'attachment' : 'inline';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `${dispositionType}; filename="${safeOriginalName}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const fileStream = fs.createReadStream(resolvedPath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
}
