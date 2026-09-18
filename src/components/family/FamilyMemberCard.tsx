import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Shield, 
  Mail, 
  Phone, 
  MoreVertical, 
  Sliders, 
  Trash2, 
  Clock, 
  RotateCcw, 
  CheckCircle2, 
  XCircle,
  Copy,
  Check
} from 'lucide-react';
import { FamilyMember } from '../../types';
import { familyCircleService } from '../../services/familyCircleService';

interface FamilyMemberCardProps {
  member: FamilyMember;
  currentUserId?: string;
  canManagePermissions: boolean;
  onEditPermissions: (member: FamilyMember) => void;
  onRefresh: () => void;
}

export const FamilyMemberCard: React.FC<FamilyMemberCardProps> = ({
  member,
  currentUserId,
  canManagePermissions,
  onEditPermissions,
  onRefresh
}) => {
  const { t } = useTranslation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isCurrentUser = currentUserId && member.userId === currentUserId;
  const isCoordinator = member.role === 'care_coordinator' || member.role === 'primary_coordinator' || member.role === 'CARE_COORDINATOR';
  const isPending = member.invitationStatus === 'pending' || member.invitationStatus === 'invited';
  const isRevoked = member.invitationStatus === 'revoked';
  const isDeclined = member.invitationStatus === 'declined';
  const activeToken = member.invitationToken || familyCircleService.getInvitation(member.id)?.token;

  const getRoleBadgeColor = () => {
    switch (member.role) {
      case 'care_coordinator':
      case 'primary_coordinator':
      case 'CARE_COORDINATOR':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'family_member':
      case 'care_collaborator':
      case 'FAMILY_MEMBER':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'view_only':
      case 'viewer':
      case 'VIEW_ONLY':
      default:
        return 'bg-surface-100 text-text-600 border-surface-200';
    }
  };

  const getStatusBadge = () => {
    if (isPending) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
          <Clock className="w-3 h-3" />
          <span>{t('family_circle.status_pending', 'Invite Pending')}</span>
        </span>
      );
    }
    if (isRevoked) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
          <XCircle className="w-3 h-3" />
          <span>{t('family_circle.status_revoked', 'Revoked')}</span>
        </span>
      );
    }
    if (isDeclined) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-400 bg-surface-100 border border-surface-200 px-2 py-0.5 rounded-full">
          <XCircle className="w-3 h-3" />
          <span>{t('family_circle.status_declined', 'Declined')}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3" />
        <span>{t('family_circle.status_active', 'Active')}</span>
      </span>
    );
  };

  const handleCopyInviteLink = () => {
    const token = activeToken;
    if (!token) return;
    const url = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleRevoke = () => {
    try {
      familyCircleService.revokeInvitation(member.id, currentUserId || 'system');
      onRefresh();
    } catch {
      // Ignore
    }
    setShowDropdown(false);
  };

  const handleResend = () => {
    try {
      familyCircleService.resendInvitation(member.id, currentUserId || 'system');
      onRefresh();
    } catch {
      // Ignore
    }
    setShowDropdown(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-4 relative shadow-2xs hover:shadow-xs transition-shadow">
      <div className="flex items-start justify-between gap-3">
        
        {/* Left: Avatar & Identity */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-11 h-11 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-bold text-base shrink-0">
            {member.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-text-900 truncate">
                {member.name}
              </h4>
              {isCurrentUser && (
                <span className="text-[10px] font-bold bg-primary-600 text-white px-2 py-0.5 rounded-full">
                  {t('family_circle.you_badge', 'You')}
                </span>
              )}
            </div>
            
            <p className="text-xs text-text-500 mt-0.5">
              {member.relationshipToRecipient}
            </p>

            {/* Badges */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadgeColor()}`}>
                {t(`family_roles.${member.role}`, member.role)}
              </span>
              {getStatusBadge()}
            </div>
          </div>
        </div>

        {/* Right: Actions Menu */}
        {canManagePermissions && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-1.5 rounded-xl text-text-400 hover:text-text-700 hover:bg-surface-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-20" 
                  onClick={() => setShowDropdown(false)} 
                />
                <div className="absolute right-0 top-8 z-30 w-48 bg-white rounded-2xl border border-surface-200 shadow-lg py-1.5 text-xs text-start">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      onEditPermissions(member);
                    }}
                    className="w-full px-3 py-2 text-text-700 hover:bg-surface-50 flex items-center gap-2 font-semibold"
                  >
                    <Sliders className="w-3.5 h-3.5 text-primary-600" />
                    <span>{t('family_circle.edit_permissions', 'Edit Permissions')}</span>
                  </button>

                  {isPending && (
                    <>
                      {activeToken && (
                        <button
                          onClick={handleCopyInviteLink}
                          className="w-full px-3 py-2 text-text-700 hover:bg-surface-50 flex items-center gap-2 font-semibold"
                        >
                          {copiedLink ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-bold">{t('common.copied', 'Copied')}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-text-500" />
                              <span>{t('family_circle.copy_invite_link', 'Copy Invite Link')}</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        onClick={handleResend}
                        className="w-full px-3 py-2 text-text-700 hover:bg-surface-50 flex items-center gap-2 font-semibold"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                        <span>{t('family_circle.resend_invite', 'Resend Invite')}</span>
                      </button>

                      <button
                        onClick={handleRevoke}
                        className="w-full px-3 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold"
                      >
                        <XCircle className="w-3.5 h-3.5 text-red-500" />
                        <span>{t('family_circle.revoke_invite', 'Revoke Invite')}</span>
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Contact Details */}
      {(member.email || member.phone) && (
        <div className="mt-3 pt-3 border-t border-surface-100 flex items-center gap-4 text-xs text-text-500 flex-wrap">
          {member.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-text-400" />
              <span>{member.email}</span>
            </div>
          )}
          {member.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-text-400" />
              <span>{member.phone}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
