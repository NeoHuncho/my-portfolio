import { motion, useScroll, useTransform } from 'framer-motion';
import { useState } from 'react';

import Image from 'next/image';
import { useMediaQuery } from '../hooks/useMediaQuery';

export default function Top_Page({ title, image }: { title: string; image: any }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const isSmall = useMediaQuery('(max-width: 1000px)');
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);

  const variantstext = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  };
  return (
    <div className="flex flex-col relative min-h-screen h-full justify-center bg-[radial-gradient(50%_98.88%_at_50%_50%,#16045e_18.23%,#0e021e_100%)]">
      <motion.div 
        className="fixed z-[1] left-1/2 -translate-x-1/2"
        style={{ opacity , bottom:'0px'}}
      >
        <Image src="/assets/ui_img/scroll_down_bar.svg" width={60} height={140} alt="Scroll down" />
      </motion.div>
      <div className={`w-full items-center grid grid-cols-12 ${isSmall ? '-mt-[55%]' : '-mt-[25%]'}`}>
        <div className={`flex ${!isSmall ? 'col-span-6 order-1' : 'col-span-12 order-3'}`}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={variantstext}
            transition={{ ease: 'easeOut', duration: 1 }}
          >
            <h1 style={{ fontSize: !isSmall ? 90 : 50 }}>{title}</h1>
            <span className={`bg-[#196dbd] block mt-[1vh] h-[0.26vh] rounded-[5px] ${isSmall ? 'w-[30vw]' : 'w-[15vw]'}`} />
            <span className={`bg-[#196dbd] block rounded-[5px] h-[0.26vh] mt-[2vh] mb-[2vh] ml-[7vw] ${isSmall ? 'w-[30vw]' : 'w-[15vw]'}`} />
          </motion.div>
        </div>
        <div className={`${!isSmall ? 'col-span-6 order-2' : 'col-span-12 order-1'}`}>
          <motion.div
            initial={{ opacity: 0, x: 0 }}
            animate={imageLoaded && { opacity: [0, 0, 1] }}
            transition={imageLoaded ? { times: [0, 0.6, 1], ease: 'easeInOut' } : {}}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 5,
                ease: 'easeInOut',
                repeat: Infinity,
                type: "tween"
              }}
              style={{ willChange: 'transform' }}
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
        </div>
      </div>
    </div>
  );
}