/**
 * Task: Login/Logout UI.
 * - If not logged in: show "Mit Microsoft anmelden" -> click -> loginWithMicrosoft()
 * - If logged in: show user name + "Logout" -> logout()
 * - On mount, call me() to get session status.
 */

import React, { useState, useEffect } from 'react';
import { loginWithMicrosoft, logout, me, type UserProfile } from '../api/auth';

interface LoginButtonProps {
  className?: string;
  onAuthChange?: (user: UserProfile | null) => void;
}

export const LoginButton: React.FC<LoginButtonProps> = ({ 
  className = '', 
  onAuthChange 
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Notify parent component of auth changes
  useEffect(() => {
    if (onAuthChange) {
      onAuthChange(user);
    }
  }, [user, onAuthChange]);

  /**
   * Check current authentication status
   */
  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      console.log('🔍 Checking authentication status...');
      
      const currentUser = await me();
      setUser(currentUser);
      
      if (currentUser) {
        console.log('✅ User is authenticated:', currentUser.displayName);
      } else {
        console.log('❌ User is not authenticated');
      }
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle login button click
   */
  const handleLogin = () => {
    console.log('🔐 Initiating Microsoft OAuth login...');
    loginWithMicrosoft();
  };

  /**
   * Handle logout button click
   */
  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      console.log('🚪 Logging out...');
      
      const result = await logout();
      
      if (result.ok) {
        setUser(null);
        console.log('✅ Logout successful');
        
        // Optional: Refresh the page to clear any cached data
        // window.location.reload();
      } else {
        console.error('❌ Logout failed:', result.message);
        alert('Logout failed. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error during logout:', error);
      alert('Error during logout. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  /**
   * Loading state
   */
  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className || ''}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  /**
   * Authenticated state - show user info and logout button
   */
  if (user) {
    const displayName = (user.displayName || user.name || user.email || 'User').toString();
    const initial = (displayName && typeof displayName === 'string' && displayName.length > 0) 
      ? displayName.charAt(0).toUpperCase() 
      : 'U';
    
    return (
      <div className={`flex items-center space-x-3 ${className || ''}`}>
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">
              {initial}
            </span>
          </div>
        </div>
        
        {/* User Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {displayName}
          </p>
          {user.jobTitle && (
            <p className="text-xs text-gray-500 truncate">
              {user.jobTitle}
            </p>
          )}
        </div>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loggingOut ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
              Abmelden...
            </>
          ) : (
            'Abmelden'
          )}
        </button>
      </div>
    );
  }

  /**
   * Unauthenticated state - show login button
   */
  return (
        <div className={`flex items-center ${className || ''}`}>
      {/* Login button */}
      <button
      <button
        onClick={handleLogin}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        <svg 
          className="w-4 h-4 mr-2" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          {/* Microsoft logo icon */}
          <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
        </svg>
        Mit Microsoft anmelden
      </button>
    </div>
  );
};

/**
 * Compact version of the login button for smaller spaces
 */
export const CompactLoginButton: React.FC<LoginButtonProps> = ({ 
  className = '', 
  onAuthChange 
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (onAuthChange) {
      onAuthChange(user);
    }
  }, [user, onAuthChange]);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const currentUser = await me();
      setUser(currentUser);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    loginWithMicrosoft();
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const result = await logout();
      if (result.ok) {
        setUser(null);
      } else {
        alert('Logout failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      alert('Error during logout. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className={`animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 ${className || ''}`}>
      </div>
    );
  }

  if (user) {
    const displayName = (user.displayName || user.name || user.email || 'User').toString();
    const initial = (displayName && typeof displayName === 'string' && displayName.length > 0) 
      ? displayName.charAt(0).toUpperCase() 
      : 'U';
    
    return (
      <div className={`flex items-center space-x-2 ${className || ''}`}>
        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-xs font-medium text-blue-600">
            {initial}
          </span>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
          title="Abmelden"
        >
          {loggingOut ? '...' : '×'}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded text-blue-600 border border-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${className || ''}`}
      title="Mit Microsoft anmelden"
    >
      Login
    </button>
  );
};

export default LoginButton;
