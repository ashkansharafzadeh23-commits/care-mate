import React from 'react';
import { useTranslation } from 'react-i18next';
import { CarePreferences } from '../../types';
import { Check } from 'lucide-react';

interface CarePreferencesFormProps {
  value: CarePreferences;
  onChange: (value: CarePreferences) => void;
  recipientName?: string;
}

export const CarePreferencesForm: React.FC<CarePreferencesFormProps> = ({
  value,
  onChange,
  recipientName
}) => {
  const { t } = useTranslation();

  const handleGenderChange = (gender: 'no_preference' | 'female' | 'male') => {
    onChange({ ...value, caregiverGender: gender });
  };

  const toggleBoolean = (field: keyof CarePreferences) => {
    onChange({ ...value, [field]: !value[field] });
  };

  return (
    <div className="space-y-6 text-start">
      <div>
        <h3 className="text-lg font-bold text-text-900">
          {t('care_preferences.heading', { name: recipientName || t('care_onboarding.default_loved_one') })}
        </h3>
        <p className="text-xs text-text-500 mt-1">
          {t('care_preferences.subheading')}
        </p>
      </div>

      {/* Caregiver Gender Preference */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-text-700 uppercase tracking-wider">
          {t('care_preferences.caregiver_gender')}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['no_preference', 'female', 'male'] as const).map(g => {
            const active = (value.caregiverGender || 'no_preference') === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => handleGenderChange(g)}
                className={`py-3 px-2 rounded-xl border text-xs font-semibold transition-all ${
                  active 
                    ? 'border-primary-500 bg-primary-50 text-primary-800 shadow-2xs' 
                    : 'border-surface-200 bg-white text-text-600 hover:bg-surface-50'
                }`}
              >
                {t(`care_preferences.gender_${g}`)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preferred Caregiver Language */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-text-700 uppercase tracking-wider">
          {t('care_preferences.preferred_language')}
        </label>
        <input
          type="text"
          value={value.preferredLanguage || ''}
          onChange={(e) => onChange({ ...value, preferredLanguage: e.target.value })}
          placeholder={t('care_preferences.language_placeholder')}
          className="w-full h-11 px-4 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all"
        />
      </div>

      {/* Household & Environmental Considerations */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-text-700 uppercase tracking-wider">
          {t('care_preferences.environment_preferences')}
        </label>
        <div className="space-y-2">
          {[
            { key: 'nonSmokingPreferred', label: t('care_preferences.non_smoking') },
            { key: 'comfortableWithPets', label: t('care_preferences.comfortable_pets') },
            { key: 'recipientHasPets', label: t('care_preferences.has_pets') },
            { key: 'transportationRequired', label: t('care_preferences.transport_needed') },
          ].map(item => {
            const checked = !!value[item.key as keyof CarePreferences];
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => toggleBoolean(item.key as keyof CarePreferences)}
                className={`w-full p-3 rounded-xl border text-start flex items-center justify-between transition-all ${
                  checked 
                    ? 'border-primary-500 bg-primary-50/50 text-primary-900 font-semibold' 
                    : 'border-surface-200 bg-white text-text-700 hover:bg-surface-50'
                }`}
              >
                <span className="text-sm">{item.label}</span>
                <div 
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ms-2 transition-colors ${
                    checked ? 'bg-primary-600 text-white' : 'border border-surface-300 bg-surface-50'
                  }`}
                >
                  {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Additional Notes */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-text-700 uppercase tracking-wider">
          {t('care_preferences.additional_notes')}
        </label>
        <textarea
          rows={3}
          value={value.additionalNotes || ''}
          onChange={(e) => onChange({ ...value, additionalNotes: e.target.value })}
          placeholder={t('care_preferences.notes_placeholder')}
          className="w-full p-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all resize-none"
          maxLength={300}
        />
      </div>
    </div>
  );
};
