import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/Button';
import { 
  ShieldCheck, 
  Users, 
  Stethoscope, 
  Activity, 
  LogOut, 
  AlertTriangle,
  FileCheck2,
  Lock
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const { language, setLanguage } = useAppContext();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-50 p-6">
      {/* Top Admin Header */}
      <header className="flex justify-between items-center mb-6 pt-safe">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-text-900 flex items-center justify-center text-white font-bold shadow-sm">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-bold text-text-900 leading-tight">
                {t('admin.title')}
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-text-100 text-text-800 px-2 py-0.5 rounded-full">
                Admin
              </span>
            </div>
            <p className="text-xs text-text-500">{t('admin.subtitle')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex bg-surface-100 rounded-full p-0.5 border border-surface-200">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${language === 'en' ? 'bg-white shadow-2xs text-primary-600' : 'text-text-500'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('fa')}
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${language === 'fa' ? 'bg-white shadow-2xs text-primary-600' : 'text-text-500'}`}
            >
              فا
            </button>
          </div>

          <button
            onClick={handleLogout}
            title={t('settings.logout')}
            className="p-2 text-text-400 hover:text-accent-500 rounded-xl hover:bg-surface-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Admin Notice */}
      <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5 mb-6">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Confidential System: </span>
          <span>{t('admin.restricted_notice')}</span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="space-y-3 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-surface-200 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-900">{t('admin.system_status')}</h3>
              <p className="text-xs text-text-500">All services nominal</p>
            </div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-surface-200 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-900">{t('admin.pending_verifications')}</h3>
              <p className="text-xs text-text-500">1 provider awaiting background audit</p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold bg-primary-50 text-primary-700 rounded-full">
            1
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-surface-200 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-900">{t('admin.active_family_circles')}</h3>
              <p className="text-xs text-text-500">Across San Francisco & Bay Area</p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold bg-purple-50 text-purple-700 rounded-full">
            12
          </span>
        </div>
      </div>

      {/* Operational session info */}
      <div className="mt-auto bg-surface-100/70 border border-surface-200 rounded-2xl p-4 text-xs text-text-500">
        <p className="font-semibold text-text-700 mb-1">Authenticated Operator:</p>
        <p>{user?.name} ({user?.email})</p>
        <p className="text-[11px] text-text-400 mt-1">Role: {user?.role.toUpperCase()}</p>
      </div>
    </div>
  );
}
