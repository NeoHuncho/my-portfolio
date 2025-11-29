'use client';
import profileImage from '@assets/about/profile.webp';
import { aboutTabs } from '@config/about';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import PersonalTab from './personal';
import ProfessionalTab from './professional';

export default function AboutPanel() {
  const [activeTab, setActiveTab] = useState(aboutTabs[0].id);
  const [hasUserSwitched, setHasUserSwitched] = useState(false);
  const [showGlow, setShowGlow] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { strings } = useLanguage();

  const handleTabClick = (tabId: string) => {
    if (tabId !== activeTab) {
      setHasUserSwitched(true);
    }
    setActiveTab(tabId);
    if (showGlow) {
      setShowGlow(false);
    }
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="h-full flex flex-col relative bg-gray-900/30 overflow-y-auto overflow-x-hidden">
        {/* Tabs at top */}
        <div className="shrink-0 flex justify-center pt-4 pb-4">
          <div className={`relative bg-gray-900/50 p-1.5 rounded-xl inline-flex gap-2 shadow-lg border border-gray-700/50 backdrop-blur-sm ${showGlow ? 'animate-glow' : 'animate-glow-fadeout'}`}>
            {aboutTabs.map((tab) => {
              const tabKey = tab.id as 'professional' | 'personal';
              const localizedLabel = strings.about.tabs[tabKey];
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`relative px-6 py-3 text-sm font-semibold transition-all duration-300 cursor-pointer group rounded-lg ${
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
                    {localizedLabel}
                  </span>
                  <span className={`absolute bottom-1 left-2 right-2 h-0.5 bg-linear-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-300 shadow-sm shadow-blue-400/50 ${
                    activeTab === tab.id
                      ? 'opacity-100 scale-x-100'
                      : 'opacity-0 scale-x-0 group-hover:opacity-50 group-hover:scale-x-100'
                  }`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-4">
          <AnimatePresence mode="wait">
            {activeTab === 'professional' ? (
              <motion.div
                key="professional-mobile"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-4 pb-16"
              >
                {/* Profile Image for Professional - No hover animation on mobile */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: imageLoaded ? 1 : 0, scale: imageLoaded ? 1 : 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="relative w-28 h-28"
                >
                  <div className="relative w-full h-full rounded-full overflow-hidden shadow-xl shadow-blue-500/20">
                    <Image
                      src={profileImage}
                      alt="Profile"
                      fill
                      style={{ objectFit: 'cover' }}
                      className={`transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                      onLoad={() => setImageLoaded(true)}
                      priority
                    />
                  </div>
                </motion.div>
                <ProfessionalTab />
              </motion.div>
            ) : (
              <motion.div
                key="personal-mobile"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-4 pb-16"
              >
                <div className="text-center py-2">
                  <h2 className="text-2xl font-bold text-white mb-1">{strings.about.mobileTitle}</h2>
                  <p className="text-gray-400 text-sm">{strings.about.mobileSubtitle}</p>
                </div>
                <PersonalTab />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Desktop/Tablet Layout
  return (
    <div className="h-full flex flex-row relative bg-gray-900/30 overflow-hidden">
      {/* Left Side - Floating Profile Image (40%) */}
      <div className="w-[40%] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: imageLoaded ? 1 : 0, scale: imageLoaded ? 1 : 0.9 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="animate-float relative w-64 h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96"
          >
            <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl shadow-blue-500/20">
              <Image
                src={profileImage}
                alt="Profile"
                fill
                style={{ objectFit: 'cover' }}
                className={`transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                priority
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Content (60%) */}
      <div className="w-[60%] flex flex-col justify-center items-center py-8 px-8">
        {/* Content area with cards */}
        <div className="flex flex-col items-center">
          <div className="shrink-0 flex justify-center mb-8">
            <div className={`relative bg-gray-900/50 p-1.5 rounded-xl inline-flex gap-2 shadow-lg border border-gray-700/50 backdrop-blur-sm ${showGlow ? 'animate-glow' : 'animate-glow-fadeout'}`}>
              {aboutTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`relative px-10 lg:px-14 py-3 lg:py-4 text-sm lg:text-lg font-semibold transition-all duration-300 cursor-pointer group rounded-lg ${
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
          
          
          
            
              <AnimatePresence mode="wait">
                {activeTab === 'professional' ? (
                  <ProfessionalTab key="professional" />
                ) : (
                  <PersonalTab key="personal" />
                )}
              </AnimatePresence>
            
          
        </div>
      </div>
    </div>
  );
}
