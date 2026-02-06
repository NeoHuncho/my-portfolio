import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FaArrowDown } from 'react-icons/fa';
import type { Locale } from '../../config/translations';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { smoothScrollToElement } from '../../utils/smoothScrollToElement';

type HeroSectionProps = {
  title: string;
  image: {
    src: string;
    width: number;
    height: number;
  };
  link?: string;
  subTitle?: string;
  ctaLabel?: string;
  locale?: Locale;
};

export default function HeroSection({ title, image, link, subTitle, ctaLabel, locale }: HeroSectionProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const isSmall = useMediaQuery('(max-width: 1000px)');
  const isNarrow = useMediaQuery('(max-width: 410px)');

  return (
    <div
      id="hero"
      className="flex flex-col relative min-h-screen h-screen justify-center bg-[radial-gradient(50%_98.88%_at_50%_50%,#16045e_18.23%,#0e021e_100%)] scroll-section overflow-x-hidden"
      style={{ zIndex: link ? 2 : 1 }}
    >
      {!link && (
        <button
          onClick={() => smoothScrollToElement('projects-section')}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10 cursor-pointer hover:opacity-80 transition-opacity"
          aria-label={ctaLabel ?? 'Scroll to projects'}
        >
          <div
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-4 shadow-lg animate-bounce-slow"
          >
            <FaArrowDown size={24} color="white" />
          </div>
        </button>
      )}
      <div
        className={`w-full items-center grid grid-cols-12 px-4 md:px-8 ${isSmall ? '-mt-[30%]' : '-mt-24'}`}
      >
        <div className={`flex ${!isSmall ? 'col-span-6 order-1' : 'col-span-12 order-3'}`}>
          <Link href={link || ''} passHref>
            <div
              className={imageLoaded ? 'animate-fade-in-left' : ''}
              style={{ 
                cursor: link ? 'pointer' : '', 
                animationDelay: imageLoaded ? '100ms' : '0ms',
                opacity: imageLoaded ? undefined : 0
              }}
            >
              <h1
                className="font-extrabold"
                style={{ fontSize: !isSmall ? 90 : 50, color: 'whitesmoke' }}
              >
                {title}
              </h1>
              <span
                className={`bg-[#196dbd] block mt-[1vh] h-[0.26vh] rounded-[5px] ${isSmall ? 'w-[30vw]' : 'w-[15vw]'}`}
              />
              <span
                className={`bg-[#196dbd] block rounded-[5px] h-[0.26vh] mt-[2vh] mb-[2vh] ml-[7vw] ${isSmall ? 'w-[30vw]' : 'w-[15vw]'}`}
              />
              {subTitle && (
                <h2 style={{ fontWeight: 300, fontSize: isNarrow && locale === 'fr' ? 33 : 37, color: 'white' }}>{subTitle}</h2>
              )}
            </div>
          </Link>
        </div>
        <div className={`${!isSmall ? 'col-span-6 order-2' : 'col-span-12 order-1'}`}>
          <Link href={link || ''} passHref>
            <div
              className={`transform-gpu ${imageLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ cursor: link ? 'pointer' : '' }}
            >
              <div className={imageLoaded ? 'animate-float' : ''}>
                <Image
                  src={image.src}
                  alt=""
                  width={image.width}
                  height={image.height}
                  style={{ width: '100%', height: 'auto' }}
                  onLoad={() => setImageLoaded(true)}
                  priority
                  sizes="(max-width: 1000px) 100vw, 50vw"
                />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
