import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { useAuthContext } from '../context/AuthContext';
import { Globe, Bell, CreditCard, LogOut, Users, Sparkles, User as UserIcon, Shield, Heart, Plus, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language, setLanguage, careRecipients, activeRecipientId, setActiveCareRecipientId } = useAppContext();
  const { user, logout } = useAuthContext();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-50 p-6">
      <header className="mt-4 mb-6">
        <h1 className="text-2xl font-bold text-text-900">{t('settings.title')}</h1>
      </header>

      <div className="flex items-center p-4 bg-white rounded-3xl border border-surface-200 shadow-sm mb-6">
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
        {/* Care Recipients Section (For Family Users) */}
        {user?.role === 'family' && (
          <div className="bg-white rounded-3xl border border-surface-200 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-surface-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
                  <Heart className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-text-900">Care Recipients</span>
              </div>
              <button
                onClick={() => navigate('/onboarding?mode=add')}
                className="text-xs font-semibold text-primary-700 hover:text-primary-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {careRecipients.length > 0 ? (
              <div className="space-y-2">
                {careRecipients.map((recipient) => {
                  const name = recipient.preferredName || recipient.firstName || recipient.name || 'Loved One';
                  const isActive = recipient.id === activeRecipientId;
                  return (
                    <div
                      key={recipient.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                        isActive ? 'bg-primary-50/50 border-primary-300' : 'bg-surface-50 border-surface-200'
                      }`}
                    >
                      <div 
                        className="flex items-center gap-3 cursor-pointer flex-1"
                        onClick={() => setActiveCareRecipientId(recipient.id)}
                      >
                        <div className="w-8 h-8 rounded-full bg-white text-primary-700 flex items-center justify-center font-bold text-xs border border-surface-200">
                          {name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-text-900">{name}</span>
                            {isActive && (
                              <span className="text-[9px] bg-primary-200/60 text-primary-900 px-1.5 py-0.5 rounded-full font-bold">
                                Active
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-text-500">
                            {recipient.customRelationship || t(`relationship.${recipient.relationshipToPrimaryUser || 'other'}`)} • {recipient.age} yrs
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/care/${recipient.id}`)}
                        className="p-1.5 text-text-400 hover:text-primary-700 rounded-lg ms-2"
                        title="View Profile"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-text-400 py-1">No care recipients added yet.</p>
            )}
          </div>
        )}

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
