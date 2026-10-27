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

/**
 * Middleware: verifyUploadedFileSignature
 * Inspects the actual magic bytes of the saved file to ensure it matches
 * declared type and is strictly JPG, PNG, or PDF (rejects disguised SVGs, HTML, EXEs).
 */
export async function verifyUploadedFileSignature(req, res, next) {
  if (!req.file) {
    return next(); // Attachment is optional
  }

  const result = await validateFileSignature(req.file.path);
  if (!result.valid) {
    // Delete the dangerous or invalid file immediately
    await safeDeleteFile(req.file.path);
    req.file = null;
    return res.status(400).json({
      success: false,
      code: 'INVALID_FILE_SIGNATURE',
      message: result.reason,
    });
  }

  next();
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
