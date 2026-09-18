import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Heart, Pill, Calendar, Clock, Plus, Phone, Bell, X, PhoneCall, CreditCard, FileText, ChevronRight, Sparkles, Download, UserCheck } from 'lucide-react';
import { EmergencyFAB } from '../components/EmergencyFAB';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/Button';
import { bookingService } from '../services/bookingService';
import { BillingTransaction } from '../types';
import { CareRecipientSwitcher } from '../components/care/CareRecipientSwitcher';
import { CareRecipientEmptyState } from '../components/care/CareRecipientEmptyState';

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activeCareRecipient, careRecipients } = useAppContext();
  const [showPushNotification, setShowPushNotification] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'payments'>('overview');
  const [transactions, setTransactions] = useState<BillingTransaction[]>([]);

  const recipientName = activeCareRecipient?.preferredName || activeCareRecipient?.firstName || activeCareRecipient?.name || 'Loved One';

  useEffect(() => {
    bookingService.getBillingHistory(activeCareRecipient?.id).then(setTransactions);
  }, [activeCareRecipient?.id]);

  const handleExportPDF = () => {
    bookingService.generateBillingSummaryPDF(transactions, recipientName);
  };

  useEffect(() => {
    // Simulate an automated push notification / system alert arriving shortly after dashboard loads
    const timer = setTimeout(() => {
      setShowPushNotification(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (careRecipients.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-surface-50 p-6">
        <header className="mt-12 mb-6">
          <h1 className="text-2xl font-bold text-text-900 leading-tight">
            {t('nav.dashboard')}
          </h1>
        </header>
        <div className="my-auto py-8">
          <CareRecipientEmptyState onAddClick={() => navigate('/onboarding?mode=add')} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface-50 p-6 pb-24 relative overflow-x-hidden">
      <EmergencyFAB />
      
      {/* Simulated System Alert / Push Notification */}
      <AnimatePresence>
        {showPushNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-4 right-4 z-[100] bg-white rounded-2xl shadow-2xl border-l-4 border-primary-500 overflow-hidden"
          >
            <div className="flex items-start p-4">
              <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center shrink-0 me-3">
                <Bell className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 pt-0.5">
                <h4 className="text-sm font-bold text-text-900 mb-0.5">Upcoming Care Appointment</h4>
                <p className="text-sm text-text-600 leading-tight">Reminder: Caregiver scheduled for {recipientName} in 24 hours.</p>
              </div>
              <button 
                onClick={() => setShowPushNotification(false)}
                className="p-1.5 bg-surface-50 hover:bg-surface-100 rounded-full text-text-400 shrink-0 ms-2 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="mt-12 mb-4 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-text-900 leading-tight">
              {t('dashboard.title', { name: recipientName })}
            </h1>
            <p className="text-xs text-text-500">Care Plan &amp; Activity</p>
          </div>

          <CareRecipientSwitcher compact={true} />
        </div>

        {activeCareRecipient && (
          <div className="flex items-center justify-between bg-white rounded-2xl p-2.5 px-3 border border-surface-200 text-xs">
            <span className="text-text-500">
              {activeCareRecipient.customRelationship || t(`relationship.${activeCareRecipient.relationshipToPrimaryUser || 'other'}`)} • {activeCareRecipient.age} {t('care_profile.years_old')}
            </span>
            <button
              onClick={() => navigate(`/care/${activeCareRecipient.id}`)}
              className="text-primary-700 font-semibold hover:underline flex items-center gap-1"
            >
              <span>{t('care_profile.title')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </header>

      {/* Tabs */}
      <div className="flex bg-surface-100 p-1 rounded-2xl mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
            activeTab === 'overview' ? 'bg-white text-text-900 shadow-sm' : 'text-text-500 hover:text-text-700'
          }`}
        >
          {t('dashboard.overview_tab')}
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
            activeTab === 'payments' ? 'bg-white text-text-900 shadow-sm' : 'text-text-500 hover:text-text-700'
          }`}
        >
          {t('dashboard.payments_tab')}
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* High-Visibility Emergency Assist Button */}
      <a 
        href="tel:911"
        className="bg-accent-500 hover:bg-accent-600 text-white rounded-3xl p-5 mb-6 flex items-center shadow-md transition-transform active:scale-[0.98]"
      >
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0 me-4">
          <PhoneCall className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">Emergency Assist</h3>
          <p className="text-white/80 text-sm mt-0.5">Call 911 or local emergency services immediately</p>
        </div>
      </a>

      {/* AI Recommendation Widget */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-3xl p-5 mb-6 flex flex-col shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-indigo-900">Smart Scheduling</h3>
        </div>
        <p className="text-sm text-indigo-800 leading-relaxed mb-4">
          Based on your history, <strong>Tuesday and Thursday mornings at 9:00 AM</strong> are your most frequent booking slots. Would you like to schedule your next session then?
        </p>
        <button className="bg-indigo-600 text-white rounded-xl py-2.5 px-4 font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm self-start">
          Quick Schedule
        </button>
      </div>

      {/* Alerts - prominent but calm */}
      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 mb-6 flex items-start shadow-sm">
        <AlertCircle className="w-5 h-5 text-amber-600 me-3 mt-0.5 shrink-0" />
        <div>
          <h3 className="font-semibold text-amber-900">Missed check-in</h3>
          <p className="text-sm text-amber-800 mt-1 leading-relaxed">
            Evelyn hasn't confirmed taking her 8:00 AM medication. Want us to remind her?
          </p>
          <div className="flex mt-3 gap-3">
            <button className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-xl hover:bg-amber-700 transition-colors">
              Remind Her
            </button>
            <button className="px-4 py-2 bg-transparent text-amber-700 border border-amber-600 text-sm font-medium rounded-xl hover:bg-amber-100 transition-colors flex items-center">
              <Phone className="w-4 h-4 me-1.5" /> Call
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Medications */}
        <div className="bg-white border border-surface-200 rounded-3xl p-5 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-3">
            <Pill className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-text-900 mb-1">{t('dashboard.medications')}</h3>
          <div className="flex items-center text-sm font-medium text-text-500">
            <CheckCircle2 className="w-4 h-4 text-primary-500 me-1.5" />
            <span>4 / 5 taken</span>
          </div>
        </div>

        {/* Vitals */}
        <div className="bg-white border border-surface-200 rounded-3xl p-5 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-accent-50 flex items-center justify-center text-accent-500 mb-3">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-text-900 mb-1">{t('dashboard.vitals')}</h3>
          <div className="text-sm font-medium text-text-500">
            <span className="text-text-900 font-bold" dir="ltr">128/76</span> BP
          </div>
        </div>
      </div>

      {/* Current Caregiver */}
      <div className="bg-white border border-surface-200 rounded-3xl p-5 mb-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="https://i.pravatar.cc/150?u=sarah" alt="Caregiver" className="w-12 h-12 rounded-full object-cover" />
          <div>
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-0.5">Current Caregiver</p>
            <h3 className="font-bold text-text-900">Sarah Jenkins</h3>
            <div className="flex items-center text-sm text-text-500 mt-0.5">
              <Clock className="w-3.5 h-3.5 me-1" /> <span dir="ltr">8:00 AM - 2:00 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Appointment */}
      <div className="bg-white border border-surface-200 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center text-text-900 mb-3 font-bold">
          <Calendar className="w-5 h-5 text-text-500 me-2" />
          {t('dashboard.next_appointment')}
        </div>
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold text-text-900">Dr. Smith - Cardiology</p>
            <p className="text-sm text-text-500">Tomorrow, 10:30 AM</p>
          </div>
        </div>
      </div>
        </>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-900">{t('dashboard.payment_methods')}</h2>
          </div>
          
          <div className="bg-white border border-surface-200 rounded-3xl p-4 mb-6 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-8 bg-surface-100 rounded flex items-center justify-center border border-surface-200">
                <CreditCard className="w-5 h-5 text-text-600" />
              </div>
              <div>
                <p className="font-bold text-text-900 text-sm">{t('dashboard.card_ending_in', { last4: '4242' })}</p>
                <p className="text-xs text-text-500">{t('dashboard.expiry')}: 12/26</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <Button variant="outline" className="w-full mb-8" onClick={() => {}}>
            <Plus className="w-4 h-4 me-2" />
            {t('dashboard.add_payment_method')}
          </Button>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-900">{t('dashboard.billing_history')}</h2>
            <button 
              onClick={handleExportPDF}
              className="flex items-center gap-1 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
          <div className="space-y-3">
            {transactions.map(bill => (
              <div key={bill.id} className="bg-white border border-surface-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-50 flex items-center justify-center border border-surface-100">
                    <FileText className="w-4 h-4 text-text-500" />
                  </div>
                  <div>
                    <p className="font-bold text-text-900 text-sm">{bill.provider}</p>
                    <p className="text-xs text-text-500">{bill.date}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="font-bold text-text-900" dir="ltr">${bill.amount}</p>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 ${
                    bill.status === 'paid' ? 'bg-primary-50 text-primary-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {t(bill.status === 'paid' ? 'dashboard.paid' : 'dashboard.pending')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
