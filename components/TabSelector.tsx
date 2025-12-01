'use client';

import { memo } from 'react';

type Tab = {
  id: string;
  label: string;
};

type TabSelectorProps = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  showGlow?: boolean;
  hasUserSwitched?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

function TabSelector({
  tabs,
  activeTab,
  onTabChange,
  showGlow = false,
  hasUserSwitched = true,
  size = 'md',
}: TabSelectorProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm md:px-10 lg:px-14 md:py-3 lg:py-4 lg:text-lg',
    lg: 'px-8 py-4 text-base md:px-12 lg:px-16 md:py-4 lg:py-5 lg:text-xl',
  };

  return (
    <div
      className={`relative bg-gray-900/50 p-1.5 rounded-xl inline-flex gap-2 shadow-lg border border-gray-700/50 backdrop-blur-sm ${
        showGlow ? 'animate-glow' : 'animate-glow-fadeout'
      }`}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`relative ${sizeClasses[size]} font-semibold transition-all duration-300 cursor-pointer group rounded-lg ${
            !hasUserSwitched && activeTab !== tab.id
              ? 'animate-[pulse_2s_ease-in-out_infinite]'
              : ''
          }`}
        >
          <span
            className={`transition-colors duration-300 ${
              activeTab === tab.id ? 'text-blue-400' : 'text-gray-300 group-hover:text-white'
            }`}
          >
            {tab.label}
          </span>
          <span
            className={`absolute bottom-1 left-2 right-2 h-0.5 bg-linear-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-300 shadow-sm shadow-blue-400/50 ${
              activeTab === tab.id
                ? 'opacity-100 scale-x-100'
                : 'opacity-0 scale-x-0 group-hover:opacity-50 group-hover:scale-x-100'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default memo(TabSelector);
