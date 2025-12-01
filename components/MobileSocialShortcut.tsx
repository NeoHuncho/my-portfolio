'use client';
import { useEffect, useState } from 'react';
import { type IconType } from 'react-icons';
import { FaComments, FaGithub, FaLinkedin } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { useLanguage } from '../hooks/useLanguage';
import { useMediaQuery } from '../hooks/useMediaQuery';

const socialLinks: Array<{ label: string; href: string; icon: IconType }> = [
  {
    label: 'GitHub',
    href: 'https://github.com/NeoHuncho',
    icon: FaGithub,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/william-g-178156180/',
    icon: FaLinkedin,
  },
  {
    label: 'Email',
    href: 'mailto:william.guinaudie@gmail.com',
    icon: MdEmail,
  },
];

export default function MobileSocialShortcut() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isPastInitial, setIsPastInitial] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { strings } = useLanguage();

  useEffect(() => {
    if (!isMobile) {
      setIsPastInitial(false);
      setIsOpen(false);
      return;
    }

    const scrollContainer = document.querySelector('.scroll-container');
    if (!scrollContainer) {
      return;
    }

    const evaluateVisibility = () => {
      const projectsSection = document.getElementById('projects-section');
      if (!projectsSection) {
        return;
      }

      const threshold = window.innerHeight * 0.1;
      const projectsTop = projectsSection.getBoundingClientRect().top;
      const reachedProjects = projectsTop <= threshold;
      setIsPastInitial(reachedProjects);
      if (!reachedProjects) {
        setIsOpen(false);
      }
    };

    evaluateVisibility();
    scrollContainer.addEventListener('scroll', evaluateVisibility, { passive: true });
    window.addEventListener('resize', evaluateVisibility);

    return () => {
      scrollContainer.removeEventListener('scroll', evaluateVisibility);
      window.removeEventListener('resize', evaluateVisibility);
    };
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile || !isPastInitial) {
      setIsOpen(false);
    }
  }, [isMobile, isPastInitial]);

  if (!isMobile || !isPastInitial) {
    return null;
  }

  return (
    <div className="fixed bottom-5 left-4 z-50 flex items-center gap-2">
      {isOpen && (
        <div className="flex items-center gap-3 px-3 py-2 bg-black/80 border border-white/20 rounded-full shadow-xl backdrop-blur-sm">
          {socialLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              aria-label={item.label}
              className="text-white hover:text-blue-300 transition"
            >
              <item.icon size={20} />
            </a>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={strings.socialShortcut.openLabel}
        aria-expanded={isOpen}
        className="bg-white/10 text-white hover:bg-white/20 transition-colors rounded-full p-3 shadow-xl border border-white/30 backdrop-blur-sm"
      >
        <FaComments size={18} />
      </button>
    </div>
  );
}
