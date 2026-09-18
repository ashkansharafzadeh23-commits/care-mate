import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Language, User, Parent, CareRecipient, FamilyMember, CareAlert } from '../types';
import { careRecipientService } from '../services/careRecipientService';
import { familyCircleService } from '../services/familyCircleService';
import { useAuthContext } from './AuthContext';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  // Authenticated user identity from AuthContext
  user: User | null;
  // Core Care Graph multi-recipient support
  careRecipients: CareRecipient[];
  activeCareRecipient: CareRecipient | null;
  activeRecipientId: string | null;
  setActiveRecipientId: (id: string) => void;
  setActiveCareRecipientId: (id: string) => void;
  createCareRecipient: (data: Omit<CareRecipient, 'id' | 'createdAt' | 'updatedAt'>) => CareRecipient;
  updateCareRecipient: (id: string, updates: Partial<CareRecipient>) => CareRecipient | null;
  removeCareRecipient: (id: string) => boolean;
  refreshCareRecipients: () => void;
  refreshFamilyMembers: () => void;
  getFamilyMembersForRecipient: (recipientId: string) => FamilyMember[];
  // Backward-compatible accessors
  parent: Parent | null;
  setParent: (parent: Parent | null) => void;
  addCareRecipient: (newRecipient: any) => CareRecipient;
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
    user?.id ? careRecipientService.listRecipientsForFamily(user.id) : []
  );
  
  const [activeRecipientId, setActiveRecipientIdState] = useState<string | null>(() => {
    const active = user?.id ? careRecipientService.getActiveRecipient(user.id) : null;
    return active ? active.id : null;
  });

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    const active = user?.id ? careRecipientService.getActiveRecipient(user.id) : null;
    return active ? familyCircleService.listMembers(active.id) : [];
  });

  const [alerts, setAlerts] = useState<CareAlert[]>(() => 
    careRecipientService.getAlerts()
  );

  const refreshCareRecipients = useCallback(() => {
    if (!user?.id) {
      setCareRecipients([]);
      setActiveRecipientIdState(null);
      setFamilyMembers([]);
      return;
    }
    const list = careRecipientService.listRecipientsForFamily(user.id);
    setCareRecipients(list);
    const active = careRecipientService.getActiveRecipient(user.id);
    const activeId = active ? active.id : null;
    setActiveRecipientIdState(activeId);
    if (activeId) {
      setFamilyMembers(familyCircleService.listMembers(activeId));
    } else {
      setFamilyMembers([]);
    }
  }, [user?.id]);

  const refreshFamilyMembers = useCallback(() => {
    if (activeRecipientId) {
      setFamilyMembers(familyCircleService.listMembers(activeRecipientId));
    } else {
      setFamilyMembers([]);
    }
  }, [activeRecipientId]);

  const getFamilyMembersForRecipient = useCallback((recipientId: string): FamilyMember[] => {
    return familyCircleService.listMembers(recipientId);
  }, []);

  // Sync care recipients when authenticated user changes
  useEffect(() => {
    refreshCareRecipients();
    if (user?.preferredLanguage) {
      setLanguageState(user.preferredLanguage);
    }
  }, [user?.id, user?.preferredLanguage, refreshCareRecipients]);

  // Sync family members when active recipient changes
  useEffect(() => {
    if (activeRecipientId) {
      setFamilyMembers(familyCircleService.listMembers(activeRecipientId));
    } else {
      setFamilyMembers([]);
    }
  }, [activeRecipientId]);

  const activeCareRecipient: CareRecipient | null = 
    (activeRecipientId ? careRecipients.find(r => r.id === activeRecipientId) : null) || 
    (careRecipients.length > 0 ? careRecipients[0] : null);

  // Sync parent with activeCareRecipient for backward compatibility
  const parent = activeCareRecipient;
  const setParent = (newParent: Parent | null) => {
    if (!newParent) return;
    setCareRecipients(prev => prev.map(p => p.id === newParent.id ? newParent : p));
  };

  const setActiveRecipientId = (id: string) => {
    setActiveRecipientIdState(id);
    if (user?.id) {
      careRecipientService.setActiveRecipientId(id, user.id);
    }
  };

  /**
   * STRENGTHENED MUTATION PATTERNS (Item 10 & 54):
   * Authentication is strictly required for mutating Care Recipient records.
   * Never fallback to development fixture accounts without explicit authentication.
   */
  const createCareRecipient = (data: Omit<CareRecipient, 'id' | 'createdAt' | 'updatedAt'>): CareRecipient => {
    if (!user?.id) {
      throw new Error('Authentication required: A Care Recipient must belong to an authenticated user.');
    }
    const created = careRecipientService.createRecipient(data, user.id, user.name);
    refreshCareRecipients();
    setActiveRecipientIdState(created.id);
    return created;
  };

  const updateCareRecipient = (id: string, updates: Partial<CareRecipient>): CareRecipient | null => {
    if (!user?.id) {
      throw new Error('Authentication required: Cannot update care recipient without an authenticated user.');
    }
    const updated = careRecipientService.updateRecipient(id, updates, user.id);
    refreshCareRecipients();
    return updated;
  };

  const removeCareRecipient = (id: string): boolean => {
    if (!user?.id) {
      throw new Error('Authentication required: Cannot remove care recipient without an authenticated user.');
    }
    const removed = careRecipientService.deleteRecipient(id, user.id);
    refreshCareRecipients();
    return removed;
  };

  // Backward compatibility alias for addCareRecipient
  const addCareRecipient = (newRecipient: any): CareRecipient => {
    if (!user?.id) {
      throw new Error('Authentication required: Cannot add care recipient without an authenticated user.');
    }
    const created = careRecipientService.addRecipient(newRecipient, user.id);
    refreshCareRecipients();
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
        activeRecipientId,
        setActiveRecipientId,
        setActiveCareRecipientId: setActiveRecipientId,
        createCareRecipient,
        updateCareRecipient,
        removeCareRecipient,
        refreshCareRecipients,
        refreshFamilyMembers,
        getFamilyMembersForRecipient,
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

