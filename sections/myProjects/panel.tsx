import projectTabs from '@config/projects';
import { useEffect, useState } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import ProjectTab from './tab';

export default function ProjectsPanel() {
  const [activeTab, setActiveTab] = useState(projectTabs[0].label);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const isMobile = useMediaQuery('(max-width: 600px)');
  useEffect(() => {
    projectTabs.map((tab, index) => {
      if (tab.label === activeTab) {
        setActiveTabIndex(index);
      }
      return null;
    });
  }, [activeTab]);

  return (
    <div style={{ marginBottom: isMobile ? '10%' : 0, backgroundColor: 'rgba(0, 0, 0, 0.00)' }}>
      <div className="flex justify-center mb-10">
        <div className="bg-gray-900/50 p-2 rounded-2xl inline-flex gap-6 shadow-md border border-gray-700/50 backdrop-blur-sm">
          {projectTabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(tab.label)}
              className={`
                px-10 py-5 rounded-xl text-lg font-bold transition-all duration-300
                ${
                  activeTab === tab.label
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20 scale-105'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60 hover:scale-102 cursor-pointer'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
          <ProjectTab items={projectTabs[activeTabIndex].items} />
      </div>
    </div>
  );
}
