import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from project root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const REQUIRED_IN_PROD = ['SESSION_SECRET', 'MONGODB_URI'];

/**
 * Validates MongoDB URI format defensively without logging credentials.
 * Fails fast with clear, actionable diagnostics if unreplaced templates or empty passwords are provided.
 */
export function validateMongoUri(uri) {
  if (!uri || typeof uri !== 'string') {
    throw new Error('[FATAL] MONGODB_URI must be a non-empty string.');
  }

  // Safely strip accidental copy-paste artifacts (quotes or "MONGODB_URI=" prefix)
  let trimmed = uri.trim();
  trimmed = trimmed.replace(/^["']+|["']+$/g, '').trim();
  if (trimmed.startsWith('MONGODB_URI=')) {
    console.warn('[Config] Note: Removed accidental "MONGODB_URI=" prefix from environment variable.');
    trimmed = trimmed.replace(/^MONGODB_URI=\s*/, '').replace(/^["']+|["']+$/g, '').trim();
  }

  if (!trimmed.startsWith('mongodb://') && !trimmed.startsWith('mongodb+srv://')) {
    throw new Error(
      '[FATAL] Invalid MONGODB_URI protocol. The connection string must start with "mongodb://" or "mongodb+srv://".'
    );
  }

  // Check for common unreplaced placeholder tokens from MongoDB Atlas copy-paste templates
  const placeholderPatterns = [/<password>/i, /<db_username>/i, /<username>/i, /<dbname>/i];
  for (const pattern of placeholderPatterns) {
    if (pattern.test(trimmed)) {
      throw new Error(
        `[FATAL] MONGODB_URI contains unreplaced placeholder text matching ${pattern}. Please replace with your actual MongoDB Atlas database credentials.`
      );
    }
  }

  // Check for authority part with empty password (e.g. mongodb+srv://username:@cluster...)
  const authMatch = trimmed.match(/^mongodb(?:\+srv)?:\/\/([^@]+)@/);
  if (authMatch) {
    const creds = authMatch[1];
    if (creds.includes(':')) {
      const colonIndex = creds.indexOf(':');
      const passwordPart = creds.slice(colonIndex + 1);
      if (passwordPart.length === 0) {
        throw new Error(
          '[FATAL] MONGODB_URI has an empty password after the username colon (:). Please provide your database user password in the connection string.'
        );
      }
    }
  }

  // Check for multiple unencoded '@' symbols in the authority segment
  const schemeEnd = trimmed.indexOf('://') + 3;
  const authorityAndPath = trimmed.slice(schemeEnd);
  const hostPart = authorityAndPath.split('/')[0] || '';
  const atCount = (hostPart.match(/@/g) || []).length;
  if (atCount > 1) {
    throw new Error(
      '[FATAL] MONGODB_URI contains multiple "@" symbols before the host. If your password contains "@", please URL-encode it as "%40".'
    );
  }

  // If the Atlas URI ends in a trailing slash without a database name, ensure smart_college_complaints is targeted
  if (trimmed.endsWith('.mongodb.net/')) {
    trimmed = `${trimmed}smart_college_complaints?retryWrites=true&w=majority`;
  } else if (trimmed.endsWith('.mongodb.net')) {
    trimmed = `${trimmed}/smart_college_complaints?retryWrites=true&w=majority`;
  }

  return trimmed;
}

export function validateEnv() {
  const isProd = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

  if (isProd) {
    const missing = REQUIRED_IN_PROD.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(`[FATAL] Missing required production environment variables: ${missing.join(', ')}`);
    }

    if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
      throw new Error('[FATAL] SESSION_SECRET must be at least 32 characters in production.');
    }
  }

  let rawMongoUri = process.env.MONGODB_URI;
  let validatedMongoUri = 'mongodb://127.0.0.1:27017/smart_college_complaints';

  // Safe diagnostic: reports only presence and protocol type, NEVER prints secrets or hostnames
  const rawClean = rawMongoUri ? rawMongoUri.trim().replace(/^["']+|["']+$/g, '') : '';
  const hasUri = Boolean(rawClean);
  const detectedProtocol = rawClean.startsWith('mongodb+srv://')
    ? 'mongodb+srv://'
    : rawClean.startsWith('mongodb://')
    ? 'mongodb://'
    : hasUri
    ? 'invalid/non-mongodb'
    : 'none';
  console.log(`[Config] Database URI configured: ${hasUri} | Protocol: ${detectedProtocol}`);

  if (isTest) {
    // Tests always run against local database to avoid polluting or wiping production clusters
    validatedMongoUri = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/smart_college_complaints';
  } else if (isProd) {
    // In production, strictly enforce valid format
    validatedMongoUri = validateMongoUri(rawMongoUri);
  } else if (rawMongoUri) {
    // In development, validate and fall back gracefully if invalid credentials were provided
    try {
      validatedMongoUri = validateMongoUri(rawMongoUri);
    } catch (err) {
      console.warn(`[WARN] ${err.message} Falling back to local MongoDB for development.`);
      validatedMongoUri = 'mongodb://127.0.0.1:27017/smart_college_complaints';
    }
  }

  const cookieSameSite = process.env.COOKIE_SAME_SITE || (isProd ? 'none' : 'lax');
  const cookieSecure = process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : isProd;

  // Provide safe defaults for development
  return {
    PORT: parseInt(process.env.PORT || '5000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGODB_URI: validatedMongoUri,
    SESSION_SECRET: process.env.SESSION_SECRET || 'dev-only-secret-do-not-use-in-production-min-32-chars',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
    UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads/attachments',
    MAX_FILE_SIZE_BYTES: parseInt(process.env.MAX_FILE_SIZE_BYTES || '5242880', 10), // 5MB
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
    RATE_LIMIT_MAX_SUBMISSIONS: parseInt(process.env.RATE_LIMIT_MAX_SUBMISSIONS || '10', 10),
    RATE_LIMIT_MAX_TRACKING: parseInt(process.env.RATE_LIMIT_MAX_TRACKING || '30', 10),
    RATE_LIMIT_MAX_LOGINS: parseInt(process.env.RATE_LIMIT_MAX_LOGINS || '5', 10),
    COOKIE_SAME_SITE: cookieSameSite,
    COOKIE_SECURE: cookieSecure,
  };
}

export const ENV = validateEnv();
