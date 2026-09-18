import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HeartHandshake, Plus, Sparkles } from 'lucide-react';
import { Button } from '../Button';

interface CareRecipientEmptyStateProps {
  onAddClick?: () => void;
}

export const CareRecipientEmptyState: React.FC<CareRecipientEmptyStateProps> = ({ onAddClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleAction = () => {
    if (onAddClick) {
      onAddClick();
    } else {
      navigate('/onboarding?mode=add');
    }
  };

  return (
    <div className="bg-white border border-surface-200 rounded-3xl p-6 text-center shadow-sm">
      <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 mx-auto mb-4">
        <HeartHandshake className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-text-900 mb-1.5">
        {t('care_empty.title')}
      </h3>
      <p className="text-sm text-text-500 max-w-xs mx-auto mb-6 leading-relaxed">
        {t('care_empty.subtitle')}
      </p>
      <Button 
        onClick={handleAction}
        className="w-full sm:w-auto h-12 px-6 font-semibold flex items-center justify-center gap-2 mx-auto"
      >
        <Plus className="w-4 h-4" />
        <span>{t('care_empty.cta')}</span>
      </Button>
    </div>
  );
};
