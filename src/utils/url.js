/**
 * Validates and sanitizes internal application redirect paths.
 * Prevents Open Redirect vulnerabilities by rejecting external domains,
 * protocol-relative URLs, javascript: schemes, and malformed paths.
 *
 * @param {string} target - The untrusted redirect target from query or state
 * @param {string} fallback - The fallback relative path (default: '/dashboard')
 * @returns {string} A safe relative pathname with query parameters
 */
export function getSafeRedirectUrl(target, fallback = '/dashboard') {
  if (!target || typeof target !== 'string') {
    return fallback;
  }

  const trimmed = target.trim();

  // Must begin with a single slash (relative URL)
  // Rejects protocol-relative URLs (//evil.com) and backslash tricks (/\\evil.com)
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return fallback;
  }

  // Reject dangerous pseudo-protocols if embedded
  const lower = trimmed.toLowerCase();
  if (lower.includes('javascript:') || lower.includes('data:') || lower.includes('vbscript:')) {
    return fallback;
  }

  try {
    // Parse against a dummy base origin to verify hostname did not get injected
    const parsed = new URL(trimmed, 'http://localhost');
    if (parsed.origin !== 'http://localhost') {
      return fallback;
    }
    // Return sanitized path, search, and hash
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return fallback;
  }
}
