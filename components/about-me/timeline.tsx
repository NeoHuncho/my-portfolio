import React from 'react';

import { Text, Timeline, Title } from '@mantine/core';
import timeline_items from '@config/about-me/timeline_items';
import { GiEarthAfricaEurope } from 'react-icons/gi';
import { FaUniversity } from 'react-icons/fa';
import { MdWork } from 'react-icons/md';

export default function TimelineComponent() {
  return (
    <Timeline
      active={10}
      bulletSize={26}
      lineWidth={2}
      style={{ maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}
      styles={{ itemBullet: { marginTop: 5 } }}
    >
      {timeline_items.map((item, index) => (
        <Timeline.Item
          bullet={
            item.icon === 'work' ? (
              <MdWork />
            ) : item.icon === 'university' ? (
              <FaUniversity />
            ) : (
              <GiEarthAfricaEurope />
            )
          }
          title={<Title order={3}> {item.heading}</Title>}
        >
          <Title order={6}>{item.date}</Title>
          <ul>
            {item.points.map((point, sub_index) => {
              if (typeof point === 'string') return <li key={sub_index}>{point}</li>;
              return (
                <>
                  <li key={index}>
                    <Text>{point[0]}</Text>
                  </li>
                  <ul>
                    {point[1].map((subpoint, sub_sub_index) => (
                      <li key={sub_sub_index}>
                        {' '}
                        <Text>{subpoint}</Text>
                      </li>
                    ))}
                  </ul>
                </>
              );
            })}
          </ul>
        </Timeline.Item>
      ))}
    </Timeline>
  );
}
//animate={{ opacity: inView ? 1 : 0 }}
