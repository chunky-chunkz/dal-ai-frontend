import React, { useState, useEffect } from 'react';
import './AuthForm.css';
import { 
  register, 
  login, 
  loginWithMicrosoft, 
  providers, 
  checkMicrosoftAuth,
  UserProfile 
} from '../api/auth';

// Types for form data and responses
interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
}

interface LoginFormData {
  email: string;
  password: string;
}

interface AuthFormProps {
  onAuthSuccess?: (user: UserProfile) => void;
  onError?: (error: string) => void;
  defaultTab?: 'login' | 'register';
}

interface ProviderStatus {
  local: boolean;
  microsoft: boolean;
  microsoftEnabled: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ 
  onAuthSuccess, 
  onError, 
  defaultTab = 'login' 
}) => {
  // State management
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const [isLoading, setIsLoading] = useState(false);
  const [providersStatus, setProvidersStatus] = useState<ProviderStatus>({
    local: true,
    microsoft: false,
    microsoftEnabled: false
  });

  // Form data state
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });

  // Error and success messages
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Check provider availability on component mount
  useEffect(() => {
    async function fetchProviders() {
      try {
        const [providersData, microsoftStatus] = await Promise.all([
          providers(),
          checkMicrosoftAuth()
        ]);

        setProvidersStatus({
          local: providersData.local,
          microsoft: providersData.microsoft,
          microsoftEnabled: microsoftStatus.enabled
        });
      } catch (error) {
        console.error('Failed to fetch provider status:', error);
        // Keep defaults if fetch fails
      }
    }

    fetchProviders();
  }, []);

  // Helper functions for form validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Validate input
      if (!validateEmail(loginData.email)) {
        throw new Error('Please enter a valid email address');
      }

      if (!loginData.password) {
        throw new Error('Password is required');
      }

      // Attempt login
      const result = await login(loginData);

      if (result.ok && result.user) {
        setMessage({ type: 'success', text: 'Login successful!' });
        onAuthSuccess?.(result.user);
      } else {
        throw new Error(result.message || 'Login failed');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setMessage({ type: 'error', text: errorMessage });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle registration form submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Validate input
      if (!validateEmail(registerData.email)) {
        throw new Error('Please enter a valid email address');
      }

      if (!validatePassword(registerData.password)) {
        throw new Error('Password must be at least 8 characters long');
      }

      if (registerData.password !== registerData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (!registerData.displayName.trim()) {
        throw new Error('Display name is required');
      }

      // Attempt registration
      const result = await register({
        email: registerData.email,
        password: registerData.password,
        displayName: registerData.displayName.trim()
      });

      if (result.ok && result.user) {
        setMessage({ type: 'success', text: 'Registration successful!' });
        onAuthSuccess?.(result.user);
      } else {
        throw new Error(result.message || 'Registration failed');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setMessage({ type: 'error', text: errorMessage });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Microsoft OAuth login
  const handleMicrosoftLogin = () => {
    if (providersStatus.microsoftEnabled) {
      loginWithMicrosoft();
    } else {
      setMessage({ 
        type: 'error', 
        text: 'Microsoft authentication is not available' 
      });
    }
  };

  // Handle input changes
  const handleLoginChange = (field: keyof LoginFormData, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
    setMessage(null); // Clear messages on input change
  };

  const handleRegisterChange = (field: keyof RegisterFormData, value: string) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
    setMessage(null); // Clear messages on input change
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        {/* Tab Navigation */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
            disabled={isLoading}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
            disabled={isLoading}
          >
            Sign Up
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`auth-message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="auth-form-content">
            <h2>Sign In</h2>
            
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                value={loginData.email}
                onChange={(e) => handleLoginChange('email', e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                value={loginData.password}
                onChange={(e) => handleLoginChange('password', e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="auth-submit-button"
              disabled={isLoading || !loginData.email || !loginData.password}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Registration Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="auth-form-content">
            <h2>Sign Up</h2>
            
            <div className="form-group">
              <label htmlFor="register-displayName">Full Name</label>
              <input
                id="register-displayName"
                type="text"
                value={registerData.displayName}
                onChange={(e) => handleRegisterChange('displayName', e.target.value)}
                placeholder="Enter your full name"
                required
                disabled={isLoading}
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-email">Email Address</label>
              <input
                id="register-email"
                type="email"
                value={registerData.email}
                onChange={(e) => handleRegisterChange('email', e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                value={registerData.password}
                onChange={(e) => handleRegisterChange('password', e.target.value)}
                placeholder="At least 8 characters"
                required
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-confirmPassword">Confirm Password</label>
              <input
                id="register-confirmPassword"
                type="password"
                value={registerData.confirmPassword}
                onChange={(e) => handleRegisterChange('confirmPassword', e.target.value)}
                placeholder="Confirm your password"
                required
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="auth-submit-button"
              disabled={
                isLoading || 
                !registerData.email || 
                !registerData.password || 
                !registerData.confirmPassword ||
                !registerData.displayName
              }
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Microsoft OAuth Option */}
        {providersStatus.microsoftEnabled && (
          <div className="oauth-section">
            <div className="oauth-divider">
              <span>or</span>
            </div>
            
            <button
              type="button"
              onClick={handleMicrosoftLogin}
              className="microsoft-oauth-button"
              disabled={isLoading}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" className="microsoft-icon">
                <rect x="1" y="1" width="7" height="7" fill="#f25022"/>
                <rect x="10" y="1" width="7" height="7" fill="#00a4ef"/>
                <rect x="1" y="10" width="7" height="7" fill="#00d4aa"/>
                <rect x="10" y="10" width="7" height="7" fill="#ffb900"/>
              </svg>
              {activeTab === 'login' ? 'Sign in with Microsoft' : 'Sign up with Microsoft'}
            </button>
          </div>
        )}

        {/* Provider Status Debug (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="auth-debug">
            <small>
              Local: {providersStatus.local ? '✅' : '❌'} | 
              Microsoft: {providersStatus.microsoft ? '✅' : '❌'} | 
              MS Enabled: {providersStatus.microsoftEnabled ? '✅' : '❌'}
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
