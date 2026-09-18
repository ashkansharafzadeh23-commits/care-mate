import React from 'react';
import { useTranslation } from 'react-i18next';
import { MobilityOption } from '../../types';
import { Check } from 'lucide-react';

interface MobilitySelectorProps {
  value?: MobilityOption;
  onChange: (value: MobilityOption) => void;
  customMobility?: string;
  onCustomMobilityChange?: (text: string) => void;
  recipientName?: string;
}

interface MobilityOptionItem {
  key: MobilityOption;
  translationKey: string;
}

const MOBILITY_OPTIONS: MobilityOptionItem[] = [
  { key: 'independent', translationKey: 'mobility.independent' },
  { key: 'cane', translationKey: 'mobility.cane' },
  { key: 'walker', translationKey: 'mobility.walker' },
  { key: 'wheelchair', translationKey: 'mobility.wheelchair' },
  { key: 'transfer_assistance', translationKey: 'mobility.transfer_assistance' },
  { key: 'bedbound', translationKey: 'mobility.bedbound' },
  { key: 'other', translationKey: 'mobility.other' },
  { key: 'prefer_not_to_answer', translationKey: 'mobility.prefer_not_to_answer' },
];

export const MobilitySelector: React.FC<MobilitySelectorProps> = ({
  value,
  onChange,
  customMobility = '',
  onCustomMobilityChange,
  recipientName
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="text-start mb-2">
        <h3 className="text-lg font-bold text-text-900">
          {t('care_onboarding.mobility_heading', { name: recipientName || t('care_onboarding.default_loved_one') })}
        </h3>
        <p className="text-xs text-text-500 mt-1">
          {t('care_onboarding.mobility_subheading')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {MOBILITY_OPTIONS.map(opt => {
          const active = value === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onChange(opt.key)}
              className={`p-3.5 rounded-2xl border text-start flex items-center justify-between transition-all ${
                active 
                  ? 'border-primary-500 bg-primary-50/60 text-primary-900 shadow-2xs font-semibold' 
                  : 'border-surface-200 bg-white text-text-800 hover:border-primary-200 hover:bg-surface-50'
              }`}
              aria-pressed={active}
            >
              <span className="text-sm leading-snug">{t(opt.translationKey)}</span>
              <div 
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ms-2 transition-colors ${
                  active ? 'bg-primary-600 text-white' : 'border border-surface-300 bg-surface-50'
                }`}
              >
                {active && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>
          );
        })}
      </div>

      {value === 'other' && onCustomMobilityChange && (
        <div className="pt-2">
          <label className="block text-xs font-semibold text-text-700 mb-1.5">
            {t('mobility.other_description')}
          </label>
          <input
            type="text"
            value={customMobility}
            onChange={(e) => onCustomMobilityChange(e.target.value)}
            placeholder={t('mobility.other_placeholder')}
            className="w-full h-11 px-4 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all"
            maxLength={100}
          />
        </div>
      )}
    </div>
  );
};
