import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EmergencyContact } from '../../types';
import { Plus, Trash2, Star, User, Phone, HeartHandshake } from 'lucide-react';
import { Button } from '../Button';

interface EmergencyContactFormProps {
  contacts: EmergencyContact[];
  onChange: (contacts: EmergencyContact[]) => void;
  optionalNotice?: boolean;
}

export const EmergencyContactForm: React.FC<EmergencyContactFormProps> = ({
  contacts,
  onChange,
  optionalNotice = false
}) => {
  const { t } = useTranslation();
  const [showAddForm, setShowAddForm] = useState(contacts.length === 0);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [isPrimary, setIsPrimary] = useState(contacts.length === 0);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    if (!name.trim() || !phone.trim() || !relationship.trim()) {
      setError(t('emergency_contacts.validation_error'));
      return;
    }

    const newContact: EmergencyContact = {
      id: `ec_${Date.now()}`,
      name: name.trim(),
      relationship: relationship.trim(),
      phone: phone.trim(),
      alternatePhone: alternatePhone.trim() || undefined,
      isPrimary: isPrimary || contacts.length === 0
    };

    let updated = [...contacts];
    if (newContact.isPrimary) {
      updated = updated.map(c => ({ ...c, isPrimary: false }));
    }
    updated.push(newContact);

    onChange(updated);
    setName('');
    setRelationship('');
    setPhone('');
    setAlternatePhone('');
    setIsPrimary(false);
    setError(null);
    setShowAddForm(false);
  };

  const handleRemove = (id: string) => {
    const filtered = contacts.filter(c => c.id !== id);
    if (filtered.length > 0 && !filtered.some(c => c.isPrimary)) {
      filtered[0].isPrimary = true;
    }
    onChange(filtered);
  };

  const handleSetPrimary = (id: string) => {
    onChange(contacts.map(c => ({ ...c, isPrimary: c.id === id })));
  };

  return (
    <div className="space-y-4 text-start">
      <div>
        <h3 className="text-lg font-bold text-text-900">
          {t('emergency_contacts.title')}
        </h3>
        <p className="text-xs text-text-500 mt-1">
          {optionalNotice 
            ? t('emergency_contacts.optional_notice')
            : t('emergency_contacts.subtitle')}
        </p>
      </div>

      {/* Existing Contacts List */}
      {contacts.length > 0 && (
        <div className="space-y-2.5">
          {contacts.map(c => (
            <div 
              key={c.id} 
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                c.isPrimary 
                  ? 'border-primary-300 bg-primary-50/40' 
                  : 'border-surface-200 bg-white'
              }`}
            >
              <div className="flex-1 min-w-0 me-3">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm text-text-900 truncate">{c.name}</span>
                  {c.isPrimary && (
                    <span className="bg-primary-100 text-primary-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      {t('emergency_contacts.primary_badge')}
                    </span>
                  )}
                </div>
                <div className="text-xs text-text-500 flex items-center gap-2">
                  <span>{c.relationship}</span>
                  <span>•</span>
                  <span dir="ltr">{c.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {!c.isPrimary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(c.id)}
                    className="p-1.5 text-text-400 hover:text-primary-600 rounded-lg hover:bg-surface-100 text-xs"
                    title={t('emergency_contacts.set_primary')}
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(c.id)}
                  className="p-1.5 text-text-400 hover:text-red-600 rounded-lg hover:bg-surface-100"
                  title={t('common.cancel')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Contact Form Toggle */}
      {!showAddForm ? (
        <Button
          type="button"
          variant="secondary"
          className="w-full h-11 text-xs font-semibold flex items-center justify-center gap-2"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="w-4 h-4" />
          <span>{t('emergency_contacts.add_contact')}</span>
        </Button>
      ) : (
        <div className="p-4 rounded-2xl border border-primary-200 bg-primary-50/20 space-y-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-text-800 uppercase tracking-wider">
              {t('emergency_contacts.new_contact_title')}
            </span>
            {contacts.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs text-text-500 hover:text-text-700"
              >
                {t('common.cancel')}
              </button>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>
          )}

          <div>
            <label className="block text-xs font-medium text-text-700 mb-1">
              {t('emergency_contacts.full_name')} *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Sarah Vance"
              className="w-full h-10 px-3 rounded-xl border border-surface-200 bg-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-text-700 mb-1">
                {t('emergency_contacts.relationship')} *
              </label>
              <input
                type="text"
                value={relationship}
                onChange={e => setRelationship(e.target.value)}
                placeholder="e.g. Daughter"
                className="w-full h-10 px-3 rounded-xl border border-surface-200 bg-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-700 mb-1">
                {t('emergency_contacts.phone')} *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                dir="ltr"
                className="w-full h-10 px-3 rounded-xl border border-surface-200 bg-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-700 mb-1">
              {t('emergency_contacts.alternate_phone')}
            </label>
            <input
              type="tel"
              value={alternatePhone}
              onChange={e => setAlternatePhone(e.target.value)}
              placeholder="Optional alternate number"
              dir="ltr"
              className="w-full h-10 px-3 rounded-xl border border-surface-200 bg-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={e => setIsPrimary(e.target.checked)}
              className="rounded text-primary-600 focus:ring-primary-500"
            />
            <span className="text-xs text-text-700">{t('emergency_contacts.make_primary')}</span>
          </label>

          <Button
            type="button"
            className="w-full h-10 text-xs font-semibold mt-2"
            onClick={handleAdd}
          >
            {t('emergency_contacts.save_contact')}
          </Button>
        </div>
      )}
    </div>
  );
};
