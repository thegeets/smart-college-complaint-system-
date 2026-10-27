import multer from 'multer';
import { logger } from '../utils/logger.js';
import { ENV } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  // Log sanitized error
  logger.error(`${req.method} ${req.url} - Error: ${err.message}`, {
    stack: ENV.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // 1. Multer specific errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        code: 'FILE_TOO_LARGE',
        message: 'Attachment exceeds the 5 MB maximum allowed size.',
      });
    }
    return res.status(400).json({
      success: false,
      code: 'UPLOAD_ERROR',
      message: err.message,
    });
  }

  // 2. Custom validation or upload rejection
  if (
    err.message &&
    (err.message.includes('Only JPG, PNG, and PDF') ||
      err.message.includes('is not permitted') ||
      err.message.includes('MIME type') ||
      err.message.includes('File extension'))
  ) {
    return res.status(400).json({
      success: false,
      code: 'INVALID_FILE_TYPE',
      message: err.message,
    });
  }

  // 3. Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors: messages,
    });
  }

  // 4. Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      code: 'DUPLICATE_KEY',
      message: `A record with this ${field} already exists.`,
    });
  }

  // 5. Default 500 Internal Server Error
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    code: err.code || 'INTERNAL_SERVER_ERROR',
    message: statusCode === 500 && ENV.NODE_ENV === 'production'
      ? 'An unexpected error occurred on the server. Please contact Soch College IT support.'
      : err.message || 'Internal server error',
  });
}
