import { FamilyRole, CarePermission, FamilyMember } from '../types';
import { familyCircleService } from './familyCircleService';

/**
 * ============================================================================
 * CAREMATE FAMILY AUTHORIZATION SERVICE
 * ============================================================================
 * 
 * SECURITY ARCHITECTURAL PRINCIPLE:
 * Frontend permission evaluation provides user experience guidance and adaptive UI ONLY.
 * 
 * In production deployment:
 * Every sensitive API endpoint and mutating cloud function MUST independently authenticate
 * the session token, resolve the user's Care Recipient access via the Family Circle graph,
 * and verify explicit granular permissions.
 * 
 * NEVER rely on client-side state or hidden DOM buttons for security isolation.
 */

// Canonical default permission presets per Family Role
const coordinatorPermissions: CarePermission[] = [
  'view_care',
  'edit_care_profile',
  'create_care_request',
  'book_care',
  'manage_bookings',
  'message_providers',
  'view_visit_reports',
  'view_care_timeline',
  'manage_care_profile',
  'view_sensitive_information',
  'manage_payments',
  'invite_family',
  'manage_permissions',
  'report_incident'
];

const memberPermissions: CarePermission[] = [
  'view_care',
  'create_care_request',
  'book_care',
  'message_providers',
  'view_visit_reports',
  'view_care_timeline',
  'report_incident'
];

const viewerPermissions: CarePermission[] = [
  'view_care',
  'view_visit_reports',
  'view_care_timeline'
];

const proxyPermissions: CarePermission[] = [
  'view_care',
  'edit_care_profile',
  'view_sensitive_information',
  'view_visit_reports',
  'view_care_timeline',
  'report_incident'
];

export const ROLE_DEFAULT_PERMISSIONS: Record<FamilyRole, CarePermission[]> = {
  care_coordinator: coordinatorPermissions,
  primary_coordinator: coordinatorPermissions,
  CARE_COORDINATOR: coordinatorPermissions,
  family_member: memberPermissions,
  care_collaborator: memberPermissions,
  FAMILY_MEMBER: memberPermissions,
  trusted_helper: memberPermissions,
  TRUSTED_HELPER: memberPermissions,
  healthcare_proxy: proxyPermissions,
  HEALTHCARE_PROXY: proxyPermissions,
  view_only: viewerPermissions,
  viewer: viewerPermissions,
  family_viewer: viewerPermissions,
  VIEW_ONLY: viewerPermissions
};

export interface PermissionGroup {
  id: string;
  category: string;
  permissions: {
    key: CarePermission;
    labelKey: string;
    descKey: string;
  }[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: 'care',
    category: 'CARE',
    permissions: [
      { key: 'view_care', labelKey: 'family_permissions.view_care', descKey: 'family_permissions.view_care_desc' },
      { key: 'edit_care_profile', labelKey: 'family_permissions.edit_care_profile', descKey: 'family_permissions.edit_care_profile_desc' },
      { key: 'create_care_request', labelKey: 'family_permissions.create_care_request', descKey: 'family_permissions.create_care_request_desc' },
      { key: 'manage_care_profile', labelKey: 'family_permissions.manage_care_profile', descKey: 'family_permissions.manage_care_profile_desc' }
    ]
  },
  {
    id: 'bookings',
    category: 'BOOKINGS',
    permissions: [
      { key: 'book_care', labelKey: 'family_permissions.book_care', descKey: 'family_permissions.book_care_desc' },
      { key: 'manage_bookings', labelKey: 'family_permissions.manage_bookings', descKey: 'family_permissions.manage_bookings_desc' }
    ]
  },
  {
    id: 'communication',
    category: 'COMMUNICATION',
    permissions: [
      { key: 'message_providers', labelKey: 'family_permissions.message_providers', descKey: 'family_permissions.message_providers_desc' }
    ]
  },
  {
    id: 'reports',
    category: 'REPORTS',
    permissions: [
      { key: 'view_visit_reports', labelKey: 'family_permissions.view_visit_reports', descKey: 'family_permissions.view_visit_reports_desc' },
      { key: 'view_care_timeline', labelKey: 'family_permissions.view_care_timeline', descKey: 'family_permissions.view_care_timeline_desc' }
    ]
  },
  {
    id: 'family',
    category: 'FAMILY',
    permissions: [
      { key: 'invite_family', labelKey: 'family_permissions.invite_family', descKey: 'family_permissions.invite_family_desc' },
      { key: 'manage_permissions', labelKey: 'family_permissions.manage_permissions', descKey: 'family_permissions.manage_permissions_desc' }
    ]
  },
  {
    id: 'financial',
    category: 'FINANCIAL',
    permissions: [
      { key: 'manage_payments', labelKey: 'family_permissions.manage_payments', descKey: 'family_permissions.manage_payments_desc' }
    ]
  },
  {
    id: 'safety',
    category: 'SAFETY',
    permissions: [
      { key: 'report_incident', labelKey: 'family_permissions.report_incident', descKey: 'family_permissions.report_incident_desc' },
      { key: 'view_sensitive_information', labelKey: 'family_permissions.view_sensitive_information', descKey: 'family_permissions.view_sensitive_information_desc' }
    ]
  }
];

