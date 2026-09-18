import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, HelpCircle } from 'lucide-react';
import { CareNeedCategory } from '../../types';

interface CareNeedsSelectorProps {
  selectedNeeds: (CareNeedCategory | string)[];
  onChange: (needs: (CareNeedCategory | string)[]) => void;
  customNeed?: string;
  onCustomNeedChange?: (text: string) => void;
  recipientName?: string;
}

interface NeedOption {
  key: CareNeedCategory;
  translationKey: string;
}

const NEED_OPTIONS: NeedOption[] = [
  { key: 'companionship', translationKey: 'care_needs.companionship' },
  { key: 'personal_care', translationKey: 'care_needs.personal_care' },
  { key: 'bathing_assistance', translationKey: 'care_needs.bathing' },
  { key: 'dressing_assistance', translationKey: 'care_needs.dressing' },
  { key: 'meal_preparation', translationKey: 'care_needs.meal_prep' },
  { key: 'mobility_assistance', translationKey: 'care_needs.mobility' },
  { key: 'transportation', translationKey: 'care_needs.transportation' },
  { key: 'light_housekeeping', translationKey: 'care_needs.housekeeping' },
  { key: 'medication_reminders', translationKey: 'care_needs.med_reminders' },
  { key: 'post_hospital_support', translationKey: 'care_needs.post_hospital' },
  { key: 'memory_dementia_support', translationKey: 'care_needs.dementia_support' },
  { key: 'overnight_supervision', translationKey: 'care_needs.overnight' },
  { key: 'appointment_assistance', translationKey: 'care_needs.appointments' },
  { key: 'not_sure_yet', translationKey: 'care_needs.not_sure' },
  { key: 'other', translationKey: 'care_needs.other' },
];

export const CareNeedsSelector: React.FC<CareNeedsSelectorProps> = ({
  selectedNeeds,
  onChange,
  customNeed = '',
  onCustomNeedChange,
  recipientName
}) => {
  const { t } = useTranslation();

  const toggleNeed = (key: CareNeedCategory) => {
    if (key === 'not_sure_yet') {
      // Toggle 'not sure yet': if selected, it can be standalone
      if (selectedNeeds.includes('not_sure_yet')) {
        onChange(selectedNeeds.filter(n => n !== 'not_sure_yet'));
      } else {
        onChange(['not_sure_yet']);
      }
      return;
    }

    // If another item clicked, remove 'not_sure_yet'
    const withoutNotSure = selectedNeeds.filter(n => n !== 'not_sure_yet');
    if (withoutNotSure.includes(key)) {
      onChange(withoutNotSure.filter(n => n !== key));
    } else {
      onChange([...withoutNotSure, key]);
    }
  };

  const isSelected = (key: CareNeedCategory) => selectedNeeds.includes(key);

  return (
    <div className="space-y-4">
      <div className="text-start mb-2">
        <h3 className="text-lg font-bold text-text-900">
          {t('care_onboarding.step2_heading', { name: recipientName || t('care_onboarding.default_loved_one') })}
        </h3>
        <p className="text-xs text-text-500 mt-1">
          {t('care_onboarding.step2_subheading')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {NEED_OPTIONS.map(opt => {
          const active = isSelected(opt.key);
          const isNotSure = opt.key === 'not_sure_yet';

          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => toggleNeed(opt.key)}
              className={`p-3.5 rounded-2xl border text-start flex items-center justify-between transition-all ${
                active 
                  ? 'border-primary-500 bg-primary-50/60 text-primary-900 shadow-2xs font-semibold' 
                  : isNotSure 
                    ? 'border-dashed border-surface-300 bg-surface-50/80 text-text-700 hover:bg-surface-100' 
                    : 'border-surface-200 bg-white text-text-800 hover:border-primary-200 hover:bg-surface-50'
              }`}
              aria-pressed={active}
            >
              <div className="flex items-center gap-2.5">
                {isNotSure && <HelpCircle className="w-4 h-4 text-text-400 shrink-0" />}
                <span className="text-sm leading-snug">{t(opt.translationKey)}</span>
              </div>
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

      {isSelected('other') && onCustomNeedChange && (
        <div className="pt-2 animate-fadeIn">
          <label className="block text-xs font-semibold text-text-700 mb-1.5">
            {t('care_needs.other_description')}
          </label>
          <input
            type="text"
            value={customNeed}
            onChange={(e) => onCustomNeedChange(e.target.value)}
            placeholder={t('care_needs.other_placeholder')}
            className="w-full h-11 px-4 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all"
            maxLength={100}
          />
        </div>
      )}
    </div>
  );
};
