import React from 'react';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

import { useMediaQuery } from '../hooks/useMediaQuery';

interface SectionProps {
  Component: React.ComponentType;
  id?: string;
}

function Section({ Component, id }: SectionProps) {
  const isSmall = useMediaQuery('(max-width: 800px)');
  const { ref, inView } = useInView({
    threshold: 0,
  });

  
  return (
    <div
      id={id} 
      className="flex flex-col relative bg-[radial-gradient(50%_98.88%_at_50%_50%,#16045e_18.23%,#0e021e_100%)] min-h-screen justify-center snap-start"
      style={{ zIndex: 2, scrollSnapStop: 'normal' }}
    > <motion.div
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
