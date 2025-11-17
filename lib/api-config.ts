/**
 * API Configuration
 * 
 * Zentrale Konfiguration für die Backend-URL.
 * Kann über NEXT_PUBLIC_API_BASE überschrieben werden.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://dal-ai-backend.onrender.com';

export function getApiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export { API_BASE };
