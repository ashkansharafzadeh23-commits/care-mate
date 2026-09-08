import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Upload, CheckCircle2, User, FileText } from 'lucide-react';
import { Button } from '../components/Button';
import { useAppContext } from '../context/AppContext';

export default function ProviderOnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    specialties: '',
    hourlyRate: ''
  });

  const [idPhoto, setIdPhoto] = useState<File | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mock upload and registration
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        navigate('/'); // Redirect to landing or dashboard after success
      }, 2000);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-50">
      <header className="flex items-center p-4 bg-white border-b border-surface-200 pt-safe sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ms-2 text-text-700 hover:text-text-900 rounded-full hover:bg-surface-50 rtl:rotate-180">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-text-900 mx-auto text-center pointer-events-none -ms-4">
          {t('provider_onboarding.title')}
        </h1>
      </header>

      <main className="flex-1 p-6 pb-safe overflow-y-auto">
        <div className="text-center mb-8">
          <p className="text-text-600 mt-2">{t('provider_onboarding.subtitle')}</p>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center h-48 animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="w-16 h-16 text-primary-500 mb-4" />
            <h2 className="text-xl font-bold text-text-900">Success!</h2>
            <p className="text-text-500 text-center mt-2">Your profile is under review.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-text-900 mb-2">{t('provider_onboarding.full_name')}</label>
                <input 
                  type="text" 
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full bg-white border border-surface-200 rounded-2xl px-4 py-3 outline-none focus:border-primary-500 transition-colors"
                  placeholder="e.g. Sarah Johnson"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-900 mb-2">{t('provider_onboarding.specialties')}</label>
                <input 
                  type="text" 
                  required
                  value={formData.specialties}
                  onChange={(e) => setFormData({...formData, specialties: e.target.value})}
                  className="w-full bg-white border border-surface-200 rounded-2xl px-4 py-3 outline-none focus:border-primary-500 transition-colors"
                  placeholder="Dementia, Mobility, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-900 mb-2">{t('provider_onboarding.hourly_rate')}</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                  className="w-full bg-white border border-surface-200 rounded-2xl px-4 py-3 outline-none focus:border-primary-500 transition-colors"
                  placeholder="25"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-4 border-t border-surface-200 pt-6">
              {/* Profile Photo Upload */}
              <div>
                <label className="block text-sm font-bold text-text-900 mb-2">{t('provider_onboarding.upload_photo')}</label>
                <label className="flex items-center gap-4 p-4 border-2 border-dashed border-surface-300 rounded-2xl bg-white cursor-pointer hover:border-primary-400 transition-colors relative">
                  <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-text-900 truncate">
                      {profilePhoto ? profilePhoto.name : 'Choose an image'}
                    </p>
                    <p className="text-xs text-text-500 mt-1">JPG, PNG</p>
                  </div>
                  <Upload className="w-5 h-5 text-text-400 shrink-0" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    required
                    onChange={(e) => handleFileChange(e, setProfilePhoto)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </label>
              </div>

              {/* ID/Certificate Upload */}
              <div>
                <label className="block text-sm font-bold text-text-900 mb-2">{t('provider_onboarding.upload_id')}</label>
                <label className="flex items-center gap-4 p-4 border-2 border-dashed border-surface-300 rounded-2xl bg-white cursor-pointer hover:border-primary-400 transition-colors relative">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-text-900 truncate">
                      {idPhoto ? idPhoto.name : 'Choose a document/image'}
                    </p>
                    <p className="text-xs text-text-500 mt-1">JPG, PNG, PDF</p>
                  </div>
                  <Upload className="w-5 h-5 text-text-400 shrink-0" />
                  <input 
                    type="file" 
                    accept="image/*,application/pdf" 
                    required
                    onChange={(e) => handleFileChange(e, setIdPhoto)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full mt-8" 
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('common.loading') : t('provider_onboarding.submit')}
            </Button>
          </form>
        )}
      </main>
    </div>
  );
}
