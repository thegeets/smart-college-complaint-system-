import fs from 'fs';
import path from 'path';

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.pdf']);

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/pjpeg',
  'image/png',
  'application/pdf',
]);

/**
 * Check magic bytes of the uploaded file to verify actual file signature.
 */
export async function validateFileSignature(filePath) {
  let fd;
  try {
    fd = await fs.promises.open(filePath, 'r');
    const buffer = Buffer.alloc(16);
    const { bytesRead } = await fd.read(buffer, 0, 16, 0);
    await fd.close();
    fd = null;

    if (bytesRead < 4) {
      return { valid: false, reason: 'File is too small to determine format.' };
    }

    // JPEG signature: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return { valid: true, detectedType: 'image/jpeg', extension: '.jpg' };
    }

    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    ) {
      return { valid: true, detectedType: 'image/png', extension: '.png' };
    }

    // PDF signature: 25 50 44 46 2D (%PDF-)
    if (
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46 &&
      buffer[4] === 0x2d
    ) {
      return { valid: true, detectedType: 'application/pdf', extension: '.pdf' };
    }

    return {
      valid: false,
      reason: 'File signature does not match allowed types (JPG, PNG, PDF only). Executables, SVGs, and scripts are strictly rejected.',
    };
  } catch (error) {
    if (fd) await fd.close().catch(() => {});
    return { valid: false, reason: `Could not inspect file signature: ${error.message}` };
  }
}

/**
 * Validate extension and declared MIME type against allowed sets.
 */
export function validateFileMetadata(filename, mimetype) {
  const ext = path.extname(filename || '').toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      reason: `File extension "${ext}" is not permitted. Only JPG, PNG, and PDF files are accepted.`,
    };
  }

  if (!ALLOWED_MIME_TYPES.has(mimetype?.toLowerCase())) {
    return {
      valid: false,
      reason: `MIME type "${mimetype}" is not permitted. Only image/jpeg, image/png, and application/pdf are accepted.`,
    };
  }

  return { valid: true, extension: ext };
}
