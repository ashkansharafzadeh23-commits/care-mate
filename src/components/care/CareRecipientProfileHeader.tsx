import React from 'react';
import { useTranslation } from 'react-i18next';
import { CareRecipient } from '../../types';
import { MapPin, Globe, Calendar, Heart, Edit3, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { Button } from '../Button';

interface CareRecipientProfileHeaderProps {
  recipient: CareRecipient;
  onEdit: () => void;
  onTellNeeds: () => void;
  onAddRecipient: () => void;
  onRemove: () => void;
}

export const CareRecipientProfileHeader: React.FC<CareRecipientProfileHeaderProps> = ({
  recipient,
  onEdit,
  onTellNeeds,
  onAddRecipient,
  onRemove
}) => {
  const { t } = useTranslation();
  const displayName = recipient.preferredName || recipient.firstName || recipient.name || 'Loved One';
  const fullName = `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim() || recipient.name || displayName;
  const relationship = recipient.customRelationship || t(`relationship.${recipient.relationshipToPrimaryUser || 'other'}`);
  const locationText = recipient.location 
    ? `${recipient.location.city}${recipient.location.state ? `, ${recipient.location.state}` : ''}`
    : recipient.address ? `${recipient.address.city}, ${recipient.address.state}` : '';

  return (
    <div className="bg-white rounded-3xl p-6 border border-surface-200 shadow-sm text-start mb-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-800 flex items-center justify-center text-2xl font-bold shrink-0 shadow-inner">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-text-900 leading-tight">
                {displayName}
              </h1>
              {recipient.preferredName && recipient.preferredName !== fullName && (
                <span className="text-sm text-text-500 font-normal">
                  ({fullName})
                </span>
              )}
              <span className="bg-primary-50 text-primary-700 border border-primary-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {relationship}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-text-500 mt-2">
              {recipient.age && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-text-400" />
                  <span>{recipient.age} {t('care_profile.years_old')}</span>
                </div>
              )}
              {locationText && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-text-400" />
                  <span>{locationText}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-text-400" />
                <span>{recipient.primaryLanguage === 'fa' ? 'فارسی (Persian)' : 'English'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:self-start">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{t('care_profile.edit_profile')}</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onTellNeeds}
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{t('care_profile.tell_needs')}</span>
          </Button>
        </div>
      </div>

      {/* Profile Management Sub-bar */}
      <div className="mt-5 pt-4 border-t border-surface-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <button
          type="button"
          onClick={onAddRecipient}
          className="text-primary-700 hover:text-primary-800 font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('care_switcher.add_care_recipient')}</span>
        </button>

        <button
          type="button"
          onClick={onRemove}
          className="text-text-400 hover:text-red-600 font-medium flex items-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{t('care_profile.remove_profile_btn')}</span>
        </button>
      </div>
    </div>
  );
};
