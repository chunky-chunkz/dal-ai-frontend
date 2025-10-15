/**
 * Auth API for Next.js App
 * Enhanced auth helpers for both local and Microsoft OAuth authentication
 */

// Get API base URL - in Next.js we can use environment variables directly
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

// Debug: Log the API base URL being used
console.log('🔗 API_BASE:', API_BASE);

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
export async function loginLocal(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    console.log('🔐 Logging in with email and password...');
    
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();
    
    if (response.ok && data.ok && data.user) {
      console.log('✅ Local login successful:', data.user.email);
      
      // Store user info in localStorage for session management
      try {
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('💾 User info stored in localStorage');
      } catch (e) {
        console.warn('Failed to store user info in localStorage');
      }
      
      return data;
    } else {
      console.error('❌ Local login failed:', data);
      return {
        ok: false,
        error: data.error || data.message || `Login failed: ${response.status}`
      };
    }
  } catch (error) {
    console.error('❌ Network error during login:', error);
    return {
      ok: false,
      error: 'Verbindungsfehler zum Server. Ist das Backend gestartet?'
    };
  }
}

/**
 * Register new user with email and password
 */
export async function registerLocal(userData: RegisterData): Promise<AuthResponse> {
  try {
    console.log('📝 Registering new user...');
    
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    
    if (response.ok && data.ok && data.user) {
      console.log('✅ Registration successful:', data.user.email);
      
      // Store user info in localStorage for session management
      try {
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('💾 User info stored in localStorage');
      } catch (e) {
        console.warn('Failed to store user info in localStorage');
      }
      
      return data;
    } else {
      console.error('❌ Registration failed:', data);
      return {
        ok: false,
        error: data.error || data.message || `Registration failed: ${response.status}`
      };
    }
  } catch (error) {
    console.error('❌ Network error during registration:', error);
    return {
      ok: false,
      error: 'Network error during registration'
    };
  }
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
  window.location.href = `${API_BASE}/auth/ms/login`;
}

/**
 * SHARED AUTHENTICATION FUNCTIONS
 */

/**
 * Logout the current user
 * Calls backend logout endpoint and clears session
 */
export async function logout(): Promise<LogoutResponse> {
  try {
    console.log('🚪 Logging out...');
    
    const response = await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Include session cookies
    });

    if (response.ok) {
      console.log('✅ Logout successful');
      
      // Clear user info from localStorage
      try {
        localStorage.removeItem('user');
        console.log('🗑️ User info cleared from localStorage');
      } catch (e) {
        console.warn('Failed to clear user info from localStorage');
      }
      
      return { ok: true };
    } else {
      const errorData = await response.text();
      console.error('❌ Logout failed:', response.status, errorData);
      return { 
        ok: false, 
        message: `Logout failed: ${response.status}` 
      };
    }
  } catch (error) {
    console.error('❌ Error during logout:', error);
    return { 
      ok: false, 
      message: 'Network error during logout' 
    };
  }
}

/**
 * Get current user profile
 * Returns user data if authenticated, null if not
 */
export async function me(): Promise<UserProfile | null> {
  try {
    console.log('🔍 Checking authentication status...');
    
    const response = await fetch(`${API_BASE}/api/me`, {
      method: 'GET',
      credentials: 'include', // Include session cookies
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const userData = await response.json();
      console.log('✅ User authenticated:', userData.displayName || userData.name || userData.email);
      
      // Store user info in localStorage for session management
      try {
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('💾 User info stored in localStorage');
      } catch (e) {
        console.warn('Failed to store user info in localStorage');
      }
      
      return userData;
    } else if (response.status === 401) {
      console.log('❌ User not authenticated');
      
      // Clear user info from localStorage
      try {
        localStorage.removeItem('user');
      } catch (e) {
        // Ignore
      }
      
      return null;
    } else {
      console.error('❌ Error checking auth status:', response.status);
      return null;
    }
  } catch (error) {
    console.error('❌ Network error checking auth status:', error);
    console.error('Backend might not be running on:', API_BASE);
    return null;
  }
}

/**
 * Check if user is currently authenticated
 * Helper function that returns boolean
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await me();
  return user !== null;
}
