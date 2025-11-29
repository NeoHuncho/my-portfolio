'use client';
import projectTabs, { type ProjectTabConfig } from '@config/projects';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import ProjectTab from './tab';

export default function ProjectsPanel() {
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

  const handleTabClick = (tabId: ProjectTabConfig['id']) => {
    if (tabId !== activeTab) {
      setHasUserSwitched(true);
    }
    setActiveTab(tabId);
    if (showGlow) {
      setShowGlow(false);
    }
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.00)' }}>
      <div className="flex flex-col items-center px-4 md:px-8">
        {/* Tabs - 12px above carousel */}
        <div id="project-tabs-container" className="shrink-0 w-full flex justify-center z-20 mb-3">
          <div className={`relative bg-gray-900/50 p-1.5 rounded-xl inline-flex gap-2 shadow-lg border border-gray-700/50 backdrop-blur-sm ${showGlow ? 'animate-glow' : 'animate-glow-fadeout'}`}>
            {projectTabs.map((tab, index) => {
              const localizedLabel = strings.projects.tabs[tab.id];
              return (
                <button
                key={index}
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

        {/* Carousel */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            <ProjectTab key={activeTab} items={projectTabs[activeTabIndex].items} />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
