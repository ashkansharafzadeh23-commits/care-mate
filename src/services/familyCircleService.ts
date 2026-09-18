import { 
  FamilyCircle, 
  FamilyMember, 
  FamilyRole, 
  CarePermission, 
  InvitationStatus, 
  FamilyActivity, 
  FamilyActivityType,
  InvitationTokenPayload 
} from '../types';
import { ROLE_DEFAULT_PERMISSIONS } from './familyAuthorizationService';

/**
 * ============================================================================
 * CAREMATE FAMILY CIRCLE SERVICE
 * ============================================================================
 * 
 * ARCHITECTURAL BOUNDARY:
 * Family Circle is strictly scoped to a single Care Recipient.
 * Different Care Recipients have completely isolated Family Circles with
 * independent roles, permissions, and members.
 * 
 * PERSISTENCE NOTICE:
 * Development implementation utilizes client-side storage for prototyping.
 * Production architecture requires a durable, multi-tenant database backend
 * with role-based access control (RBAC) and immutable audit logging.
 */

const STORAGE_KEY_CIRCLES = 'caremate_family_circles_store';
const STORAGE_KEY_MEMBERS = 'caremate_family_members_store';
const STORAGE_KEY_ACTIVITIES = 'caremate_family_activities_store';
const STORAGE_KEY_INVITATIONS = 'caremate_invitation_tokens_store';

// Development demo fixtures
const MOCK_FIXTURE_CIRCLES: Record<string, FamilyCircle> = {
  p1: {
    id: 'fc_p1',
    careRecipientId: 'p1',
    createdByUserId: 'u_family_sample',
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-09-01T12:00:00Z'
  },
  p2: {
    id: 'fc_p2',
    careRecipientId: 'p2',
    createdByUserId: 'u_family_sample',
    createdAt: '2026-02-10T10:00:00Z',
    updatedAt: '2026-08-20T14:30:00Z'
  }
};

const MOCK_FIXTURE_MEMBERS: Record<string, FamilyMember[]> = {
  // Evelyn's Family Circle
  p1: [
    {
      id: 'mem_sarah_p1',
      familyCircleId: 'fc_p1',
      careRecipientId: 'p1',
      userId: 'u_family_sample',
      name: 'Sarah Vance',
      email: 'sarah.family@example.com',
      phone: '+1 (555) 234-5678',
      relationshipToRecipient: 'Daughter',
      role: 'care_coordinator',
      permissions: [...ROLE_DEFAULT_PERMISSIONS.care_coordinator],
      invitationStatus: 'accepted',
      createdAt: '2026-01-15T08:00:00Z',
      updatedAt: '2026-09-01T12:00:00Z',
      isEmergencyContact: true
    },
    {
      id: 'mem_david_p1',
      familyCircleId: 'fc_p1',
      careRecipientId: 'p1',
      userId: 'u_david_sample',
      name: 'David Vance',
      email: 'david.fam@example.com',
      phone: '+1 (555) 987-6543',
      relationshipToRecipient: 'Son',
      role: 'family_member',
      permissions: [...ROLE_DEFAULT_PERMISSIONS.family_member],
      invitationStatus: 'accepted',
      invitedByUserId: 'u_family_sample',
      invitedAt: '2026-01-16T09:00:00Z',
      acceptedAt: '2026-01-16T11:30:00Z',
      createdAt: '2026-01-16T09:00:00Z',
      updatedAt: '2026-01-16T11:30:00Z',
      isEmergencyContact: true
    }
  ],
  // Robert's Family Circle (Demonstrates isolated circle configuration)
  p2: [
    {
      id: 'mem_sarah_p2',
      familyCircleId: 'fc_p2',
      careRecipientId: 'p2',
      userId: 'u_family_sample',
      name: 'Sarah Vance',
      email: 'sarah.family@example.com',
      phone: '+1 (555) 234-5678',
      relationshipToRecipient: 'Daughter',
      role: 'care_coordinator',
      permissions: [...ROLE_DEFAULT_PERMISSIONS.care_coordinator],
      invitationStatus: 'accepted',
      createdAt: '2026-02-10T10:00:00Z',
      updatedAt: '2026-08-20T14:30:00Z',
      isEmergencyContact: true
    },
    {
      id: 'mem_michael_p2',
      familyCircleId: 'fc_p2',
      careRecipientId: 'p2',
      name: 'Michael Vance',
      email: 'michael.v@example.com',
      relationshipToRecipient: 'Brother',
      role: 'view_only',
      permissions: [...ROLE_DEFAULT_PERMISSIONS.view_only],
      invitationStatus: 'invited',
      invitedByUserId: 'u_family_sample',
      invitedAt: '2026-09-10T14:00:00Z',
      createdAt: '2026-09-10T14:00:00Z',
      updatedAt: '2026-09-10T14:00:00Z',
      isEmergencyContact: false
    }
  ]
};

