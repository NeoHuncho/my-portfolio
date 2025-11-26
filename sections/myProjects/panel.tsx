import projectTabs from '@config/projects';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import ProjectTab from './tab';

export default function ProjectsPanel() {
  const [activeTab, setActiveTab] = useState(projectTabs[0].label);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [hasUserSwitched, setHasUserSwitched] = useState(false);
  const [showGlow, setShowGlow] = useState(true);
  const isMobile = useMediaQuery('(max-width: 600px)');
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = document.getElementById('projects-section');
            if (section) {
              section.scrollIntoView({ behavior: 'smooth' });
            }
          }
        });
      },
      {
        threshold: 1.0,
        rootMargin: '0px 0px -10% 0px'
      }
    );

    const tabs = document.getElementById('project-tabs-container');
    if (tabs) observer.observe(tabs);

    return () => observer.disconnect();
  }, []);
  
  useEffect(() => {
    projectTabs.map((tab, index) => {
      if (tab.label === activeTab) {
        setActiveTabIndex(index);
      }
      return null;
    });
  }, [activeTab]);

  const handleTabClick = (tabLabel: string) => {
    if (tabLabel !== activeTab) {
      setHasUserSwitched(true);
    }
    setActiveTab(tabLabel);
    if (showGlow) {
      setShowGlow(false);
    }
  };

  return (
    <div className="min-h-screen 2xl:h-screen flex flex-col relative" style={{ backgroundColor: 'rgba(0, 0, 0, 0.00)' }}>
      <div id="project-tabs-container" className="absolute top-4 md:top-20 left-0 w-full flex justify-center z-20 pointer-events-none">
        <div className={`relative bg-gray-900/50 p-1.5 rounded-xl inline-flex gap-2 shadow-lg border border-gray-700/50 backdrop-blur-sm pointer-events-auto ${showGlow ? 'animate-glow' : 'animate-glow-fadeout'}`}>
          {projectTabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabClick(tab.label)}
              className={`relative px-3 md:px-10 lg:px-14 py-3 lg:py-4 text-sm lg:text-lg font-semibold transition-all duration-300 cursor-pointer group rounded-lg ${
                !hasUserSwitched && activeTab !== tab.label
                  ? 'animate-[pulse_2s_ease-in-out_infinite]'
                  : ''
              }`}
            >
              <span className={`transition-colors duration-300 ${
                activeTab === tab.label
                  ? 'text-blue-400'
                  : 'text-gray-300 group-hover:text-white'
              }`}>
                {tab.label}
              </span>
              <span className={`absolute bottom-1 left-2 right-2 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-300 shadow-sm shadow-blue-400/50 ${
                activeTab === tab.label
                  ? 'opacity-100 scale-x-100'
                  : 'opacity-0 scale-x-0 group-hover:opacity-50 group-hover:scale-x-100'
              }`} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 2xl:overflow-hidden pt-20 md:pt-40 px-4 md:px-8">
        <AnimatePresence mode="wait">
          <ProjectTab key={activeTab} items={projectTabs[activeTabIndex].items} />
        </AnimatePresence>
      </div>
    </div>
  );
}
