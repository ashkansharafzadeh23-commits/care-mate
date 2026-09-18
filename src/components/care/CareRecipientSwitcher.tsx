import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import { ChevronDown, Plus, Check, Heart, User } from 'lucide-react';

interface CareRecipientSwitcherProps {
  compact?: boolean;
}

export const CareRecipientSwitcher: React.FC<CareRecipientSwitcherProps> = ({ compact = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { careRecipients, activeCareRecipient, setActiveRecipientId } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (careRecipients.length === 0) {
    return (
      <button
        onClick={() => navigate('/onboarding?mode=add')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 hover:bg-primary-100 text-xs font-semibold transition-colors border border-primary-200"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>{t('care_switcher.add_first_recipient')}</span>
      </button>
    );
  }

  const current = activeCareRecipient || careRecipients[0];
  const displayName = current?.preferredName || current?.firstName || current?.name || 'Loved One';
  const relationship = current?.customRelationship || t(`relationship.${current?.relationshipToPrimaryUser || 'mother'}`);

  return (
    <div className="relative inline-block text-start" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex items-center gap-2 rounded-2xl border transition-all ${
          compact 
            ? 'px-2.5 py-1 bg-white/90 border-surface-200 text-xs shadow-2xs hover:bg-white' 
            : 'px-3 py-1.5 bg-surface-50 border-surface-200 hover:bg-surface-100 shadow-2xs'
        }`}
      >
        <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs shrink-0">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col text-start">
          <span className="font-bold text-xs text-text-900 leading-tight truncate max-w-[120px]">
            {displayName}
          </span>
          <span className="text-[10px] text-text-500 font-medium leading-tight">
            {relationship}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-text-400 ms-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1.5 start-0 z-50 w-64 bg-white rounded-2xl shadow-xl border border-surface-200 py-1.5 overflow-hidden animate-fadeIn">
          <div className="px-3 py-1.5 border-b border-surface-100 text-[10px] font-bold text-text-400 uppercase tracking-wider">
            {t('care_switcher.switch_loved_one')}
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            {careRecipients.map(recipient => {
              const name = recipient.preferredName || recipient.firstName || recipient.name || 'Loved One';
              const rel = recipient.customRelationship || t(`relationship.${recipient.relationshipToPrimaryUser || 'other'}`);
              const isActive = recipient.id === current.id;

              return (
                <button
                  key={recipient.id}
                  type="button"
                  onClick={() => {
                    setActiveRecipientId(recipient.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-start flex items-center justify-between hover:bg-surface-50 transition-colors ${
                    isActive ? 'bg-primary-50/60 font-semibold text-primary-900' : 'text-text-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-surface-100 text-text-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs truncate font-medium">{name}</span>
                      <span className="text-[10px] text-text-500 truncate">{rel}</span>
                    </div>
                  </div>
                  {isActive && (
                    <Check className="w-4 h-4 text-primary-600 shrink-0 ms-2" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="border-t border-surface-100 pt-1 px-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/onboarding?mode=add');
              }}
              className="w-full px-2.5 py-2 text-start rounded-xl flex items-center gap-2 text-primary-700 hover:bg-primary-50 text-xs font-semibold transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                <Plus className="w-3.5 h-3.5 text-primary-700" />
              </div>
              <span>{t('care_switcher.add_care_recipient')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
