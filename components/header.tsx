'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { useLanguage } from '../hooks/useLanguage';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { smoothScrollToElement } from '../utils/smoothScrollToElement';

export default function Header() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInProjectsSection, setIsInProjectsSection] = useState(false);
  const isSmall = useMediaQuery('(max-width: 850px)');
  const [menuOpen, setMenuOpen] = useState(false);
  const { strings, toggleLocale } = useLanguage();

  useEffect(() => {
    setIsLoaded(true);
    
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const projectsSection = document.getElementById('projects-section');
      
      if (projectsSection) {
        const projectsTop = projectsSection.getBoundingClientRect().top;
        // Trigger transition when projects section is near the top (e.g. 200px threshold)
        setIsInProjectsSection(projectsTop <= 200);
      }
    };

    // Attach scroll listener to the scrollable container instead of window
    const scrollContainer = document.querySelector('.scroll-container');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  if (!isLoaded) {
    return null;
  }

  return (
    <div className={`fixed z-10 top-0 left-0 w-full px-6 md:px-[1%] pt-4 pb-2 grid grid-cols-12 items-center pointer-events-none transition-transform duration-200 ${isSmall && isInProjectsSection ? '-translate-y-full' : ''}`}>
        <div className={`col-span-4 transition-opacity duration-300 pointer-events-auto`}>
          <Link passHref href="/">
            <h2
              className={`font-medium text-white cursor-pointer text-2xl ${isSmall ? 'pt-1' : ''}`}
              style={{ color: 'white' }}
              onClick={() => smoothScrollToElement('hero')}
            >
              W.G
            </h2>
          </Link>
        </div>
        <div className={`transition-all duration-300 pointer-events-none flex items-center ${isInProjectsSection ? 'col-span-8 justify-end pr-8' : (isSmall ? 'col-span-6' : 'absolute left-0 w-full justify-center')}`}>
          <motion.div
            key={isInProjectsSection ? 'projects' : 'hero'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={`flex gap-4 items-center pointer-events-auto ${isInProjectsSection ? 'justify-end' : (isSmall ? 'pt-2 justify-start' : 'justify-center')}`}
          >
            <a
              className="cursor-pointer"
              href="https://github.com/NeoHuncho"
              target="_blank"
              rel="noreferrer"
            >
              <FaGithub size={25} color="white" />
            </a>

            <a
              className="cursor-pointer"
              href="https://www.linkedin.com/in/william-guinaudie/" 
              target="_blank"
              rel="noreferrer"
            >
               <FaLinkedin size={25} color="white" />
            </a>

            <a className="cursor-pointer" href="mailto:william.guinaudie@gmail.com">
              <MdEmail size={28} color="white" />
            </a>
          </motion.div>
        </div>
        {!isInProjectsSection && (
          <button
            type="button"
            aria-label={strings.language.ariaLabel}
            title={strings.language.toggleLabel}
            onClick={toggleLocale}
            className={`pointer-events-auto absolute right-6 top-4 transition-colors aspect-square flex items-center justify-center ${
              isSmall
                ? 'text-white bg-white/10 hover:bg-white/20 rounded-full p-2 border border-white/30'
                : 'text-white bg-white/90 hover:bg-white rounded-full w-8 h-8 border border-white shadow-sm'
            }`}
          >
            <span className="text-lg leading-none lg:-mt-1 lg:-mr-0.5">{strings.language.flagEmoji}</span>
          </button>
        )}
      </div>
    );
}
