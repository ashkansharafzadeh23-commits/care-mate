import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  UserPlus, 
  ArrowLeft, 
  Shield, 
  Clock, 
  AlertCircle, 
  History, 
  Heart,
  ChevronRight
} from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { careRecipientService } from '../services/careRecipientService';
import { familyCircleService } from '../services/familyCircleService';
import { familyAuthorizationService } from '../services/familyAuthorizationService';
import { CareRecipient, FamilyCircle, FamilyMember, FamilyActivity } from '../types';
import { Button } from '../components/Button';
import { CareRecipientSwitcher } from '../components/care/CareRecipientSwitcher';
import { FamilyMemberCard } from '../components/family/FamilyMemberCard';
import { InviteFamilyModal } from '../components/family/InviteFamilyModal';
import { MemberPermissionsModal } from '../components/family/MemberPermissionsModal';

export const FamilyCirclePage: React.FC = () => {
  const { recipientId } = useParams<{ recipientId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const { careRecipients, refreshFamilyMembers } = useAppContext();

  const [recipient, setRecipient] = useState<CareRecipient | null>(null);
  const [circle, setCircle] = useState<FamilyCircle | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [activities, setActivities] = useState<FamilyActivity[]>([]);
  const [activeTab, setActiveTab] = useState<'members' | 'activity'>('members');

  // Modals state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load recipient and circle data
  const loadData = () => {
    if (!recipientId || !user?.id) {
      setIsLoading(false);
      return;
    }

    // Lookup recipient scoped to user
    const foundRecipient = careRecipientService.getRecipient(recipientId, user.id);
    if (!foundRecipient) {
      // Check demo fixture fallback for development demo accounts
      const demoRecipient = careRecipientService.getRecipientForDevelopmentDemo(recipientId);
      if (demoRecipient && user.id === 'u_family_sample') {
        setRecipient(demoRecipient);
      } else {
        setRecipient(null);
      }
    } else {
      setRecipient(foundRecipient);
    }

    const foundCircle = familyCircleService.getCircleByRecipientId(recipientId);
    setCircle(foundCircle);

    const circleMembers = familyCircleService.listMembers(recipientId);
    setMembers(circleMembers);

    setActivities(familyCircleService.getActivities(recipientId));

    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [recipientId, user?.id]);

  const canViewCare = useMemo(() => {
    if (!recipientId || !user?.id) return false;
    return familyAuthorizationService.can(user.id, recipientId, 'view_care');
  }, [recipientId, user?.id]);

  const canInviteFamily = useMemo(() => {
    if (!recipientId || !user?.id) return false;
    return familyAuthorizationService.can(user.id, recipientId, 'invite_family');
  }, [recipientId, user?.id]);

  const canManagePermissions = useMemo(() => {
    if (!recipientId || !user?.id) return false;
    return familyAuthorizationService.can(user.id, recipientId, 'manage_permissions');
  }, [recipientId, user?.id]);

  // Separate active and pending members
  const activeMembers = members.filter(m => m.invitationStatus === 'accepted');
  const pendingInvitations = members.filter(m => m.invitationStatus === 'pending' || m.invitationStatus === 'invited');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Unauthorized or Missing Recipient State
  if (!recipient || !canViewCare) {
    return (
      <div className="min-h-screen bg-surface-50 p-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-text-900 mb-2">
          {t('family_circle.not_found_title', 'Family Circle Unavailable')}
        </h2>
        <p className="text-sm text-text-500 max-w-md mb-6">
          {t('family_circle.not_found_desc', 
            'You do not have permission to view this Family Circle, or the profile has been moved. Access is strictly scoped to authorized family members.'
          )}
        </p>
        <Link to="/home">
          <Button variant="primary">
            {t('common.return_home', 'Return to Home')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 pb-20">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-surface-200 sticky top-0 z-30 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/care/${recipient.id}`)}
              className="p-2 rounded-xl text-text-500 hover:text-text-800 hover:bg-surface-100 transition-colors"
              title={t('common.back', 'Back')}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-text-900 leading-tight">
                  {recipient.firstName}'s {t('family_circle.title', 'Family Circle')}
                </h1>
                <span className="hidden sm:inline-block text-[11px] bg-primary-100 text-primary-800 font-bold px-2 py-0.5 rounded-full">
                  {activeMembers.length} {t('family_circle.active_members', 'Active')}
                </span>
              </div>
              <p className="text-xs text-text-400">
                {t('family_circle.subtitle', 'Authorized family coordination team')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Recipient Switcher if user coordinates multiple people */}
            {careRecipients.length > 1 && (
              <div className="hidden sm:block">
                <CareRecipientSwitcher />
              </div>
            )}

            {canInviteFamily && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-1.5 shadow-xs"
              >
                <UserPlus className="w-4 h-4" />
                <span>{t('family_circle.invite_button', 'Invite Family')}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6 text-start">
        
        {/* Purpose Banner */}
        <div className="bg-gradient-to-r from-primary-900 to-primary-950 text-white rounded-3xl p-6 relative overflow-hidden shadow-sm">
          <div className="relative z-10 max-w-xl space-y-2">
            <div className="flex items-center gap-2 text-primary-200 text-xs font-bold uppercase tracking-wider">
              <Users className="w-4 h-4" />
              <span>{t('family_circle.banner_eyebrow', 'Care Coordination Circle')}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold">
              {t('family_circle.banner_title', 'Coordinate Care for {{name}}', { name: recipient.firstName })}
            </h2>
            <p className="text-xs sm:text-sm text-primary-100/90 leading-relaxed">
              {t('family_circle.banner_desc', 
                'Keep everyone on the same page. Family members can book visits, message caregivers, and view real-time visit reports with permissions tailored to their role.'
              )}
            </p>
          </div>
          <Heart className="absolute -right-6 -bottom-6 w-36 h-36 text-white/5 pointer-events-none" />
        </div>

        {/* Tab Selection */}
        <div className="flex items-center justify-between border-b border-surface-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('members')}
              className={`pb-3 text-sm font-bold transition-all relative ${
                activeTab === 'members'
                  ? 'text-primary-700'
                  : 'text-text-400 hover:text-text-600'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>{t('family_circle.members_tab', 'Members & Invites')}</span>
                <span className="text-xs bg-surface-200 text-text-700 px-1.5 py-0.2 rounded-full font-semibold">
                  {members.length}
                </span>
              </span>
              {activeTab === 'members' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`pb-3 text-sm font-bold transition-all relative ${
                activeTab === 'activity'
                  ? 'text-primary-700'
                  : 'text-text-400 hover:text-text-600'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <History className="w-4 h-4" />
                <span>{t('family_circle.activity_tab', 'Care Coordination Log')}</span>
              </span>
              {activeTab === 'activity' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* TAB 1: MEMBERS & INVITATIONS */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            
            {/* Respectful Solo Coordinator State (Item 32) */}
            {members.length === 1 && pendingInvitations.length === 0 && (
              <div className="p-5 bg-white rounded-3xl border border-surface-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-900">
                    {t('family_circle.solo_title', 'You are currently coordinating {{name}}\'s care solo', { name: recipient.firstName })}
                  </h3>
                  <p className="text-xs text-text-500 max-w-md mx-auto mt-1 leading-relaxed">
                    {t('family_circle.solo_desc', 
                      'Caregiving is easier when shared. Invite a sibling, spouse, or trusted neighbor to collaborate on appointments, receive visit updates, or serve as backup emergency contacts.'
                    )}
                  </p>
                </div>
                {canInviteFamily && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowInviteModal(true)}
                    className="mt-2"
                  >
                    <UserPlus className="w-4 h-4 mr-1.5" />
                    <span>{t('family_circle.invite_first_member', 'Invite Family Member')}</span>
                  </Button>
                )}
              </div>
            )}

            {/* Active Members Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-text-400 uppercase tracking-wider">
                  {t('family_circle.active_members_heading', 'Active Circle Members')} ({activeMembers.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeMembers.map(member => (
                  <FamilyMemberCard
                    key={member.id}
                    member={member}
                    currentUserId={user?.id}
                    canManagePermissions={canManagePermissions}
                    onEditPermissions={m => setEditingMember(m)}
                    onRefresh={() => {
                      loadData();
                      refreshFamilyMembers();
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Pending Invitations Section */}
            {pendingInvitations.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-bold text-text-700 uppercase tracking-wider">
                    {t('family_circle.pending_invitations_heading', 'Pending Invitations')} ({pendingInvitations.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pendingInvitations.map(member => (
                    <FamilyMemberCard
                      key={member.id}
                      member={member}
                      currentUserId={user?.id}
                      canManagePermissions={canManagePermissions}
                      onEditPermissions={m => setEditingMember(m)}
                      onRefresh={() => {
                        loadData();
                        refreshFamilyMembers();
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Multi-Recipient Privacy Assurance Card */}
            <div className="bg-surface-100/80 rounded-2xl p-4 border border-surface-200/80 flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" />
              <div className="text-xs text-text-600 space-y-1">
                <h4 className="font-bold text-text-800">
                  {t('family_circle.privacy_card_title', 'Multi-Recipient Privacy & Scope')}
                </h4>
                <p className="leading-relaxed text-text-500">
                  {t('family_circle.privacy_card_desc', 
                    'Every Care Recipient has their own independent Family Circle. Permissions and access granted here apply strictly to {{name}} and do not expose other loved ones.',
                    { name: recipient.firstName }
                  )}
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: AUDIT & COORDINATION LOG */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-text-900">
                  {t('family_circle.activity_log_title', 'Coordination & Audit Trail')}
                </h3>
                <p className="text-xs text-text-500">
                  {t('family_circle.activity_log_desc', 'Track invites, role assignments, and permission changes.')}
                </p>
              </div>
            </div>

            {activities.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-surface-200 text-xs text-text-400">
                {t('family_circle.no_activity', 'No logged coordination events yet.')}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-surface-200 divide-y divide-surface-100 overflow-hidden shadow-2xs">
                {activities.map(activity => {
                  const displayDescription = activity.description || (
                    activity.type === 'FAMILY_MEMBER_INVITED'
                      ? `Invited ${activity.metadata?.memberName || 'member'} as ${(activity.metadata?.role || '').replace(/_/g, ' ')}`
                      : activity.type === 'FAMILY_MEMBER_JOINED'
                      ? `${activity.metadata?.memberName || activity.actorName} joined the Family Circle`
                      : activity.type === 'FAMILY_MEMBER_REMOVED'
                      ? `${activity.metadata?.memberName || 'A member'} was removed`
                      : activity.type === 'MEMBER_ROLE_CHANGED'
                      ? `Role updated for ${activity.metadata?.memberName || 'member'}`
                      : activity.type === 'MEMBER_PERMISSIONS_CHANGED'
                      ? `Permissions adjusted for ${activity.metadata?.memberName || 'member'}`
                      : activity.type === 'FAMILY_CIRCLE_CREATED'
                      ? 'Family Circle initialized'
                      : String(activity.type || 'ACTIVITY').replace(/_/g, ' ')
                  );
                  const timeValue = activity.timestamp || activity.createdAt || new Date().toISOString();

                  return (
                    <div key={activity.id} className="p-4 flex items-start justify-between gap-4 text-xs">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-surface-100 text-text-600 flex items-center justify-center shrink-0 mt-0.5">
                          <History className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-text-900 leading-snug">
                            {displayDescription}
                          </p>
                          <p className="text-[11px] text-text-400 mt-0.5">
                            By <span className="font-medium text-text-600">{activity.actorName || 'Family Member'}</span>
                          </p>
                        </div>
                      </div>
                      <time className="text-[11px] text-text-400 shrink-0">
                        {new Date(timeValue).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </time>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Modals */}
      {showInviteModal && recipient && user && (
        <InviteFamilyModal
          careRecipientId={recipient.id}
          recipientName={recipient.firstName}
          inviterUserId={user.id}
          inviterName={user.name}
          onClose={() => setShowInviteModal(false)}
          onInviteSuccess={() => {
            loadData();
            refreshFamilyMembers();
          }}
        />
      )}

      {editingMember && recipient && user && (
        <MemberPermissionsModal
          member={editingMember}
          recipientName={recipient.firstName}
          actorUserId={user.id}
          actorName={user.name}
          onClose={() => setEditingMember(null)}
          onUpdated={() => {
            loadData();
            refreshFamilyMembers();
          }}
        />
      )}
    </div>
  );
};
