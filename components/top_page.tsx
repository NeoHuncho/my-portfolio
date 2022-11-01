import React, { useState } from 'react';
import { motion } from 'framer-motion';

import Image from 'next/image';
import { Grid, Title } from '@mantine/core';
import styles from '@styles/globalStyles.module.css';
import { useMediaQuery } from '@mantine/hooks';

export default function Top_Page({ title, image }: { title: string; image: any }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const isSmall = useMediaQuery('(max-width: 1000px)');
  const variantstext = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  };
  return (
    <div className={styles.page}>
      <div className={styles.scroll_down}>
        <Image src="/assets/ui_img/scroll_down_bar.svg" width={60} height={140} />
      </div>
      <Grid style={{ width: '100%', alignItems: 'center', marginTop: !isSmall ? 0 : '-30%' }}>
        <Grid.Col style={{ display: 'flex' }} span={!isSmall ? 6 : 12} order={!isSmall ? 1 : 3}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={variantstext}
            transition={{ ease: 'easeOut', duration: 1 }}
          >
            <Title style={{ fontSize: !isSmall ? 90 : 50 }}>{title}</Title>
            <span className={styles.line_top} />
            <span className={styles.line_bottom} />
          </motion.div>
        </Grid.Col>
        <Grid.Col order={!isSmall ? 2 : 1} span={!isSmall ? 6 : 12}>
          <motion.div
            initial={{ opacity: 0, x: 0 }}
            animate={imageLoaded && { opacity: [0, 0, 2] }}
            transition={imageLoaded ? { times: [0, 0.6, 1.2], ease: 'easeInOut' } : {}}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 5,
                ease: 'easeInOut',
                loop: Infinity,
              }}
            >
              <Image
                src={image.src}
                alt="Computer"
                width={image.width}
                height={image.height}
                layout="responsive"
                priority
                onLoadingComplete={() => setImageLoaded(true)}
              />
            </motion.div>
          </motion.div>
        </Grid.Col>
      </Grid>
    </div>
  );
}
