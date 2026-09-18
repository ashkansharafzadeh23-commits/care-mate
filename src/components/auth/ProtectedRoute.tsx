import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { hasRole } from '../../services/auth/authUtils';
import { HeartHandshake } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * ProtectedRoute
 * Guards routes requiring authentication and optional role-based authorization.
 * 
 * Flow:
 * 1. If auth is resolving (authStatus === 'loading'): displays a calm loading view (prevents content flashing).
 * 2. If unauthenticated: redirects to /login with a sanitized returnTo query param.
 * 3. If authenticated but role not allowed: redirects to /unauthorized.
 * 4. Otherwise: renders children.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { authStatus, isAuthenticated, user } = useAuthContext();
  const location = useLocation();

  // 1. Loading state: Prevents flashing protected UI
  if (authStatus === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 animate-pulse mb-4">
          <HeartHandshake className="w-8 h-8" />
        </div>
        <p className="text-sm font-medium text-text-500">Securing CareMate session...</p>
      </div>
    );
  }

  // 2. Unauthenticated: Redirect to login with return destination
  if (!isAuthenticated || !user) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
  }

  // 3. Role validation: Check if user's role is authorized
  if (allowedRoles && allowedRoles.length > 0 && !hasRole(user, allowedRoles)) {
    return <Navigate to="/unauthorized" replace state={{ attemptedPath: location.pathname, userRole: user.role }} />;
  }

  return <>{children}</>;
};

/**
 * RoleRoute is a convenience alias explicitly targeting role authorization.
 */
export const RoleRoute: React.FC<ProtectedRouteProps> = (props) => {
  return <ProtectedRoute {...props} />;
};
