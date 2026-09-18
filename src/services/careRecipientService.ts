import { CareRecipient, FamilyMember, CareAlert } from '../types';

/**
 * Care Recipient Service
 * Centralizes management of Care Recipients and their Family Circles.
 * Rule 22: Design data structures so a family can manage more than one Care Recipient.
 * Rule 23: Design role-based access so multiple authorized family members can collaborate.
 * Rule 24: Build around the Care Recipient as the central entity.
 */

export const INITIAL_RECIPIENTS: CareRecipient[] = [
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

export const INITIAL_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'fam_1',
    userId: 'u1',
    name: 'Sarah',
    relationshipToRecipient: 'Daughter',
    role: 'primary_coordinator',
    email: 'sarah@example.com',
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
  private recipients: CareRecipient[] = [...INITIAL_RECIPIENTS];
  private activeRecipientId: string = 'p1';
  private familyMembers: FamilyMember[] = [...INITIAL_FAMILY_MEMBERS];
  private alerts: CareAlert[] = [...INITIAL_ALERTS];

  public getRecipients(): CareRecipient[] {
    return [...this.recipients];
  }

  public getActiveRecipient(): CareRecipient {
    const found = this.recipients.find(r => r.id === this.activeRecipientId);
    return found || this.recipients[0];
  }

  public setActiveRecipientId(id: string): void {
    if (this.recipients.some(r => r.id === id)) {
      this.activeRecipientId = id;
    }
  }

  public addRecipient(newRecipient: Omit<CareRecipient, 'id'>): CareRecipient {
    const created: CareRecipient = {
      ...newRecipient,
      id: `p_${Date.now()}`
    };
    this.recipients.push(created);
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
