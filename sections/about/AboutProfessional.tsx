'use client';
import { motion } from 'framer-motion';
import InfoCard from '@components/InfoCard';
import { professionalPoints } from '@config/about';
import { useLanguage } from '../../hooks/useLanguage';

export default function AboutProfessional() {
  const { locale } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center w-full"
    >
      {/* Points Grid - Centered */}
      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
        {professionalPoints.map((point, index) => (
          <InfoCard
            key={index}
            icon={point.icon}
            title={point.title[locale]}
            description={point.description[locale]}
            variant="professional"
            isLast={index === professionalPoints.length - 1}
          />
        ))}
      </div>
    </motion.div>
  );
}
