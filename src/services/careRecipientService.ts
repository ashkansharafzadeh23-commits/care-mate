import { CareRecipient, FamilyMember, CareAlert } from '../types';

/**
 * Care Recipient Service
 * Centralizes management of Care Recipients and their Family Circles.
 * 
 * ARCHITECTURE RULES:
 * - Rule 18: Development fixtures (Evelyn & Robert) are clearly isolated for prototyping.
 * - Rule 22: Supports multiple Care Recipients per family.
 * - Rule 24: Care Recipient is the central domain entity.
 */

// DEVELOPMENT ONLY FIXTURES
export const MOCK_DEVELOPMENT_RECIPIENTS: CareRecipient[] = [
  {
    id: 'p1',
    name: 'Evelyn',
    preferredName: 'Mom',
    age: 78,
    dateOfBirth: '1948-04-12',
    livingSituation: 'Lives independently with family checking in daily',
    primaryLanguage: 'en',
    address: {
      city: 'San Francisco',
      state: 'CA',
      zip: '94110'
    },
    careNeeds: ['Mobility assistance', 'Medication reminders', 'Physical therapy exercises'],
    notes: 'Mild arthritis, prefers morning appointments, fluent in English.',
    medicalConditionsSummary: 'Hypertension, Osteoarthritis'
  },
  {
    id: 'p2',
    name: 'Robert',
    preferredName: 'Dad',
    age: 81,
    dateOfBirth: '1945-09-22',
    livingSituation: 'Living with spouse Evelyn',
    primaryLanguage: 'en',
    careNeeds: ['Post-surgery rehab', 'Driver assistance'],
    notes: 'Recovering from minor knee surgery.',
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

class CareRecipientService {
  private userRecipientsMap: Map<string, CareRecipient[]> = new Map([
    ['u_family_sample', [...MOCK_DEVELOPMENT_RECIPIENTS]]
  ]);
  private activeRecipientId: string = 'p1';
  private familyMembers: FamilyMember[] = [...INITIAL_FAMILY_MEMBERS];
  private alerts: CareAlert[] = [...INITIAL_ALERTS];

  public getRecipients(userId?: string): CareRecipient[] {
    if (!userId) {
      return [...MOCK_DEVELOPMENT_RECIPIENTS];
    }
    const list = this.userRecipientsMap.get(userId);
    if (list) return [...list];
    // Return empty array for newly registered family users until they add a recipient
    return [];
  }

  public getActiveRecipient(userId?: string): CareRecipient | null {
    const list = this.getRecipients(userId);
    if (list.length === 0) return null;
    const found = list.find(r => r.id === this.activeRecipientId);
    return found || list[0];
  }

  public setActiveRecipientId(id: string): void {
    this.activeRecipientId = id;
  }

  public addRecipient(newRecipient: Omit<CareRecipient, 'id'>, userId?: string): CareRecipient {
    const created: CareRecipient = {
      ...newRecipient,
      id: `p_${Date.now()}`
    };

    const targetUserId = userId || 'u_family_sample';
    const currentList = this.userRecipientsMap.get(targetUserId) || [];
    currentList.push(created);
    this.userRecipientsMap.set(targetUserId, currentList);
    this.activeRecipientId = created.id;

    return created;
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
