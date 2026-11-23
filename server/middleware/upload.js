import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { ENV } from '../config/env.js';
import { validateFileMetadata, validateFileSignature } from '../utils/fileValidator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists outside public directory
const absoluteUploadDir = path.resolve(__dirname, '../../', ENV.UPLOAD_DIR);
if (!fs.existsSync(absoluteUploadDir)) {
  fs.mkdirSync(absoluteUploadDir, { recursive: true });
}

// Multer disk storage with random server-generated filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, absoluteUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomHex = crypto.randomBytes(12).toString('hex');
    const safeName = `att_${Date.now()}_${randomHex}${ext}`;
    cb(null, safeName);
  },
});

// Multer fileFilter: checks extension and declared MIME
const fileFilter = (req, file, cb) => {
  const metaValidation = validateFileMetadata(file.originalname, file.mimetype);
  if (!metaValidation.valid) {
    return cb(new Error(metaValidation.reason), false);
  }
  cb(null, true);
};

export const uploadAttachment = multer({
  storage,
  limits: {
    fileSize: ENV.MAX_FILE_SIZE_BYTES, // 5 MB
    files: 1, // Max 1 file per complaint
  },
  fileFilter,
}).single('attachment');

export const uploadComplaintAttachments = multer({
  storage,
  limits: {
    fileSize: ENV.MAX_FILE_SIZE_BYTES, // 5 MB
    files: 3, // Max 3 files total
  },
  fileFilter,
}).fields([
  { name: 'attachments', maxCount: 3 },
  { name: 'attachment', maxCount: 1 },
]);

/**
 * Middleware: verifyUploadedFileSignature
 * Inspects the actual magic bytes of the saved file(s) to ensure it matches
 * declared type and is strictly JPG, PNG, PDF, or WEBP (rejects disguised SVGs, HTML, EXEs).
 */
export async function verifyUploadedFileSignature(req, res, next) {
  const filesToVerify = [];
  if (req.file) {
    filesToVerify.push(req.file);
  }
  if (Array.isArray(req.files) && req.files.length > 0) {
    filesToVerify.push(...req.files);
  } else if (req.files && typeof req.files === 'object') {
    for (const key of Object.keys(req.files)) {
      if (Array.isArray(req.files[key])) {
        filesToVerify.push(...req.files[key]);
      }
    }
  }

  if (filesToVerify.length === 0) {
    return next(); // Attachments are optional
  }

  for (const file of filesToVerify) {
    const result = await validateFileSignature(file.path);
    if (!result.valid) {
      // Delete all uploaded files on any signature error
      for (const f of filesToVerify) {
        await safeDeleteFile(f.path);
      }
      req.file = null;
      req.files = [];
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
 * Helper to collect all uploaded files from req (supports req.file, req.files array, or req.files object).
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
 * Helper to safely delete an orphaned or invalid file.
 */
export async function safeDeleteFile(filePath) {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (error) {
    console.warn(`[File Cleanup] Could not delete file: ${filePath}`, error.message);
  }
}
