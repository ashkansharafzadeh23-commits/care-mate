import { User, AuthSession, AuthStatus, Language, UserRole } from '../../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  role: 'family' | 'provider';
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  preferredLanguage: Language;
}

export interface ResetPasswordResult {
  success: boolean;
  message: string;
  isDevelopment: boolean;
}

export interface IAuthAdapter {
  getSession(): Promise<{ session: AuthSession | null; user: User | null }>;
  login(credentials: LoginCredentials): Promise<{ session: AuthSession; user: User }>;
  signUp(data: SignUpData): Promise<{ session: AuthSession; user: User }>;
  logout(): Promise<void>;
  resetPassword(email: string): Promise<ResetPasswordResult>;
  refreshSession(): Promise<{ session: AuthSession | null; user: User | null }>;
}

export type { User, AuthSession, AuthStatus, UserRole };
