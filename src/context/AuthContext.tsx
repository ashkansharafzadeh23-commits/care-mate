import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthSession, AuthStatus } from '../types';
import { authService, LoginCredentials, SignUpData, ResetPasswordResult } from '../services/auth/authService';

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  authStatus: AuthStatus;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<{ user: User; session: AuthSession }>;
  signUp: (data: SignUpData) => Promise<{ user: User; session: AuthSession }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<ResetPasswordResult>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');

  // Initialize session on mount
  const initSession = useCallback(async () => {
    try {
      setAuthStatus('loading');
      const result = await authService.getSession();
      if (result.session && result.user) {
        setSession(result.session);
        setUser(result.user);
        setAuthStatus('authenticated');
      } else {
        setSession(null);
        setUser(null);
        setAuthStatus('unauthenticated');
      }
    } catch {
      setSession(null);
      setUser(null);
      setAuthStatus('unauthenticated');
    }
  }, []);

  useEffect(() => {
    initSession();
  }, [initSession]);

  const login = async (credentials: LoginCredentials) => {
    setAuthStatus('loading');
    try {
      const result = await authService.login(credentials);
      setUser(result.user);
      setSession(result.session);
      setAuthStatus('authenticated');
      return result;
    } catch (err) {
      setAuthStatus('unauthenticated');
      throw err;
    }
  };

  const signUp = async (data: SignUpData) => {
    setAuthStatus('loading');
    try {
      const result = await authService.signUp(data);
      setUser(result.user);
      setSession(result.session);
      setAuthStatus('authenticated');
      return result;
    } catch (err) {
      setAuthStatus('unauthenticated');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setSession(null);
      setAuthStatus('unauthenticated');
    }
  };

  const resetPassword = async (email: string) => {
    return authService.resetPassword(email);
  };

  const refreshSession = async () => {
    await initSession();
  };

  const isAuthenticated = authStatus === 'authenticated' && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        authStatus,
        isAuthenticated,
        login,
        signUp,
        logout,
        resetPassword,
        refreshSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
