/**
 * Task: API wrappers with credentials: 'include'.
 * - register({email,password,displayName?})
 * - login({email,password})
 * - logout()
 * - me()
 * - providers()
 * Base URL from environment variables.
 */

import { API_BASE } from './config';

// User profile interface matching backend response
export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  providers?: string[];
  jobTitle?: string;
  officeLocation?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Auth request interfaces
export interface RegisterRequest {
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Auth response interfaces
export interface AuthResponse {
  ok: boolean;
  user?: UserProfile;
  error?: string;
  message?: string;
}

export interface LogoutResponse {
  ok: boolean;
  message?: string;
  provider?: string;
}

export interface ProvidersResponse {
  local: boolean;
  microsoft: boolean;
}

export interface MicrosoftStatusResponse {
  enabled: boolean;
  provider: string;
  name: string;
  type: string;
}

// Calendar event interface
export interface CalendarEvent {
  subject: string;
  start: string;
  formattedStart: string;
  location?: string;
}

// Email message interface
export interface EmailMessage {
  from: string;
  subject: string;
  received: string;
  formattedReceived: string;
}

// Outlook responses
export interface EventsResponse {
  events: CalendarEvent[];
  count: number;
}

export interface UnreadMailResponse {
  emails: EmailMessage[];
  count: number;
}

export interface OutlookSummary {
  user: UserProfile;
  upcomingEvents: number;
  unreadEmails: number;
  nextEvent?: {
    subject: string;
    start: string;
    formattedStart: string;
  };
}

/**
 * Register a new user with email and password
 * @param userData - Registration data
 * @returns Promise with registration result
 */
export async function register(userData: RegisterRequest): Promise<AuthResponse> {
  try {
    console.log('📝 Registering new user...');
    
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Registration failed:', data);
      return {
        ok: false,
        error: data.error || 'Registration failed',
        message: data.message || 'Unknown error'
      };
    }

    console.log('✅ Registration successful');
    return {
      ok: true,
      user: data.user,
      message: 'Registration successful'
    };

  } catch (error) {
    console.error('❌ Error during registration:', error);
    return {
      ok: false,
      error: 'network_error',
      message: 'Network error during registration'
    };
  }
}

/**
 * Login with email and password
 * @param credentials - Login credentials
 * @returns Promise with login result
 */
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  try {
    console.log('🔐 Logging in user...');
    
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Login failed:', data);
      return {
        ok: false,
        error: data.error || 'Login failed',
        message: data.message || 'Invalid credentials'
      };
    }

    console.log('✅ Login successful');
    return {
      ok: true,
      user: data.user,
      message: 'Login successful'
    };

  } catch (error) {
    console.error('❌ Error during login:', error);
    return {
      ok: false,
      error: 'network_error',
      message: 'Network error during login'
    };
  }
}

/**
 * Logout the current user (local auth)
 * @returns Promise with logout result
 */
export async function logout(): Promise<LogoutResponse> {
  try {
    console.log('🚪 Logging out user...');
    
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Logout failed:', data);
      return {
        ok: false,
        message: data.message || 'Logout failed'
      };
    }

    console.log('✅ Logout successful');
    return {
      ok: true,
      message: 'Logged out successfully'
    };

  } catch (error) {
    console.error('❌ Error during logout:', error);
    return {
      ok: false,
      message: 'Network error during logout'
    };
  }
}

/**
 * Get available authentication providers
 * @returns Promise with providers information
 */
export async function providers(): Promise<ProvidersResponse> {
  try {
    console.log('🔍 Fetching auth providers...');
    
    const response = await fetch(`${API_BASE}/api/auth/providers`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch providers:', response.statusText);
      return { local: true, microsoft: false }; // Fallback
    }

    const data = await response.json();
    console.log('✅ Auth providers fetched successfully');
    return data;

  } catch (error) {
    console.error('❌ Error fetching auth providers:', error);
    return { local: true, microsoft: false }; // Fallback
  }
}

/**
 * Check if Microsoft OAuth is enabled and configured
 * @returns Promise with Microsoft auth status
 */
export async function checkMicrosoftAuth(): Promise<MicrosoftStatusResponse> {
  try {
    console.log('🔍 Checking Microsoft auth status...');
    
    const response = await fetch(`${API_BASE}/auth/ms/enabled`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('❌ Failed to check Microsoft auth status:', response.statusText);
      return { enabled: false, provider: 'microsoft', name: 'Microsoft', type: 'oauth' };
    }

    const data = await response.json();
    console.log('✅ Microsoft auth status checked successfully');
    return data;

  } catch (error) {
    console.error('❌ Error checking Microsoft auth status:', error);
    return { enabled: false, provider: 'microsoft', name: 'Microsoft', type: 'oauth' };
  }
}

