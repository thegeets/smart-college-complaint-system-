import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from project root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const REQUIRED_IN_PROD = ['SESSION_SECRET', 'MONGODB_URI'];

export function validateEnv() {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    const missing = REQUIRED_IN_PROD.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(`[FATAL] Missing required production environment variables: ${missing.join(', ')}`);
    }

    if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
      throw new Error('[FATAL] SESSION_SECRET must be at least 32 characters in production.');
    }
  }

  // Provide safe defaults for development
  return {
    PORT: parseInt(process.env.PORT || '5000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_college_complaints',
    SESSION_SECRET: process.env.SESSION_SECRET || 'dev-only-secret-do-not-use-in-production-min-32-chars',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
    UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads/attachments',
    MAX_FILE_SIZE_BYTES: parseInt(process.env.MAX_FILE_SIZE_BYTES || '5242880', 10), // 5MB
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
    RATE_LIMIT_MAX_SUBMISSIONS: parseInt(process.env.RATE_LIMIT_MAX_SUBMISSIONS || '10', 10),
    RATE_LIMIT_MAX_TRACKING: parseInt(process.env.RATE_LIMIT_MAX_TRACKING || '30', 10),
    RATE_LIMIT_MAX_LOGINS: parseInt(process.env.RATE_LIMIT_MAX_LOGINS || '5', 10),
  };
}

export const ENV = validateEnv();
