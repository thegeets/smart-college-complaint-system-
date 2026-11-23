import mongoose from 'mongoose';
import crypto from 'crypto';
import path from 'path';

/**
 * Lazy singleton for GridFSBucket.
 * Reuses the active Mongoose connection's native Db instance.
 * Works seamlessly in serverless (e.g. Vercel) environments without opening
 * multiple connections per request.
 */
let cachedBucket = null;

export function getGridFSBucket() {
  if (!mongoose.connection || !mongoose.connection.db) {
    throw new Error('MongoDB database connection is not ready for GridFS operations.');
  }

  // If cached bucket exists and is bound to current DB instance, reuse it
  if (cachedBucket && cachedBucket.s?.db === mongoose.connection.db) {
    return cachedBucket;
  }

  cachedBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'complaintFiles',
  });

  return cachedBucket;
}

/**
 * Upload a file Buffer directly into MongoDB GridFS bucket "complaintFiles".
 * Returns metadata with the newly created ObjectId (fileId).
 *
 * @param {Buffer} buffer - File content in memory
 * @param {Object} options - File metadata
 * @param {string} options.originalName - Original uploaded filename
 * @param {string} options.mimetype - Validated MIME type
 * @param {number} options.size - File size in bytes
 * @returns {Promise<{ fileId: mongoose.Types.ObjectId, originalName: string, mimetype: string, size: number, filename: string }>}
 */
export async function uploadBufferToGridFS(buffer, { originalName, mimetype, size }) {
  const bucket = getGridFSBucket();
  const ext = path.extname(originalName || '').toLowerCase();
  const randomHex = crypto.randomBytes(12).toString('hex');
  const storageFilename = `att_${Date.now()}_${randomHex}${ext}`;

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(storageFilename, {
      contentType: mimetype,
      metadata: {
        originalName,
        mimetype,
        size,
        uploadedAt: new Date(),
      },
    });

    uploadStream.on('error', (err) => {
      reject(err);
    });

    uploadStream.on('finish', () => {
      resolve({
        fileId: uploadStream.id,
        originalName,
        mimetype,
        mimeType: mimetype,
        size,
        filename: storageFilename,
        storageFilename,
        uploadedAt: new Date(),
      });
    });

    uploadStream.end(buffer);
  });
}

/**
 * Safely delete a single file from GridFS by its fileId (ObjectId).
 * Gracefully ignores if the file was already deleted or not found.
 *
 * @param {string|mongoose.Types.ObjectId} fileId
 */
export async function deleteGridFSFile(fileId) {
  if (!fileId) return;
  try {
    const bucket = getGridFSBucket();
    const objectId = typeof fileId === 'string' ? new mongoose.Types.ObjectId(fileId) : fileId;
    await bucket.delete(objectId);
  } catch (err) {
    // Ignore 'FileNotFound' errors during idempotent cleanup
    if (err.message && (err.message.includes('FileNotFound') || err.message.includes('not found'))) {
      return;
    }
    console.warn(`[GridFS] Warning: Failed to delete file ${fileId}:`, err.message);
  }
}

/**
 * Bulk delete an array of GridFS fileIds.
 *
 * @param {Array<string|mongoose.Types.ObjectId>} fileIds
 */
export async function deleteGridFSFiles(fileIds = []) {
  if (!Array.isArray(fileIds) || fileIds.length === 0) return;
  const promises = fileIds
    .filter(Boolean)
    .map((id) => deleteGridFSFile(id));
  await Promise.allSettled(promises);
}

/**
 * Find GridFS file metadata document by fileId.
 *
 * @param {string|mongoose.Types.ObjectId} fileId
 * @returns {Promise<Object|null>}
 */
export async function getGridFSFileDoc(fileId) {
  if (!fileId || !mongoose.isValidObjectId(fileId)) return null;
  const bucket = getGridFSBucket();
  const objectId = typeof fileId === 'string' ? new mongoose.Types.ObjectId(fileId) : fileId;
  const files = await bucket.find({ _id: objectId }).toArray();
  return files.length > 0 ? files[0] : null;
}

/**
 * Open a download/readable stream from GridFS for the specified fileId.
 *
 * @param {string|mongoose.Types.ObjectId} fileId
 * @returns {import('mongodb').GridFSBucketReadStream}
 */
export function openGridFSDownloadStream(fileId) {
  const bucket = getGridFSBucket();
  const objectId = typeof fileId === 'string' ? new mongoose.Types.ObjectId(fileId) : fileId;
  return bucket.openDownloadStream(objectId);
}
