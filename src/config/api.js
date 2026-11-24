/**
 * Centralized API URL configuration.
 *
 * Reads VITE_API_URL from environment variables (e.g. Vercel dashboard).
 * When unset, defaults to an empty string so requests use relative paths (/api/...)
 * which are handled by Vite dev proxy locally or Vercel rewrites in production.
 *
 * @example
 * // If VITE_API_URL="https://smart-college-complaint-system-4f8d.onrender.com"
 * apiUrl('/api/v1/health') -> "https://smart-college-complaint-system-4f8d.onrender.com/api/v1/health"
 *
 * // If VITE_API_URL is unset
 * apiUrl('/api/v1/health') -> "/api/v1/health"
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');

export function apiUrl(endpoint = '') {
  if (!endpoint) return API_BASE_URL || '/';
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}

export default apiUrl;
