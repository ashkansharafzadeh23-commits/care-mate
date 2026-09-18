export type Language = 'en' | 'fa';

// ==========================================
// IDENTITY & ROLES
// ==========================================
export type UserRole = 'family' | 'provider' | 'admin';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthSession {
  userId: string;
  role: UserRole;
  expiresAt?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string; // Combined convenience property for UI: `${firstName} ${lastName}`
  email: string;
  phone?: string;
  role: UserRole;
  preferredLanguage: Language;
  createdAt: string;
  activeFamilyCircleId?: string;
}

/**
 * Provider Professional Profile (Separated from User identity)
 * Domain-specific data for marketplace providers.
 */
export interface ProviderProfile {
  id: string;
  userId: string;
  title: string;
  hourlyRate?: number;
  yearsExperience?: number;
  specialties: string[];
  bio?: string;
  status: 'draft' | 'under_review' | 'active' | 'suspended';
  trustRecord?: TrustRecord;
}

// ==========================================
// FAMILY CIRCLE, ROLES & PERMISSIONS
// ==========================================
export type FamilyRole = 
  | 'care_coordinator' 
  | 'family_member' 
  | 'view_only'
  | 'trusted_helper'
  | 'healthcare_proxy'
  | 'viewer'
  | 'CARE_COORDINATOR'
  | 'FAMILY_MEMBER'
  | 'TRUSTED_HELPER'
  | 'HEALTHCARE_PROXY'
  | 'VIEW_ONLY'
  // Legacy aliases preserved for backward compatibility
  | 'primary_coordinator' 
  | 'care_collaborator' 
  | 'family_viewer';

export type InvitationStatus = 
  | 'invited' 
  | 'accepted' 
  | 'declined' 
  | 'expired' 
  | 'revoked'
  | 'pending';

export type CarePermission =
  | 'view_care'
  | 'edit_care_profile'
  | 'create_care_request'
  | 'book_care'
  | 'manage_bookings'
  | 'message_providers'
  | 'view_visit_reports'
  | 'view_care_timeline'
  | 'manage_care_profile'
  | 'view_sensitive_information'
  | 'manage_payments'
  | 'invite_family'
  | 'manage_permissions'
  | 'report_incident';

export interface FamilyCircle {
  id: string;
  careRecipientId: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMember {
  id: string;
  familyCircleId: string;
  careRecipientId: string;
  recipientId?: string;
  userId?: string;
  name: string;
  email?: string;
  phone?: string;
  relationshipToRecipient: string;
  role: FamilyRole;
  permissions: CarePermission[];
  invitationStatus: InvitationStatus;
  invitationToken?: string;
  invitedByUserId?: string;
  invitedAt?: string;
  acceptedAt?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  isEmergencyContact?: boolean;
}

export type FamilyActivityType =
  | 'FAMILY_MEMBER_INVITED'
  | 'FAMILY_MEMBER_JOINED'
  | 'FAMILY_MEMBER_REMOVED'
  | 'MEMBER_ROLE_CHANGED'
  | 'MEMBER_PERMISSIONS_CHANGED'
  | 'FAMILY_CIRCLE_CREATED';

export interface FamilyActivity {
  id: string;
  careRecipientId: string;
  actorUserId: string;
  actorName?: string;
  type: FamilyActivityType;
  timestamp: string;
  createdAt?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface InvitationTokenPayload {
  token: string;
  memberId: string;
  careRecipientId: string;
  recipientId?: string;
  recipientName: string;
  inviterName: string;
  relationshipToRecipient: string;
  role: FamilyRole;
  email?: string;
  phone?: string;
  expiresAt: string;
}

// ==========================================
// CARE RECIPIENT & CARE GRAPH TYPES
// ==========================================

export type RelationshipType = 
  | 'mother'
  | 'father'
  | 'grandmother'
  | 'grandfather'
  | 'spouse'
  | 'relative'
  | 'friend'
  | 'other';

export type CareNeedCategory =
  | 'companionship'
  | 'personal_care'
  | 'bathing_assistance'
  | 'dressing_assistance'
  | 'meal_preparation'
  | 'mobility_assistance'
  | 'transportation'
  | 'light_housekeeping'
  | 'medication_reminders'
  | 'post_hospital_support'
  | 'memory_dementia_support'
  | 'overnight_supervision'
  | 'appointment_assistance'
  | 'not_sure_yet'
  | 'other';

export type MobilityOption =
  | 'independent'
  | 'cane'
  | 'walker'
  | 'wheelchair'
  | 'transfer_assistance'
  | 'bedbound'
  | 'prefer_not_to_answer'
  | 'other';

export interface CommunicationPreferences {
  primaryLanguage?: string;
  additionalLanguages?: string[];
  preferences?: string[];
  customCommunication?: string;
}

export interface CarePreferences {
  caregiverGender?: 'no_preference' | 'female' | 'male';
  preferredLanguage?: string;
  nonSmokingPreferred?: boolean;
  comfortableWithPets?: boolean;
  recipientHasPets?: boolean;
  transportationRequired?: boolean;
  additionalNotes?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
  isPrimary: boolean;
}

export interface CareRecipientLocation {
  addressLine1?: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

/**
 * CareRecipient is the central domain entity of CareMate.
 * An authenticated Family user can coordinate care for multiple loved ones (e.g., Mother and Father).
 */
export interface CareRecipient {
  id: string;
  familyId?: string;
  createdByUserId: string;

  firstName: string;
  lastName: string;
  preferredName?: string;

  dateOfBirth?: string;
  age?: number;

  relationshipToPrimaryUser: RelationshipType;
  customRelationship?: string;

  profilePhotoUrl?: string;

  primaryLanguage?: Language | string;
  additionalLanguages?: string[];

  location: CareRecipientLocation;

  careNeeds: (CareNeedCategory | string)[];
  customCareNeed?: string;

  mobility?: MobilityOption;
  customMobility?: string;

  communication?: CommunicationPreferences;

  preferences?: CarePreferences;

  emergencyContacts: EmergencyContact[];

  livingSituation?: string;
  importantNotes?: string;

  createdAt: string;
  updatedAt: string;

  // Backward compatibility properties for existing prototype screens
  name?: string;
  notes?: string;
  photoUrl?: string;
  address?: {
    city: string;
    state?: string;
    zip?: string;
  };
  emergencyContactIds?: string[];
  medicalConditionsSummary?: string;
}

/**
 * Backward compatibility alias for the initial prototype
 * TODO: Legacy backward compatibility alias, will be phased out in future iterations.
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
