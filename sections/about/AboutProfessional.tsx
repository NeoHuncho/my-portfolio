'use client';
import InfoCard from '@components/InfoCard';
import { professionalPoints } from '@config/about';
import { useLanguage } from '../../hooks/useLanguage';

export default function AboutProfessional() {
  const { locale } = useLanguage();

  return (
    <div className="flex flex-col items-center w-full animate-fade-in">
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
    </div>
  );
}
