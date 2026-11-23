import React from 'react';

/**
 * Wraps dynamic React.lazy imports with automated retry and cache invalidation.
 * Handles Vite/Webpack chunk loading errors (e.g. after a new production deployment
 * where old chunk hashes no longer exist on the CDN/server).
 *
 * It reloads the window once automatically so the browser fetches the fresh index.html
 * and latest chunk manifests.
 *
 * @param {Function} componentImport - Dynamic import factory function, e.g. () => import('./Page')
 * @returns {React.LazyExoticComponent}
 */
export function lazyWithRetry(componentImport) {
  return React.lazy(async () => {
    const sessionKey = 'app_chunk_retry_occurred';
    const hasAlreadyRetried = window.sessionStorage.getItem(sessionKey) === 'true';

    try {
      const component = await componentImport();
      // Reset retry marker upon successful load
      if (hasAlreadyRetried) {
        window.sessionStorage.removeItem(sessionKey);
      }
      return component;
    } catch (error) {
      console.warn('[ChunkLoader] Dynamic module import failed:', error?.message || error);

      const errorMessage = (error?.message || '').toLowerCase();
      const isChunkOrNetworkError =
        error?.name === 'ChunkLoadError' ||
        errorMessage.includes('failed to fetch dynamically imported module') ||
        errorMessage.includes('dynamically imported module') ||
        errorMessage.includes('importing a module script failed') ||
        errorMessage.includes('error loading dynamically imported module') ||
        errorMessage.includes('networkerror') ||
        errorMessage.includes('load failed') ||
        errorMessage.includes('unexpected token');

      if (!hasAlreadyRetried && isChunkOrNetworkError) {
        console.info('[ChunkLoader] Stale bundle or chunk load failure detected. Performing automatic reload to retrieve fresh assets...');
        window.sessionStorage.setItem(sessionKey, 'true');
        window.location.reload();
        // Return unresolved promise to suspend render until the browser navigates/reloads
        return new Promise(() => {});
      }

      // If already retried once and still fails, clear marker and rethrow so ErrorBoundary catches it
      window.sessionStorage.removeItem(sessionKey);
      throw error;
    }
  });
}

export default lazyWithRetry;
