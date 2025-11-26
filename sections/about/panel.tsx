import { aboutTabs } from '@config/about';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import PersonalTab from './personal';
import ProfessionalTab from './professional';

export default function AboutPanel() {
  const [activeTab, setActiveTab] = useState(aboutTabs[0].id);
  const [hasUserSwitched, setHasUserSwitched] = useState(false);
  const [showGlow, setShowGlow] = useState(true);

  const handleTabClick = (tabId: string) => {
    if (tabId !== activeTab) {
      setHasUserSwitched(true);
    }
    setActiveTab(tabId);
    if (showGlow) {
      setShowGlow(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative py-12 md:py-20 px-4 md:px-8 bg-gray-900/30" id="about-section">
      {/* Tabs - Same style as Projects */}
      <div className="flex justify-center mb-8 md:mb-16">
        <div className={`relative bg-gray-900/50 p-1.5 rounded-xl inline-flex gap-2 shadow-lg border border-gray-700/50 backdrop-blur-sm ${showGlow ? 'animate-glow' : 'animate-glow-fadeout'}`}>
          {aboutTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative px-3 md:px-10 lg:px-14 py-3 lg:py-4 text-sm lg:text-lg font-semibold transition-all duration-300 cursor-pointer group rounded-lg ${
                !hasUserSwitched && activeTab !== tab.id
                  ? 'animate-[pulse_2s_ease-in-out_infinite]'
                  : ''
              }`}
            >
              <span className={`transition-colors duration-300 ${
                activeTab === tab.id
                  ? 'text-blue-400'
                  : 'text-gray-300 group-hover:text-white'
              }`}>
                {tab.label}
              </span>
              <span className={`absolute bottom-1 left-2 right-2 h-0.5 bg-linear-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-300 shadow-sm shadow-blue-400/50 ${
                activeTab === tab.id
                  ? 'opacity-100 scale-x-100'
                  : 'opacity-0 scale-x-0 group-hover:opacity-50 group-hover:scale-x-100'
              }`} />
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {activeTab === 'professional' ? (
            <ProfessionalTab key="professional" />
          ) : (
            <PersonalTab key="personal" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
