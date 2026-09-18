import { 
  CareRecipient, 
  FamilyMember, 
  CareAlert, 
  EmergencyContact, 
  RelationshipType, 
  CareNeedCategory, 
  MobilityOption, 
  CarePreferences, 
  CommunicationPreferences,
  CareRecipientLocation 
} from '../types';

/**
 * Care Recipient Service
 * Centralizes management of Care Recipients and their Family Circles.
 * 
 * ARCHITECTURAL PRINCIPLES:
 * - Rule 18: Evelyn and Robert are clearly isolated development fixtures for 'u_family_sample'.
 * - Rule 22: Supports multiple Care Recipients per family.
 * - Rule 24: Care Recipient is the central domain entity.
 * - Rule 10: Care Recipient privacy (no sensitive data leaks, soft delete support).
 */

export function calculateAge(dobString?: string): number | undefined {
  if (!dobString) return undefined;
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return undefined;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : undefined;
}

// DEVELOPMENT ONLY FIXTURES (Attached solely to u_family_sample for testing)
export const MOCK_DEVELOPMENT_RECIPIENTS: CareRecipient[] = [
  {
    id: 'p1',
    createdByUserId: 'u_family_sample',
    firstName: 'Evelyn',
    lastName: 'Vance',
    preferredName: 'Mom',
    age: 78,
    dateOfBirth: '1948-04-12',
    relationshipToPrimaryUser: 'mother',
    primaryLanguage: 'en',
    location: {
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94110',
      country: 'USA'
    },
    careNeeds: ['mobility_assistance', 'medication_reminders', 'personal_care'],
    mobility: 'cane',
    communication: {
      primaryLanguage: 'en',
      preferences: ['normal_conversation']
    },
    preferences: {
      caregiverGender: 'female',
      preferredLanguage: 'English',
      nonSmokingPreferred: true,
      comfortableWithPets: true,
      recipientHasPets: true,
      transportationRequired: false
    },
    emergencyContacts: [
      {
        id: 'ec_1',
        name: 'Sarah Vance',
        relationship: 'Daughter',
        phone: '+1 (555) 234-5678',
        isPrimary: true
      },
      {
        id: 'ec_2',
        name: 'David Vance',
        relationship: 'Son',
        phone: '+1 (555) 987-6543',
        isPrimary: false
      }
    ],
    livingSituation: 'Lives independently with family checking in daily',
    importantNotes: 'Mild arthritis in morning, prefers morning appointments, fluent in English.',
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-09-01T12:00:00Z',
    // Backward compatibility
    name: 'Evelyn',
    notes: 'Mild arthritis in morning, prefers morning appointments, fluent in English.',
    address: {
      city: 'San Francisco',
      state: 'CA',
      zip: '94110'
    },
    medicalConditionsSummary: 'Hypertension, Osteoarthritis'
  },
  {
    id: 'p2',
    createdByUserId: 'u_family_sample',
    firstName: 'Robert',
    lastName: 'Vance',
    preferredName: 'Dad',
    age: 81,
    dateOfBirth: '1945-09-22',
    relationshipToPrimaryUser: 'father',
    primaryLanguage: 'en',
    location: {
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94110',
      country: 'USA'
    },
    careNeeds: ['post_hospital_support', 'transportation'],
    mobility: 'walker',
    communication: {
      primaryLanguage: 'en',
      preferences: ['normal_conversation']
    },
    preferences: {
      caregiverGender: 'no_preference',
      preferredLanguage: 'English',
      nonSmokingPreferred: true,
      comfortableWithPets: false,
      recipientHasPets: false,
      transportationRequired: true
    },
    emergencyContacts: [
      {
        id: 'ec_3',
        name: 'Sarah Vance',
        relationship: 'Daughter',
        phone: '+1 (555) 234-5678',
        isPrimary: true
      }
    ],
    livingSituation: 'Living with spouse Evelyn',
    importantNotes: 'Recovering from minor knee surgery.',
    createdAt: '2026-02-10T10:00:00Z',
    updatedAt: '2026-08-20T14:30:00Z',
    // Backward compatibility
    name: 'Robert',
    notes: 'Recovering from minor knee surgery.',
    address: {
      city: 'San Francisco',
      state: 'CA',
      zip: '94110'
    },
    medicalConditionsSummary: 'Post-knee arthroscopy'
  }
];

