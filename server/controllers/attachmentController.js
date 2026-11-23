import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { Complaint } from '../models/Complaint.js';
import { Student } from '../models/Student.js';
import { Admin } from '../models/Admin.js';
import { openGridFSDownloadStream, getGridFSFileDoc } from '../services/gridfsService.js';
import { ENV } from '../config/env.js';

/**
 * Controller: streamComplaintAttachment
 * Securely streams complaint attachments from MongoDB GridFS (or legacy disk fallback)
 * with strict authentication, ownership isolation, path traversal guards,
 * and standard security headers.
 */
export async function streamComplaintAttachment(req, res, next) {
  try {
    const rawComplaintId = req.params.complaintId || req.params.id;
    const rawFileId = req.params.fileId || req.params.filename;

    // 1. Path traversal guard on rawFileId if string
    if (rawFileId && typeof rawFileId === 'string') {
      if (
        rawFileId.includes('..') ||
        rawFileId.includes('/') ||
        rawFileId.includes('\\')
      ) {
        return res.status(403).json({
          success: false,
          code: 'ACCESS_DENIED',
          message: 'Invalid file ID or directory traversal attempt detected.',
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

    // 4. Find complaint by _id or reference/referenceId
    const isObjectId = mongoose.isValidObjectId(rawComplaintId);
    const upperId = typeof rawComplaintId === 'string' ? rawComplaintId.toUpperCase() : '';
    const query = isObjectId
      ? { _id: rawComplaintId }
      : { $or: [{ referenceId: upperId }, { reference: upperId }] };

    const complaint = await Complaint.findOne(query);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        code: 'COMPLAINT_NOT_FOUND',
        message: 'Complaint not found.',
      });
    }

    // 5. Ownership verification for students:
    // Only the student who submitted or owns this complaint may view it.
    if (authenticatedStudent) {
      const isOwner =
        (complaint.studentId && complaint.studentId.equals(authenticatedStudent._id)) ||
        (complaint.student && complaint.student._id && complaint.student._id.toString() === authenticatedStudent._id.toString()) ||
        (complaint.student?.email && complaint.student.email.toLowerCase() === authenticatedStudent.email.toLowerCase()) ||
        (complaint.student?.studentId && complaint.student.studentId === authenticatedStudent.studentId);

      if (!isOwner) {
        // Legacy student subroute expects 404 to hide existence; general API returns 403
        const isLegacyStudentSubroute = req.baseUrl.includes('student');
        const statusCode = isLegacyStudentSubroute ? 404 : 403;
        return res.status(statusCode).json({
          success: false,
          code: isLegacyStudentSubroute ? 'COMPLAINT_NOT_FOUND' : 'FORBIDDEN',
          message: isLegacyStudentSubroute
            ? 'Complaint not found.'
            : 'Access denied. You are not authorized to view attachments for this complaint.',
        });
      }
    }

    // 6. Match attachment in attachments array or legacy attachment field
    const allAttachments = [
      ...(Array.isArray(complaint.attachments) ? complaint.attachments : []),
      ...(complaint.attachment ? [complaint.attachment] : []),
    ];

    let matched = null;
    if (rawFileId) {
      matched = allAttachments.find((att) => {
        if (!att) return false;
        if (att.fileId && String(att.fileId) === String(rawFileId)) return true;
        if (att._id && String(att._id) === String(rawFileId)) return true;
        if (att.storageFilename && att.storageFilename === rawFileId) return true;
        if (att.filename && att.filename === rawFileId) return true;
        if (att.originalName && att.originalName === rawFileId) return true;
        return false;
      });
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

    // 7. Content-Type and Content-Disposition configuration
    const mimeType = matched.mimetype || matched.mimeType || 'application/octet-stream';
    const isImage = mimeType.startsWith('image/');
    const safeOriginalName = path.basename(matched.originalName || matched.filename || rawFileId || 'attachment').replace(/[^\w.-]/g, '_');

    const isDownload = req.query.download === '1' || req.query.download === 'true';
    const dispositionType = (!rawFileId || !isImage || isDownload) ? 'attachment' : 'inline';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `${dispositionType}; filename="${safeOriginalName}"`);
    res.setHeader('Cache-Control', 'private, max-age=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // 8. Stream from MongoDB GridFS if fileId is present
    if (matched.fileId && mongoose.isValidObjectId(matched.fileId)) {
      const gridDoc = await getGridFSFileDoc(matched.fileId);
      if (!gridDoc) {
        return res.status(404).json({
          success: false,
          code: 'FILE_NOT_FOUND_IN_GRIDFS',
          message: 'The attachment file was not found in database storage.',
        });
      }

      if (gridDoc.length) {
        res.setHeader('Content-Length', gridDoc.length);
      }

      const gridStream = openGridFSDownloadStream(matched.fileId);
      gridStream.on('error', (err) => next(err));
      return gridStream.pipe(res);
    }

    // Fallback: Legacy disk storage stream if fileId is not present
    const uploadBaseDir = path.resolve(process.cwd(), ENV.UPLOAD_DIR);
    const candidatePath = matched.path
      ? path.resolve(matched.path)
      : path.resolve(uploadBaseDir, matched.storageFilename || matched.filename);

    if (fs.existsSync(candidatePath)) {
      const fileStream = fs.createReadStream(candidatePath);
      fileStream.on('error', (err) => next(err));
      return fileStream.pipe(res);
    }

    return res.status(404).json({
      success: false,
      code: 'FILE_NOT_FOUND',
      message: 'Attachment content is unavailable.',
    });
  } catch (error) {
    next(error);
  }
}
