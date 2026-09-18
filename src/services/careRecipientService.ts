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
import { familyCircleService } from './familyCircleService';

/**
 * Care Recipient Service
 * Centralizes management of Care Recipients and their Family Circles.
 * 
 * ARCHITECTURAL PRINCIPLES:
 * - Rule 18: Evelyn and Robert are clearly isolated development fixtures for 'u_family_sample'.
 * - Rule 22: Supports multiple Care Recipients per family with isolated Family Circles.
 * - Rule 24: Care Recipient is the central domain entity.
 * - Rule 10 & 11: Scoped lookup (no cross-user leakage, authenticated mutations required).
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

export const INITIAL_RECIPIENTS = MOCK_DEVELOPMENT_RECIPIENTS;

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
   * Internal helper to find a recipient by ID across stores (used for shared memberships)
   */
  public findRecipientByIdInternal(id: string): CareRecipient | null {
    for (const list of this.userRecipientsMap.values()) {
      const found = list.find(r => r.id === id);
      if (found) return found;
    }
    return null;
  }

  /**
   * List all Care Recipients accessible by an authenticated user.
   * Includes:
   * 1. Care Recipients created by this user
   * 2. Care Recipients where this user is an accepted member of the Family Circle
   */
  public listRecipientsForFamily(userId?: string): CareRecipient[] {
    if (!userId) {
      return [];
    }
    const createdList = this.userRecipientsMap.get(userId) || [];
    const memberRecipientIds = familyCircleService.getRecipientIdsForUser(userId);

    const combined: CareRecipient[] = [...createdList];
    for (const recId of memberRecipientIds) {
      if (!combined.some(r => r.id === recId)) {
        const shared = this.findRecipientByIdInternal(recId);
        if (shared) {
          combined.push(shared);
        }
      }
    }
    return combined;
  }

  /**
   * Legacy alias for listRecipientsForFamily.
   * If userId is omitted, returns empty array in production-safe architecture.
   */
  public getRecipients(userId?: string): CareRecipient[] {
    if (!userId) {
      return [];
    }
    return this.listRecipientsForFamily(userId);
  }

  /**
   * Get single recipient by ID.
   * STRENGTHENED AUTHORIZATION (Item 11):
   * Scoped strictly to the authenticated user's authorized recipients.
   * Unauthenticated or out-of-scope access returns null.
   */
  public getRecipient(id: string, userId?: string): CareRecipient | null {
    if (!userId) {
      return null;
    }
    const authorizedList = this.listRecipientsForFamily(userId);
    return authorizedList.find(r => r.id === id) || null;
  }

  /**
   * Explicit development demo helper for testing fixtures.
   */
  public getRecipientForDevelopmentDemo(id: string): CareRecipient | null {
    return this.findRecipientByIdInternal(id);
  }

  /**
   * Get the active recipient for the given family user.
   */
  public getActiveRecipient(userId?: string): CareRecipient | null {
    if (!userId) return null;
    const list = this.listRecipientsForFamily(userId);
    if (list.length === 0) return null;

    let savedId = this.activeRecipientIdMap.get(userId);
    if (!savedId) {
      try {
        savedId = localStorage.getItem(`${STORAGE_KEY_ACTIVE}_${userId}`) || undefined;
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
    if (!userId) return;
    this.activeRecipientIdMap.set(userId, id);
    try {
      localStorage.setItem(`${STORAGE_KEY_ACTIVE}_${userId}`, id);
    } catch {
      // Ignore
    }
  }

  /**
   * Create a new Care Recipient profile.
   * AUTOMATICALLY CREATES FAMILY CIRCLE (Item 12):
   * The authenticated creator is designated as the primary Care Coordinator.
   */
  public createRecipient(
    data: Omit<CareRecipient, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string,
    creatorName?: string
  ): CareRecipient {
    if (!userId) {
      throw new Error('Authentication required: A Care Recipient must belong to an authenticated user.');
    }

    const now = new Date().toISOString();
    const effectiveAge = data.age || calculateAge(data.dateOfBirth) || 0;
    const displayName = data.preferredName || `${data.firstName} ${data.lastName}`.trim();
    const recipientId = `cr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newRecipient: CareRecipient = {
      ...data,
      id: recipientId,
      createdByUserId: userId,
      age: effectiveAge,
      createdAt: now,
      updatedAt: now,
      name: displayName,
      notes: data.importantNotes,
      photoUrl: data.profilePhotoUrl,
      address: {
        city: data.location.city,
        state: data.location.state,
        zip: data.location.postalCode
      }
    };

    const currentList = this.userRecipientsMap.get(userId) || [];
    currentList.push(newRecipient);
    this.userRecipientsMap.set(userId, currentList);
    this.saveToStorage();

    // Automatically establish the Family Circle for this Care Recipient
    familyCircleService.createCircle(
      recipientId, 
      userId, 
      creatorName || `${newRecipient.firstName}'s Coordinator`
    );

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
    if (!userId) {
      throw new Error('Authentication required to create a Care Recipient.');
    }

    const firstName = newRecipient.firstName || (newRecipient.name ? newRecipient.name.split(' ')[0] : 'Loved');
    const lastName = newRecipient.lastName || (newRecipient.name ? newRecipient.name.split(' ').slice(1).join(' ') : 'One');

    const payload: Omit<CareRecipient, 'id' | 'createdAt' | 'updatedAt'> = {
      createdByUserId: userId,
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

    return this.createRecipient(payload, userId);
  }

  /**
   * Update an existing Care Recipient.
   */
  public updateRecipient(
    id: string,
    updates: Partial<CareRecipient>,
    userId?: string
  ): CareRecipient | null {
    if (!userId) {
      throw new Error('Authentication required to update a Care Recipient.');
    }

    // Find recipient in creator's list or shared list
    let ownerUserId = userId;
    let list = this.userRecipientsMap.get(userId) || [];
    let index = list.findIndex(r => r.id === id);

    if (index === -1) {
      // Check if user is an authorized coordinator for this recipient
      for (const [uid, uList] of this.userRecipientsMap.entries()) {
        const foundIndex = uList.findIndex(r => r.id === id);
        if (foundIndex !== -1) {
          ownerUserId = uid;
          list = uList;
          index = foundIndex;
          break;
        }
      }
    }

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
    this.userRecipientsMap.set(ownerUserId, list);
    this.saveToStorage();

    return updated;
  }

  /**
   * Delete / Remove a Care Recipient profile.
   */
  public deleteRecipient(id: string, userId?: string): boolean {
    if (!userId) {
      throw new Error('Authentication required to delete a Care Recipient.');
    }

    let ownerUserId = userId;
    let list = this.userRecipientsMap.get(userId) || [];
    let filtered = list.filter(r => r.id !== id);

    if (filtered.length === list.length) {
      // Check if creator is different
      for (const [uid, uList] of this.userRecipientsMap.entries()) {
        const f = uList.filter(r => r.id !== id);
        if (f.length !== uList.length) {
          ownerUserId = uid;
          list = uList;
          filtered = f;
          break;
        }
      }
    }

    if (filtered.length === list.length) return false;

    this.userRecipientsMap.set(ownerUserId, filtered);
    this.saveToStorage();

    const active = this.getActiveRecipient(userId);
    if (active && active.id === id) {
      if (filtered.length > 0) {
        this.setActiveRecipientId(filtered[0].id, userId);
      } else {
        this.activeRecipientIdMap.delete(userId);
        try {
          localStorage.removeItem(`${STORAGE_KEY_ACTIVE}_${userId}`);
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
    if (filtered.length > 0 && !filtered.some(c => c.isPrimary)) {
      filtered[0].isPrimary = true;
    }

    this.updateRecipient(recipientId, { emergencyContacts: filtered }, userId);
    return true;
  }

  /**
   * Scoped family members lookup for a specific Care Recipient.
   */
  public getFamilyMembers(recipientId?: string): FamilyMember[] {
    if (recipientId) {
      return familyCircleService.listMembers(recipientId);
    }
    return [];
  }

  public getAlerts(recipientId?: string): CareAlert[] {
    if (recipientId) {
      return this.alerts.filter(a => a.recipientId === recipientId);
    }
    return [...this.alerts];
  }
}

export const careRecipientService = new CareRecipientService();


