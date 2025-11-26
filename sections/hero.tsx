import { motion } from 'framer-motion';
import { useState } from 'react';
import { FaArrowDown } from 'react-icons/fa';

import Image from 'next/image';
import Link from 'next/link';
import { useMediaQuery } from '../hooks/useMediaQuery';

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
      id="hero"
      className="flex flex-col relative min-h-screen h-full justify-center bg-[radial-gradient(50%_98.88%_at_50%_50%,#16045e_18.23%,#0e021e_100%)] snap-start"
      style={{ zIndex: link ? 2 : 1, minHeight: link && isSmall ? '70vh' : '100vh', scrollSnapStop: 'normal' }}
    >
      {!link && (
        <button 
          onClick={() => {
            const projectsSection = document.getElementById('projects-section');
            if (projectsSection) {
              projectsSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10 cursor-pointer hover:opacity-80 transition-opacity"
          aria-label="Scroll to projects"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-4 shadow-lg"
          >
            <FaArrowDown size={24} color="white" />
          </motion.div>
        </button>
      )}
      <div className={`w-full items-center grid grid-cols-12 px-4 md:px-8 ${isSmall ? '-mt-[30%]' : '-mt-24'}`}>
        <div className={`flex ${!isSmall ? 'col-span-6 order-1' : 'col-span-12 order-3'}`}>
          <Link href={link || ''} passHref>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={variantstext}
              transition={{ ease: 'easeOut', duration: 1 }}
              style={{ cursor: link ? 'pointer' : '' }}
            >
              <h1 className='font-extrabold' style={{ fontSize: !isSmall ? 90 : 50, color: 'whitesmoke' }}>{title}</h1>
              <span className={`bg-[#196dbd] block mt-[1vh] h-[0.26vh] rounded-[5px] ${isSmall ? 'w-[30vw]' : 'w-[15vw]'}`} />
              <span className={`bg-[#196dbd] block rounded-[5px] h-[0.26vh] mt-[2vh] mb-[2vh] ml-[7vw] ${isSmall ? 'w-[30vw]' : 'w-[15vw]'}`} />
              {subTitle && <h2 style={{ fontWeight: 300, fontSize: 37, color: 'white' }}>{subTitle}</h2>}
            </motion.div>
          </Link>
        </div>
        <div className={`${!isSmall ? 'col-span-6 order-2' : 'col-span-12 order-1'}`}>
          <Link href={link || ''} passHref>
            <motion.div
              initial={link ? { opacity: 0, x: 0 } : { opacity: 0, x: 50, y: -50 }}
              animate={imageLoaded && (link ? { opacity: [0, 0, 1] } : { opacity: 1, x: 0, y: 0 })}
              transition={
                imageLoaded
                  ? link
                    ? { times: [0, 0.6, 1], ease: 'easeInOut' }
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
                  repeat: Infinity,
                  type: "tween"
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
        </div>
      </div>
    </div>
  );
}
