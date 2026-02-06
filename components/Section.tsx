import React, { memo } from 'react';
import { useInView } from 'react-intersection-observer';
import { useMediaQuery } from '../hooks/useMediaQuery';

type SectionProps = {
  Component: React.ComponentType;
  id?: string;
};

function Section({ Component, id }: SectionProps) {
  const isSmall = useMediaQuery('(max-width: 800px)');
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true,
    rootMargin: '200px 0px', // Start loading 200px before section enters viewport
  });

  return (
    <div
      id={id}
      className="flex flex-col relative bg-[radial-gradient(50%_98.88%_at_50%_50%,#16045e_18.23%,#0e021e_100%)] min-h-screen h-screen scroll-section overflow-hidden"
      style={{ zIndex: 2 }}
    >
      <div
        ref={ref}
        className={`h-full w-full flex flex-col transform-gpu transition-opacity duration-500 ${inView ? 'opacity-100' : 'opacity-0'}`}
        style={{ width: isSmall ? '95%' : '100%', margin: isSmall ? '0 auto' : undefined }}
      >
        <Component />
      </div>
    </div>
  );
}

export default memo(Section);
