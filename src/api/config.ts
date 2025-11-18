/**
 * API Configuration for src/api clients
 * Supports both Vite (import.meta.env) and Next.js (process.env) environments
 */

const API_BASE = 
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'https://dal-ai-backend.onrender.com';

export function getApiUrl(path: string): string {
  if (!path) {
    console.error('⚠️ getApiUrl called with empty path');
    return API_BASE;
  }
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
}

export { API_BASE };
