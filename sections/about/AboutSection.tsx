'use client';
import profileImage from '@assets/about/profile.webp';
import TabSelector from '@components/TabSelector';
import { aboutTabs } from '@config/about';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import AboutPersonal from './AboutPersonal';
import AboutProfessional from './AboutProfessional';

export default function AboutSection() {
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

  const tabs = aboutTabs.map((tab) => ({
    id: tab.id,
    label: strings.about.tabs[tab.id as 'professional' | 'personal'],
  }));

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="h-full flex flex-col relative bg-gray-900/30 overflow-y-auto overflow-x-hidden">
        {/* Tabs at top */}
        <div className="shrink-0 flex justify-center pt-4 pb-4">
          <TabSelector
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabClick}
            showGlow={showGlow}
            hasUserSwitched={hasUserSwitched}
            size="sm"
          />
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
                      sizes="112px"
                      style={{ objectFit: 'cover' }}
                      className={`transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                      onLoad={() => setImageLoaded(true)}
                      priority
                    />
                  </div>
                </motion.div>
                <AboutProfessional />
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
                <AboutPersonal />
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
                sizes="(max-width: 1024px) 256px, (max-width: 1280px) 320px, 384px"
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
      <div className="w-[60%] h-full overflow-y-auto flex flex-col items-center py-8 px-8">
        {/* Content area with cards */}
        <div className="flex flex-col items-center w-full my-auto">
          <div className="shrink-0 flex justify-center mb-8">
            <TabSelector
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={handleTabClick}
              showGlow={showGlow}
              hasUserSwitched={hasUserSwitched}
              size="md"
            />
          </div>
          
          <AnimatePresence mode="wait">
            {activeTab === 'professional' ? (
              <AboutProfessional key="professional" />
            ) : (
              <AboutPersonal key="personal" />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
