import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { CommunicationPreferences } from '../../types';

interface CommunicationSelectorProps {
  value: CommunicationPreferences;
  onChange: (value: CommunicationPreferences) => void;
  recipientName?: string;
}

const COMMUNICATION_ITEMS = [
  { key: 'normal_conversation', translationKey: 'communication.normal_conversation' },
  { key: 'speak_slowly', translationKey: 'communication.speak_slowly' },
  { key: 'hearing_difficulty', translationKey: 'communication.hearing_difficulty' },
  { key: 'visual_preferred', translationKey: 'communication.visual_preferred' },
  { key: 'other', translationKey: 'communication.other' },
];

export const CommunicationSelector: React.FC<CommunicationSelectorProps> = ({
  value,
  onChange,
  recipientName
}) => {
  const { t } = useTranslation();
  const currentPreferences = value.preferences || [];

  const togglePreference = (key: string) => {
    if (currentPreferences.includes(key)) {
      onChange({
        ...value,
        preferences: currentPreferences.filter(k => k !== key)
      });
    } else {
      onChange({
        ...value,
        preferences: [...currentPreferences, key]
      });
    }
  };

  const isSelected = (key: string) => currentPreferences.includes(key);

  return (
    <div className="space-y-4 pt-3 border-t border-surface-200">
      <div className="text-start">
        <h4 className="text-sm font-bold text-text-900">
          {t('care_onboarding.communication_heading', { name: recipientName || t('care_onboarding.default_loved_one') })}
        </h4>
        <p className="text-xs text-text-500 mt-0.5">
          {t('care_onboarding.communication_subheading')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {COMMUNICATION_ITEMS.map(item => {
          const active = isSelected(item.key);
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => togglePreference(item.key)}
              className={`p-3 rounded-xl border text-start flex items-center justify-between transition-all ${
                active 
                  ? 'border-primary-500 bg-primary-50/60 text-primary-900 font-semibold shadow-2xs' 
                  : 'border-surface-200 bg-white text-text-700 hover:border-primary-200'
              }`}
              aria-pressed={active}
            >
              <span className="text-xs leading-snug">{t(item.translationKey)}</span>
              <div 
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ms-2 transition-colors ${
                  active ? 'bg-primary-600 text-white' : 'border border-surface-300 bg-surface-50'
                }`}
              >
                {active && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
            </button>
          );
        })}
      </div>

      {isSelected('other') && (
        <div className="pt-2">
          <label className="block text-xs font-semibold text-text-700 mb-1">
            {t('communication.other_description')}
          </label>
          <input
            type="text"
            value={value.customCommunication || ''}
            onChange={(e) => onChange({ ...value, customCommunication: e.target.value })}
            placeholder={t('communication.other_placeholder')}
            className="w-full h-11 px-4 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all"
            maxLength={100}
          />
        </div>
      )}
    </div>
  );
};
