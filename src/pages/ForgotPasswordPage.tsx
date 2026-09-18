import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/Button';
import { Mail, CheckCircle2, ArrowLeft, HeartHandshake, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { resetPassword } = useAuthContext();
  const { isRTL } = useAppContext();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage(t('auth.errors.missing_fields'));
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(email.trim());
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || t('auth.errors.generic'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6 bg-surface-50">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 pt-safe">
        <Link 
          to="/login"
          className="flex items-center gap-1.5 text-sm font-semibold text-text-600 hover:text-text-900 transition-colors"
        >
          <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          <span>{t('auth.back_to_login')}</span>
        </Link>
        <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-lg">
          <HeartHandshake className="w-5 h-5" />
        </div>
      </header>

      {/* Main Card */}
      <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-surface-200 my-auto max-w-md mx-auto w-full">
        {!isSubmitted ? (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-text-900 mb-2">{t('auth.reset_title')}</h1>
              <p className="text-text-500 text-sm leading-relaxed">{t('auth.reset_subtitle')}</p>
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

              <Button 
                type="submit" 
                className="w-full h-12 mt-2 font-semibold" 
                disabled={isSubmitting}
              >
                {isSubmitting ? t('common.loading') : t('auth.send_reset_link')}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-text-900 mb-2">{t('auth.reset_success_title')}</h2>
            <p className="text-sm text-text-600 mb-6 leading-relaxed">
              {t('auth.reset_success_desc')}
            </p>

            <div className="bg-surface-50 border border-surface-200 rounded-2xl p-4 text-xs text-text-500 text-start mb-6">
              {t('auth.reset_dev_notice')}
            </div>

            <Link to="/login">
              <Button className="w-full">
                {t('auth.back_to_login')}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
