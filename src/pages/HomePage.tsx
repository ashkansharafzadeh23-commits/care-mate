import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Search, HeartPulse, Sparkles, Bell } from 'lucide-react';
import { EmergencyFAB } from '../components/EmergencyFAB';

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, parent } = useAppContext();

  return (
    <div className="flex flex-col min-h-screen p-6">
      <EmergencyFAB />
      
      <header className="flex justify-between items-center mt-16 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-900">
            {t('home.greeting', { name: user?.name || 'User' })}
          </h1>
          <p className="text-text-500 mt-1">Ready to coordinate care?</p>
        </div>
        <button className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center text-text-700 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 end-2 w-2 h-2 bg-accent-500 rounded-full"></span>
        </button>
      </header>

      <div className="space-y-4">
        {/* Ask CareMate AI */}
        <button 
          onClick={() => navigate('/chat')}
          className="w-full bg-primary-600 rounded-3xl p-6 text-start relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow flex items-center"
        >
          <div className="absolute -end-6 -top-6 w-32 h-32 bg-primary-500 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
          
          <div className="flex-1 relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary-100" />
              <h2 className="text-xl font-semibold text-white">{t('home.chat_title')}</h2>
            </div>
            <p className="text-primary-50 pe-8">{t('home.chat_desc')}</p>
          </div>
        </button>

        <div className="grid grid-cols-2 gap-4">
          {/* Find Care */}
          <button 
            onClick={() => navigate('/find-care')}
            className="bg-white border border-surface-200 rounded-3xl p-5 text-start flex flex-col items-start justify-between h-40 hover:border-primary-200 transition-colors shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center text-text-700 mb-4">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-text-900 mb-1">{t('home.find_care_title')}</h3>
              <p className="text-xs text-text-500">{t('home.find_care_desc')}</p>
            </div>
          </button>

          {/* Health Dashboard */}
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-white border border-surface-200 rounded-3xl p-5 text-start flex flex-col items-start justify-between h-40 hover:border-primary-200 transition-colors shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-accent-500/10 flex items-center justify-center text-accent-500 mb-4">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-text-900 mb-1">
                {t('home.health_title', { name: parent?.name || 'Parent' })}
              </h3>
              <p className="text-xs text-text-500">{t('home.health_desc')}</p>
            </div>
          </button>
        </div>
      </div>
      
      <div className="mt-auto pt-8">
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-center">
          <p className="text-xs text-orange-800 font-medium">{t('home.emergency_warning')}</p>
        </div>
      </div>
    </div>
  );
}
