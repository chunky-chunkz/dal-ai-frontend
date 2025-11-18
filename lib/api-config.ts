// lib/api-config.ts
const API_BASE = 'https://dal-ai-backend.onrender.com';

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
