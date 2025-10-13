/**
 * LoginButton component for Next.js App
 * Enhanced component supporting both local and Microsoft OAuth authentication
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, Mail, Lock, UserPlus, Loader2, AlertTriangle } from 'lucide-react';
import { 
  loginLocal, 
  registerLocal, 
  loginWithMicrosoft, 
  logout, 
  me, 
  type UserProfile,
  type LoginCredentials,
  type RegisterData 
} from '@/lib/auth';

interface LoginButtonProps {
  className?: string;
  onAuthChange?: (user: UserProfile | null) => void;
  onLogout?: () => void; // New callback for logout events
}

export default function LoginButton({ 
  className = '', 
  onAuthChange,
  onLogout
}: LoginButtonProps) {
  // Authentication state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  
  // UI state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // Form data
  const [loginData, setLoginData] = useState<LoginCredentials>({ 
    email: '', 
    password: '' 
  });
  const [registerData, setRegisterData] = useState<RegisterData & { confirmPassword: string }>({ 
    email: '', 
    password: '', 
    displayName: '',
    confirmPassword: '' 
  });

  // Check authentication status on mount
  useEffect(() => {
    console.log('🔄 LoginButton component mounted');
    checkAuthStatus();
  }, []);

  // Notify parent component of auth changes
  useEffect(() => {
    if (onAuthChange) {
      onAuthChange(user);
    }
  }, [user, onAuthChange]);

  // Debug state changes
  useEffect(() => {
    console.log('🔄 Login modal state changed:', showLoginModal);
  }, [showLoginModal]);

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
        console.log('✅ User is authenticated:', currentUser.displayName || currentUser.name || currentUser.email);
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
   * Handle local login with email/password
   */
  const handleLocalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const result = await loginLocal(loginData);

      if (result.ok && result.user) {
        setUser(result.user);
        setSuccess('Erfolgreich eingeloggt!');
        setShowLoginModal(false);
        setLoginData({ email: '', password: '' });
        console.log('✅ Local login successful');
      } else {
        setError(result.error || 'Anmeldung fehlgeschlagen');
      }
    } catch (error) {
      console.error('❌ Local login error:', error);
      setError('Verbindungsfehler. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle local registration
   */
  const handleLocalRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    // Validate passwords match
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      setIsSubmitting(false);
      return;
    }

    try {
      const { confirmPassword, ...submitData } = registerData;
      const result = await registerLocal(submitData);

      if (result.ok && result.user) {
        setUser(result.user);
        setSuccess('Konto erfolgreich erstellt und eingeloggt!');
        setShowLoginModal(false);
        setRegisterData({ email: '', password: '', displayName: '', confirmPassword: '' });
        console.log('✅ Registration successful');
      } else {
        setError(result.error || 'Registrierung fehlgeschlagen');
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      setError('Verbindungsfehler. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle Microsoft OAuth login
   */
  const handleMicrosoftLogin = () => {
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
        setSuccess('Erfolgreich abgemeldet!');
        
        // Call the logout callback to clear chat
        if (onLogout) {
          onLogout();
        }
      } else {
        console.error('❌ Logout failed:', result.message);
        setError('Abmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.');
      }
    } catch (error) {
      console.error('❌ Error during logout:', error);
      setError('Fehler bei der Abmeldung. Bitte versuchen Sie es erneut.');
    } finally {
      setLoggingOut(false);
    }
  };

  /**
   * Clear messages and close modal
   */
  const handleCloseModal = () => {
    setShowLoginModal(false);
    setError('');
    setSuccess('');
    setLoginData({ email: '', password: '' });
    setRegisterData({ email: '', password: '', displayName: '', confirmPassword: '' });
  };

  /**
   * Loading state
   */
  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  /**
   * Authenticated state - show user info and logout button
   */
  if (user) {
    const displayName = user.displayName || user.name || user.email;
    
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {/* User Avatar */}
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        {/* User Info - Hidden on small screens */}
        <div className="hidden md:flex flex-col">
          <span className="text-sm font-medium">
            {displayName}
          </span>
          {user.jobTitle && (
            <span className="text-xs text-muted-foreground">
              {user.jobTitle}
            </span>
          )}
        </div>
        
        {/* Success message */}
        {success && (
          <div className="hidden lg:block text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
            {success}
          </div>
        )}
        
        {/* Logout Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2"
        >
          {loggingOut ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="hidden sm:inline">Abmelden...</span>
            </>
          ) : (
            <>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Abmelden</span>
            </>
          )}
        </Button>
      </div>
    );
  }

  /**
   * Unauthenticated state - show login button and modal
   */
  return (
    <>
      <Button
        onClick={() => {
          console.log('🔄 Login button clicked!');
          setShowLoginModal(true);
        }}
        variant="default"
        size="sm"
        className={`flex items-center gap-2 cursor-pointer ${className}`}
        style={{ pointerEvents: 'auto', zIndex: 10 }}
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">Anmelden</span>
        <span className="sm:hidden">Login</span>
      </Button>

      {/* Login/Register Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 pt-20">
          <Card className="w-full max-w-md mx-4 mt-8">
            <CardHeader>
              <CardTitle className="text-center">
                Willkommen bei KI-Assistent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Anmelden</TabsTrigger>
                  <TabsTrigger value="register">Registrieren</TabsTrigger>
                </TabsList>

                {/* Error/Success Messages */}
                {error && (
                  <Alert className="mt-4 border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="mt-4 border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">
                      {success}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Login Tab */}
                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLocalLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-Mail</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="ihre@email.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Passwort</Label>
                      <Input
                        id="password"
                        type="password"
                        value={loginData.password}
                        onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Anmelden...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Anmelden
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">oder</span>
                    </div>
                  </div>

                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full"
                    onClick={handleMicrosoftLogin}
                    disabled={isSubmitting}
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 21 21">
                      <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                      <rect x="12" y="1" width="9" height="9" fill="#00a4ef"/>
                      <rect x="1" y="12" width="9" height="9" fill="#ffb900"/>
                      <rect x="12" y="12" width="9" height="9" fill="#7fba00"/>
                    </svg>
                    Mit Microsoft anmelden
                  </Button>
                </TabsContent>

                {/* Register Tab */}
                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={handleLocalRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Name</Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Ihr Name"
                        value={registerData.displayName}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, displayName: e.target.value }))}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">E-Mail</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="ihre@email.com"
                        value={registerData.email}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Passwort</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Mind. 8 Zeichen, 1 Buchstabe, 1 Zahl"
                        value={registerData.password}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                        required
                        disabled={isSubmitting}
                        minLength={8}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-confirm">Passwort bestätigen</Label>
                      <Input
                        id="register-confirm"
                        type="password"
                        placeholder="Passwort wiederholen"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Registrieren...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Konto erstellen
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-4 flex justify-end">
                <Button 
                  variant="ghost" 
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  Abbrechen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
