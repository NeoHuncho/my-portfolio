'use client';

import { ReactNode } from 'react';

interface InfoCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  variant?: 'default' | 'professional';
  isLast?: boolean;
}

export default function InfoCard({
  icon,
  title,
  description,
  variant = 'default',
  isLast = false,
}: InfoCardProps) {
  const titleColor = variant === 'professional' ? 'text-blue-400' : 'text-white';
  const descriptionColor = variant === 'professional' ? 'text-gray-300' : 'text-gray-400';

  return (
    <div
      className={`bg-gray-800/60 p-4 md:p-5 [@media(min-width:1600px)]:h-44 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:bg-gray-800/80 ${
        isLast ? 'mb-4 md:mb-0' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl md:text-3xl shrink-0">{icon}</span>
        <div className="min-w-0">
          <h3 className={`text-base md:text-lg font-bold ${titleColor} mb-1`}>{title}</h3>
          <p className={`${descriptionColor} text-sm md:text-base leading-relaxed`}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
