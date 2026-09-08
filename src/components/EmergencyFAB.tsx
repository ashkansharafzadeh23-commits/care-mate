import React from 'react';
import { useTranslation } from 'react-i18next';
import { Phone } from 'lucide-react';
import { motion } from 'motion/react';

export function EmergencyFAB() {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 pointer-events-none flex justify-center z-50">
      <div className="w-full max-w-md relative pt-safe">
        <motion.button 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute top-4 end-4 pointer-events-auto bg-accent-500 text-white shadow-lg hover:bg-accent-600 transition-colors rounded-full px-4 py-3 flex items-center justify-center gap-2 font-bold text-sm"
          onClick={() => alert('Emergency call initiated')}
        >
          <Phone className="w-4 h-4 fill-white" />
          <span>{t('common.emergency')}</span>
        </motion.button>
      </div>
    </div>
  );
}
