import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/Button';
import { OnboardingProgress } from '../components/care/OnboardingProgress';
import { CareNeedsSelector } from '../components/care/CareNeedsSelector';
import { MobilitySelector } from '../components/care/MobilitySelector';
import { CommunicationSelector } from '../components/care/CommunicationSelector';
import { CarePreferencesForm } from '../components/care/CarePreferencesForm';
import { EmergencyContactForm } from '../components/care/EmergencyContactForm';
import { 
  RelationshipType, 
  MobilityOption, 
  CareNeedCategory, 
  CarePreferences, 
  CommunicationPreferences, 
  EmergencyContact,
  CareRecipientLocation 
} from '../types';
import { ArrowLeft, ArrowRight, Check, Heart, Shield, Sparkles, User } from 'lucide-react';
import { calculateAge } from '../services/careRecipientService';

export default function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAddMode = searchParams.get('mode') === 'add';

  const { language, setLanguage, isRTL, createCareRecipient, careRecipients } = useAppContext();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Form state
  // Step 1: About Loved One
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType>('mother');
  const [customRelationship, setCustomRelationship] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [ageInput, setAgeInput] = useState<string>('');
  const [primaryLanguage, setPrimaryLanguage] = useState(language);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [step1Error, setStep1Error] = useState<string | null>(null);

  // Step 2: Care Needs
  const [selectedNeeds, setSelectedNeeds] = useState<(CareNeedCategory | string)[]>(['companionship']);
  const [customNeed, setCustomNeed] = useState('');

  // Step 3: Mobility & Communication
  const [mobility, setMobility] = useState<MobilityOption>('independent');
  const [customMobility, setCustomMobility] = useState('');
  const [communication, setCommunication] = useState<CommunicationPreferences>({
    primaryLanguage: language,
    preferences: ['normal_conversation']
  });

  // Step 4: Care Preferences
  const [carePreferences, setCarePreferences] = useState<CarePreferences>({
    caregiverGender: 'no_preference',
    preferredLanguage: language === 'fa' ? 'Persian' : 'English',
    nonSmokingPreferred: true,
    comfortableWithPets: true,
    recipientHasPets: false,
    transportationRequired: false
  });

  // Step 5: Emergency Contacts & Review
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived display name
  const effectiveName = preferredName.trim() || firstName.trim() || t('care_onboarding.default_loved_one');

  // Step 1 validation
  const validateStep1 = (): boolean => {
    if (!firstName.trim()) {
      setStep1Error(t('care_onboarding.first_name_required'));
      return false;
    }
    if (!city.trim()) {
      setStep1Error(t('care_onboarding.city_required'));
      return false;
    }
    setStep1Error(null);
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep(s => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(s => s - 1);
    } else if (isAddMode || careRecipients.length > 0) {
      navigate(-1);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const derivedAge = ageInput ? parseInt(ageInput, 10) : calculateAge(dateOfBirth) || 75;

      const location: CareRecipientLocation = {
        city: city.trim(),
        state: state.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
        country: 'USA'
      };

      const finalNeeds = [...selectedNeeds];
      if (finalNeeds.includes('other') && customNeed.trim()) {
        finalNeeds.push(`other: ${customNeed.trim()}`);
      }

      const created = createCareRecipient({
        createdByUserId: '', // Will be assigned by AppContext from authenticated user
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        preferredName: preferredName.trim() || undefined,
        relationshipToPrimaryUser: relationship,
        customRelationship: relationship === 'other' ? customRelationship.trim() : undefined,
        age: derivedAge,
        dateOfBirth: dateOfBirth || undefined,
        primaryLanguage,
        location,
        careNeeds: finalNeeds,
        mobility,
        customMobility: mobility === 'other' ? customMobility.trim() : undefined,
        communication,
        preferences: carePreferences,
        emergencyContacts,
        importantNotes: carePreferences.additionalNotes
      });

      // Post onboarding: navigate to Family Home with active recipient
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Failed to create care recipient:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return t('care_onboarding.step1_title');
      case 2: return t('care_onboarding.step2_title');
      case 3: return t('care_onboarding.step3_title');
      case 4: return t('care_onboarding.step4_title');
      case 5: return t('care_onboarding.step5_title');
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col justify-between py-6 px-4 sm:px-6">
      {/* Top Header bar */}
      <div className="max-w-xl w-full mx-auto flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
            C
          </div>
          <span className="font-bold text-primary-800 text-lg tracking-tight">CareMate</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex bg-surface-200/80 rounded-full p-0.5 text-xs">
            <button 
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors ${language === 'en' ? 'bg-white shadow-2xs text-primary-700' : 'text-text-500'}`}
            >
              EN
            </button>
            <button 
              type="button"
              onClick={() => setLanguage('fa')}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors ${language === 'fa' ? 'bg-white shadow-2xs text-primary-700' : 'text-text-500'}`}
            >
              فا
            </button>
          </div>

          {(isAddMode || careRecipients.length > 0) && (
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-xs text-text-500 hover:text-text-800 ms-1 px-2 py-1"
            >
              {t('common.cancel')}
            </button>
          )}
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-xl w-full mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-surface-200 shadow-sm flex-1 flex flex-col justify-between">
        <div>
          {/* Progress Bar */}
          <OnboardingProgress
            currentStep={currentStep}
            totalSteps={totalSteps}
            stepTitle={getStepTitle()}
          />

          <AnimatePresence mode="wait">
            {/* STEP 1: ABOUT YOUR LOVED ONE */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-4 text-start"
              >
                <div>
                  <h2 className="text-xl font-bold text-text-900 leading-tight">
                    {t('care_onboarding.step1_heading')}
                  </h2>
                  <p className="text-xs text-text-500 mt-1">
                    {t('care_onboarding.step1_subheading')}
                  </p>
                </div>

                {step1Error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                    {step1Error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-700 mb-1">
                      {t('care_onboarding.first_name')} *
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={e => {
                        setFirstName(e.target.value);
                        if (step1Error) setStep1Error(null);
                      }}
                      placeholder="e.g. Evelyn"
                      className="w-full h-11 px-3.5 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-700 mb-1">
                      {t('care_onboarding.last_name')}
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      placeholder="e.g. Vance"
                      className="w-full h-11 px-3.5 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-700 mb-1">
                    {t('care_onboarding.preferred_name')}
                  </label>
                  <input
                    type="text"
                    value={preferredName}
                    onChange={e => setPreferredName(e.target.value)}
                    placeholder="e.g. Mom, Grandma, Bob"
                    className="w-full h-11 px-3.5 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all"
                  />
                </div>

                {/* Relationship Selection */}
                <div>
                  <label className="block text-xs font-semibold text-text-700 mb-1.5">
                    {t('care_onboarding.relationship_label')} *
                  </label>
                  <select
                    value={relationship}
                    onChange={e => setRelationship(e.target.value as RelationshipType)}
                    className="w-full h-11 px-3.5 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all"
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

                {relationship === 'other' && (
                  <div>
                    <label className="block text-xs font-semibold text-text-700 mb-1">
                      {t('care_onboarding.other_relationship_label')}
                    </label>
                    <input
                      type="text"
                      value={customRelationship}
                      onChange={e => setCustomRelationship(e.target.value)}
                      placeholder="e.g. Godmother, Cousin"
                      className="w-full h-11 px-3.5 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-700 mb-1">
                      {t('care_onboarding.dob_label')}
                    </label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={e => {
                        setDateOfBirth(e.target.value);
                        const calculated = calculateAge(e.target.value);
                        if (calculated !== undefined) {
                          setAgeInput(calculated.toString());
                        }
                      }}
                      className="w-full h-11 px-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-xs transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-700 mb-1">
                      {t('care_onboarding.age_label')}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={120}
                      value={ageInput}
                      onChange={e => setAgeInput(e.target.value)}
                      placeholder="e.g. 78"
                      className="w-full h-11 px-3.5 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-text-700 mb-1">
                      {t('care_onboarding.city_label')} *
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={e => {
                        setCity(e.target.value);
                        if (step1Error) setStep1Error(null);
                      }}
                      placeholder="e.g. San Francisco"
                      className="w-full h-11 px-3.5 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-700 mb-1">
                      {t('care_onboarding.state_label')}
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={e => setState(e.target.value)}
                      placeholder="CA"
                      className="w-full h-11 px-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: CARE NEEDS */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
              >
                <CareNeedsSelector
                  selectedNeeds={selectedNeeds}
                  onChange={setSelectedNeeds}
                  customNeed={customNeed}
                  onCustomNeedChange={setCustomNeed}
                  recipientName={effectiveName}
                />
              </motion.div>
            )}

            {/* STEP 3: MOBILITY & COMMUNICATION */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-6"
              >
                <MobilitySelector
                  value={mobility}
                  onChange={setMobility}
                  customMobility={customMobility}
                  onCustomMobilityChange={setCustomMobility}
                  recipientName={effectiveName}
                />

                <CommunicationSelector
                  value={communication}
                  onChange={setCommunication}
                  recipientName={effectiveName}
                />
              </motion.div>
            )}

            {/* STEP 4: CARE PREFERENCES */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
              >
                <CarePreferencesForm
                  value={carePreferences}
                  onChange={setCarePreferences}
                  recipientName={effectiveName}
                />
              </motion.div>
            )}

            {/* STEP 5: EMERGENCY CONTACT & REVIEW */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-6 text-start"
              >
                <div>
                  <h2 className="text-xl font-bold text-text-900 leading-tight">
                    {t('care_onboarding.review_heading', { name: effectiveName })}
                  </h2>
                  <p className="text-xs text-text-500 mt-1">
                    {t('care_onboarding.review_subheading')}
                  </p>
                </div>

                {/* Summary Card */}
                <div className="bg-surface-50 rounded-2xl p-4 border border-surface-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-surface-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                        {effectiveName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-text-900">{firstName} {lastName}</div>
                        <div className="text-text-500">
                          {relationship === 'other' ? customRelationship : t(`relationship.${relationship}`)}
                          {ageInput ? ` • ${ageInput} ${t('care_profile.years_old')}` : ''}
                        </div>
                      </div>
                    </div>
                    <span className="text-text-500 font-medium">
                      {city}{state ? `, ${state}` : ''}
                    </span>
                  </div>

                  <div>
                    <span className="font-semibold text-text-700 block mb-1">
                      {t('care_profile.care_needs_section')} ({selectedNeeds.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedNeeds.map(need => (
                        <span key={need} className="bg-white border border-surface-200 px-2 py-0.5 rounded-md text-[11px] text-text-700">
                          {t(`care_needs.${need}`, need)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="font-semibold text-text-700 block mb-0.5">
                        {t('care_profile.mobility_section')}:
                      </span>
                      <span className="text-text-600">
                        {t(`mobility.${mobility}`)}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-text-700 block mb-0.5">
                        {t('care_preferences.caregiver_gender')}:
                      </span>
                      <span className="text-text-600">
                        {t(`care_preferences.gender_${carePreferences.caregiverGender || 'no_preference'}`)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact section */}
                <EmergencyContactForm
                  contacts={emergencyContacts}
                  onChange={setEmergencyContacts}
                  optionalNotice={true}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Step Control Buttons */}
        <div className="mt-8 pt-4 border-t border-surface-100 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="h-11 px-4 text-xs font-semibold flex items-center gap-1.5"
            >
              {isRTL ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
              <span>{t('common.back')}</span>
            </Button>
          ) : (
            <div>
              {(isAddMode || careRecipients.length > 0) && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/')}
                  className="h-11 px-4 text-xs font-medium text-text-500"
                >
                  {t('common.cancel')}
                </Button>
              )}
            </div>
          )}

          {currentStep < totalSteps ? (
            <Button
              type="button"
              onClick={handleNext}
              className="h-11 px-6 text-xs font-semibold flex items-center gap-1.5 ms-auto"
            >
              <span>{t('care_onboarding.save_continue')}</span>
              {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleFinish}
              disabled={isSubmitting}
              className="h-12 px-8 text-sm font-semibold flex items-center gap-2 ms-auto bg-primary-600 hover:bg-primary-700 shadow-sm"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isSubmitting ? t('common.loading') : t('care_onboarding.finish_onboarding')}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
