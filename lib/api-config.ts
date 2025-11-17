// lib/api-config.ts
const API_BASE = 'https://dal-ai-backend.onrender.com';

export function getApiUrl(path: string) {
  return `${API_BASE}${path}`;
}

export { API_BASE };
