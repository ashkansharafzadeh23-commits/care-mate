import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/Button';
import { useAppContext } from '../context/AppContext';
import { HeartHandshake, UserPlus, Share2 } from 'lucide-react';

export default function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language, setLanguage } = useAppContext();
  const [step, setStep] = useState(1);

  const nextStep = () => setStep(s => s + 1);

  return (
    <div className="flex flex-col min-h-screen p-6 relative">
      {/* Language Switcher */}
      <div className="absolute top-6 right-6 left-6 flex justify-between items-center z-10">
        <div className="text-xl font-bold text-primary-600 tracking-tight">CareMate</div>
        <div className="flex bg-surface-100 rounded-full p-1">
          <button 
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${language === 'en' ? 'bg-white shadow-sm text-primary-600' : 'text-text-500'}`}
          >
            EN
          </button>
          <button 
            onClick={() => setLanguage('fa')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${language === 'fa' ? 'bg-white shadow-sm text-primary-600' : 'text-text-500'}`}
          >
            فا
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center mt-12">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center text-center space-y-6"
            >
              <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center text-primary-500 mb-4">
                <HeartHandshake className="w-12 h-12" />
              </div>
              <h1 className="text-3xl font-bold text-text-900 leading-tight">{t('onboarding.welcome')}</h1>
              <p className="text-lg text-text-500">{t('onboarding.subtitle')}</p>
              
              <div className="w-full pt-8">
                <Button className="w-full mb-3" onClick={nextStep}>{t('onboarding.get_started')}</Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center text-center space-y-6 w-full"
            >
              <div className="w-20 h-20 bg-surface-100 rounded-full flex items-center justify-center text-text-700 mb-2">
                <UserPlus className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-text-900">{t('onboarding.add_parent')}</h2>
              
              <div className="w-full space-y-4 text-start mt-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-700 mx-2">{t('onboarding.parent_name')}</label>
                  <input type="text" defaultValue="Evelyn" className="w-full h-12 px-4 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-700 mx-2">{t('onboarding.parent_age')}</label>
                  <input type="number" defaultValue="78" className="w-full h-12 px-4 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                </div>
              </div>

              <div className="w-full pt-8 space-y-3">
                <Button className="w-full" onClick={nextStep}>{t('onboarding.continue')}</Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center space-y-6 w-full"
            >
              <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center text-primary-500 mb-2">
                <Share2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-text-900">{t('onboarding.invite_family')}</h2>
              <p className="text-text-500 leading-relaxed px-4">{t('onboarding.invite_desc')}</p>
              
              <div className="w-full p-4 bg-surface-50 rounded-2xl border border-surface-200 mt-4 flex items-center justify-between">
                <span dir="ltr" className="text-sm text-text-500 truncate me-4">caremate.app/invite/ev-123</span>
                <Button variant="secondary" size="sm" onClick={() => {}}>{t('common.save')}</Button>
              </div>

              <div className="w-full pt-8 space-y-3 flex flex-col">
                <Button className="w-full" onClick={() => navigate('/home')}>{t('onboarding.share_link')}</Button>
                <Button variant="ghost" className="w-full" onClick={() => navigate('/home')}>{t('onboarding.skip')}</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
