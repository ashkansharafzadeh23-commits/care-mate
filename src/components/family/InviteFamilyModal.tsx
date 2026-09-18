import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../context/AuthContext';
import { 
  X, 
  UserPlus, 
  Shield, 
  Mail, 
  Phone, 
  Check, 
  Copy, 
  Info, 
  ExternalLink,
  Sliders
} from 'lucide-react';
import { Button } from '../Button';
import { FamilyRole, CarePermission, InvitationTokenPayload } from '../../types';
import { familyCircleService } from '../../services/familyCircleService';
import { ROLE_DEFAULT_PERMISSIONS, PERMISSION_GROUPS } from '../../services/familyAuthorizationService';

export interface InviteFamilyModalProps {
  careRecipientId: string;
  recipientName?: string;
  careRecipientName?: string;
  inviterUserId?: string;
  inviterName?: string;
  isOpen?: boolean;
  onClose: () => void;
  onInviteSuccess?: () => void;
  onInvited?: () => void;
}

export const InviteFamilyModal: React.FC<InviteFamilyModalProps> = ({
  careRecipientId,
  recipientName,
  careRecipientName,
  inviterUserId,
  inviterName,
  onClose,
  onInviteSuccess,
  onInvited
}) => {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const effectiveRecipientName = recipientName || careRecipientName || 'Loved One';
  const effectiveInviterUserId = inviterUserId || user?.id || 'u_coord';
  const effectiveInviterName = inviterName || user?.name || 'Care Coordinator';
  const notifySuccess = () => {
    if (onInviteSuccess) onInviteSuccess();
    if (onInvited) onInvited();
  };

  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Daughter');
  const [customRelationship, setCustomRelationship] = useState('');
  const [role, setRole] = useState<FamilyRole>('family_member');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showAdvancedPermissions, setShowAdvancedPermissions] = useState(false);
  const [customPermissions, setCustomPermissions] = useState<CarePermission[]>([
    ...ROLE_DEFAULT_PERMISSIONS.family_member
  ]);
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdInvitation, setCreatedInvitation] = useState<InvitationTokenPayload | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Update permissions preset when role changes
  const handleRoleChange = (newRole: FamilyRole) => {
    setRole(newRole);
    setCustomPermissions([...(ROLE_DEFAULT_PERMISSIONS[newRole] || ROLE_DEFAULT_PERMISSIONS.family_member)]);
  };

  const togglePermission = (perm: CarePermission) => {
    setCustomPermissions(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(t('family_circle.errors.name_required', 'Please provide the family member\'s name.'));
      return;
    }

    if (!email.trim() && !phone.trim()) {
      setError(t('family_circle.errors.contact_required', 'Please provide either an email or phone number for the invitation.'));
      return;
    }

    const effectiveRelationship = relationship === 'Other' ? customRelationship.trim() : relationship;
    if (relationship === 'Other' && !effectiveRelationship) {
      setError(t('family_circle.errors.relationship_required', 'Please specify the relationship to the care recipient.'));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = familyCircleService.inviteMember(
        careRecipientId,
        effectiveInviterUserId,
        effectiveInviterName,
        effectiveRecipientName,
        {
          name: name.trim(),
          relationshipToRecipient: effectiveRelationship,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          role,
          customPermissions: showAdvancedPermissions ? customPermissions : undefined
        }
      );

      setCreatedInvitation(result.tokenPayload);
      notifySuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation. Please check your information.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const invitationUrl = createdInvitation 
    ? `${window.location.origin}/invite/${createdInvitation.token}` 
    : '';

  const handleCopyLink = () => {
    if (!invitationUrl) return;
    navigator.clipboard.writeText(invitationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 text-start shadow-xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-primary-100 text-primary-800 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-900">
                {t('family_circle.invite_title', 'Invite to Family Circle')}
              </h3>
              <p className="text-xs text-text-500">
                {t('family_circle.invite_subtitle', 'Coordinate care for {{name}}', { name: effectiveRecipientName })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-400 hover:text-text-700 rounded-xl hover:bg-surface-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success State (Invitation Created) */}
        {createdInvitation ? (
          <div className="space-y-4 py-2">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <Check className="w-4 h-4" />
                <span>{t('family_circle.invitation_ready', 'Invitation Ready')}</span>
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed">
                {t('family_circle.invitation_ready_desc', 
                  'An invitation has been generated for {{name}} as {{role}}. In development mode, you can share the link below directly.',
                  { name: createdInvitation.recipientName, role: t(`family_roles.${createdInvitation.role}`, createdInvitation.role) }
                )}
              </p>
            </div>

            {/* Development Mode Notice (Item 20 & 28) */}
            <div className="p-3.5 bg-surface-50 border border-surface-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-text-700">
                <span>{t('family_circle.invite_link', 'Invitation Link')}</span>
                {copiedLink && (
                  <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                    <Check className="w-3 h-3" /> {t('common.copied', 'Copied')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={invitationUrl}
                  className="flex-1 bg-white border border-surface-200 rounded-xl px-3 py-2 text-xs text-text-600 font-mono truncate select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedLink ? t('common.copied', 'Copied') : t('common.copy', 'Copy')}</span>
                </button>
              </div>
              <p className="text-[11px] text-text-400 italic">
                {t('family_circle.dev_delivery_notice', 'Development Note: Email/SMS notifications will be connected through the production notification gateway.')}
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button onClick={onClose} variant="primary">
                {t('common.done', 'Done')}
              </Button>
            </div>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block font-semibold text-text-700 mb-1">
                {t('family_circle.member_name', 'Full Name')} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., David Vance"
                className="w-full h-10 px-3 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>

            {/* Relationship */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-text-700 mb-1">
                  {t('family_circle.relationship_to_recipient', 'Relationship')} *
                </label>
                <select
                  value={relationship}
                  onChange={e => setRelationship(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-surface-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="Daughter">Daughter</option>
                  <option value="Son">Son</option>
                  <option value="Spouse">Spouse / Partner</option>
                  <option value="Sister">Sister</option>
                  <option value="Brother">Brother</option>
                  <option value="Grandchild">Grandchild</option>
                  <option value="Trusted Friend">Trusted Friend</option>
                  <option value="Neighbor">Neighbor</option>
                  <option value="Care Coordinator">Care Coordinator</option>
                  <option value="Other">Other...</option>
                </select>
              </div>

              {relationship === 'Other' ? (
                <div>
                  <label className="block font-semibold text-text-700 mb-1">
                    {t('family_circle.specify_relationship', 'Specify')} *
                  </label>
                  <input
                    type="text"
                    value={customRelationship}
                    onChange={e => setCustomRelationship(e.target.value)}
                    placeholder="e.g., Niece"
                    className="w-full h-10 px-3 rounded-xl border border-surface-200 text-sm"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-text-700 mb-1">
                    {t('family_circle.contact_type', 'Contact Info')}
                  </label>
                  <span className="text-[11px] text-text-500 block pt-2.5">
                    {t('family_circle.contact_helper', 'Provide email or phone below')}
                  </span>
                </div>
              )}
            </div>

            {/* Contact Channels */}
            <div className="space-y-2.5">
              <div>
                <label className="block font-semibold text-text-700 mb-1">
                  {t('family_circle.email_address', 'Email Address')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-text-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="david@example.com"
                    className="w-full h-10 ps-9 pe-3 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-text-700 mb-1">
                  {t('family_circle.phone_number', 'Phone Number')}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-text-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full h-10 ps-9 pe-3 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block font-semibold text-text-700 mb-1.5">
                {t('family_circle.assigned_role', 'Assigned Role')} *
              </label>
              <div className="space-y-2">
                {[
                  {
                    id: 'care_coordinator',
                    label: t('family_roles.care_coordinator', 'Care Coordinator'),
                    badge: 'Full Access',
                    desc: t('family_roles.coordinator_desc', 'Manages care profile, invites members, books visits, and oversees all coordination.')
                  },
                  {
                    id: 'family_member',
                    label: t('family_roles.family_member', 'Family Member'),
                    badge: 'Collaborator',
                    desc: t('family_roles.member_desc', 'Collaborates on care: creates requests, books visits, messages caregivers, and views visit reports.')
                  },
                  {
                    id: 'view_only',
                    label: t('family_roles.view_only', 'View Only'),
                    badge: 'Read Only',
                    desc: t('family_roles.view_only_desc', 'Stays informed by viewing the care overview and visit reports. Sensitive details protected.')
                  }
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`block p-3 rounded-2xl border cursor-pointer transition-all ${
                      role === item.id 
                        ? 'border-primary-500 bg-primary-50/50 shadow-2xs' 
                        : 'border-surface-200 bg-white hover:border-surface-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="role"
                          checked={role === item.id}
                          onChange={() => handleRoleChange(item.id as FamilyRole)}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <span className="font-bold text-text-900 text-xs">{item.label}</span>
                      </div>
                      <span className="text-[10px] bg-surface-100 text-text-600 px-2 py-0.5 rounded-full font-semibold">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-500 ps-5 leading-relaxed">
                      {item.desc}
                    </p>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Permissions Accordion Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvancedPermissions(!showAdvancedPermissions)}
                className="flex items-center gap-1.5 text-xs text-primary-700 font-semibold hover:underline"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>
                  {showAdvancedPermissions 
                    ? t('family_circle.hide_permissions', 'Hide Custom Permissions') 
                    : t('family_circle.customize_permissions', 'Customize Granular Permissions')}
                </span>
              </button>

              {showAdvancedPermissions && (
                <div className="mt-3 p-3 bg-surface-50 border border-surface-200 rounded-2xl space-y-3 max-h-56 overflow-y-auto">
                  <p className="text-[11px] text-text-500">
                    {t('family_circle.custom_permissions_desc', 'Fine-tune specific capabilities granted to this member.')}
                  </p>
                  {PERMISSION_GROUPS.map(group => (
                    <div key={group.id} className="space-y-1.5">
                      <span className="text-[10px] font-bold text-text-400 uppercase tracking-wider block">
                        {group.category}
                      </span>
                      {group.permissions.map(perm => {
                        const isChecked = customPermissions.includes(perm.key);
                        return (
                          <label key={perm.key} className="flex items-center gap-2 cursor-pointer text-xs text-text-700 hover:text-text-900">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(perm.key)}
                              className="rounded text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-[11px]">{t(perm.labelKey, perm.key)}</span>
                          </label>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Privacy Guarantee Notice (Item 20) */}
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-2 text-blue-800">
              <Shield className="w-4 h-4 mt-0.5 shrink-0 text-blue-600" />
              <div className="text-[11px] leading-relaxed">
                <strong>{t('family_circle.privacy_guarantee', 'Privacy Protected')}:</strong>{' '}
                {t('family_circle.privacy_guarantee_desc', 'Sensitive information (exact address, emergency phone numbers, medical notes) remains protected until this member accepts the invitation.')}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-100">
              <Button type="button" onClick={onClose} variant="ghost">
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? t('family_circle.inviting', 'Creating Invitation...') : t('family_circle.send_invite', 'Create Invitation')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