const MOCK_FIXTURE_ACTIVITIES: Record<string, FamilyActivity[]> = {
  p1: [
    {
      id: 'act_1',
      careRecipientId: 'p1',
      actorUserId: 'u_family_sample',
      actorName: 'Sarah Vance',
      type: 'FAMILY_CIRCLE_CREATED',
      timestamp: '2026-01-15T08:00:00Z',
      metadata: { role: 'care_coordinator' }
    },
    {
      id: 'act_2',
      careRecipientId: 'p1',
      actorUserId: 'u_family_sample',
      actorName: 'Sarah Vance',
      type: 'FAMILY_MEMBER_INVITED',
      timestamp: '2026-01-16T09:00:00Z',
      metadata: { memberName: 'David Vance', role: 'family_member' }
    },
    {
      id: 'act_3',
      careRecipientId: 'p1',
      actorUserId: 'u_david_sample',
      actorName: 'David Vance',
      type: 'FAMILY_MEMBER_JOINED',
      timestamp: '2026-01-16T11:30:00Z',
      metadata: { role: 'family_member' }
    }
  ]
};

class FamilyCircleService {
  private circlesMap: Map<string, FamilyCircle> = new Map();
  private membersMap: Map<string, FamilyMember[]> = new Map();
  private activitiesMap: Map<string, FamilyActivity[]> = new Map();
  private invitationTokensMap: Map<string, InvitationTokenPayload> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const storedCircles = localStorage.getItem(STORAGE_KEY_CIRCLES);
      if (storedCircles) {
        const parsed = JSON.parse(storedCircles) as Record<string, FamilyCircle>;
        Object.entries(parsed).forEach(([recipientId, circle]) => {
          this.circlesMap.set(recipientId, circle);
        });
      }

      const storedMembers = localStorage.getItem(STORAGE_KEY_MEMBERS);
      if (storedMembers) {
        const parsed = JSON.parse(storedMembers) as Record<string, FamilyMember[]>;
        Object.entries(parsed).forEach(([recipientId, members]) => {
          this.membersMap.set(recipientId, members);
        });
      }

      const storedActivities = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
      if (storedActivities) {
        const parsed = JSON.parse(storedActivities) as Record<string, FamilyActivity[]>;
        Object.entries(parsed).forEach(([recipientId, acts]) => {
          this.activitiesMap.set(recipientId, acts);
        });
      }

