import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Sparkles, Users } from 'lucide-react';
import { Button } from '../components/Button';
import { useAppContext } from '../context/AppContext';
import heroImage from '../assets/images/caremate_hero_1788327490038.jpg';

export default function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language, setLanguage } = useAppContext();

  return (
    <div className="flex flex-col min-h-screen bg-surface-50 relative">
      {/* Header with Language Switcher */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 pt-safe">
        <div className="text-xl font-bold text-white drop-shadow-md tracking-tight">CareMate</div>
        <div className="flex bg-black/20 backdrop-blur-md rounded-full p-1 border border-white/20">
          <button 
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${language === 'en' ? 'bg-white text-primary-700 shadow-sm' : 'text-white/90 hover:text-white'}`}
          >
            EN
          </button>
          <button 
            onClick={() => setLanguage('fa')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${language === 'fa' ? 'bg-white text-primary-700 shadow-sm' : 'text-white/90 hover:text-white'}`}
          >
            فا
          </button>
        </div>
      </header>

      {/* Hero Image Section */}
      <div className="relative h-[45vh] w-full shrink-0">
        <img 
          src={heroImage} 
          alt="Family connection" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-50 via-surface-50/20 to-black/30"></div>
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col px-6 -mt-12 relative z-10">
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-surface-200 text-center mb-8">
          <h1 className="text-2xl font-bold text-text-900 leading-tight mb-3">
            {t('landing.headline')}
          </h1>
          <p className="text-text-500 leading-relaxed">
            {t('landing.subheadline')}
          </p>
        </div>

        {/* Pillars */}
        <div className="space-y-4 mb-8 px-2">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 me-4 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="font-semibold text-text-900">{t('landing.pillar1')}</span>
          </div>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 me-4 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="font-semibold text-text-900">{t('landing.pillar2')}</span>
          </div>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 me-4 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <span className="font-semibold text-text-900">{t('landing.pillar3')}</span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-auto pb-safe flex flex-col space-y-3">
          <Button className="w-full" size="lg" onClick={() => navigate('/onboarding')}>
            {t('landing.get_started')}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => navigate('/home')}>
            {t('landing.login')}
          </Button>
          <div className="w-full h-px bg-surface-200 my-2"></div>
          <Button variant="outline" className="w-full text-text-600" onClick={() => navigate('/provider-signup')}>
            {t('landing.register_caregiver')}
          </Button>
        </div>
      </div>
    </div>
  );
}
