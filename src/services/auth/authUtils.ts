import { User, UserRole } from '../../types';

/**
 * ==============================================================================
 * ARCHITECTURAL SECURITY NOTICE
 * ==============================================================================
 * Frontend role and authorization checks implemented here provide User Experience
 * (UX) navigation gating and route protection ONLY.
 * 
 * In a production architecture:
 * - The backend API gateway and microservices must independently verify JWT
 *   signatures or session cookies on every request.
 * - Database security rules (e.g. Firestore Security Rules, Postgres RLS) must
 *   strictly enforce Role-Based Access Control (RBAC) independently of any client assertions.
 * - NEVER rely on frontend authorization logic as a boundary for sensitive data or operations.
 * ==============================================================================
 */

/**
 * Checks if the user holds one of the specified allowed roles.
 */
export function hasRole(user: User | null, allowedRoles: UserRole | UserRole[]): boolean {
  if (!user) return false;
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(user.role);
}

/**
 * Determines default landing route after successful authentication based on UserRole.
 */
export function getRoleDefaultRoute(role: UserRole): string {
  switch (role) {
    case 'family':
      return '/home';
    case 'provider':
      return '/provider-dashboard';
    case 'admin':
      return '/admin';
    default:
      return '/';
  }
}

/**
 * Validates a route against the user's role.
 */
export function canAccessRoute(user: User | null, pathname: string): boolean {
  if (!user) return false;

  // Admin has overarching operational access
  if (user.role === 'admin') return true;

  // Provider-exclusive routes
  if (pathname.startsWith('/provider-dashboard') || pathname.startsWith('/provider-onboarding')) {
    return user.role === 'provider';
  }

  // Admin-exclusive routes (admin already returned true above; if non-admin reaches here, deny)
  if (pathname.startsWith('/admin')) {
    return false;
  }

  // Family-exclusive routes (home, onboarding, chat, dashboard, results, book, map, settings)
  const familyRoutes = ['/home', '/onboarding', '/chat', '/results', '/find-care', '/dashboard', '/book', '/settings'];
  const isFamilyRoute = familyRoutes.some(r => pathname === r || pathname.startsWith(`${r}/`));

  if (isFamilyRoute) {
    return user.role === 'family';
  }

  return true;
}

/**
 * Sanitizes and validates returnTo parameters to prevent Open Redirect vulnerabilities.
 * 
 * Rules:
 * - Must be a relative path starting with a single '/'
 * - Must NOT start with '//' (protocol-relative URL)
 * - Must NOT contain scheme identifiers like 'http:', 'https:', 'javascript:'
 */
export function sanitizeReturnTo(returnTo: string | null | undefined, fallback: string = '/home'): string {
  if (!returnTo) return fallback;

  const trimmed = returnTo.trim();

  // Ensure it starts with / but not //
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return fallback;
  }

  // Reject URLs with protocol or javascript pseudo-protocols
  if (/^(\/\\|[a-zA-Z][a-zA-Z0-9+.-]*:)/.test(trimmed)) {
    return fallback;
  }

  return trimmed;
}
