import React from 'react';
import { InView } from 'react-intersection-observer';
import styles from '@styles/globalStyles.module.css';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Grid, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import main_img from '../../public/assets/main_img/main_img';
import information_items from '../../config/about-me/information_items';

export default function MoreInformation() {
  const isSmall = useMediaQuery('(max-width: 650px)');
  const AnimatedImage = motion(Image);
  const AnimatetCol = motion(Grid.Col);
  return (
    <Grid style={{ marginBottom: isSmall ? 30 : 0 }}>
      <AnimatetCol
        span={!isSmall ? 4 : 12}
        initial={{ opacity: 0 }}
        transition={{ ease: 'easeOut', duration: 1.25 }}
        animate={{ opacity: InView ? 1 : 0 }}
      >
        <AnimatedImage
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 5,
            ease: 'easeInOut',
            loop: Infinity,
          }}
          src={main_img.me_front.src}
          alt="Computer"
          width={985}
          height={1157}
        />
      </AnimatetCol>
      <AnimatetCol
        span={!isSmall ? 8 : 12}
        initial={{ opacity: 0 }}
        transition={{ ease: 'easeOut', duration: 1.25 }}
        animate={{ opacity: InView ? 1 : 0 }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: isSmall ? 20 : 10,
            height: '100%',
            justifyContent: 'space-around',
            marginLeft: '5%',
          }}
        >
          {information_items.map((item, index) => (
            <Text align="justify" size={isSmall ? 'md' : 'xl'} key={index}>
              {item}
            </Text>
          ))}
        </div>
      </AnimatetCol>
    </Grid>
  );
}
