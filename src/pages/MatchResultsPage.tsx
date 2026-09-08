import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ShieldCheck, Star, MapPin } from 'lucide-react';
import { Button } from '../components/Button';
import { useAppContext } from '../context/AppContext';
import { Provider } from '../types';

const MOCK_PROVIDERS: Provider[] = [
  {
    id: 'prov_1',
    name: 'Sarah Jenkins',
    title: 'Certified Nursing Assistant',
    matchScore: 94,
    matchReasonEN: 'Excellent match for mobility assistance & Tuesday/Thursday schedule.',
    matchReasonFA: 'تطابق عالی برای کمک به تحرک و برنامه سه‌شنبه/پنجشنبه.',
    yearsExperience: 8,
    rate: 28,
    distance: '3.2 mi',
    specialtiesEN: ['Mobility Support', 'Dementia Care', 'Medication Mgmt'],
    specialtiesFA: ['پشتیبانی تحرک', 'مراقبت از زوال عقل', 'مدیریت دارو'],
    isIdentityVerified: true,
    isBackgroundChecked: true,
    isLicenseVerified: true,
    avatarUrl: 'https://i.pravatar.cc/150?u=sarah',
    aboutEN: 'I have been a CNA for 8 years, specializing in elder care and mobility support. I believe in compassionate, patient-centered care.',
    aboutFA: 'من به مدت ۸ سال کمک پرستار بوده‌ام و در مراقبت از سالمندان و پشتیبانی تحرک تخصص دارم.',
    reviewsCount: 42,
    rating: 4.9
  },
  {
    id: 'prov_2',
    name: 'David Chen',
    title: 'Registered Nurse',
    matchScore: 88,
    matchReasonEN: 'Strong medical background, matches your schedule requirements.',
    matchReasonFA: 'پیشینه قوی پزشکی، مطابق با نیازهای زمانی شما.',
    yearsExperience: 12,
    rate: 45,
    distance: '5.1 mi',
    specialtiesEN: ['Wound Care', 'Post-Op Recovery', 'Vitals Monitoring'],
    specialtiesFA: ['مراقبت از زخم', 'ریکاوری بعد از عمل', 'نظارت بر علائم حیاتی'],
    isIdentityVerified: true,
    isBackgroundChecked: true,
    isLicenseVerified: true,
    avatarUrl: 'https://i.pravatar.cc/150?u=david',
    aboutEN: 'Experienced RN with a background in ICU and home health. Detail-oriented and highly communicative with families.',
    aboutFA: 'پرستار با تجربه با سابقه کار در بخش مراقبت‌های ویژه و بهداشت خانگی.',
    reviewsCount: 128,
    rating: 5.0
  }
];

export default function MatchResultsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language } = useAppContext();

  return (
    <div className="flex flex-col min-h-screen bg-surface-50 p-6 pt-safe">
      <header className="flex items-center mb-6 relative">
        <button onClick={() => navigate(-1)} className="p-2 -ms-2 text-text-700 hover:bg-surface-100 rounded-full z-10 rtl:rotate-180">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-text-900 absolute w-full text-center inset-0 flex items-center justify-center pointer-events-none">
          {t('results.title')}
        </h1>
      </header>

      <div className="space-y-6">
        {MOCK_PROVIDERS.map(provider => (
          <div key={provider.id} className="bg-white rounded-3xl border border-surface-200 overflow-hidden shadow-sm">
            {/* Trust Banner */}
            <div className="bg-primary-50 px-4 py-3 border-b border-primary-100 flex items-center justify-between">
              <div className="flex items-center text-primary-700 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 me-1.5" />
                {t('results.verified')} & {t('results.background_checked')}
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <img src={provider.avatarUrl} alt={provider.name} className="w-16 h-16 rounded-full object-cover border border-surface-100" />
                  <div>
                    <h2 className="text-lg font-bold text-text-900">{provider.name}</h2>
                    <p className="text-sm text-text-500">{provider.title}</p>
                    <div className="flex items-center mt-1 text-sm text-text-700 font-medium">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400 me-1" />
                      <span dir="ltr">{provider.rating}</span> <span className="text-text-400 font-normal ms-1">({provider.reviewsCount})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Match Reason highlight */}
              <div className="bg-surface-50 rounded-2xl p-4 border border-surface-200 mb-4">
                <div className="text-sm font-bold text-primary-600 mb-1">
                  {t('results.match_score', { score: provider.matchScore })}
                </div>
                <p className="text-sm text-text-700 leading-relaxed">
                  {language === 'fa' ? provider.matchReasonFA : provider.matchReasonEN}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="flex flex-col items-center justify-center p-3 bg-surface-50 rounded-2xl">
                  <span className="text-sm font-bold text-text-900" dir="ltr">${provider.rate}</span>
                  <span className="text-[10px] text-text-500 uppercase tracking-wider mt-1">/ hr</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-surface-50 rounded-2xl text-center">
                  <span className="text-sm font-bold text-text-900" dir="ltr">{provider.yearsExperience}</span>
                  <span className="text-[10px] text-text-500 uppercase tracking-wider mt-1">Yrs Exp</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-surface-50 rounded-2xl text-center">
                  <MapPin className="w-4 h-4 text-text-900 mb-1" />
                  <span className="text-[10px] font-medium text-text-500" dir="ltr">{provider.distance}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => {}}>
                  {t('results.view_profile')}
                </Button>
                <Button className="flex-1" onClick={() => navigate(`/book/${provider.id}`)}>
                  {t('results.book')}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
