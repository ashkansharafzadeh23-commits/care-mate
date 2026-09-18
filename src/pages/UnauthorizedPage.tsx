import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../context/AuthContext';
import { Button } from '../components/Button';
import { getRoleDefaultRoute } from '../services/auth/authUtils';
import { ShieldAlert, LogOut, ArrowRight, Home } from 'lucide-react';

export default function UnauthorizedPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthContext();

  const state = (location.state as any) || {};
  const currentRole = user?.role || state.userRole || 'unauthenticated';

  const handleReturnToDashboard = () => {
    if (user) {
      navigate(getRoleDefaultRoute(user.role), { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  const handleLogoutAndSwitch = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex flex-col min-h-screen p-6 bg-surface-50 items-center justify-center text-center">
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-surface-200 max-w-md w-full">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-5">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-text-900 mb-2">
          {t('unauthorized.title')}
        </h1>

        <p className="text-sm text-text-500 mb-4 leading-relaxed">
          {t('unauthorized.message')}
        </p>

        <div className="inline-block px-3 py-1 rounded-full bg-surface-100 text-xs font-semibold text-text-700 mb-6">
          {t('unauthorized.current_role', { role: currentRole.toUpperCase() })}
        </div>

        <div className="space-y-3">
          <Button 
            className="w-full h-12 font-semibold"
            onClick={handleReturnToDashboard}
          >
            <Home className="w-4 h-4 me-2" />
            {t('unauthorized.go_dashboard')}
          </Button>

          <Button 
            variant="outline" 
            className="w-full h-12 text-text-700"
            onClick={handleLogoutAndSwitch}
          >
            <LogOut className="w-4 h-4 me-2" />
            {t('unauthorized.switch_account')}
          </Button>
        </div>
      </div>
    </div>
  );
}
