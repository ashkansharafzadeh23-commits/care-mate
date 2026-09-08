import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Calendar, Clock, CreditCard, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '../components/Button';
import { motion, AnimatePresence } from 'motion/react';

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const TIME_SLOTS = ["08:00 AM", "09:00 AM", "10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM"];

export default function BookingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSuccess, setIsSuccess] = useState(false);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("09:00 AM");

  const handleConfirm = () => {
    // Mock API call
    setTimeout(() => setIsSuccess(true), 1500);
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: (Date | null)[] = Array(firstDay).fill(null);
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const handleDateClick = (date: Date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else if (date < startDate) {
      setStartDate(date);
      setEndDate(null);
    } else {
      setEndDate(date);
    }
  };

  const isSelected = (date: Date) => {
    if (!date) return false;
    const time = date.getTime();
    if (startDate && time === startDate.getTime()) return true;
    if (endDate && time === endDate.getTime()) return true;
    if (startDate && endDate && time > startDate.getTime() && time < endDate.getTime()) return true;
    return false;
  };

  const isEndpoint = (date: Date) => {
    if (!date) return false;
    const time = date.getTime();
    return (startDate && time === startDate.getTime()) || (endDate && time === endDate.getTime());
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col min-h-screen bg-primary-50 p-6 items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-[2rem] shadow-sm max-w-sm w-full"
        >
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-text-900 mb-2">{t('booking.success')}</h1>
          <p className="text-text-500 mb-8">
            Sarah Jenkins has been notified. They will confirm the appointment shortly.
          </p>
          <div className="space-y-3">
            <Button className="w-full" onClick={() => navigate('/chat')}>{t('booking.message_caregiver')}</Button>
            <Button variant="ghost" className="w-full" onClick={() => navigate('/home')}>{t('booking.back_home')}</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface-50 p-6 pt-safe">
      <header className="flex items-center mb-6 relative">
        <button onClick={() => navigate(-1)} className="p-2 -ms-2 text-text-700 hover:bg-surface-100 rounded-full z-10 rtl:rotate-180">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-text-900 absolute w-full text-center inset-0 flex items-center justify-center pointer-events-none">
          {t('booking.title')}
        </h1>
      </header>

      <div className="bg-white rounded-3xl p-6 border border-surface-200 mb-6 shadow-sm">
        <h2 className="text-lg font-bold text-text-900 mb-4">{t('booking.schedule')}</h2>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 text-text-500 hover:bg-surface-100 rounded-full rtl:rotate-180">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-text-900" dir="ltr">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button onClick={nextMonth} className="p-2 text-text-500 hover:bg-surface-100 rounded-full rtl:rotate-180">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {DAYS.map(day => (
              <div key={day} className="text-xs font-semibold text-text-400 py-1" dir="ltr">{day}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-y-2 text-center" dir="ltr">
            {getDaysInMonth().map((date, i) => (
              <div key={i} className="relative flex items-center justify-center h-10">
                {date && isSelected(date) && !isEndpoint(date) && (
                  <div className="absolute inset-0 bg-primary-50 rounded-none -mx-1" />
                )}
                {date ? (
                  <button
                    onClick={() => handleDateClick(date)}
                    className={`relative w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-colors z-10 ${
                      isEndpoint(date) 
                        ? 'bg-primary-600 text-white shadow-md' 
                        : isSelected(date)
                        ? 'text-primary-700'
                        : 'text-text-700 hover:bg-surface-100'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                ) : <div />}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-surface-100 pt-6">
          <h3 className="text-sm font-bold text-text-900 mb-3 flex items-center">
            <Clock className="w-4 h-4 text-primary-500 me-2" />
            Select Time
          </h3>
          <div className="grid grid-cols-3 gap-2" dir="ltr">
            {TIME_SLOTS.map(time => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`py-2 px-1 text-xs font-medium rounded-xl border transition-colors ${
                  selectedTime === time 
                    ? 'border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500' 
                    : 'border-surface-200 bg-white text-text-600 hover:border-primary-300'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-surface-200 mb-6 shadow-sm">
        <h2 className="text-lg font-bold text-text-900 mb-4">{t('booking.price_breakdown')}</h2>
        
        <div className="space-y-3 text-sm text-text-700">
          <div className="flex justify-between">
            <span dir="ltr">$28/hr x 12 hrs/week</span>
            <span className="font-medium" dir="ltr">$336.00</span>
          </div>
          <div className="flex justify-between">
            <span>CareMate Service Fee</span>
            <span className="font-medium" dir="ltr">$16.80</span>
          </div>
          <div className="h-px w-full bg-surface-200 my-2"></div>
          <div className="flex justify-between text-base font-bold text-text-900">
            <span>{t('booking.total')} (Weekly)</span>
            <span dir="ltr">$352.80</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-surface-200 mb-8 shadow-sm flex items-center">
        <div className="w-10 h-10 bg-surface-100 rounded-full flex items-center justify-center me-4 shrink-0">
          <CreditCard className="w-5 h-5 text-text-700" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-text-900">Visa ending in <span dir="ltr">4242</span></p>
          <p className="text-xs text-text-500">Expires <span dir="ltr">12/25</span></p>
        </div>
        <button className="text-sm font-semibold text-primary-600">Edit</button>
      </div>

      <div className="mt-auto pb-safe">
        <Button className="w-full" size="lg" onClick={handleConfirm}>
          {t('booking.confirm_pay')}
        </Button>
      </div>
    </div>
  );
}
