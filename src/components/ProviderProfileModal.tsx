import React from 'react';
import { X, Play, Star, ShieldCheck, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './Button';
import { useTranslation } from 'react-i18next';
import { Provider } from '../types';

interface ProviderProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider | null;
  onBook: () => void;
  language: string;
}

export function ProviderProfileModal({ isOpen, onClose, provider, onBook, language }: ProviderProfileModalProps) {
  const { t } = useTranslation();

  if (!provider) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-text-900/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-x-0 bottom-0 z-[101] bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-surface-200 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-text-900">{provider.name}</h2>
              <button onClick={onClose} className="p-2 bg-surface-100 hover:bg-surface-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-text-600" />
              </button>
            </div>

            <div className="p-6">
              {/* Video Placeholder */}
              <div className="relative w-full aspect-video bg-surface-200 rounded-2xl overflow-hidden mb-6 group cursor-pointer">
                {/* Simulated Auto-playing Video Placeholder */}
                <div className="absolute inset-0 bg-gradient-to-tr from-surface-300 to-surface-100 animate-pulse"></div>
                <img 
                  src={provider.avatarUrl} 
                  alt="Video Thumbnail" 
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-text-900/20 group-hover:bg-text-900/30 transition-colors">
                  <div className="w-16 h-16 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-white fill-white ms-1" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white text-sm font-medium drop-shadow-md">
                  "{language === 'fa' ? 'سلام، من ' + provider.name.split(' ')[0] + ' هستم...' : 'Hi, I am ' + provider.name.split(' ')[0] + '...'}"
                </div>
              </div>

              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-text-900 mb-1">{provider.name}</h3>
                  <p className="text-sm text-text-600">{provider.title}</p>
                </div>
                <div className="flex items-center bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500 me-1" />
                  <span className="font-bold text-amber-700" dir="ltr">{provider.rating}</span>
                </div>
              </div>

              <div className="bg-primary-50 rounded-2xl p-4 border border-primary-100 mb-6 flex items-start">
                <ShieldCheck className="w-5 h-5 text-primary-600 mt-0.5 me-3 shrink-0" />
                <p className="text-sm text-primary-800 leading-relaxed">
                  {t('results.verified')} & {t('results.background_checked')}. Identity and credentials have been thoroughly authenticated by our team.
                </p>
              </div>

              <div className="mb-6">
                <h4 className="font-bold text-text-900 mb-2">About Me</h4>
                <p className="text-text-600 text-sm leading-relaxed">
                  {language === 'fa' ? provider.aboutFA : provider.aboutEN}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-surface-50 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                  <span className="font-bold text-text-900" dir="ltr">${provider.rate}/hr</span>
                  <span className="text-[10px] text-text-500 uppercase mt-1">Rate</span>
                </div>
                <div className="bg-surface-50 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                  <span className="font-bold text-text-900" dir="ltr">{provider.yearsExperience}</span>
                  <span className="text-[10px] text-text-500 uppercase mt-1">Years Exp</span>
                </div>
                <div className="bg-surface-50 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                  <MapPin className="w-4 h-4 text-text-900 mb-1" />
                  <span className="text-[10px] font-bold text-text-900" dir="ltr">{provider.distance}</span>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="font-bold text-text-900 mb-4 flex items-center justify-between">
                  <span>Client Reviews</span>
                  <span className="text-sm font-normal text-text-500">See all {provider.reviewsCount}</span>
                </h4>
                <div className="space-y-4">
                  <div className="bg-white border border-surface-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-text-900">Emily R.</span>
                      <div className="flex text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <Star className="w-3 h-3 fill-amber-400" />
                        <Star className="w-3 h-3 fill-amber-400" />
                        <Star className="w-3 h-3 fill-amber-400" />
                        <Star className="w-3 h-3 fill-amber-400" />
                      </div>
                    </div>
                    <p className="text-text-600 text-xs leading-relaxed">
                      "Absolutely wonderful! She was so patient with my mother and always arrived on time. Highly recommended."
                    </p>
                    <span className="text-[10px] text-text-400 mt-2 block">2 weeks ago</span>
                  </div>
                  <div className="bg-white border border-surface-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-text-900">David M.</span>
                      <div className="flex text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <Star className="w-3 h-3 fill-amber-400" />
                        <Star className="w-3 h-3 fill-amber-400" />
                        <Star className="w-3 h-3 fill-amber-400" />
                        <Star className="w-3 h-3 text-surface-300" />
                      </div>
                    </div>
                    <p className="text-text-600 text-xs leading-relaxed">
                      "Very professional and knowledgeable. My father felt very comfortable right away."
                    </p>
                    <span className="text-[10px] text-text-400 mt-2 block">1 month ago</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pb-safe">
                <Button className="flex-1" size="lg" onClick={onBook}>
                  {t('results.book')} {provider.name.split(' ')[0]}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
