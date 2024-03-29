import React, { useEffect, useState } from 'react';
import { Tabs } from '@mantine/core';
import specialtiesTabs from '@config/my-projects/specialties-tabs';
import { useMediaQuery } from '@mantine/hooks';
import SpecialtyTab from './tab';

export default function SpecialtiesComponent() {
  const [activeTab, setActiveTab] = useState(specialtiesTabs[0].label);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const isSmall = useMediaQuery('(max-width: 600px)');

  useEffect(() => {
    specialtiesTabs.map((tab, index) => {
      if (tab.label === activeTab) {
        setActiveTabIndex(index);
        return null;
      }
    });
  }, [activeTab]);
  return (
    <div>
      <Tabs
        value={activeTab}
        onTabChange={setActiveTab}
        styles={{ tabsList: { justifyContent: 'center' }, tabLabel: { fontSize: '13px' } }}
        defaultValue={activeTab.label}
      >
        <Tabs.List>
          {specialtiesTabs.map((tab, index) => (
            <Tabs.Tab value={tab.label} key={index}>
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        <div
          style={{
            marginTop: '30px',
            minHeight: isSmall ? 120 : 130,
            backgroundColor: 'whitesmoke',
          }}
        >
          <Tabs.Panel
            value={specialtiesTabs[activeTabIndex].label}
            key={specialtiesTabs[activeTabIndex].label}
          >
            <SpecialtyTab items={specialtiesTabs[activeTabIndex].items} />
          </Tabs.Panel>
        </div>
      </Tabs>
    </div>
  );
}
