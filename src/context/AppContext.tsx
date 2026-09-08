import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Language, User, Parent } from '../types';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  parent: Parent | null;
  setParent: (parent: Parent | null) => void;
  isRTL: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<Language>('en');
  
  // Mock data for MVP
  const [user, setUser] = useState<User | null>({
    id: 'u1',
    name: 'Sarah',
    email: 'sarah@example.com'
  });
  
  const [parent, setParent] = useState<Parent | null>({
    id: 'p1',
    name: 'Evelyn',
    age: 78,
    careNeeds: ['Mobility assistance', 'Medication reminders']
  });

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
    <AppContext.Provider value={{ language, setLanguage, user, setUser, parent, setParent, isRTL }}>
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
