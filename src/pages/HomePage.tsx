import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Search, HeartPulse, Sparkles, Bell, ChevronRight, Heart, Users } from 'lucide-react';
import { EmergencyFAB } from '../components/EmergencyFAB';
import { CareRecipientSwitcher } from '../components/care/CareRecipientSwitcher';
import { CareRecipientEmptyState } from '../components/care/CareRecipientEmptyState';

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, activeCareRecipient, careRecipients } = useAppContext();

  const recipientName = activeCareRecipient?.preferredName || activeCareRecipient?.firstName || activeCareRecipient?.name || 'Loved One';

  return (
    <div className="flex flex-col min-h-screen p-6">
      <EmergencyFAB />
      
      <header className="flex justify-between items-center mt-12 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-900">
            {t('home.greeting', { name: user?.name || 'User' })}
          </h1>
          <p className="text-xs text-text-500 mt-0.5">
            {careRecipients.length > 0
              ? `Coordinating care for ${careRecipients.length} loved ${careRecipients.length === 1 ? 'one' : 'ones'}`
              : 'Welcome to your care coordination hub'}
          </p>
        </div>

        {careRecipients.length > 0 && (
          <CareRecipientSwitcher compact={false} />
        )}
      </header>

      {/* When no care recipient exists, display respectful empty state */}
      {careRecipients.length === 0 ? (
        <div className="my-auto py-8">
          <CareRecipientEmptyState onAddClick={() => navigate('/onboarding?mode=add')} />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active Care Recipient Quick Card */}
          {activeCareRecipient && (
            <div 
              onClick={() => navigate(`/care/${activeCareRecipient.id}`)}
              className="w-full bg-surface-50 hover:bg-surface-100/80 border border-surface-200 rounded-3xl p-4 text-start cursor-pointer transition-colors shadow-2xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-primary-100 text-primary-800 flex items-center justify-center font-bold text-base shrink-0">
                  {recipientName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-text-900 truncate">{recipientName}</span>
                    <span className="text-[10px] bg-white border border-surface-200 px-2 py-0.5 rounded-full text-text-600 font-medium">
                      {activeCareRecipient.customRelationship || t(`relationship.${activeCareRecipient.relationshipToPrimaryUser || 'other'}`)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-500 mt-0.5 truncate">
                    {activeCareRecipient.careNeeds && activeCareRecipient.careNeeds.length > 0 ? (
                      <span>{activeCareRecipient.careNeeds.slice(0, 2).map(n => t(`care_needs.${n}`, n)).join(', ')}{activeCareRecipient.careNeeds.length > 2 ? ` +${activeCareRecipient.careNeeds.length - 2}` : ''}</span>
                    ) : (
                      <span>View Care Profile</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center text-primary-600 ps-2">
                <span className="text-xs font-semibold me-1 hidden sm:inline">{t('care_profile.title')}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          )}

          {/* Family Circle Coordination Banner */}
          {activeCareRecipient && (
            <div 
              onClick={() => navigate(`/care/${activeCareRecipient.id}/family`)}
              className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:bg-emerald-50 transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-emerald-950">Family Circle</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.2 rounded-full">
                      Team
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Coordinate care & permissions for {recipientName}
                  </p>
                </div>
              </div>
              <div className="text-emerald-700 flex items-center gap-1 text-xs font-semibold">
                <span className="hidden sm:inline">Manage</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          )}

          {/* Ask CareMate AI */}
          <button 
            onClick={() => navigate(activeCareRecipient ? `/chat?recipient=${activeCareRecipient.id}` : '/chat')}
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
                <h3 className="font-semibold text-text-900 mb-1 truncate max-w-[140px]">
                  {t('home.health_title', { name: recipientName })}
                </h3>
                <p className="text-xs text-text-500">{t('home.health_desc')}</p>
              </div>
            </button>
          </div>
        </div>
      )}
      
      <div className="mt-auto pt-8">
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-center">
          <p className="text-xs text-orange-800 font-medium">{t('home.emergency_warning')}</p>
        </div>
      </div>
    </div>
  );
}

