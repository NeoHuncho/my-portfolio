import React, { useState } from 'react';
import { motion } from 'framer-motion';

import Image from 'next/image';
import { Grid, Title } from '@mantine/core';
import styles from '@styles/globalStyles.module.css';
import { useMediaQuery } from '@mantine/hooks';
import Link from 'next/link';

export default function IndexPage({
  title,
  image,
  link,
  subTitle,
}: {
  title: string;
  image: any;
  link?: string;
  subTitle?: string;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const isSmall = useMediaQuery('(max-width: 1000px)');
  const variantstext = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  };
  return (
    <div
      className={styles.page}
      style={{ zIndex: link ? 2 : 1, minHeight: link && isSmall ? '70vh' : '100vh' }}
    >
      {!link && (
        <div className={styles.scroll_down}>
          <Image
            src="/assets/ui_img/scroll_down_bar.svg"
            width={!isSmall ? 60 : 45}
            height={!isSmall ? 140 : 105}
          />
        </div>
      )}
      <Grid style={{ width: '100%', alignItems: 'center', marginTop: !isSmall ? 0 : '-30%' }}>
        <Grid.Col style={{ display: 'flex' }} span={!isSmall ? 6 : 12} order={!isSmall ? 1 : 3}>
          <Link href={link || ''} passHref>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={variantstext}
              transition={{ ease: 'easeOut', duration: 1 }}
              style={{ cursor: link ? 'pointer' : '' }}
            >
              <Title style={{ fontSize: !isSmall ? 90 : 50, color: 'whitesmoke' }}>{title}</Title>
              <span className={styles.line_top} />
              <span className={styles.line_bottom} />
              {subTitle && <Title style={{ fontWeight: 300, fontSize: 37 }}>{subTitle}</Title>}
            </motion.div>
          </Link>
        </Grid.Col>
        <Grid.Col order={!isSmall ? 2 : 1} span={!isSmall ? 6 : 12}>
          <Link href={link || ''} passHref>
            <motion.div
              initial={link ? { opacity: 0, x: 0 } : { opacity: 0, x: 50, y: -50 }}
              animate={imageLoaded && (link ? { opacity: [0, 0, 2] } : { opacity: 1, x: 0, y: 0 })}
              transition={
                imageLoaded
                  ? link
                    ? { times: [0, 0.6, 1.2], ease: 'easeInOut' }
                    : { ease: 'easeOut', duration: 1.5 }
                  : {}
              }
              style={{ cursor: link ? 'pointer' : '' }}
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
          </Link>
        </Grid.Col>
      </Grid>
    </div>
  );
}
