/**
 * Redacting Logger
 * Redacts passwords, cookies, tracking secrets, student descriptions,
 * and sensitive personal information from console outputs.
 */

const SENSITIVE_KEYS = new Set([
  'password',
  'currentpassword',
  'newpassword',
  'confirmpassword',
  'trackingsecret',
  'secret',
  'cookie',
  'set-cookie',
  'authorization',
  'x-csrf-token',
  'csrftoken',
  'studentdescription',
  'description',
]);

function redactObject(obj, depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > 5) return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => redactObject(item, depth + 1));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = redactObject(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export const logger = {
  info: (...args) => {
    const sanitized = args.map((arg) => (typeof arg === 'object' ? redactObject(arg) : arg));
    console.log(`[INFO ${new Date().toISOString()}]`, ...sanitized);
  },
  warn: (...args) => {
    const sanitized = args.map((arg) => (typeof arg === 'object' ? redactObject(arg) : arg));
    console.warn(`[WARN ${new Date().toISOString()}]`, ...sanitized);
  },
  error: (...args) => {
    const sanitized = args.map((arg) => (typeof arg === 'object' ? redactObject(arg) : arg));
    console.error(`[ERROR ${new Date().toISOString()}]`, ...sanitized);
  },
};
