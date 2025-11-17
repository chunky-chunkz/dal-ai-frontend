/**
 * Auth API for Next.js App
 * Enhanced auth helpers for both local and Microsoft OAuth authentication
 */

import { getApiUrl } from './api-config';

// Debug: Log the API configuration
console.log('🔗 Using API configuration from api-config');

// User profile interface matching backend response
export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  name?: string;
  jobTitle?: string;
  officeLocation?: string;
}

// Auth response interfaces
export interface AuthResponse {
  ok: boolean;
  authenticated?: boolean;
  user?: UserProfile;
  message?: string;
  error?: string;
}

export interface LogoutResponse {
  ok: boolean;
  message?: string;
}

// Login credentials for local auth
export interface LoginCredentials {
  email: string;
  password: string;
}

// Registration data for local auth
export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
}

/**
 * LOCAL AUTHENTICATION FUNCTIONS
 */

/**
 * Login with email and password
 */
export async function loginLocal(email: string, password: string) {
  const res = await fetch(getApiUrl('/auth/login'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed (${res.status}): ${text}`);
  }

  return res.json();
}

/**
 * Register new user with email and password
 */
export async function registerLocal(
  email: string,
  password: string,
  displayName?: string
) {
  const res = await fetch(getApiUrl('/auth/register'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, displayName }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Register failed (${res.status}): ${text}`);
  }

  return res.json();
}

/**
 * MICROSOFT OAUTH FUNCTIONS
 */

/**
 * Redirect to Microsoft OAuth login
 * This will navigate to the backend auth endpoint which starts OAuth flow
 */
export function loginWithMicrosoft(): void {
  console.log('🔐 Redirecting to Microsoft OAuth login...');
  
  // Redirect to backend OAuth login endpoint
  window.location.href = getApiUrl('/auth/ms/login');
}

/**
 * SHARED AUTHENTICATION FUNCTIONS
 */

/**
 * Logout the current user
 * Calls backend logout endpoint and clears session
 */
export async function logout() {
  const res = await fetch(getApiUrl('/auth/logout'), {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Logout failed (${res.status}): ${text}`);
  }
}

/**
 * Get current user profile
 * Returns user data if authenticated, null if not
 */
export async function me() {
  const res = await fetch(getApiUrl('/auth/me'), {
    method: 'GET',
    credentials: 'include',
  });

  if (res.status === 401) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Me failed (${res.status}): ${text}`);
  }

  return res.json();
}

/**
 * Check if user is currently authenticated
 * Helper function that returns boolean
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await me();
  return user !== null;
}