// Backwards compatibility export
export const INITIAL_RECIPIENTS = MOCK_DEVELOPMENT_RECIPIENTS;

export const INITIAL_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'fam_1',
    userId: 'u_family_sample',
    name: 'Sarah',
    relationshipToRecipient: 'Daughter',
    role: 'primary_coordinator',
    email: 'sarah.family@example.com',
    phone: '+1 (555) 234-5678',
    isEmergencyContact: true
  },
  {
    id: 'fam_2',
    name: 'David',
    relationshipToRecipient: 'Son',
    role: 'care_collaborator',
    email: 'david.fam@example.com',
    phone: '+1 (555) 987-6543',
    isEmergencyContact: true
  }
];

export const INITIAL_ALERTS: CareAlert[] = [
  {
    id: 'alt_1',
    recipientId: 'p1',
    severity: 'warning',
    title: 'Missed Medication Check',
    message: 'Morning blood pressure medication was logged 45 minutes past target window.',
    timestamp: '2026-09-08T09:45:00Z',
    resolved: false,
    actionRoute: '/dashboard'
  }
];

const STORAGE_KEY_RECIPIENTS = 'caremate_recipients_store';
const STORAGE_KEY_ACTIVE = 'caremate_active_recipient_id';

class CareRecipientService {
  private userRecipientsMap: Map<string, CareRecipient[]> = new Map();
  private activeRecipientIdMap: Map<string, string> = new Map();
  private familyMembers: FamilyMember[] = [...INITIAL_FAMILY_MEMBERS];
  private alerts: CareAlert[] = [...INITIAL_ALERTS];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_RECIPIENTS);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, CareRecipient[]>;
        Object.entries(parsed).forEach(([userId, list]) => {
          this.userRecipientsMap.set(userId, list);
        });
      }
    } catch {
      // Storage unavailable or invalid JSON
    }

    // Ensure development fixtures for u_family_sample exist
    if (!this.userRecipientsMap.has('u_family_sample')) {
      this.userRecipientsMap.set('u_family_sample', [...MOCK_DEVELOPMENT_RECIPIENTS]);
      this.saveToStorage();
    }
  }

  private saveToStorage(): void {
    try {
      const record: Record<string, CareRecipient[]> = {};
      this.userRecipientsMap.forEach((list, userId) => {
        record[userId] = list;
      });
      localStorage.setItem(STORAGE_KEY_RECIPIENTS, JSON.stringify(record));
    } catch {
      // Ignore write errors in restricted contexts
    }
  }

  /**
   * List all Care Recipients belonging to an authenticated Family user.
   * A newly registered user returns [] until they create a recipient.
   */
  public listRecipientsForFamily(userId?: string): CareRecipient[] {
    if (!userId) {
      return [];
    }
    const list = this.userRecipientsMap.get(userId);
    return list ? [...list] : [];
  }

  /**
   * Legacy backward-compatibility alias for listRecipientsForFamily.
   * If userId is omitted in test environments, falls back to demo sample.
   */
  public getRecipients(userId?: string): CareRecipient[] {
    if (!userId) {
      const sample = this.userRecipientsMap.get('u_family_sample');
      return sample ? [...sample] : [...MOCK_DEVELOPMENT_RECIPIENTS];
    }
    return this.listRecipientsForFamily(userId);
  }

  /**
   * Get single recipient by ID.
   */
  public getRecipient(id: string, userId?: string): CareRecipient | null {
    if (userId) {
      const userList = this.listRecipientsForFamily(userId);
      return userList.find(r => r.id === id) || null;
    }
    // Search across all users if userId not specified
    for (const list of this.userRecipientsMap.values()) {
      const found = list.find(r => r.id === id);
      if (found) return found;
    }
    return null;
  }

  /**
   * Get the active recipient for the given family user.
   * Does NOT force 'p1' if none exists.
   */
  public getActiveRecipient(userId?: string): CareRecipient | null {
    const list = this.getRecipients(userId);
    if (list.length === 0) return null;

    const userKey = userId || 'u_family_sample';
    let savedId = this.activeRecipientIdMap.get(userKey);
    if (!savedId) {
      try {
        savedId = localStorage.getItem(`${STORAGE_KEY_ACTIVE}_${userKey}`) || undefined;
      } catch {
        // Fallback
      }
    }

    if (savedId) {
      const match = list.find(r => r.id === savedId);
      if (match) return match;
    }

    return list[0];
  }

  /**
   * Set active recipient ID for a user.
   */
  public setActiveRecipientId(id: string, userId?: string): void {
    const userKey = userId || 'u_family_sample';
    this.activeRecipientIdMap.set(userKey, id);
    try {
      localStorage.setItem(`${STORAGE_KEY_ACTIVE}_${userKey}`, id);
    } catch {
      // Ignore
    }
  }

  /**
   * Create a new Care Recipient profile.
   */
  public createRecipient(
    data: Omit<CareRecipient, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): CareRecipient {
    const now = new Date().toISOString();
    const effectiveAge = data.age || calculateAge(data.dateOfBirth) || 0;
    const displayName = data.preferredName || `${data.firstName} ${data.lastName}`.trim();

    const newRecipient: CareRecipient = {
      ...data,
      id: `cr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdByUserId: userId,
      age: effectiveAge,
      createdAt: now,
      updatedAt: now,
      // Backward compatibility fields
      name: displayName,
      notes: data.importantNotes,
      photoUrl: data.profilePhotoUrl,
      address: {
        city: data.location.city,
        state: data.location.state,
        zip: data.location.postalCode
      }
    };

    const currentList = this.listRecipientsForFamily(userId);
    currentList.push(newRecipient);
    this.userRecipientsMap.set(userId, currentList);
    this.saveToStorage();

    this.setActiveRecipientId(newRecipient.id, userId);

    return newRecipient;
  }

  /**
   * Legacy alias for createRecipient
   */
  public addRecipient(
    newRecipient: Partial<CareRecipient> & { firstName?: string; lastName?: string; name?: string },
    userId?: string
  ): CareRecipient {
    const targetUserId = userId || 'u_family_sample';
    
    // Normalize if only legacy fields provided
    const firstName = newRecipient.firstName || (newRecipient.name ? newRecipient.name.split(' ')[0] : 'Loved');
    const lastName = newRecipient.lastName || (newRecipient.name ? newRecipient.name.split(' ').slice(1).join(' ') : 'One');

    const payload: Omit<CareRecipient, 'id' | 'createdAt' | 'updatedAt'> = {
      createdByUserId: targetUserId,
      firstName,
      lastName,
      preferredName: newRecipient.preferredName || firstName,
      age: newRecipient.age || 75,
      relationshipToPrimaryUser: (newRecipient.relationshipToPrimaryUser as RelationshipType) || 'mother',
      primaryLanguage: newRecipient.primaryLanguage || 'en',
      location: newRecipient.location || {
        city: newRecipient.address?.city || 'San Francisco',
        state: newRecipient.address?.state || 'CA',
        postalCode: newRecipient.address?.zip || '94110',
        country: 'USA'
      },
      careNeeds: newRecipient.careNeeds || ['companionship'],
      mobility: newRecipient.mobility || 'independent',
      emergencyContacts: newRecipient.emergencyContacts || [],
      livingSituation: newRecipient.livingSituation,
      importantNotes: newRecipient.importantNotes || newRecipient.notes
    };

    return this.createRecipient(payload, targetUserId);
  }

  /**
   * Update an existing Care Recipient.
   */
  public updateRecipient(
    id: string,
    updates: Partial<CareRecipient>,
    userId?: string
  ): CareRecipient | null {
    const targetUserId = userId || 'u_family_sample';
    const list = this.listRecipientsForFamily(targetUserId);
    const index = list.findIndex(r => r.id === id);
    if (index === -1) return null;

    const current = list[index];
    const derivedAge = updates.age ?? (updates.dateOfBirth ? calculateAge(updates.dateOfBirth) : current.age);
    const firstName = updates.firstName ?? current.firstName;
    const lastName = updates.lastName ?? current.lastName;
    const preferredName = updates.preferredName ?? current.preferredName;
    const displayName = preferredName || `${firstName} ${lastName}`.trim();

    const updated: CareRecipient = {
      ...current,
      ...updates,
      id: current.id,
      createdByUserId: current.createdByUserId,
      age: derivedAge,
      updatedAt: new Date().toISOString(),
      name: displayName,
      notes: updates.importantNotes ?? current.importantNotes,
      photoUrl: updates.profilePhotoUrl ?? current.profilePhotoUrl,
      address: updates.location ? {
        city: updates.location.city,
        state: updates.location.state,
        zip: updates.location.postalCode
      } : current.address
    };

    list[index] = updated;
    this.userRecipientsMap.set(targetUserId, list);
    this.saveToStorage();

    return updated;
  }

  /**
   * Delete / Remove a Care Recipient profile.
   * Architecture supports soft deletion / archiving.
   */
  public deleteRecipient(id: string, userId?: string): boolean {
    const targetUserId = userId || 'u_family_sample';
    const list = this.listRecipientsForFamily(targetUserId);
    const filtered = list.filter(r => r.id !== id);
    if (filtered.length === list.length) return false;

    this.userRecipientsMap.set(targetUserId, filtered);
    this.saveToStorage();

    // If active recipient was deleted, reassign or clear
    const active = this.getActiveRecipient(targetUserId);
    if (active && active.id === id) {
      if (filtered.length > 0) {
        this.setActiveRecipientId(filtered[0].id, targetUserId);
      } else {
        this.activeRecipientIdMap.delete(targetUserId);
        try {
          localStorage.removeItem(`${STORAGE_KEY_ACTIVE}_${targetUserId}`);
        } catch {
          // Ignore
        }
      }
    }

    return true;
  }

  /**
   * Emergency Contacts Management
   */
  public addEmergencyContact(
    recipientId: string,
    contact: Omit<EmergencyContact, 'id'>,
    userId?: string
  ): EmergencyContact | null {
    const recipient = this.getRecipient(recipientId, userId);
    if (!recipient) return null;

    const newContact: EmergencyContact = {
      ...contact,
      id: `ec_${Date.now()}`
    };

    let contacts = [...(recipient.emergencyContacts || [])];
    if (newContact.isPrimary) {
      contacts = contacts.map(c => ({ ...c, isPrimary: false }));
    } else if (contacts.length === 0) {
      newContact.isPrimary = true;
    }
    contacts.push(newContact);

    this.updateRecipient(recipientId, { emergencyContacts: contacts }, userId);
    return newContact;
  }

  public updateEmergencyContact(
    recipientId: string,
    contactId: string,
    updates: Partial<EmergencyContact>,
    userId?: string
  ): EmergencyContact | null {
    const recipient = this.getRecipient(recipientId, userId);
    if (!recipient) return null;

    let contacts = [...(recipient.emergencyContacts || [])];
    const index = contacts.findIndex(c => c.id === contactId);
    if (index === -1) return null;

    if (updates.isPrimary) {
      contacts = contacts.map(c => ({ ...c, isPrimary: false }));
    }

    const updatedContact = { ...contacts[index], ...updates };
    contacts[index] = updatedContact;

    this.updateRecipient(recipientId, { emergencyContacts: contacts }, userId);
    return updatedContact;
  }

  public removeEmergencyContact(
    recipientId: string,
    contactId: string,
    userId?: string
  ): boolean {
    const recipient = this.getRecipient(recipientId, userId);
    if (!recipient) return false;

    const filtered = (recipient.emergencyContacts || []).filter(c => c.id !== contactId);
    // Ensure at least one primary if contacts remain and previous primary was removed
    if (filtered.length > 0 && !filtered.some(c => c.isPrimary)) {
      filtered[0].isPrimary = true;
    }

    this.updateRecipient(recipientId, { emergencyContacts: filtered }, userId);
    return true;
  }

  public getFamilyMembers(): FamilyMember[] {
    return [...this.familyMembers];
  }

  public getAlerts(recipientId?: string): CareAlert[] {
    if (recipientId) {
      return this.alerts.filter(a => a.recipientId === recipientId);
    }
    return [...this.alerts];
  }
}

export const careRecipientService = new CareRecipientService();

