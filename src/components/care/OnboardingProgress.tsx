import React from 'react';
import { useTranslation } from 'react-i18next';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitle?: string;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps,
  stepTitle
}) => {
  const { t } = useTranslation();
  const percentage = Math.min(Math.round((currentStep / totalSteps) * 100), 100);

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center text-xs font-semibold text-text-500 mb-2">
        <span className="uppercase tracking-wider">
          {t('care_onboarding.step_progress', { current: currentStep, total: totalSteps })}
        </span>
        {stepTitle && (
          <span className="text-primary-700 font-medium truncate max-w-[50%]">
            {stepTitle}
          </span>
        )}
      </div>
      <div 
        className="w-full bg-surface-200 h-2 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={t('care_onboarding.step_progress', { current: currentStep, total: totalSteps })}
      >
        <div 
          className="bg-primary-600 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
