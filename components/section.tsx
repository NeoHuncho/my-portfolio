import React from 'react';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

import { useMediaQuery } from '../hooks/useMediaQuery';

interface SectionProps {
  title: string;
  Component: React.ComponentType;
}

function Section({ title, Component }: SectionProps) {
  const isSmall = useMediaQuery('(max-width: 800px)');
  const { ref, inView } = useInView({
    threshold: 0,
  });

  return (
    <div 
      className="flex flex-col relative bg-[radial-gradient(50%_98.88%_at_50%_50%,#16045e_18.23%,#0e021e_100%)] pb-[5%] min-h-screen justify-center"
      style={{ zIndex: 2 }}
    >
      <motion.div
        ref={ref}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: inView ? 1 : 0, x: inView ? 0 : -50 }}
        transition={{ ease: 'easeOut', duration: 1.5 }}
      >
        <h1 style={{ fontSize: 50 }}>{title}</h1>
        <span className={`bg-[#196dbd] block mt-[1vh] h-[0.26vh] rounded-[5px] ${isSmall ? 'w-[30vw]' : 'w-[15vw]'}`} />
        <span className={`bg-[#196dbd] block rounded-[5px] h-[0.26vh] mt-[2vh] mb-[2vh] ml-[7vw] ${isSmall ? 'w-[30vw]' : 'w-[15vw]'}`} />
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
