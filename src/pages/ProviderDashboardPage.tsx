import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/Button';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  AlertCircle, 
  LogOut, 
  ChevronRight, 
  UserCheck, 
  FileText,
  Sparkles
} from 'lucide-react';

export default function ProviderDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const { language, setLanguage, isRTL } = useAppContext();

  // In this foundation phase, providers have an initial overview shell
  const [activeTab, setActiveTab] = useState<'schedule' | 'requests'>('schedule');

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Development sample appointments for provider testing
  const sampleAppointments = [
    {
      id: 'apt_1',
      clientName: 'Evelyn Miller',
      date: 'Today, 10:00 AM',
      duration: '2 hours',
      service: 'Mobility & Medication Reminder',
      status: 'confirmed',
      payout: '$70.00'
    },
    {
      id: 'apt_2',
      clientName: 'Robert Vance',
      date: 'Tomorrow, 2:00 PM',
      duration: '3 hours',
      service: 'Post-Surgery Physical Support',
      status: 'confirmed',
      payout: '$105.00'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-surface-50 p-6 pb-24">
      {/* Top Pro Header */}
      <header className="flex justify-between items-center mb-6 pt-safe">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-sm">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-bold text-text-900 leading-tight">
                {t('provider_dashboard.title')}
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Pro
              </span>
            </div>
            <p className="text-xs text-text-500">{t('provider_dashboard.subtitle')}</p>
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

      {/* Provider Welcome & Credential Verification Banner */}
      <div className="bg-white rounded-3xl p-5 border border-surface-200 shadow-2xs mb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xs text-text-400 font-medium">{t('provider_dashboard.welcome', { name: user?.firstName || 'Caregiver' })}</span>
            <h2 className="text-xl font-bold text-text-900">{user?.name}</h2>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg border border-emerald-100">
            {user?.firstName?.charAt(0) || 'P'}
          </div>
        </div>

        {/* Verification Status (Protected by TrustRecord principles) */}
        <div className="flex items-center gap-2 p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-xs text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{t('provider_dashboard.status_active')}</span>
          <span className="ms-auto text-[10px] text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded-full font-mono">
            ID & Lic. Verified
          </span>
        </div>
      </div>

      {/* Overview Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-surface-200 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-2">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-text-900">2</div>
          <div className="text-xs text-text-500">{t('provider_dashboard.upcoming_visits')}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-surface-200 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-text-900">$175</div>
          <div className="text-xs text-text-500">{t('provider_dashboard.weekly_earnings')}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-surface-100 rounded-2xl p-1 mb-4 border border-surface-200">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'schedule' ? 'bg-white text-text-900 shadow-2xs' : 'text-text-500 hover:text-text-900'}`}
        >
          {t('provider_dashboard.upcoming_visits')}
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'requests' ? 'bg-white text-text-900 shadow-2xs' : 'text-text-500 hover:text-text-900'}`}
        >
          {t('provider_dashboard.client_requests')}
        </button>
      </div>

      {/* Content for Tabs */}
      {activeTab === 'schedule' ? (
        <div className="space-y-3">
          {sampleAppointments.map(apt => (
            <div key={apt.id} className="bg-white p-4 rounded-2xl border border-surface-200 shadow-2xs">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-text-900 text-sm">{apt.clientName}</h3>
                  <p className="text-xs text-text-500">{apt.service}</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {apt.payout}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-text-400 mt-3 pt-3 border-t border-surface-100">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{apt.date}</span>
                </div>
                <span>•</span>
                <span>{apt.duration}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-surface-200 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-surface-50 flex items-center justify-center text-text-400 mx-auto mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-text-600 mb-1">
            {t('provider_dashboard.no_pending_requests')}
          </p>
          <p className="text-xs text-text-400">
            Care requests matching your skills and schedule will appear here.
          </p>
        </div>
      )}

      {/* Pro Action link */}
      <div className="mt-auto pt-6">
        <Link to="/provider-onboarding">
          <Button variant="outline" className="w-full text-xs font-semibold h-11 border-surface-200">
            <FileText className="w-4 h-4 me-1.5" />
            {t('provider_dashboard.complete_profile')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
