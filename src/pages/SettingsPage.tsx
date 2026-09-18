import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { useAuthContext } from '../context/AuthContext';
import { Globe, Bell, CreditCard, LogOut, Users, Sparkles, User as UserIcon, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language, setLanguage } = useAppContext();
  const { user, logout } = useAuthContext();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-50 p-6">
      <header className="mt-4 mb-8">
        <h1 className="text-2xl font-bold text-text-900">{t('settings.title')}</h1>
      </header>

      <div className="flex items-center p-4 bg-white rounded-3xl border border-surface-200 shadow-sm mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 me-4 text-xl font-bold shrink-0">
          {user?.firstName?.charAt(0) || user?.name?.charAt(0) || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-xl font-bold text-text-900 truncate">{user?.name}</h2>
            {user?.role && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full shrink-0">
                {user.role}
              </span>
            )}
          </div>
          <p className="text-text-500 text-sm truncate">{user?.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Language Toggle */}
        <div className="bg-white rounded-3xl border border-surface-200 overflow-hidden shadow-sm">
          <div className="p-4 flex items-center justify-between border-b border-surface-100 last:border-0">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-surface-50 flex items-center justify-center text-text-700 me-4">
                <Globe className="w-5 h-5" />
              </div>
              <span className="font-semibold text-text-900">{t('settings.language')}</span>
            </div>
            
            <div className="flex bg-surface-100 rounded-full p-1">
              <button 
                onClick={() => setLanguage('en')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${language === 'en' ? 'bg-white shadow-sm text-primary-600' : 'text-text-500'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('fa')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${language === 'fa' ? 'bg-white shadow-sm text-primary-600' : 'text-text-500'}`}
              >
                فارسی
              </button>
            </div>
          </div>

          {/* Menu Items */}
          {[
            { icon: Users, label: 'Family Circle' },
            { icon: Bell, label: t('settings.notifications') },
            { icon: CreditCard, label: t('settings.payment') },
            { icon: Sparkles, label: t('settings.subscription'), value: 'Free' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <button key={i} className="w-full p-4 flex items-center justify-between border-b border-surface-100 last:border-0 hover:bg-surface-50 transition-colors">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-surface-50 flex items-center justify-center text-text-700 me-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-text-900">{item.label}</span>
                </div>
                {item.value && <span className="text-sm font-medium text-text-500">{item.value}</span>}
              </button>
            );
          })}
        </div>

        <button 
          onClick={handleLogout}
          className="w-full bg-white rounded-3xl border border-surface-200 p-4 flex items-center text-accent-500 hover:bg-accent-50 transition-colors shadow-sm"
        >
          <div className="w-10 h-10 rounded-full bg-accent-50 flex items-center justify-center me-4">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="font-semibold">{t('settings.logout')}</span>
        </button>
      </div>
    </div>
  );
}