class FamilyAuthorizationService {
  /**
   * Retrieve active membership of a user in a Care Recipient's Family Circle.
   */
  public getMembership(userId: string | undefined, careRecipientId: string): FamilyMember | null {
    if (!userId || !careRecipientId) return null;
    return familyCircleService.getMemberByUserId(careRecipientId, userId);
  }

  /**
   * Get all explicit permissions granted to a user for a specific Care Recipient.
   */
  public getPermissions(userId: string | undefined, careRecipientId: string): CarePermission[] {
    const membership = this.getMembership(userId, careRecipientId);
    if (!membership || membership.invitationStatus !== 'accepted') {
      return [];
    }
    return membership.permissions || ROLE_DEFAULT_PERMISSIONS[membership.role] || [];
  }

  /**
   * Central authorization check: Does user have permission for careRecipientId?
   */
  public can(userId: string | undefined, careRecipientId: string, permission: CarePermission): boolean {
    if (!userId || !careRecipientId) return false;
    const permissions = this.getPermissions(userId, careRecipientId);
    return permissions.includes(permission);
  }

  public hasPermission(userId: string | undefined, careRecipientId: string, permission: CarePermission): boolean {
    return this.can(userId, careRecipientId, permission);
  }

  /**
   * Check if user is an active Care Coordinator for the recipient.
   */
  public isCoordinator(userId: string | undefined, careRecipientId: string): boolean {
    const membership = this.getMembership(userId, careRecipientId);
    if (!membership || membership.invitationStatus !== 'accepted') return false;
    return membership.role === 'care_coordinator' || membership.role === 'primary_coordinator';
  }

  /**
   * Check if user can invite family members to this recipient's circle.
   */
  public canInviteFamily(userId: string | undefined, careRecipientId: string): boolean {
    return this.can(userId, careRecipientId, 'invite_family');
  }

  /**
   * Check if user can manage member permissions or change roles.
   */
  public canManagePermissions(userId: string | undefined, careRecipientId: string): boolean {
    return this.can(userId, careRecipientId, 'manage_permissions');
  }

  /**
   * Check if user can edit the care recipient profile.
   */
  public canEditProfile(userId: string | undefined, careRecipientId: string): boolean {
    return this.can(userId, careRecipientId, 'edit_care_profile') || this.can(userId, careRecipientId, 'manage_care_profile');
  }

  /**
   * Check if user can remove or archive the care recipient profile.
   * Requires strict MANAGE_CARE_PROFILE permission.
   */
  public canRemoveProfile(userId: string | undefined, careRecipientId: string): boolean {
    return this.can(userId, careRecipientId, 'manage_care_profile');
  }

  /**
   * Check if user can view sensitive data (address, emergency contact numbers, private notes).
   */
  public canViewSensitiveInformation(userId: string | undefined, careRecipientId: string): boolean {
    return this.can(userId, careRecipientId, 'view_sensitive_information');
  }
}

export const familyAuthorizationService = new FamilyAuthorizationService();
