import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, 
  Shield, 
  Sliders, 
  Check, 
  AlertTriangle, 
  Trash2, 
  RotateCcw,
  UserCheck
} from 'lucide-react';
import { Button } from '../Button';
import { FamilyMember, FamilyRole, CarePermission } from '../../types';
import { familyCircleService } from '../../services/familyCircleService';
import { ROLE_DEFAULT_PERMISSIONS, PERMISSION_GROUPS } from '../../services/familyAuthorizationService';

interface MemberPermissionsModalProps {
  member: FamilyMember;
  recipientName: string;
  actorUserId: string;
  actorName: string;
  onClose: () => void;
  onUpdated: () => void;
}

export const MemberPermissionsModal: React.FC<MemberPermissionsModalProps> = ({
  member,
  recipientName,
  actorUserId,
  actorName,
  onClose,
  onUpdated
}) => {
  const { t } = useTranslation();

  const [selectedRole, setSelectedRole] = useState<FamilyRole>(member.role);
  const [permissions, setPermissions] = useState<CarePermission[]>([...(member.permissions || [])]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);

  const handleRoleChange = (newRole: FamilyRole) => {
    setSelectedRole(newRole);
    // Reset permissions to selected role preset
    setPermissions([...(ROLE_DEFAULT_PERMISSIONS[newRole] || ROLE_DEFAULT_PERMISSIONS.family_member)]);
  };

  const togglePermission = (perm: CarePermission) => {
    setPermissions(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleResetToPreset = () => {
    setPermissions([...(ROLE_DEFAULT_PERMISSIONS[selectedRole] || ROLE_DEFAULT_PERMISSIONS.family_member)]);
  };

  const handleSave = () => {
    setError(null);
    setIsSaving(true);

    try {
      // 1. If role changed, update role first (protects last coordinator)
      if (selectedRole !== member.role) {
        familyCircleService.updateMemberRole(member.id, selectedRole, actorUserId, actorName);
      }

      // 2. Update permissions
      familyCircleService.updateMemberPermissions(member.id, permissions, actorUserId, actorName);

      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update member permissions.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveMember = () => {
    setError(null);
    setIsSaving(true);
    try {
      familyCircleService.removeMember(member.id, actorUserId, actorName);
      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to remove member.');
      setShowConfirmRemove(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 text-start shadow-xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-bold text-sm">
              {member.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold text-text-900">{member.name}</h3>
              <p className="text-xs text-text-500">
                {member.relationshipToRecipient} • {t(`family_roles.${member.role}`, member.role)}
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

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-2 text-xs">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {/* Remove Confirmation Sub-screen */}
        {showConfirmRemove ? (
          <div className="p-4 bg-red-50/60 border border-red-200 rounded-2xl space-y-3 text-xs">
            <div className="flex items-center gap-2 text-red-800 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>{t('family_circle.remove_member_title', 'Remove Member from Circle?')}</span>
            </div>
            <p className="text-text-600 leading-relaxed">
              {t('family_circle.remove_member_confirm', 
                'Are you sure you want to remove {{name}}? They will immediately lose access to all of {{recipient}}\'s care details, schedules, and visit reports.',
                { name: member.name, recipient: recipientName }
              )}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowConfirmRemove(false)}
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <button
                onClick={handleRemoveMember}
                disabled={isSaving}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('family_circle.confirm_remove_btn', 'Confirm Removal')}</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* Role Selection */}
        <div className="space-y-2 text-xs">
          <label className="block font-bold text-text-800">
            {t('family_circle.change_role_title', 'Family Circle Role')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'care_coordinator', label: t('family_roles.care_coordinator', 'Coordinator') },
              { id: 'family_member', label: t('family_roles.family_member', 'Member') },
              { id: 'view_only', label: t('family_roles.view_only', 'View Only') }
            ].map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleRoleChange(r.id as FamilyRole)}
                className={`py-2 px-3 rounded-xl border font-semibold transition-all text-xs ${
                  selectedRole === r.id
                    ? 'bg-primary-50 border-primary-500 text-primary-900 shadow-2xs'
                    : 'bg-white border-surface-200 text-text-600 hover:bg-surface-50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Granular Permissions Section */}
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-text-800">
                {t('family_circle.permissions_title', 'Granular Care Permissions')}
              </h4>
              <p className="text-[11px] text-text-400">
                {t('family_circle.permissions_subtitle', 'Adjust specific capabilities allowed for {{name}}', { name: member.name })}
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetToPreset}
              className="text-[11px] text-primary-700 hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t('family_circle.reset_preset', 'Reset to Role Preset')}</span>
            </button>
          </div>

          <div className="space-y-4 max-h-72 overflow-y-auto border border-surface-200 rounded-2xl p-4 bg-surface-50/50">
            {PERMISSION_GROUPS.map(group => (
              <div key={group.id} className="space-y-2">
                <span className="text-[10px] font-bold text-text-400 uppercase tracking-wider block border-b border-surface-200/60 pb-1">
                  {group.category}
                </span>
                <div className="space-y-2">
                  {group.permissions.map(perm => {
                    const isChecked = permissions.includes(perm.key);
                    const isSensitive = perm.key === 'view_sensitive_information';

                    return (
                      <label 
                        key={perm.key} 
                        className={`flex items-start gap-2.5 p-2 rounded-xl transition-colors cursor-pointer ${
                          isChecked ? 'bg-white border border-surface-200/80 shadow-2xs' : 'hover:bg-surface-100/60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(perm.key)}
                          className="mt-0.5 rounded text-primary-600 focus:ring-primary-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-text-900 text-xs">
                              {t(perm.labelKey, perm.key)}
                            </span>
                            {isSensitive && (
                              <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded">
                                Sensitive
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-text-500 leading-normal">
                            {t(perm.descKey, '')}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-100">
          {!showConfirmRemove && (
            <button
              type="button"
              onClick={() => setShowConfirmRemove(true)}
              className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 p-1 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('family_circle.remove_from_circle', 'Remove from Circle')}</span>
            </button>
          )}

          <div className="flex items-center gap-2 ms-auto">
            <Button type="button" onClick={onClose} variant="ghost">
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button 
              type="button" 
              onClick={handleSave} 
              variant="primary" 
              disabled={isSaving}
            >
              {isSaving ? t('common.saving', 'Saving...') : t('common.save_changes', 'Save Changes')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
