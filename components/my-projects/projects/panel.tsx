import React, { useState, useEffect } from 'react';
import { Tabs } from '@mantine/core';
import projectTabs from '@config/my-projects/projects-tabs';
import { useMediaQuery } from '@mantine/hooks';
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
      <Tabs
        value={activeTab}
        onTabChange={setActiveTab}
        styles={{ tabsList: { justifyContent: 'center' } }}
        defaultValue={activeTab.label}
      >
        <Tabs.List>
          {projectTabs.map((tab, index) => (
            <Tabs.Tab value={tab.label} key={index}>
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Tabs.Panel
          value={projectTabs[activeTabIndex].label}
          key={projectTabs[activeTabIndex].label}
        >
          <ProjectTab items={projectTabs[activeTabIndex].items} />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
