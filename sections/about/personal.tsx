'use client';
import { personalPoints } from '@config/about';
import { motion } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';

export default function PersonalTab() {
  const { locale } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center w-full"
    >
      {/* Points - Compact cards centered */}
      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
        {personalPoints.map((point, index) => (
          <div
            key={index}
            className={`bg-gray-800/60 p-4 md:p-5  [@media(min-width:1600px)]:h-44 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:bg-gray-800/80 ${
              index === personalPoints.length - 1 ? 'mb-4 md:mb-0' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl md:text-3xl shrink-0">{point.icon}</span>
              <div className="min-w-0">
                <h3 className="text-base md:text-lg font-bold text-white mb-1">{point.title[locale]}</h3>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed">{point.description[locale]}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
