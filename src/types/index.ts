export type Language = 'en' | 'fa';

// ==========================================
// IDENTITY & FAMILY
// ==========================================
export type FamilyRole = 'primary_coordinator' | 'care_collaborator' | 'family_viewer' | 'emergency_contact';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  activeFamilyCircleId?: string;
}

export interface FamilyMember {
  id: string;
  userId?: string;
  name: string;
  email?: string;
  phone?: string;
  relationshipToRecipient: string;
  role: FamilyRole;
  avatarUrl?: string;
  isEmergencyContact: boolean;
}

/**
 * CareRecipient is the central domain entity of CareMate.
 * A family can manage more than one CareRecipient (e.g., Mom and Dad).
 */
export interface CareRecipient {
  id: string;
  name: string;
  preferredName?: string;
  age: number;
  dateOfBirth?: string;
  livingSituation?: string;
  primaryLanguage?: Language;
  address?: {
    city: string;
    state?: string;
    zip?: string;
  };
  careNeeds: string[];
  photoUrl?: string;
  emergencyContactIds?: string[];
  notes?: string;
  medicalConditionsSummary?: string;
}

/**
 * Backward compatibility alias for the initial prototype
 */
export type Parent = CareRecipient;

// ==========================================
// TRUST & VERIFICATION
// ==========================================
export type VerificationStatus = 'verified' | 'pending' | 'unverified' | 'rejected';

export interface TrustRecord {
  isIdentityVerified: boolean;
  identityVerifiedAt?: string;
  isBackgroundChecked: boolean;
  backgroundCheckedAt?: string;
  isLicenseVerified: boolean;
  licenseType?: string;
  licenseNumber?: string;
  isInsured: boolean;
  verificationNotes?: string;
}

// ==========================================
// REVIEWS
// ==========================================
export interface ProviderReview {
  id: string;
  authorName: string;
  rating: number;
  date: string;
  text: string;
  verifiedVisit?: boolean;
}

// ==========================================
// PROVIDERS & MARKETPLACE
// ==========================================
export interface Provider {
  id: string;
  name: string;
  title: string;
  matchScore: number;
  matchReasonEN: string;
  matchReasonFA: string;
  yearsExperience: number;
  rate: number;
  distance: string;
  specialtiesEN: string[];
  specialtiesFA: string[];
  isIdentityVerified: boolean;
  isBackgroundChecked: boolean;
  isLicenseVerified: boolean;
  avatarUrl: string;
  aboutEN: string;
  aboutFA: string;
  reviewsCount: number;
  rating: number;
  // Trust record abstraction for strict verification checking
  trustRecord?: TrustRecord;
  reviews?: ProviderReview[];
  // Map coordinates
  lat?: number;
  lng?: number;
  availability?: 'today' | 'this_week' | 'custom';
}

export interface CareMatchScore {
  overall: number; // 0-100
  factors: {
    scheduleScore: number;
    skillsScore: number;
    distanceScore: number;
    budgetScore: number;
  };
  reasonEN: string;
  reasonFA: string;
}

// ==========================================
// CARE GRAPH: NEEDS, REQUESTS, VISITS, ALERTS
// ==========================================
export type CareNeedCategory = 
  | 'mobility' 
  | 'medication' 
  | 'memory_care' 
  | 'personal_care' 
  | 'companionship' 
  | 'transportation' 
  | 'meal_prep' 
  | 'specialized_medical';

export interface CareNeed {
  id: string;
  recipientId: string;
  category: CareNeedCategory;
  title: string;
  description?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  frequency?: string;
}

export interface CareRequest {
  id: string;
  recipientId: string;
  requestedByFamilyMemberId: string;
  careNeeds: string[];
  preferredSchedule: {
    days: string[];
    timeSlot: string;
  };
  status: 'draft' | 'submitted' | 'matched' | 'confirmed' | 'completed';
  createdAt: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  recipientId: string;
  providerId: string;
  providerName: string;
  providerAvatar?: string;
  serviceDate: string;
  timeSlot: string;
  hours: number;
  hourlyRate: number;
  totalAmount: number;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
}

export interface VisitReport {
  id: string;
  visitId: string;
  recipientId: string;
  providerId: string;
  providerName: string;
  date: string;
  summary: string;
  activitiesCompleted: string[];
  moodRating?: 1 | 2 | 3 | 4 | 5;
  vitals?: {
    bloodPressure?: string;
    pulse?: number;
    bloodSugar?: string;
  };
  urgentNotes?: string;
}

export interface CareAlert {
  id: string;
  recipientId: string;
  severity: 'info' | 'warning' | 'urgent' | 'emergency';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  actionRoute?: string;
}

export interface CareTimelineItem {
  id: string;
  recipientId: string;
  type: 'visit' | 'medication' | 'alert' | 'booking' | 'note';
  title: string;
  timestamp: string;
  actorName: string;
  description?: string;
}

// ==========================================
// PAYMENTS & BILLING
// ==========================================
export interface PaymentMethod {
  id: string;
  type: 'card';
  last4: string;
  brand: string;
  expiry: string;
  isDefault: boolean;
}

export interface BillingTransaction {
  id: number | string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  provider: string;
  recipientId?: string;
  serviceDescription?: string;
  invoiceUrl?: string;
}

// ==========================================
// AI COORDINATOR CONVERSATION
// ==========================================
export interface AICoordinatorMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isAction?: boolean;
  actionType?: 'see_matches' | 'view_schedule' | 'emergency_help';
  timestamp?: string;
  metadata?: {
    extractedNeeds?: string[];
    suggestedSchedule?: string;
    isEmergencyTriage?: boolean;
  };
}
