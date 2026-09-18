/**
 * DEVELOPMENT ONLY — Development Authentication Adapter
 * ====================================================
 * WARNING: This adapter is strictly for local frontend development and prototyping.
 * It simulates authentication flows without communicating with a production identity provider.
 * 
 * In production:
 * Replace this adapter in AuthService with a production adapter (Firebase Auth, Supabase,
 * Auth0, or custom backend API) that utilizes HTTP-only Secure cookies and server-side verification.
 * 
 * SECURITY RULES ENFORCED:
 * - No passwords or secrets are ever persisted in localStorage or sessionStorage.
 * - Only minimal, non-sensitive session identifiers (userId, role) are kept in dev session storage.
 * - Admin registration is strictly prohibited via public sign-up methods.
 */

import { IAuthAdapter, LoginCredentials, SignUpData, ResetPasswordResult } from './authTypes';
import { User, AuthSession } from '../../types';
import { DEVELOPMENT_USERS } from '../fixtures/developmentFixtures';

const DEV_SESSION_STORAGE_KEY = 'caremate_dev_session';
const DEV_DYNAMIC_USERS_STORAGE_KEY = 'caremate_dev_dynamic_users';

export class DevelopmentAuthAdapter implements IAuthAdapter {
  private dynamicUsers: User[] = [];

  constructor() {
    this.loadDynamicUsers();
  }

  private loadDynamicUsers() {
    try {
      const stored = localStorage.getItem(DEV_DYNAMIC_USERS_STORAGE_KEY);
      if (stored) {
        this.dynamicUsers = JSON.parse(stored);
      }
    } catch {
      this.dynamicUsers = [];
    }
  }

  private saveDynamicUsers() {
    try {
      localStorage.setItem(DEV_DYNAMIC_USERS_STORAGE_KEY, JSON.stringify(this.dynamicUsers));
    } catch {
      // Storage unavailable or quota exceeded
    }
  }

  public async getSession(): Promise<{ session: AuthSession | null; user: User | null }> {
    // Simulate slight async network delay
    await new Promise(res => setTimeout(res, 80));

    try {
      const stored = localStorage.getItem(DEV_SESSION_STORAGE_KEY);
      if (!stored) {
        return { session: null, user: null };
      }

      const session: AuthSession = JSON.parse(stored);
      // Check expiration if set
      if (session.expiresAt && new Date(session.expiresAt) <= new Date()) {
        localStorage.removeItem(DEV_SESSION_STORAGE_KEY);
        return { session: null, user: null };
      }

      // Find user from fixtures or dynamic users
      const user = this.findUserById(session.userId);
      if (!user) {
        localStorage.removeItem(DEV_SESSION_STORAGE_KEY);
        return { session: null, user: null };
      }

      return { session, user };
    } catch {
      localStorage.removeItem(DEV_SESSION_STORAGE_KEY);
      return { session: null, user: null };
    }
  }

  public async login(credentials: LoginCredentials): Promise<{ session: AuthSession; user: User }> {
    await new Promise(res => setTimeout(res, 350));

    const normalizedEmail = credentials.email.trim().toLowerCase();

    // 1. Check development fixtures
    const fixtureUser = DEVELOPMENT_USERS.find(
      u => u.email.toLowerCase() === normalizedEmail
    );

    let user: User | null = null;

    if (fixtureUser) {
      // In dev mode, fixture accounts accept their fixture password or any non-empty demo password
      if (!credentials.password) {
        throw new Error('Please enter your password.');
      }
      user = {
        id: fixtureUser.id,
        firstName: fixtureUser.firstName,
        lastName: fixtureUser.lastName,
        name: `${fixtureUser.firstName} ${fixtureUser.lastName}`,
        email: fixtureUser.email,
        phone: fixtureUser.phone,
        role: fixtureUser.role,
        preferredLanguage: fixtureUser.preferredLanguage,
        createdAt: fixtureUser.createdAt,
        activeFamilyCircleId: fixtureUser.activeFamilyCircleId
      };
    } else {
      // 2. Check dynamic users registered during the current dev lifecycle
      const found = this.dynamicUsers.find(u => u.email.toLowerCase() === normalizedEmail);
      if (found) {
        user = found;
      }
    }

    if (!user) {
      throw new Error('Invalid email or password. Please verify your credentials.');
    }

    const session: AuthSession = {
      userId: user.id,
      role: user.role,
      // 7-day development session expiry
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    try {
      localStorage.setItem(DEV_SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Ignore storage error
    }

    return { session, user };
  }

  public async signUp(data: SignUpData): Promise<{ session: AuthSession; user: User }> {
    await new Promise(res => setTimeout(res, 400));

    // SECURITY: Reject any attempt to register as an admin through public registration
    if ((data.role as string) === 'admin') {
      throw new Error('Administrative accounts cannot be created via public registration.');
    }

    const normalizedEmail = data.email.trim().toLowerCase();

    // Check duplicate
    const emailExistsInFixtures = DEVELOPMENT_USERS.some(u => u.email.toLowerCase() === normalizedEmail);
    const emailExistsInDynamic = this.dynamicUsers.some(u => u.email.toLowerCase() === normalizedEmail);

    if (emailExistsInFixtures || emailExistsInDynamic) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      name: `${data.firstName.trim()} ${data.lastName.trim()}`,
      email: normalizedEmail,
      phone: data.phone?.trim() || undefined,
      role: data.role,
      preferredLanguage: data.preferredLanguage || 'en',
      createdAt: new Date().toISOString()
    };

    // Store in dynamic dev users list (NO password stored)
    this.dynamicUsers.push(newUser);
    this.saveDynamicUsers();

    const session: AuthSession = {
      userId: newUser.id,
      role: newUser.role,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    try {
      localStorage.setItem(DEV_SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Ignore storage error
    }

    return { session, user: newUser };
  }

  public async logout(): Promise<void> {
    await new Promise(res => setTimeout(res, 50));
    try {
      localStorage.removeItem(DEV_SESSION_STORAGE_KEY);
    } catch {
      // Ignore storage error
    }
  }

  public async resetPassword(email: string): Promise<ResetPasswordResult> {
    await new Promise(res => setTimeout(res, 300));
    // To prevent account enumeration in production-oriented UX, we return a success status
    // while noting for development that email delivery requires a production backend.
    return {
      success: true,
      message: 'If an account exists with this email, password reset instructions have been sent.',
      isDevelopment: true
    };
  }

  public async refreshSession(): Promise<{ session: AuthSession | null; user: User | null }> {
    return this.getSession();
  }

  private findUserById(id: string): User | null {
    const fixture = DEVELOPMENT_USERS.find(u => u.id === id);
    if (fixture) {
      return {
        id: fixture.id,
        firstName: fixture.firstName,
        lastName: fixture.lastName,
        name: `${fixture.firstName} ${fixture.lastName}`,
        email: fixture.email,
        phone: fixture.phone,
        role: fixture.role,
        preferredLanguage: fixture.preferredLanguage,
        createdAt: fixture.createdAt,
        activeFamilyCircleId: fixture.activeFamilyCircleId
      };
    }
    const dynamic = this.dynamicUsers.find(u => u.id === id);
    return dynamic || null;
  }
}
