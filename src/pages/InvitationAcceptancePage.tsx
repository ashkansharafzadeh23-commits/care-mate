import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Heart, 
  Users, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  LogIn,
  UserCheck
} from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { familyCircleService } from '../services/familyCircleService';
import { InvitationTokenPayload } from '../types';
import { Button } from '../components/Button';

export const InvitationAcceptancePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthContext();
  const { refreshCareRecipients, setActiveRecipientId } = useAppContext();

  const [invitation, setInvitation] = useState<InvitationTokenPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [acceptedSuccess, setAcceptedSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError(t('invitation.invalid_link', 'Invalid invitation link.'));
      return;
    }

    const found = familyCircleService.getInvitation(token);
    if (!found) {
      setError(t('invitation.not_found_or_expired', 'This invitation link is expired, invalid, or has already been used.'));
      return;
    }

    setInvitation(found);
  }, [token, t]);

  const handleAccept = () => {
    if (!token || !user) return;
    setIsProcessing(true);
    setError(null);

    try {
      const acceptedMember = familyCircleService.acceptInvitation(token, user.id, user.name);
      refreshCareRecipients();
      const targetRecipientId = acceptedMember.careRecipientId || acceptedMember.recipientId;
      if (targetRecipientId) {
        setActiveRecipientId(targetRecipientId);
      }
      setAcceptedSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation.');
      setIsProcessing(false);
    }
  };

  const handleDecline = () => {
    if (!token) return;
    try {
      familyCircleService.declineInvitation(token);
      navigate('/home');
    } catch {
      navigate('/home');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-4 border border-surface-200 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-text-900">
            {t('invitation.invalid_title', 'Invitation Unavailable')}
          </h2>
          <p className="text-xs text-text-500 leading-relaxed">
            {error}
          </p>
          <div className="pt-2">
            <Link to="/home">
              <Button variant="primary" className="w-full">
                {t('common.return_home', 'Go to CareMate')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (acceptedSuccess) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-5 border border-surface-200 shadow-sm animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-text-900">
              {t('invitation.welcome_to_circle', 'Welcome to {{name}}\'s Circle!', { name: invitation.recipientName })}
            </h2>
            <p className="text-xs text-text-500 leading-relaxed">
              {t('invitation.success_joined', 'You have joined as {{role}}. You can now coordinate visits, communicate with caregivers, and stay updated.', {
                role: t(`family_roles.${invitation.role}`, invitation.role)
              })}
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => navigate(`/care/${invitation.careRecipientId || invitation.recipientId}/family`)}
            >
              <span>{t('family_circle.go_to_circle', 'View Family Circle')}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 border border-surface-200 shadow-sm text-start">
        
        {/* Header Branding */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-xs">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <span className="text-sm font-bold tracking-tight text-text-900">CareMate</span>
        </div>

        {/* Invitation Headline */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full inline-block">
            {t('invitation.badge', 'Family Circle Invitation')}
          </span>
          <h1 className="text-xl font-bold text-text-900 leading-tight">
            {t('invitation.main_headline', 'Join the Care Circle for {{name}}', { name: invitation.recipientName })}
          </h1>
          <p className="text-xs text-text-500 leading-relaxed">
            {t('invitation.invited_by_desc', '{{inviter}} has invited you to coordinate care as a trusted family team member.', {
              inviter: invitation.inviterName
            })}
          </p>
        </div>

        {/* Role & Scope Information Box */}
        <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 space-y-3 text-xs">
          <div className="flex justify-between items-center border-b border-surface-200/80 pb-2">
            <span className="text-text-500">{t('family_circle.assigned_role', 'Assigned Role')}</span>
            <span className="font-bold text-text-900 bg-white px-2.5 py-0.5 rounded-full border border-surface-200">
              {t(`family_roles.${invitation.role}`, invitation.role)}
            </span>
          </div>

          <div className="flex justify-between items-center border-b border-surface-200/80 pb-2">
            <span className="text-text-500">{t('family_circle.relationship_to_recipient', 'Relationship')}</span>
            <span className="font-semibold text-text-800">{invitation.relationshipToRecipient}</span>
          </div>

          <div className="flex items-start gap-2 pt-1 text-text-500 text-[11px] leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              {t('invitation.privacy_scope_note', 'Access is strictly scoped to {{name}}\'s care and does not grant access to any other care recipients.', {
                name: invitation.recipientName
              })}
            </span>
          </div>
        </div>

        {/* Authentication or Acceptance Action */}
        {!isAuthenticated ? (
          <div className="space-y-3 pt-2">
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <LogIn className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                {t('invitation.auth_required_prompt', 'Please sign in or create an account to accept this invitation and connect to {{name}}\'s circle.', {
                  name: invitation.recipientName
                })}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5">
              <Link to={`/login?redirect=/invite/${token}`} className="w-full">
                <Button variant="primary" className="w-full text-xs">
                  {t('auth.login', 'Sign In')}
                </Button>
              </Link>
              <Link to={`/register?redirect=/invite/${token}`} className="w-full">
                <Button variant="outline" className="w-full text-xs">
                  {t('auth.register', 'Create Account')}
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-text-600 bg-surface-100 p-2.5 rounded-xl">
              <UserCheck className="w-4 h-4 text-primary-600" />
              <span>
                {t('invitation.logged_in_as', 'Signed in as {{name}}', { name: user?.name })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={handleDecline}
                className="w-1/3 text-xs"
                disabled={isProcessing}
              >
                {t('invitation.decline', 'Decline')}
              </Button>
              <Button
                variant="primary"
                onClick={handleAccept}
                className="w-2/3 text-xs"
                disabled={isProcessing}
              >
                {isProcessing ? t('invitation.accepting', 'Joining...') : t('invitation.accept_button', 'Accept & Join Circle')}
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