/**
 * Initiate Microsoft OAuth login (if enabled)
 * Redirects the browser to the backend's Microsoft OAuth endpoint
 */
export function loginWithMicrosoft(): void {
  const loginUrl = `${API_BASE}/auth/ms/login`;
  console.log('🔐 Redirecting to Microsoft OAuth login:', loginUrl);
  window.location.href = loginUrl;
}

/**
 * Get current user profile
 * Fetches the authenticated user's information
 * @returns Promise with user profile or null if not authenticated
 */
export async function me(): Promise<UserProfile | null> {
  try {
    console.log('👤 Fetching current user profile...');
    
    const response = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 502) {
        console.log('🔒 User not authenticated');
        return null;
      }
      
      const errorData = await response.json();
      console.error('❌ Failed to fetch user profile:', errorData);
      throw new Error(errorData.message || 'Failed to fetch user profile');
    }

    const userProfile = await response.json() as UserProfile;
    console.log('✅ User profile fetched:', userProfile.displayName);
    return userProfile;

  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    return null;
  }
}

/**
 * Get user's upcoming calendar events
 * @param limit - Maximum number of events to fetch (default: 5)
 * @returns Promise with calendar events or null if error
 */
export async function getCalendarEvents(limit: number = 5): Promise<EventsResponse | null> {
  try {
    console.log(`📅 Fetching ${limit} upcoming calendar events...`);
    
    const response = await fetch(`${API_BASE}/api/outlook/events?limit=${limit}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 502) {
        console.log('🔒 Authentication required for calendar access');
        return null;
      }
      
      const errorData = await response.json();
      console.error('❌ Failed to fetch calendar events:', errorData);
      throw new Error(errorData.message || 'Failed to fetch calendar events');
    }

    const eventsData = await response.json() as EventsResponse;
    console.log(`✅ Fetched ${eventsData.count} calendar events`);
    return eventsData;

  } catch (error) {
    console.error('❌ Error fetching calendar events:', error);
    return null;
  }
}

/**
 * Get user's unread emails
 * @param limit - Maximum number of emails to fetch (default: 10)
 * @returns Promise with unread emails or null if error
 */
export async function getUnreadEmails(limit: number = 10): Promise<UnreadMailResponse | null> {
  try {
    console.log(`📧 Fetching ${limit} unread emails...`);
    
    const response = await fetch(`${API_BASE}/api/outlook/unread?limit=${limit}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 502) {
        console.log('🔒 Authentication required for email access');
        return null;
      }
      
      const errorData = await response.json();
      console.error('❌ Failed to fetch unread emails:', errorData);
      throw new Error(errorData.message || 'Failed to fetch unread emails');
    }

    const emailsData = await response.json() as UnreadMailResponse;
    console.log(`✅ Fetched ${emailsData.count} unread emails`);
    return emailsData;

  } catch (error) {
    console.error('❌ Error fetching unread emails:', error);
    return null;
  }
}

/**
 * Get Outlook summary (user + events + emails overview)
 * @returns Promise with Outlook summary or null if error
 */
export async function getOutlookSummary(): Promise<OutlookSummary | null> {
  try {
    console.log('📊 Fetching Outlook summary...');
    
    const response = await fetch(`${API_BASE}/api/outlook/summary`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 502) {
        console.log('🔒 Authentication required for Outlook access');
        return null;
      }
      
      const errorData = await response.json();
      console.error('❌ Failed to fetch Outlook summary:', errorData);
      throw new Error(errorData.message || 'Failed to fetch Outlook summary');
    }

    const summaryData = await response.json() as OutlookSummary;
    console.log('✅ Outlook summary fetched successfully');
    return summaryData;

  } catch (error) {
    console.error('❌ Error fetching Outlook summary:', error);
    return null;
  }
}

/**
 * Check if user is currently authenticated
 * @returns Promise<boolean> indicating authentication status
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const user = await me();
    return user !== null;
  } catch (error) {
    console.error('❌ Error checking authentication status:', error);
    return false;
  }
}

/**
 * Utility function to handle auth errors consistently
 * @param error - The error to handle
 * @returns boolean indicating if user should be redirected to login
 */
export function shouldRedirectToLogin(error: any): boolean {
  // If it's a network error or auth error, suggest login
  if (!error) return false;
  
  const errorMessage = error.message || error.toString().toLowerCase();
  return errorMessage.includes('401') || 
         errorMessage.includes('unauthorized') || 
         errorMessage.includes('authentication required') ||
         errorMessage.includes('token expired');
}

// Export API base for other modules
export { API_BASE };
