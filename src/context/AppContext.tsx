import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Language, User, Parent, CareRecipient, FamilyMember, CareAlert } from '../types';
import { careRecipientService } from '../services/careRecipientService';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  // Backward-compatible single parent accessor
  parent: Parent | null;
  setParent: (parent: Parent | null) => void;
  // Core Care Graph multi-recipient support
  careRecipients: CareRecipient[];
  activeCareRecipient: CareRecipient | null;
  setActiveRecipientId: (id: string) => void;
  familyMembers: FamilyMember[];
  alerts: CareAlert[];
  isRTL: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<Language>('en');
  
  const [user, setUser] = useState<User | null>({
    id: 'u1',
    name: 'Sarah',
    email: 'sarah@example.com',
    phone: '+1 (555) 234-5678',
    activeFamilyCircleId: 'fc_1'
  });
  
  const [careRecipients, setCareRecipients] = useState<CareRecipient[]>(() => careRecipientService.getRecipients());
  const [activeRecipientId, setActiveRecipientIdState] = useState<string>('p1');
  const [familyMembers] = useState<FamilyMember[]>(() => careRecipientService.getFamilyMembers());
  const [alerts] = useState<CareAlert[]>(() => careRecipientService.getAlerts());

  const activeCareRecipient = careRecipients.find(r => r.id === activeRecipientId) || careRecipients[0] || null;

  // Sync parent with activeCareRecipient for backward compatibility
  const parent = activeCareRecipient;
  const setParent = (newParent: Parent | null) => {
    if (!newParent) return;
    setCareRecipients(prev => prev.map(p => p.id === newParent.id ? newParent : p));
  };

  const setActiveRecipientId = (id: string) => {
    setActiveRecipientIdState(id);
    careRecipientService.setActiveRecipientId(id);
  };

  const isRTL = language === 'fa';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    i18n.changeLanguage(language);
  }, [language, isRTL, i18n]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return (
    <AppContext.Provider 
      value={{ 
        language, 
        setLanguage, 
        user, 
        setUser, 
        parent, 
        setParent, 
        careRecipients,
        activeCareRecipient,
        setActiveRecipientId,
        familyMembers,
        alerts,
        isRTL 
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
