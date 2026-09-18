import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { careRecipientService } from '../services/careRecipientService';
import { Button } from '../components/Button';
import { Language } from '../types';
import { 
  HeartHandshake, 
  Users, 
  Stethoscope, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Phone, 
  Globe, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

export default function SignUpPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp } = useAuthContext();
  const { language, setLanguage, isRTL } = useAppContext();

  // Role can be pre-selected via query param (e.g. /signup?role=provider)
  const initialRole = searchParams.get('role') === 'provider' ? 'provider' : null;
  const [selectedRole, setSelectedRole] = useState<'family' | 'provider' | null>(initialRole);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    preferredLanguage: language as Language
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRoleSelect = (role: 'family' | 'provider') => {
    setSelectedRole(role);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedRole) {
      setErrorMessage(t('auth.choose_role_title'));
      return;
    }

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.password) {
      setErrorMessage(t('auth.errors.missing_fields'));
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setErrorMessage(t('auth.errors.invalid_email'));
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage(t('auth.errors.password_short'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage(t('auth.errors.password_mismatch'));
      return;
    }

    setIsSubmitting(true);
    try {
      const { user } = await signUp({
        role: selectedRole,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        password: formData.password,
        preferredLanguage: formData.preferredLanguage
      });

      // Role-specific post-signup routing
      if (user.role === 'family') {
        const recipients = careRecipientService.getRecipients(user.id);
        if (recipients.length === 0) {
          navigate('/onboarding', { replace: true });
        } else {
          navigate('/home', { replace: true });
        }
      } else {
        // Provider signup routes to professional credentials onboarding
        navigate('/provider-onboarding', { replace: true });
      }
    } catch (err: any) {
      setErrorMessage(err.message || t('auth.errors.generic'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6 bg-surface-50 relative">
      {/* Top Header */}
      <header className="flex justify-between items-center mb-6 pt-safe">
        {selectedRole ? (
          <button 
            type="button"
            onClick={() => setSelectedRole(null)}
            className="flex items-center gap-1 text-sm font-semibold text-text-600 hover:text-text-900 transition-colors"
          >
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            <span>{t('common.back')}</span>
          </button>
        ) : (
          <Link to="/" className="flex items-center gap-2 text-primary-600 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
              <HeartHandshake className="w-5 h-5" />
            </div>
            CareMate
          </Link>
        )}

        <div className="flex bg-surface-100 rounded-full p-1 border border-surface-200 ms-auto">
          <button 
            type="button"
            onClick={() => {
              setLanguage('en');
              setFormData(f => ({ ...f, preferredLanguage: 'en' }));
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${language === 'en' ? 'bg-white shadow-sm text-primary-600' : 'text-text-500'}`}
          >
            EN
          </button>
          <button 
            type="button"
            onClick={() => {
              setLanguage('fa');
              setFormData(f => ({ ...f, preferredLanguage: 'fa' }));
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${language === 'fa' ? 'bg-white shadow-sm text-primary-600' : 'text-text-500'}`}
          >
            فا
          </button>
        </div>
      </header>

      {/* STEP 1: ROLE SELECTION */}
      {!selectedRole && (
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-text-900 mb-2">{t('auth.choose_role_title')}</h1>
            <p className="text-text-500 text-sm">{t('auth.choose_role_subtitle')}</p>
          </div>

          <div className="space-y-4 mb-8">
            {/* Family Role Option */}
            <button
              type="button"
              onClick={() => handleRoleSelect('family')}
              className="w-full bg-white p-5 rounded-3xl border-2 border-surface-200 hover:border-primary-500 text-start transition-all shadow-2xs hover:shadow-sm flex items-start gap-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-text-900 mb-1 group-hover:text-primary-600 transition-colors">
                  {t('auth.role_family_title')}
                </h3>
                <p className="text-xs text-text-500 leading-relaxed">
                  {t('auth.role_family_desc')}
                </p>
              </div>
            </button>

            {/* Provider Role Option */}
            <button
              type="button"
              onClick={() => handleRoleSelect('provider')}
              className="w-full bg-white p-5 rounded-3xl border-2 border-surface-200 hover:border-primary-500 text-start transition-all shadow-2xs hover:shadow-sm flex items-start gap-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-text-900 mb-1 group-hover:text-emerald-600 transition-colors">
                  {t('auth.role_provider_title')}
                </h3>
                <p className="text-xs text-text-500 leading-relaxed">
                  {t('auth.role_provider_desc')}
                </p>
              </div>
            </button>
          </div>

          <div className="text-center text-sm text-text-500">
            <span>{t('auth.have_account')} </span>
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
              {t('auth.login_button')}
            </Link>
          </div>
        </div>
      )}

      {/* STEP 2: REGISTRATION FORM */}
      {selectedRole && (
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-surface-200 my-auto">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 mb-2">
              {selectedRole === 'family' ? t('auth.role_family_title') : t('auth.role_provider_title')}
            </span>
            <h1 className="text-2xl font-bold text-text-900 mb-1">
              {selectedRole === 'family' ? t('auth.signup_family_title') : t('auth.signup_provider_title')}
            </h1>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-accent-500/10 border border-accent-500/20 text-accent-600 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-700 uppercase tracking-wider mb-1.5 ms-1">
                  {t('auth.first_name')}
                </label>
                <div className="relative flex items-center">
                  <div className="absolute start-3 text-text-400 pointer-events-none">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full h-11 ps-9 pe-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    disabled={isSubmitting}
                    autoComplete="given-name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-700 uppercase tracking-wider mb-1.5 ms-1">
                  {t('auth.last_name')}
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                  disabled={isSubmitting}
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-700 uppercase tracking-wider mb-1.5 ms-1">
                {t('auth.email')}
              </label>
              <div className="relative flex items-center">
                <div className="absolute start-3.5 text-text-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  dir="ltr"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t('auth.email_placeholder')}
                  className="w-full h-11 ps-10 pe-4 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-700 uppercase tracking-wider mb-1.5 ms-1">
                {t('auth.phone')}
              </label>
              <div className="relative flex items-center">
                <div className="absolute start-3.5 text-text-400 pointer-events-none">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  dir="ltr"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full h-11 ps-10 pe-4 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                  disabled={isSubmitting}
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-700 uppercase tracking-wider mb-1.5 ms-1">
                  {t('auth.password')}
                </label>
                <div className="relative flex items-center">
                  <div className="absolute start-3 text-text-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-11 ps-9 pe-9 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    disabled={isSubmitting}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-2 text-text-400 hover:text-text-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-700 uppercase tracking-wider mb-1.5 ms-1">
                  {t('auth.confirm_password')}
                </label>
                <div className="relative flex items-center">
                  <div className="absolute start-3 text-text-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full h-11 ps-9 pe-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    disabled={isSubmitting}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-700 uppercase tracking-wider mb-1.5 ms-1">
                {t('auth.preferred_language')}
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, preferredLanguage: 'en' })}
                  className={`flex-1 h-10 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${formData.preferredLanguage === 'en' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-surface-200 bg-surface-50 text-text-600'}`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, preferredLanguage: 'fa' })}
                  className={`flex-1 h-10 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${formData.preferredLanguage === 'fa' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-surface-200 bg-surface-50 text-text-600'}`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  فارسی
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 mt-2 font-semibold" 
              disabled={isSubmitting}
            >
              {isSubmitting ? t('auth.creating_account') : t('auth.create_account')}
            </Button>
          </form>

          <div className="mt-5 pt-4 border-t border-surface-100 text-center text-sm text-text-500">
            <span>{t('auth.have_account')} </span>
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
              {t('auth.login_button')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
