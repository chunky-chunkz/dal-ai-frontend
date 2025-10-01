import React, { useState } from 'react';
import AuthForm from '../components/AuthForm';
import { UserProfile } from '../api/auth';

const AuthDemo: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleAuthSuccess = (userProfile: UserProfile) => {
    setUser(userProfile);
    setAuthError(null);
    console.log('Authentication successful:', userProfile);
  };

  const handleAuthError = (error: string) => {
    setAuthError(error);
    console.error('Authentication error:', error);
  };

  const handleLogout = () => {
    setUser(null);
    setAuthError(null);
  };

  if (user) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto',
        marginTop: '50px'
      }}>
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h1>Welcome!</h1>
          <div style={{ marginBottom: '20px' }}>
            <p><strong>Display Name:</strong> {user.displayName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            {user.jobTitle && <p><strong>Job Title:</strong> {user.jobTitle}</p>}
            {user.officeLocation && <p><strong>Office:</strong> {user.officeLocation}</p>}
            {user.providers && (
              <p><strong>Auth Providers:</strong> {user.providers.join(', ')}</p>
            )}
          </div>
          <button 
            onClick={handleLogout}
            style={{
              padding: '12px 24px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {authError && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#f8d7da',
          color: '#721c24',
          padding: '12px 20px',
          borderRadius: '8px',
          border: '1px solid #f5c6cb',
          zIndex: 1000
        }}>
          {authError}
        </div>
      )}
      
      <AuthForm 
        onAuthSuccess={handleAuthSuccess}
        onError={handleAuthError}
        defaultTab="login"
      />
    </div>
  );
};

export default AuthDemo;
