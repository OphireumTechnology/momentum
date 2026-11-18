/**
 * Centralized API configuration for Momentum Transportation & Hauling LLC.
 *
 * Supports both fullstack deployment (relative /api paths) and static hosting
 * (e.g. GitHub Pages) by honoring the VITE_API_BASE_URL environment variable.
 */

const DEFAULT_STATIC_API_URL = 'https://momentum-production-7643a06f.up.railway.app';
const configuredApiUrl = import.meta.env.VITE_API_BASE_URL || '';
const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.endsWith('.github.io');
export const API_BASE_URL = (configuredApiUrl || (isGitHubPages ? DEFAULT_STATIC_API_URL : '')).replace(/\/$/, '');

export const getApiUrl = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
