import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Language, User, Parent, CareRecipient, FamilyMember, CareAlert } from '../types';
import { careRecipientService } from '../services/careRecipientService';
import { useAuthContext } from './AuthContext';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  // Authenticated user identity from AuthContext
  user: User | null;
  // Backward-compatible single parent accessor
  parent: Parent | null;
  setParent: (parent: Parent | null) => void;
  // Core Care Graph multi-recipient support
  careRecipients: CareRecipient[];
  activeCareRecipient: CareRecipient | null;
  setActiveRecipientId: (id: string) => void;
  addCareRecipient: (newRecipient: Omit<CareRecipient, 'id'>) => CareRecipient;
  familyMembers: FamilyMember[];
  alerts: CareAlert[];
  isRTL: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const { user } = useAuthContext();
  const [language, setLanguageState] = useState<Language>(() => user?.preferredLanguage || 'en');
  
  const [careRecipients, setCareRecipients] = useState<CareRecipient[]>(() => 
    careRecipientService.getRecipients(user?.id)
  );
  const [activeRecipientId, setActiveRecipientIdState] = useState<string>('p1');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => 
    careRecipientService.getFamilyMembers()
  );
  const [alerts, setAlerts] = useState<CareAlert[]>(() => 
    careRecipientService.getAlerts()
  );

  // Sync care recipients when authenticated user changes
  useEffect(() => {
    const list = careRecipientService.getRecipients(user?.id);
    setCareRecipients(list);
    if (list.length > 0) {
      setActiveRecipientIdState(list[0].id);
      careRecipientService.setActiveRecipientId(list[0].id);
    }
    if (user?.preferredLanguage) {
      setLanguageState(user.preferredLanguage);
    }
  }, [user?.id, user?.preferredLanguage]);

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

  const addCareRecipient = (newRecipient: Omit<CareRecipient, 'id'>): CareRecipient => {
    const created = careRecipientService.addRecipient(newRecipient, user?.id);
    setCareRecipients(careRecipientService.getRecipients(user?.id));
    setActiveRecipientIdState(created.id);
    return created;
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
        parent, 
        setParent, 
        careRecipients,
        activeCareRecipient,
        setActiveRecipientId,
        addCareRecipient,
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

