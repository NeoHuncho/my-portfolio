'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import TabSelector from '@components/TabSelector';
import projectTabs, { type ProjectTabConfig } from '@config/projects';
import ProjectCarousel from './ProjectCarousel';
import { useLanguage } from '../../hooks/useLanguage';

export default function ProjectsSection() {
  const [activeTab, setActiveTab] = useState<ProjectTabConfig['id']>(projectTabs[0].id);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [hasUserSwitched, setHasUserSwitched] = useState(false);
  const [showGlow, setShowGlow] = useState(true);
  const { strings } = useLanguage();

  useEffect(() => {
    projectTabs.map((tab, index) => {
      if (tab.id === activeTab) {
        setActiveTabIndex(index);
      }
      return null;
    });
  }, [activeTab]);

  const handleTabClick = (tabId: string) => {
    if (tabId !== activeTab) {
      setHasUserSwitched(true);
    }
    setActiveTab(tabId as ProjectTabConfig['id']);
    if (showGlow) {
      setShowGlow(false);
    }
  };

  const tabs = projectTabs.map((tab) => ({
    id: tab.id,
    label: strings.projects.tabs[tab.id],
  }));

  return (
    <div
      className="h-full flex flex-col relative overflow-hidden justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.00)' }}
    >
      <div className="flex flex-col items-center justify-center gap-3 md:gap-6 px-4 md:px-8 w-full -mt-[50px] md:mt-0">
        {/* Tabs - 12px above carousel */}
        <div id="project-tabs-container" className="shrink-0 w-full flex justify-center z-20">
          <TabSelector
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabClick}
            showGlow={showGlow}
            hasUserSwitched={hasUserSwitched}
            size="md"
          />
        </div>

        {/* Carousel */}
        <div className="w-full flex flex-col justify-center md:block">
          <AnimatePresence mode="wait">
            <ProjectCarousel key={activeTab} items={projectTabs[activeTabIndex].items} />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
