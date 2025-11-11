/**
 * API Configuration for src/api clients
 * Supports both Vite (import.meta.env) and Next.js (process.env) environments
 */

/**
 * Get API base URL from environment variables
 * Supports both Vite and Next.js build systems
 */
export function getApiBaseUrl(): string {
  // Try Next.js environment variable first
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE) {
    return process.env.NEXT_PUBLIC_API_BASE;
  }
  
  // Try Vite environment variable
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Try Next.js alternative variable
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Try window.__ENV__ for runtime injection
  if (typeof window !== 'undefined' && (window as any).__ENV__?.VITE_API_URL) {
    return (window as any).__ENV__.VITE_API_URL;
  }
  
  // Default fallback
  return 'http://localhost:8081';
}

/**
 * Get full API URL for a given path
 */
export function getApiUrl(path: string): string {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

export const API_BASE = getApiBaseUrl();
