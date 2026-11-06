/**
 * Centralized API configuration for Momentum Transportation & Hauling LLC.
 *
 * Supports both fullstack deployment (relative /api paths) and static hosting
 * (e.g. GitHub Pages) by honoring the VITE_API_BASE_URL environment variable.
 */

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const getApiUrl = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
