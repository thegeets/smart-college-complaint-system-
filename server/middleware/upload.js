import multer from 'multer';
import fs from 'fs';
import { validateFileMetadata, validateFileSignature } from '../utils/fileValidator.js';
import { uploadBufferToGridFS, deleteGridFSFiles } from '../services/gridfsService.js';

// Multer in-memory storage (serverless-ready, never writes to disk)
const storage = multer.memoryStorage();

// Allowed file constraints
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB per file
const MAX_FILES_COUNT = 3;

// Multer fileFilter: checks file extension and declared MIME type against strict whitelist
const fileFilter = (req, file, cb) => {
  const metaValidation = validateFileMetadata(file.originalname, file.mimetype);
  if (!metaValidation.valid) {
    return cb(new Error(metaValidation.reason), false);
  }
  cb(null, true);
};

// Single attachment middleware for public complaint submission
export const uploadAttachment = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter,
}).single('attachment');

// Multi-attachment middleware for student/admin complaint wizard (up to 3 files total)
export const uploadComplaintAttachments = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES_COUNT,
  },
  fileFilter,
}).fields([
  { name: 'attachments', maxCount: 3 },
  { name: 'attachment', maxCount: 1 },
]);

/**
 * Middleware: verifyUploadedFileSignature
 * Inspects the actual magic bytes of each in-memory file buffer to ensure it
 * strictly matches JPG, PNG, PDF, or WEBP (rejects disguised scripts, SVGs, EXEs).
 */
export async function verifyUploadedFileSignature(req, res, next) {
  const filesToVerify = getUploadedFiles(req);

  if (filesToVerify.length === 0) {
    return next(); // Attachments are optional
  }

  for (const file of filesToVerify) {
    const result = await validateFileSignature(file.buffer);
    if (!result.valid) {
      req.file = null;
      req.files = null;
      return res.status(400).json({
        success: false,
        code: 'INVALID_FILE_SIGNATURE',
        message: result.reason,
      });
    }
  }

  next();
}

/**
 * Collect all uploaded files from req (supports req.file, req.files array, or req.files object).
 *
 * @param {import('express').Request} req
 * @returns {Array<Express.Multer.File>}
 */
export function getUploadedFiles(req) {
  const files = [];
  if (req.file) {
    files.push(req.file);
  }
  if (Array.isArray(req.files)) {
    files.push(...req.files);
  } else if (req.files && typeof req.files === 'object') {
    for (const key of Object.keys(req.files)) {
      if (Array.isArray(req.files[key])) {
        files.push(...req.files[key]);
      }
    }
  }
  return files;
}

/**
 * Persist uploaded in-memory files into MongoDB GridFS.
 * Returns an array of attachment metadata objects with GridFS fileId (ObjectId).
 *
 * @param {Array<Express.Multer.File>} files
 * @returns {Promise<Array<{ fileId: import('mongoose').Types.ObjectId, originalName: string, mimetype: string, mimeType: string, size: number, filename: string, storageFilename: string, uploadedAt: Date }>>}
 */
export async function persistFilesToGridFS(files) {
  if (!Array.isArray(files) || files.length === 0) return [];
  const uploadedResults = [];

  try {
    for (const file of files) {
      const result = await uploadBufferToGridFS(file.buffer, {
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      });
      uploadedResults.push(result);
    }
    return uploadedResults;
  } catch (error) {
    // If any upload fails midway, delete all previously uploaded files from GridFS
    const fileIdsToDelete = uploadedResults.map((r) => r.fileId);
    await deleteGridFSFiles(fileIdsToDelete);
    throw error;
  }
}

/**
 * Helper to safely delete any legacy disk file (for backwards compatibility).
 */
export async function safeDeleteFile(filePath) {
  if (!filePath || typeof filePath !== 'string') return;
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (error) {
    console.warn(`[File Cleanup] Could not delete disk file: ${filePath}`, error.message);
  }
}
