import React from 'react';

import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';

import styles from '@styles/globalStyles.module.css';
import { Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

function Section({ title, Component }) {
  const isSmall = useMediaQuery('(max-width: 800px)');
  const { ref, inView } = useInView({
    threshold: 0,
  });

  return (
    <div className={styles.section} style={{ zIndex: 2 }}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: inView ? 1 : 0, x: inView ? 0 : -50 }}
        transition={{ ease: 'easeOut', duration: 1.5 }}
      >
        <Title style={{ fontSize: 50 }}>{title}</Title>
        <span className={styles.line_top} />
        <span className={styles.line_bottom} />
      </motion.div>
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={{ opacity: inView ? 1 : 0 }}
        transition={{ ease: 'easeOut', duration: 1.5 }}
        style={{ width: isSmall ? '95%' : '100%' }}
      >
        <Component />
      </motion.div>
    </div>
  );
}

export default Section;
