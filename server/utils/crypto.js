import crypto from 'crypto';
import argon2 from 'argon2';

/**
 * Hash a plain text password using Argon2id with secure memory and time cost parameters.
 */
export async function hashPassword(plainPassword) {
  if (!plainPassword || typeof plainPassword !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  return argon2.hash(plainPassword, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 1,
  });
}

/**
 * Verify a plain text password against an Argon2id hash.
 */
export async function verifyPassword(storedHash, plainPassword) {
  if (!storedHash || !plainPassword) return false;
  try {
    return await argon2.verify(storedHash, plainPassword);
  } catch (error) {
    return false;
  }
}

/**
 * Generate a cryptographically random, high-entropy tracking secret.
 * Format: 32 hex characters with a clean prefix for user clarity.
 */
export function generateTrackingSecret() {
  const random = crypto.randomBytes(20).toString('hex');
  return `trk_${random}`;
}

/**
 * Securely hash a tracking secret using Argon2id.
 * Only the hash is stored in the database.
 */
export async function hashTrackingSecret(secret) {
  return argon2.hash(secret, {
    type: argon2.argon2id,
    memoryCost: 32768, // 32 MB
    timeCost: 2,
    parallelism: 1,
  });
}

/**
 * Verify an entered tracking secret against the stored Argon2id hash.
 */
export async function verifyTrackingSecret(storedHash, enteredSecret) {
  if (!storedHash || !enteredSecret) return false;
  try {
    return await argon2.verify(storedHash, enteredSecret);
  } catch (error) {
    return false;
  }
}

/**
 * Generate a unique Complaint Reference ID.
 * Format: CMP-YYYY-XXXXX (e.g. CMP-2026-A8F2K)
 */
export function generateComplaintReference() {
  const year = new Date().getFullYear();
  // 5 uppercase alphanumeric chars (excluding ambiguous 0/O, 1/I)
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randStr = '';
  const bytes = crypto.randomBytes(5);
  for (let i = 0; i < 5; i++) {
    randStr += chars[bytes[i] % chars.length];
  }
  return `CMP-${year}-${randStr}`;
}

/**
 * Generate a cryptographically secure random token (e.g. for email verification and password reset)
 */
export function generateRandomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generate a 6-digit numeric verification code
 */
export function generateNumericToken() {
  const num = crypto.randomInt(100000, 999999);
  return num.toString();
}

/**
 * Generate a random CSRF token.
 */
export function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}
