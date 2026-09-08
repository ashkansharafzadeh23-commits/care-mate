import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Heart, Pill, Calendar, Clock, Plus, Phone, Bell, X, PhoneCall } from 'lucide-react';
import { EmergencyFAB } from '../components/EmergencyFAB';
import { motion, AnimatePresence } from 'motion/react';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { parent } = useAppContext();
  const [showPushNotification, setShowPushNotification] = useState(false);

  useEffect(() => {
    // Simulate an automated push notification / system alert arriving shortly after dashboard loads
    const timer = setTimeout(() => {
      setShowPushNotification(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

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
                <p className="text-sm text-text-600 leading-tight">Reminder: Sarah Jenkins is scheduled to arrive in exactly 24 hours (Tomorrow, 8:00 AM).</p>
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

      <header className="flex justify-between items-center mt-16 mb-6">
        <h1 className="text-2xl font-bold text-text-900 leading-tight">
          {t('dashboard.title', { name: parent?.name || 'Parent' })}
        </h1>
        <div className="flex">
          <img src="https://i.pravatar.cc/150?u=a" alt="Family 1" className="w-8 h-8 rounded-full border-2 border-surface-50 relative z-20" />
          <img src="https://i.pravatar.cc/150?u=b" alt="Family 2" className="w-8 h-8 rounded-full border-2 border-surface-50 -ms-2 relative z-10" />
          <div className="w-8 h-8 rounded-full border-2 border-surface-50 bg-surface-200 flex items-center justify-center text-xs font-bold text-text-700 -ms-2 relative z-0">
            <Plus className="w-3 h-3" />
          </div>
        </div>
      </header>

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
    </div>
  );
}
