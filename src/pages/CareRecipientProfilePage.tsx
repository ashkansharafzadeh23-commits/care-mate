import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { CareRecipientProfileHeader } from '../components/care/CareRecipientProfileHeader';
import { CareNeedsSelector } from '../components/care/CareNeedsSelector';
import { MobilitySelector } from '../components/care/MobilitySelector';
import { CommunicationSelector } from '../components/care/CommunicationSelector';
import { CarePreferencesForm } from '../components/care/CarePreferencesForm';
import { EmergencyContactForm } from '../components/care/EmergencyContactForm';
import { CareRecipientSwitcher } from '../components/care/CareRecipientSwitcher';
import { Button } from '../components/Button';
import { 
  CareRecipient, 
  RelationshipType, 
  MobilityOption, 
  CareNeedCategory, 
  CarePreferences, 
  CommunicationPreferences, 
  EmergencyContact,
  CareRecipientLocation 
} from '../types';
import { 
  Heart, 
  Activity, 
  MessageSquare, 
  Sliders, 
  PhoneCall, 
  Users, 
  AlertTriangle, 
  Check, 
  X, 
  ChevronRight, 
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Home
} from 'lucide-react';

export default function CareRecipientProfilePage() {
  const { recipientId } = useParams<{ recipientId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { 
    careRecipients, 
    activeCareRecipient, 
    updateCareRecipient, 
    removeCareRecipient, 
    familyMembers,
    isRTL 
  } = useAppContext();

  // Find recipient by ID, fallback to active
  const targetRecipient = (recipientId 
    ? careRecipients.find(r => r.id === recipientId) 
    : activeCareRecipient) || null;

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPreferredName, setEditPreferredName] = useState('');
  const [editRelationship, setEditRelationship] = useState<RelationshipType>('mother');
  const [editCustomRelationship, setEditCustomRelationship] = useState('');
  const [editAge, setEditAge] = useState<string>('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editNeeds, setEditNeeds] = useState<(CareNeedCategory | string)[]>([]);
  const [editCustomNeed, setEditCustomNeed] = useState('');
  const [editMobility, setEditMobility] = useState<MobilityOption>('independent');
  const [editCustomMobility, setEditCustomMobility] = useState('');
  const [editCommunication, setEditCommunication] = useState<CommunicationPreferences>({ preferences: [] });
  const [editPreferences, setEditPreferences] = useState<CarePreferences>({});
  const [editLivingSituation, setEditLivingSituation] = useState('');

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize edit form values when opening edit
  const openEditModal = () => {
    if (!targetRecipient) return;
    setEditFirstName(targetRecipient.firstName || targetRecipient.name?.split(' ')[0] || '');
    setEditLastName(targetRecipient.lastName || targetRecipient.name?.split(' ').slice(1).join(' ') || '');
    setEditPreferredName(targetRecipient.preferredName || '');
    setEditRelationship(targetRecipient.relationshipToPrimaryUser || 'mother');
    setEditCustomRelationship(targetRecipient.customRelationship || '');
    setEditAge(targetRecipient.age ? targetRecipient.age.toString() : '');
    setEditCity(targetRecipient.location?.city || targetRecipient.address?.city || '');
    setEditState(targetRecipient.location?.state || targetRecipient.address?.state || '');
    setEditNeeds(targetRecipient.careNeeds || []);
    setEditMobility(targetRecipient.mobility || 'independent');
    setEditCustomMobility(targetRecipient.customMobility || '');
    setEditCommunication(targetRecipient.communication || { preferences: [] });
    setEditPreferences(targetRecipient.preferences || {});
    setEditLivingSituation(targetRecipient.livingSituation || '');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!targetRecipient) return;

    const location: CareRecipientLocation = {
      city: editCity.trim() || 'San Francisco',
      state: editState.trim() || undefined,
      country: 'USA'
    };

    updateCareRecipient(targetRecipient.id, {
      firstName: editFirstName.trim(),
      lastName: editLastName.trim() || undefined,
      preferredName: editPreferredName.trim() || undefined,
      relationshipToPrimaryUser: editRelationship,
      customRelationship: editRelationship === 'other' ? editCustomRelationship.trim() : undefined,
      age: editAge ? parseInt(editAge, 10) : targetRecipient.age,
      location,
      careNeeds: editNeeds,
      mobility: editMobility,
      customMobility: editMobility === 'other' ? editCustomMobility.trim() : undefined,
      communication: editCommunication,
      preferences: editPreferences,
      livingSituation: editLivingSituation.trim() || undefined
    });

    setIsEditing(false);
  };

  const handleEmergencyContactsChange = (contacts: EmergencyContact[]) => {
    if (!targetRecipient) return;
    updateCareRecipient(targetRecipient.id, { emergencyContacts: contacts });
  };

  const handleConfirmRemove = () => {
    if (!targetRecipient) return;
    setIsDeleting(true);
    try {
      removeCareRecipient(targetRecipient.id);
      setShowDeleteModal(false);
      navigate('/home', { replace: true });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!targetRecipient) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-surface-100 flex items-center justify-center text-text-400 mx-auto mb-4">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-text-900 mb-2">Care Profile Not Found</h2>
        <p className="text-sm text-text-500 mb-6">
          The requested profile could not be located or may have been removed.
        </p>
        <Button onClick={() => navigate('/home')}>
          Return to Family Home
        </Button>
      </div>
    );
  }

  const displayName = targetRecipient.preferredName || targetRecipient.firstName || targetRecipient.name || 'Loved One';

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      {/* Top Breadcrumb / Nav Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-1.5 text-xs font-semibold text-text-500 hover:text-text-800 transition-colors"
        >
          {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{t('nav.home')}</span>
        </button>

        <CareRecipientSwitcher compact={true} />
      </div>

      {/* Main Profile Header Card */}
      <CareRecipientProfileHeader
        recipient={targetRecipient}
        onEdit={openEditModal}
        onTellNeeds={() => navigate(`/chat?recipient=${targetRecipient.id}`)}
        onAddRecipient={() => navigate('/onboarding?mode=add')}
        onRemove={() => setShowDeleteModal(true)}
      />

      {/* SECTION 1: CARE NEEDS & ASSISTANCE */}
      <div className="bg-white rounded-3xl p-5 border border-surface-200 shadow-sm text-start space-y-3">
        <div className="flex items-center justify-between border-b border-surface-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-900">
                {t('care_profile.care_needs_section')}
              </h2>
              <span className="text-[11px] text-text-500">
                {targetRecipient.careNeeds?.length || 0} active focus areas
              </span>
            </div>
          </div>
          <button
            onClick={openEditModal}
            className="text-xs text-primary-700 hover:text-primary-800 font-semibold"
          >
            {t('care_profile.edit_profile')}
          </button>
        </div>

        {targetRecipient.careNeeds && targetRecipient.careNeeds.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {targetRecipient.careNeeds.map((need, idx) => (
              <span 
                key={idx}
                className="bg-primary-50 text-primary-900 border border-primary-200/60 px-3 py-1.5 rounded-xl text-xs font-medium"
              >
                {t(`care_needs.${need}`, need)}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-text-400 py-2">
            {t('care_profile.empty_needs')}
          </p>
        )}

        {targetRecipient.importantNotes && (
          <div className="mt-3 p-3 bg-surface-50 rounded-xl border border-surface-100 text-xs text-text-700 leading-relaxed">
            <span className="font-semibold block text-text-800 mb-0.5">Notes:</span>
            {targetRecipient.importantNotes}
          </div>
        )}
      </div>

      {/* SECTION 2: MOBILITY & DAILY LIVING */}
      <div className="bg-white rounded-3xl p-5 border border-surface-200 shadow-sm text-start space-y-3">
        <div className="flex items-center justify-between border-b border-surface-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-text-900">
              {t('care_profile.mobility_section')}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-surface-50 rounded-2xl border border-surface-100">
            <span className="text-[10px] font-bold text-text-400 uppercase tracking-wider block mb-1">
              Current Mobility
            </span>
            <span className="text-xs font-semibold text-text-900">
              {targetRecipient.mobility 
                ? t(`mobility.${targetRecipient.mobility}`, targetRecipient.mobility) 
                : 'Walks Independently'}
            </span>
            {targetRecipient.customMobility && (
              <p className="text-[11px] text-text-500 mt-1">
                {targetRecipient.customMobility}
              </p>
            )}
          </div>

          <div className="p-3 bg-surface-50 rounded-2xl border border-surface-100">
            <span className="text-[10px] font-bold text-text-400 uppercase tracking-wider block mb-1">
              Living Situation
            </span>
            <span className="text-xs font-medium text-text-800">
              {targetRecipient.livingSituation || 'Lives in family residence'}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 3: COMMUNICATION & PREFERENCES */}
      <div className="bg-white rounded-3xl p-5 border border-surface-200 shadow-sm text-start space-y-3">
        <div className="flex items-center justify-between border-b border-surface-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-text-900">
              {t('care_profile.communication_section')} &amp; {t('care_profile.preferences_section')}
            </h2>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {/* Communication preferences tags */}
          <div>
            <span className="text-xs font-semibold text-text-700 block mb-1.5">
              Communication Style:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {targetRecipient.communication?.preferences?.map(p => (
                <span key={p} className="bg-surface-100 text-text-700 px-2.5 py-1 rounded-lg text-xs">
                  {t(`communication.${p}`, p)}
                </span>
              ))}
              {(!targetRecipient.communication?.preferences || targetRecipient.communication.preferences.length === 0) && (
                <span className="text-xs text-text-400">Normal conversation</span>
              )}
            </div>
          </div>

          {/* Preferences details */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-surface-100 text-xs">
            <div>
              <span className="text-text-400 block text-[11px]">Caregiver Gender:</span>
              <span className="font-medium text-text-800">
                {t(`care_preferences.gender_${targetRecipient.preferences?.caregiverGender || 'no_preference'}`)}
              </span>
            </div>
            <div>
              <span className="text-text-400 block text-[11px]">Preferred Language:</span>
              <span className="font-medium text-text-800">
                {targetRecipient.preferences?.preferredLanguage || 'English'}
              </span>
            </div>
            <div>
              <span className="text-text-400 block text-[11px]">Non-Smoking Required:</span>
              <span className="font-medium text-text-800">
                {targetRecipient.preferences?.nonSmokingPreferred ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="text-text-400 block text-[11px]">Comfortable with Pets:</span>
              <span className="font-medium text-text-800">
                {targetRecipient.preferences?.comfortableWithPets ? 'Yes' : 'No preference'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: EMERGENCY CONTACTS */}
      <div className="bg-white rounded-3xl p-5 border border-surface-200 shadow-sm text-start space-y-4">
        <div className="flex items-center justify-between border-b border-surface-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-700 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-text-900">
              {t('care_profile.emergency_section')}
            </h2>
          </div>
        </div>

        <EmergencyContactForm
          contacts={targetRecipient.emergencyContacts || []}
          onChange={handleEmergencyContactsChange}
        />
      </div>

      {/* SECTION 5: FAMILY CIRCLE PREVIEW */}
      <div className="bg-white rounded-3xl p-5 border border-surface-200 shadow-sm text-start space-y-3">
        <div className="flex items-center justify-between border-b border-surface-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-900">
                Family Circle
              </h2>
              <span className="text-[11px] text-text-500">
                Collaborating on {displayName}'s care
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="text-xs text-primary-700 hover:text-primary-800 font-semibold"
          >
            Manage Circle
          </button>
        </div>

        <div className="space-y-2 pt-1">
          {familyMembers.map(member => (
            <div key={member.id} className="p-3 bg-surface-50 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-surface-200 text-text-700 flex items-center justify-center font-bold text-xs">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <span className="font-semibold text-text-900 block">{member.name}</span>
                  <span className="text-text-500 text-[10px]">{member.relationshipToRecipient} • {member.role.replace('_', ' ')}</span>
                </div>
              </div>
              {member.isEmergencyContact && (
                <span className="text-[10px] bg-primary-100 text-primary-800 font-semibold px-2 py-0.5 rounded-full">
                  Emergency
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 text-start shadow-xl">
            <div className="flex items-center justify-between border-b border-surface-200 pb-3">
              <h3 className="text-base font-bold text-text-900">
                Edit {displayName}'s Profile
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 text-text-400 hover:text-text-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={e => setEditFirstName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-surface-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-text-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={e => setEditLastName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-surface-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-text-700 mb-1">Preferred Name</label>
                <input
                  type="text"
                  value={editPreferredName}
                  onChange={e => setEditPreferredName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-surface-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text-700 mb-1">Relationship</label>
                  <select
                    value={editRelationship}
                    onChange={e => setEditRelationship(e.target.value as RelationshipType)}
                    className="w-full h-10 px-2.5 rounded-xl border border-surface-200 text-xs"
                  >
                    <option value="mother">{t('relationship.mother')}</option>
                    <option value="father">{t('relationship.father')}</option>
                    <option value="spouse">{t('relationship.spouse')}</option>
                    <option value="grandparent">{t('relationship.grandparent')}</option>
                    <option value="aunt_uncle">{t('relationship.aunt_uncle')}</option>
                    <option value="in_law">{t('relationship.in_law')}</option>
                    <option value="friend_neighbor">{t('relationship.friend_neighbor')}</option>
                    <option value="self">{t('relationship.self')}</option>
                    <option value="other">{t('relationship.other')}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-text-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={editAge}
                    onChange={e => setEditAge(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-surface-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={e => setEditCity(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-surface-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-text-700 mb-1">State</label>
                  <input
                    type="text"
                    value={editState}
                    onChange={e => setEditState(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-surface-200 text-sm"
                  />
                </div>
              </div>

              <div className="pt-2">
                <CareNeedsSelector
                  selectedNeeds={editNeeds}
                  onChange={setEditNeeds}
                  customNeed={editCustomNeed}
                  onCustomNeedChange={setEditCustomNeed}
                  recipientName={displayName}
                />
              </div>

              <div className="pt-2">
                <MobilitySelector
                  value={editMobility}
                  onChange={setEditMobility}
                  customMobility={editCustomMobility}
                  onCustomMobilityChange={setEditCustomMobility}
                  recipientName={displayName}
                />
              </div>

              <div className="pt-2">
                <CommunicationSelector
                  value={editCommunication}
                  onChange={setEditCommunication}
                  recipientName={displayName}
                />
              </div>

              <div className="pt-2">
                <CarePreferencesForm
                  value={editPreferences}
                  onChange={setEditPreferences}
                  recipientName={displayName}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-surface-200">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                {t('common.cancel')}
              </Button>
              <Button size="sm" onClick={handleSaveEdit}>
                {t('common.save')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* REMOVE PROFILE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-900 mb-1">
                {t('care_profile.remove_dialog_title')}
              </h3>
              <p className="text-xs text-text-500 leading-relaxed">
                {t('care_profile.remove_dialog_desc', { name: displayName })}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="primary"
                onClick={handleConfirmRemove}
                disabled={isDeleting}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs h-11"
              >
                {isDeleting ? t('common.loading') : t('care_profile.remove_confirm_btn')}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="w-full text-xs h-10"
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
