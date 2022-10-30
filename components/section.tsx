import React from 'react';

import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';

import styles from '@styles/globalStyles.module.css';

function Section({ title, Component }) {
  const { ref, inView } = useInView({
    threshold: 0,
  });

  return (
    <div className={styles.page} style={{ zIndex: 2 }}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: inView ? 1 : 0, x: inView ? 0 : -50 }}
        transition={{ ease: 'easeOut', duration: 1.5 }}
      >
        <h1>{title}</h1>
        {/* <LineTop />
        <LineBottom /> */}
      </motion.div>
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={{ opacity: inView ? 1 : 0 }}
        transition={{ ease: 'easeOut', duration: 1.5 }}
      >
        <Component />
      </motion.div>
    </div>
  );
}

export default Section;
