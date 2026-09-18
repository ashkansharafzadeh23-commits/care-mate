import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/Button';
import { sanitizeReturnTo, getRoleDefaultRoute, canAccessRoute } from '../services/auth/authUtils';
import { Eye, EyeOff, Lock, Mail, HeartHandshake, AlertCircle, Sparkles } from 'lucide-react';
import { DEVELOPMENT_USERS } from '../services/fixtures/developmentFixtures';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthContext();
  const { language, setLanguage } = useAppContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const queryParams = new URLSearchParams(location.search);
  const rawReturnTo = queryParams.get('returnTo');

  const handleSuccessfulAuth = (role: 'family' | 'provider' | 'admin') => {
    const sanitized = sanitizeReturnTo(rawReturnTo, getRoleDefaultRoute(role));
    // Verify that the user's role can access the sanitized return destination
    const tempUser = { role } as any;
    if (canAccessRoute(tempUser, sanitized)) {
      navigate(sanitized, { replace: true });
    } else {
      navigate(getRoleDefaultRoute(role), { replace: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage(t('auth.errors.missing_fields'));
      return;
    }

    setIsSubmitting(true);
    try {
      const { user } = await login({ email: email.trim(), password });
      handleSuccessfulAuth(user.role);
    } catch (err: any) {
      setErrorMessage(err.message || t('auth.errors.generic'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (fixtureEmail: string) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const { user } = await login({ email: fixtureEmail, password: 'dev_password_123' });
      handleSuccessfulAuth(user.role);
    } catch (err: any) {
      setErrorMessage(err.message || t('auth.errors.generic'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6 bg-surface-50 relative">
      {/* Header & Language Switcher */}
      <header className="flex justify-between items-center mb-8 pt-safe">
        <Link to="/" className="flex items-center gap-2 text-primary-600 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
            <HeartHandshake className="w-5 h-5" />
          </div>
          CareMate
        </Link>
        <div className="flex bg-surface-100 rounded-full p-1 border border-surface-200">
          <button 
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${language === 'en' ? 'bg-white shadow-sm text-primary-600' : 'text-text-500'}`}
          >
            EN
          </button>
          <button 
            type="button"
            onClick={() => setLanguage('fa')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${language === 'fa' ? 'bg-white shadow-sm text-primary-600' : 'text-text-500'}`}
          >
            فا
          </button>
        </div>
      </header>

      {/* Main Card */}
      <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-surface-200 mb-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-900 mb-1">{t('auth.login_title')}</h1>
          <p className="text-text-500 text-sm">{t('auth.login_subtitle')}</p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-accent-500/10 border border-accent-500/20 text-accent-600 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('auth.email_placeholder')}
                className="w-full h-12 ps-10 pe-4 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all"
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5 ms-1 me-1">
              <label className="block text-xs font-semibold text-text-700 uppercase tracking-wider">
                {t('auth.password')}
              </label>
              <Link 
                to="/forgot-password" 
                className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                {t('auth.forgot_password')}
              </Link>
            </div>
            <div className="relative flex items-center">
              <div className="absolute start-3.5 text-text-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-12 ps-10 pe-11 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all"
                disabled={isSubmitting}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3.5 text-text-400 hover:text-text-600 p-1"
                aria-label={showPassword ? t('auth.hide_password') : t('auth.show_password')}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 mt-2 font-semibold" 
            disabled={isSubmitting}
          >
            {isSubmitting ? t('auth.logging_in') : t('auth.login_button')}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-surface-100 text-center text-sm text-text-500">
          <span>{t('auth.no_account')} </span>
          <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-700">
            {t('auth.sign_up')}
          </Link>
        </div>
      </div>

      {/* Clearly Separated Development Test Fixtures */}
      <div className="mt-auto bg-primary-50/50 border border-primary-100 rounded-2xl p-4 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-primary-800 uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('auth.demo_accounts_title')}</span>
        </div>
        <p className="text-xs text-text-500 mb-3">{t('auth.demo_notice')}</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleDemoLogin(DEVELOPMENT_USERS[0].email)}
            className="py-2 px-2 text-xs font-semibold bg-white rounded-xl border border-primary-200 text-primary-700 hover:bg-primary-50 transition-colors shadow-2xs"
          >
            {t('auth.demo_family')}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleDemoLogin(DEVELOPMENT_USERS[1].email)}
            className="py-2 px-2 text-xs font-semibold bg-white rounded-xl border border-primary-200 text-primary-700 hover:bg-primary-50 transition-colors shadow-2xs"
          >
            {t('auth.demo_provider')}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleDemoLogin(DEVELOPMENT_USERS[2].email)}
            className="py-2 px-2 text-xs font-semibold bg-white rounded-xl border border-primary-200 text-primary-700 hover:bg-primary-50 transition-colors shadow-2xs"
          >
            {t('auth.demo_admin')}
          </button>
        </div>
      </div>
    </div>
  );
}
