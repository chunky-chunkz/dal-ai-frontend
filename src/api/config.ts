/**
 * API Configuration for src/api clients
 * Supports both Vite (import.meta.env) and Next.js (process.env) environments
 * 
 * Поддерживает переменные окружения:
 * - NEXT_PUBLIC_API_BASE (Next.js приоритет)
 * - NEXT_PUBLIC_API_URL (Next.js альтернатива)
 * - VITE_API_URL (Vite приоритет)
 */

/**
 * Get API base URL from environment variables
 * Supports both Vite and Next.js build systems
 */
export function getApiBaseUrl(): string {
  // Try Next.js environment variables first (NEXT_PUBLIC_API_BASE has priority)
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE) {
    return process.env.NEXT_PUBLIC_API_BASE;
  }
  
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Try Vite environment variable
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Try window.__ENV__ for runtime injection
  if (typeof window !== 'undefined' && (window as any).__ENV__?.VITE_API_URL) {
    return (window as any).__ENV__.VITE_API_URL;
  }
  
  // Fallback to production backend URL
  return 'https://dal-ai-backend.onrender.com';
}

/**
 * Get full API URL for a given path
 * @param path - API path (например, '/api/answer' или 'api/answer')
 * @returns Полный URL для запроса к бэкенду
 */
export function getApiUrl(path: string): string {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

export const API_BASE = getApiBaseUrl();