      const storedInvitations = localStorage.getItem(STORAGE_KEY_INVITATIONS);
      if (storedInvitations) {
        const parsed = JSON.parse(storedInvitations) as Record<string, InvitationTokenPayload>;
        Object.entries(parsed).forEach(([token, payload]) => {
          this.invitationTokensMap.set(token, payload);
        });
      }
    } catch {
      // Storage unavailable or corrupted
    }

    // Seed development fixtures if not present
    if (!this.circlesMap.has('p1')) {
      Object.entries(MOCK_FIXTURE_CIRCLES).forEach(([recId, circle]) => {
        this.circlesMap.set(recId, circle);
      });
      Object.entries(MOCK_FIXTURE_MEMBERS).forEach(([recId, members]) => {
        this.membersMap.set(recId, members);
      });
      Object.entries(MOCK_FIXTURE_ACTIVITIES).forEach(([recId, acts]) => {
        this.activitiesMap.set(recId, acts);
      });
      // Add initial invitation token for demo Michael
      this.invitationTokensMap.set('demo_token_michael_p2', {
        token: 'demo_token_michael_p2',
        memberId: 'mem_michael_p2',
        careRecipientId: 'p2',
        recipientName: 'Robert Vance',
        inviterName: 'Sarah Vance',
        relationshipToRecipient: 'Brother',
        role: 'view_only',
        email: 'michael.v@example.com',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
      this.saveToStorage();
    }
  }

  private saveToStorage(): void {
    try {
      const circlesObj: Record<string, FamilyCircle> = {};
      this.circlesMap.forEach((v, k) => { circlesObj[k] = v; });
      localStorage.setItem(STORAGE_KEY_CIRCLES, JSON.stringify(circlesObj));

      const membersObj: Record<string, FamilyMember[]> = {};
      this.membersMap.forEach((v, k) => { membersObj[k] = v; });
      localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(membersObj));

      const actObj: Record<string, FamilyActivity[]> = {};
      this.activitiesMap.forEach((v, k) => { actObj[k] = v; });
      localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(actObj));

      const invObj: Record<string, InvitationTokenPayload> = {};
      this.invitationTokensMap.forEach((v, k) => { invObj[k] = v; });
      localStorage.setItem(STORAGE_KEY_INVITATIONS, JSON.stringify(invObj));
    } catch {
      // Storage quota or restriction
    }
  }

  /**
   * Log an activity event in the Care Recipient's Family timeline.
   */
  private logActivity(
    careRecipientId: string,
    actorUserId: string,
    type: FamilyActivityType,
    metadata?: Record<string, any>,
    actorName?: string
  ): void {
    const list = this.activitiesMap.get(careRecipientId) || [];
    const newActivity: FamilyActivity = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      careRecipientId,
      actorUserId,
      actorName: actorName || 'Family Member',
      type,
      timestamp: new Date().toISOString(),
      metadata
    };
    list.unshift(newActivity);
    this.activitiesMap.set(careRecipientId, list);
  }

  /**
   * Automatically create a new Family Circle when a Care Recipient is created.
   * Designates creator as initial Care Coordinator with broad coordination permissions.
   */
  public createCircle(
    careRecipientId: string, 
    creatorUserId: string, 
    creatorName: string = 'Care Coordinator',
    creatorEmail?: string
  ): FamilyCircle {
    const now = new Date().toISOString();
    const circleId = `fc_${careRecipientId}_${Date.now()}`;

    const circle: FamilyCircle = {
      id: circleId,
      careRecipientId,
      createdByUserId: creatorUserId,
      createdAt: now,
      updatedAt: now
    };

    const creatorMember: FamilyMember = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      familyCircleId: circleId,
      careRecipientId,
      userId: creatorUserId,
      name: creatorName,
      email: creatorEmail,
      relationshipToRecipient: 'Family Coordinator',
      role: 'care_coordinator',
      permissions: [...ROLE_DEFAULT_PERMISSIONS.care_coordinator],
      invitationStatus: 'accepted',
      createdAt: now,
      updatedAt: now
    };

    this.circlesMap.set(careRecipientId, circle);
    this.membersMap.set(careRecipientId, [creatorMember]);

    this.logActivity(
      careRecipientId,
      creatorUserId,
      'FAMILY_CIRCLE_CREATED',
      { role: 'care_coordinator' },
      creatorName
    );

    this.saveToStorage();
    return circle;
  }

  /**
   * Retrieve the Family Circle for a specific Care Recipient.
   */
  public getCircleForRecipient(careRecipientId: string): FamilyCircle | null {
    if (!careRecipientId) return null;
    return this.circlesMap.get(careRecipientId) || null;
  }

  public getCircleByRecipientId(careRecipientId: string): FamilyCircle | null {
    return this.getCircleForRecipient(careRecipientId);
  }

  /**
   * List all members (active and invited) of a Care Recipient's Family Circle.
   */
  public listMembers(careRecipientId: string): FamilyMember[] {
    if (!careRecipientId) return [];
    const members = this.membersMap.get(careRecipientId);
    if (!members) return [];
    // Ensure invitationToken is populated for invited members
    return members.map(m => {
      if (m.invitationStatus === 'invited' && !m.invitationToken) {
        for (const [token, payload] of this.invitationTokensMap.entries()) {
          if (payload.memberId === m.id) {
            return { ...m, invitationToken: token, recipientId: m.careRecipientId };
          }
        }
      }
      return { ...m, recipientId: m.careRecipientId };
    });
  }

  /**
   * Alias for listMembers
   */
  public getMembers(careRecipientId: string): FamilyMember[] {
    return this.listMembers(careRecipientId);
  }

  /**
   * Get single member by ID across circles.
   */
  public getMember(memberId: string): FamilyMember | null {
    for (const members of this.membersMap.values()) {
      const found = members.find(m => m.id === memberId);
      if (found) return found;
    }
    return null;
  }

  /**
   * Get member by recipient ID and user ID.
   */
  public getMemberByUserId(careRecipientId: string, userId: string): FamilyMember | null {
    const list = this.listMembers(careRecipientId);
    return list.find(m => m.userId === userId) || null;
  }

  /**
   * Invite a new family member to a Care Recipient's circle.
   */
  public inviteMember(
    careRecipientId: string,
    inviterUserId: string,
    inviterName: string,
    recipientName: string,
    data: {
      name: string;
      relationshipToRecipient: string;
      email?: string;
      phone?: string;
      role: FamilyRole;
      customPermissions?: CarePermission[];
    }
  ): { member: FamilyMember; tokenPayload: InvitationTokenPayload } {
    const circle = this.getCircleForRecipient(careRecipientId);
    if (!circle) {
      throw new Error('Family circle not found for this care recipient.');
    }

    const currentMembers = this.listMembers(careRecipientId);

    // Validation: prevent duplicate pending/active member with same contact
    const cleanEmail = data.email?.trim().toLowerCase();
    const cleanPhone = data.phone?.trim();

    if (cleanEmail) {
      const existingEmail = currentMembers.find(
        m => m.email?.toLowerCase() === cleanEmail && (m.invitationStatus === 'accepted' || m.invitationStatus === 'invited')
      );
      if (existingEmail) {
        throw new Error('A family member with this email is already part of or invited to this Family Circle.');
      }
    }

    if (cleanPhone) {
      const existingPhone = currentMembers.find(
        m => m.phone === cleanPhone && (m.invitationStatus === 'accepted' || m.invitationStatus === 'invited')
      );
      if (existingPhone) {
        throw new Error('A family member with this phone number is already part of or invited to this Family Circle.');
      }
    }

    const now = new Date().toISOString();
    const memberId = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const effectivePermissions = data.customPermissions && data.customPermissions.length > 0
      ? data.customPermissions
      : [...(ROLE_DEFAULT_PERMISSIONS[data.role] || ROLE_DEFAULT_PERMISSIONS.family_member)];

    // Generate development token
    const token = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    const newMember: FamilyMember = {
      id: memberId,
      familyCircleId: circle.id,
      careRecipientId,
      recipientId: careRecipientId,
      name: data.name.trim(),
      email: cleanEmail || undefined,
      phone: cleanPhone || undefined,
      relationshipToRecipient: data.relationshipToRecipient.trim(),
      role: data.role,
      permissions: effectivePermissions,
      invitationStatus: 'invited',
      invitationToken: token,
      invitedByUserId: inviterUserId,
      invitedAt: now,
      createdAt: now,
      updatedAt: now
    };

    currentMembers.push(newMember);
    this.membersMap.set(careRecipientId, currentMembers);

    const tokenPayload: InvitationTokenPayload = {
      token,
      memberId,
      careRecipientId,
      recipientName,
      inviterName,
      relationshipToRecipient: data.relationshipToRecipient.trim(),
      role: data.role,
      email: cleanEmail,
      phone: cleanPhone,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };

    this.invitationTokensMap.set(token, tokenPayload);

    this.logActivity(
      careRecipientId,
      inviterUserId,
      'FAMILY_MEMBER_INVITED',
      { memberName: data.name, role: data.role },
      inviterName
    );

    this.saveToStorage();
    return { member: newMember, tokenPayload };
  }

  /**
   * Retrieve invitation details by token or member ID.
   */
  public getInvitation(tokenOrMemberId: string): InvitationTokenPayload | null {
    // Check direct token match
    if (this.invitationTokensMap.has(tokenOrMemberId)) {
      return this.invitationTokensMap.get(tokenOrMemberId) || null;
    }

    // Search by member ID
    for (const payload of this.invitationTokensMap.values()) {
      if (payload.memberId === tokenOrMemberId) {
        return payload;
      }
    }
    return null;
  }

  /**
   * Accept an invitation and bind member record to authenticated userId.
   */
  public acceptInvitation(tokenOrMemberId: string, userId: string, userName?: string): FamilyMember {
    const invitation = this.getInvitation(tokenOrMemberId);
    if (!invitation) {
      throw new Error('Invitation token could not be found or has expired.');
    }

    const members = this.listMembers(invitation.careRecipientId);
    const index = members.findIndex(m => m.id === invitation.memberId);
    if (index === -1) {
      throw new Error('Family member record associated with invitation was not found.');
    }

    const currentMember = members[index];
    if (currentMember.invitationStatus === 'accepted') {
      return currentMember;
    }
    if (currentMember.invitationStatus === 'revoked') {
      throw new Error('This invitation has been revoked by a Care Coordinator.');
    }

    const now = new Date().toISOString();
    const updatedMember: FamilyMember = {
      ...currentMember,
      userId,
      name: userName || currentMember.name,
      invitationStatus: 'accepted',
      acceptedAt: now,
      updatedAt: now
    };

    members[index] = updatedMember;
    this.membersMap.set(invitation.careRecipientId, members);

    this.logActivity(
      invitation.careRecipientId,
      userId,
      'FAMILY_MEMBER_JOINED',
      { memberName: updatedMember.name, role: updatedMember.role },
      updatedMember.name
    );

    this.saveToStorage();
    return updatedMember;
  }

  /**
   * Decline an invitation.
   */
  public declineInvitation(tokenOrMemberId: string): boolean {
    const invitation = this.getInvitation(tokenOrMemberId);
    if (!invitation) return false;

    const members = this.listMembers(invitation.careRecipientId);
    const index = members.findIndex(m => m.id === invitation.memberId);
    if (index === -1) return false;

    members[index].invitationStatus = 'declined';
    members[index].updatedAt = new Date().toISOString();

    this.membersMap.set(invitation.careRecipientId, members);
    this.saveToStorage();
    return true;
  }

  /**
   * Revoke a pending invitation.
   */
  public revokeInvitation(memberId: string, actorUserId: string, actorName?: string): boolean {
    const member = this.getMember(memberId);
    if (!member) return false;

    const members = this.listMembers(member.careRecipientId);
    const index = members.findIndex(m => m.id === memberId);
    if (index === -1) return false;

    members[index].invitationStatus = 'revoked';
    members[index].updatedAt = new Date().toISOString();

    this.membersMap.set(member.careRecipientId, members);
    this.logActivity(
      member.careRecipientId,
      actorUserId,
      'FAMILY_MEMBER_REMOVED',
      { memberName: member.name, note: 'Invitation revoked' },
      actorName
    );

    this.saveToStorage();
    return true;
  }

  /**
   * Recreate / Resend an invitation token (Development Safe wording).
   */
  public recreateInvitation(
    memberId: string, 
    actorUserId: string,
    recipientName: string,
    actorName?: string
  ): { member: FamilyMember; tokenPayload: InvitationTokenPayload } {
    const member = this.getMember(memberId);
    if (!member) {
      throw new Error('Member not found.');
    }

    const token = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const tokenPayload: InvitationTokenPayload = {
      token,
      memberId,
      careRecipientId: member.careRecipientId,
      recipientName,
      inviterName: actorName || 'Care Coordinator',
      relationshipToRecipient: member.relationshipToRecipient,
      role: member.role,
      email: member.email,
      phone: member.phone,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    member.invitationStatus = 'invited';
    member.invitedAt = new Date().toISOString();
    member.updatedAt = new Date().toISOString();

    this.invitationTokensMap.set(token, tokenPayload);
    this.saveToStorage();

    return { member, tokenPayload };
  }

  /**
   * Update role for a family member.
   * PROTECTS LAST CARE COORDINATOR:
   * Rejects downgrade if target is the only remaining accepted Care Coordinator.
   */
  public updateMemberRole(
    memberId: string, 
    newRole: FamilyRole, 
    actorUserId: string,
    actorName?: string
  ): FamilyMember {
    const member = this.getMember(memberId);
    if (!member) throw new Error('Member not found.');

    const members = this.listMembers(member.careRecipientId);
    const index = members.findIndex(m => m.id === memberId);
    if (index === -1) throw new Error('Member not found.');

    const isCurrentCoordinator = member.role === 'care_coordinator' || member.role === 'primary_coordinator';
    const willBeCoordinator = newRole === 'care_coordinator' || newRole === 'primary_coordinator';

    // Protect last coordinator from downgrade
    if (isCurrentCoordinator && !willBeCoordinator) {
      const activeCoordinators = members.filter(
        m => m.id !== memberId &&
             (m.role === 'care_coordinator' || m.role === 'primary_coordinator') &&
             m.invitationStatus === 'accepted'
      );
      if (activeCoordinators.length === 0) {
        throw new Error('Assign another Care Coordinator before changing this role. Every Care Recipient must have at least one active Care Coordinator.');
      }
    }

    const oldRole = member.role;
    members[index].role = newRole;
    members[index].permissions = [...ROLE_DEFAULT_PERMISSIONS[newRole]];
    members[index].updatedAt = new Date().toISOString();

    this.membersMap.set(member.careRecipientId, members);

    this.logActivity(
      member.careRecipientId,
      actorUserId,
      'MEMBER_ROLE_CHANGED',
      { memberName: member.name, oldRole, newRole },
      actorName
    );

    this.saveToStorage();
    return members[index];
  }

  /**
   * Update granular permissions for a family member.
   */
  public updateMemberPermissions(
    memberId: string,
    newPermissions: CarePermission[],
    actorUserId: string,
    actorName?: string
  ): FamilyMember {
    const member = this.getMember(memberId);
    if (!member) throw new Error('Member not found.');

    const members = this.listMembers(member.careRecipientId);
    const index = members.findIndex(m => m.id === memberId);
    if (index === -1) throw new Error('Member not found.');

    members[index].permissions = [...newPermissions];
    members[index].updatedAt = new Date().toISOString();

    this.membersMap.set(member.careRecipientId, members);

    this.logActivity(
      member.careRecipientId,
      actorUserId,
      'MEMBER_PERMISSIONS_CHANGED',
      { memberName: member.name, count: newPermissions.length },
      actorName
    );

    this.saveToStorage();
    return members[index];
  }

  /**
   * Remove a member from the Family Circle.
   * PROTECTS LAST CARE COORDINATOR:
   * Rejects removal if target is the only remaining accepted Care Coordinator.
   */
  public removeMember(memberId: string, actorUserId: string, actorName?: string): boolean {
    const member = this.getMember(memberId);
    if (!member) return false;

    const members = this.listMembers(member.careRecipientId);
    const isCurrentCoordinator = (member.role === 'care_coordinator' || member.role === 'primary_coordinator') && member.invitationStatus === 'accepted';

    if (isCurrentCoordinator) {
      const remainingCoordinators = members.filter(
        m => m.id !== memberId &&
             (m.role === 'care_coordinator' || m.role === 'primary_coordinator') &&
             m.invitationStatus === 'accepted'
      );
      if (remainingCoordinators.length === 0) {
        throw new Error('Assign another Care Coordinator before removing this member. Every Care Recipient must have at least one active Care Coordinator.');
      }
    }

    const filtered = members.filter(m => m.id !== memberId);
    this.membersMap.set(member.careRecipientId, filtered);

    this.logActivity(
      member.careRecipientId,
      actorUserId,
      'FAMILY_MEMBER_REMOVED',
      { memberName: member.name, role: member.role },
      actorName
    );

    this.saveToStorage();
    return true;
  }

  /**
   * Retrieve recent activities for a Care Recipient's circle.
   */
  public getActivities(careRecipientId: string): FamilyActivity[] {
    if (!careRecipientId) return [];
    const list = this.activitiesMap.get(careRecipientId);
    return list ? [...list] : [];
  }

  public listActivities(careRecipientId: string): FamilyActivity[] {
    return this.getActivities(careRecipientId);
  }

  public resendInvitation(tokenOrMemberId: string, actorUserId: string, actorName?: string) {
    const inv = this.getInvitation(tokenOrMemberId);
    const memberId = inv ? inv.memberId : tokenOrMemberId;
    return this.recreateInvitation(memberId, actorUserId, inv?.recipientName || 'Loved One', actorName);
  }

  /**
   * Find all Care Recipient IDs where a user is an accepted Family Member.
   */
  public getRecipientIdsForUser(userId: string): string[] {
    if (!userId) return [];
    const recipientIds: string[] = [];
    this.membersMap.forEach((members, recipientId) => {
      if (members.some(m => m.userId === userId && m.invitationStatus === 'accepted')) {
        recipientIds.push(recipientId);
      }
    });
    return recipientIds;
  }
}

export const familyCircleService = new FamilyCircleService();
