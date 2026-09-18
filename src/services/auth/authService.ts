import { IAuthAdapter, LoginCredentials, SignUpData, ResetPasswordResult } from './authTypes';
import { User, AuthSession } from '../../types';
import { DevelopmentAuthAdapter } from './developmentAuthAdapter';

/**
 * AuthService
 * Central authentication gateway for CareMate.
 * 
 * Architecture:
 * - Uses an adapter pattern (IAuthAdapter).
 * - Currently initialized with DevelopmentAuthAdapter.
 * - Replaceable with SupabaseAuthAdapter, FirebaseAuthAdapter, or CustomBackendAuthAdapter
 *   without modifying any frontend pages or components.
 */
class AuthService {
  private adapter: IAuthAdapter;

  constructor(adapter?: IAuthAdapter) {
    this.adapter = adapter || new DevelopmentAuthAdapter();
  }

  /**
   * Set a custom or production adapter at runtime or bootstrap.
   */
  public setAdapter(adapter: IAuthAdapter): void {
    this.adapter = adapter;
  }

  public async getSession(): Promise<{ session: AuthSession | null; user: User | null }> {
    return this.adapter.getSession();
  }

  public async login(credentials: LoginCredentials): Promise<{ session: AuthSession; user: User }> {
    return this.adapter.login(credentials);
  }

  public async signUp(data: SignUpData): Promise<{ session: AuthSession; user: User }> {
    return this.adapter.signUp(data);
  }

  public async logout(): Promise<void> {
    return this.adapter.logout();
  }

  public async resetPassword(email: string): Promise<ResetPasswordResult> {
    return this.adapter.resetPassword(email);
  }

  public async refreshSession(): Promise<{ session: AuthSession | null; user: User | null }> {
    return this.adapter.refreshSession();
  }
}

export const authService = new AuthService();
export * from './authTypes';
