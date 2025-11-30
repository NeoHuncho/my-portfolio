'use client';
import type { ProjectCardItem } from '@config/projects';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaGithub } from 'react-icons/fa';
import { useLanguage } from '../../hooks/useLanguage';

interface ProjectCardProps {
  item: ProjectCardItem;
  isCompactArrows: boolean;
}

function ProjectCard({ item, isCompactArrows }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false);
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);
  const [needsCarousel, setNeedsCarousel] = useState(true);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const techContainerRef = useRef<HTMLDivElement>(null);
  const [techEmblaRef, techEmblaApi] = useEmblaCarousel({ 
    align: 'start', 
    containScroll: 'trimSnaps',
    dragFree: true
  });

  const { strings, locale } = useLanguage();

  const checkOverflow = useCallback(() => {
    if (techContainerRef.current) {
      const container = techContainerRef.current;
      // Check if content would overflow by calculating total width of all items
      const itemWidth = 40 + 12; // 40px (w-10) + 12px (gap-3)
      const totalWidth = item.technologies.length * itemWidth;
      const containerWidth = container.clientWidth;
      setNeedsCarousel(totalWidth > containerWidth);
    }
  }, [item.technologies.length]);

  const onSelect = useCallback(() => {
    if (!techEmblaApi) return;
    setCanScrollPrev(techEmblaApi.canScrollPrev());
    setCanScrollNext(techEmblaApi.canScrollNext());
  }, [techEmblaApi]);

  useEffect(() => {
    if (!techEmblaApi) return;
    onSelect();
    techEmblaApi.on('select', onSelect);
    techEmblaApi.on('reInit', onSelect);
    return () => {
      techEmblaApi.off('select', onSelect);
      techEmblaApi.off('reInit', onSelect);
    };
  }, [techEmblaApi, onSelect]);

  useEffect(() => {
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [checkOverflow]);

  const scrollPrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (techEmblaApi) techEmblaApi.scrollPrev();
  }, [techEmblaApi]);

  const scrollNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (techEmblaApi) techEmblaApi.scrollNext();
  }, [techEmblaApi]);

  const handleTechInteraction = useCallback((e: React.MouseEvent | React.TouchEvent | React.WheelEvent) => {
    e.stopPropagation();
  }, []);

  const getStatusColor = (code: number) => {
    switch(code) {
      case 1: return 'bg-blue-600';
      case 2: return 'bg-green-600';
      case 3: return 'bg-red-600';
      default: return 'bg-blue-600';
    }
  };

  const githubLinks = item.github ? (Array.isArray(item.github) ? item.github : [item.github]) : [];
  const statusText = strings.projects.statuses[item.statusCode] ?? item.status;
  const localizedTitle = item.title[locale];
  const localizedSubTitle = item.subTitle[locale];

  return (
    <div
      className="flex flex-col h-full max-h-[70vh] md:max-h-none rounded-2xl shadow-2xl border border-gray-700 bg-gray-800 overflow-hidden transition-all duration-300 ease-out select-none"
      style={{
        transform: hovered && item.link ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      <a
        href={item.link}
        target="_blank"
        rel="noreferrer"
        className="block relative w-full group shrink min-h-[120px] md:shrink-0 md:h-auto"
        onMouseEnter={() => item.link && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative h-[25vh] md:h-80 [@media(max-height:800px)]:md:h-60 w-full overflow-hidden bg-gray-900">
          {item.period && (
            <div className="absolute top-3 left-3 z-10 bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-semibold shadow-lg">
              {item.period}
            </div>
          )}
          <Image
            src={item.image.image.src}
            alt={item.image.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 35vw"
            style={{ objectFit: 'cover' }}
            className={`select-none transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${item.link ? 'transition-transform duration-300 group-hover:scale-105' : ''}`}
            draggable={false}
            onLoad={() => setImageLoaded(true)}
          />
        </div>
      </a>
      
      <div className="flex flex-col grow p-4 md:p-6 [@media(max-height:800px)]:md:p-4 overflow-hidden">
        <div className="grow">
          <div className="flex items-center justify-between mb-2 md:mb-3 [@media(max-height:800px)]:md:mb-2">
            <h3 className="text-xl md:text-2xl [@media(max-height:800px)]:md:text-xl font-bold text-white pr-2">{localizedTitle}</h3>
            {githubLinks.length > 0 && (
              <div className="flex gap-2 shrink-0">
                {githubLinks.map((link, index) => (
                  <a 
                    key={index}
                    href={link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="hover:opacity-80 transition-opacity"
                  >
                    <FaGithub size={24} color="white" />
                  </a>
                ))}
              </div>
            )}
          </div>
          <h5 className="text-sm md:text-base [@media(max-height:800px)]:md:text-sm font-medium text-gray-300 leading-relaxed mb-2 md:mb-4 [@media(max-height:800px)]:md:mb-2 line-clamp-3 md:line-clamp-none">
            {localizedSubTitle}
          </h5>
        </div>

        <div className="mt-auto pt-2 md:pt-4 border-t border-gray-700">
          <div ref={techContainerRef}>
            {needsCarousel ? (
              <div className="relative mb-3 md:mb-5 [@media(max-height:800px)]:md:mb-3">
                {canScrollPrev && (
                  <button
                    onClick={scrollPrev}
                    onMouseDown={(e) => e.stopPropagation()}
                    className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-900/90 hover:bg-gray-900 text-white shadow-lg transition-all ${isCompactArrows ? 'p-1.5' : 'p-2.5'}`}
                    aria-label="Scroll left"
                  >
                    <FaChevronLeft size={isCompactArrows ? 10 : 12} />
                  </button>
                )}
                <div 
                  className="overflow-hidden cursor-grab active:cursor-grabbing pt-12 -mt-12" 
                  ref={techEmblaRef}
                  data-tech-carousel
                  onPointerDown={handleTechInteraction}
                  onWheel={handleTechInteraction}
                >
                  <div className="flex gap-3">
                    {item.technologies.map((technology, index) => (
                      <div 
                        key={index} 
                        className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm transition-all shrink-0"
                        onMouseEnter={() => setHoveredTech(technology.name)}
                        onMouseLeave={() => setHoveredTech(null)}
                      >
                        <div className="relative w-6 h-6">
                          <Image
                            alt={technology.name}
                            src={technology.image.src}
                            fill
                            sizes="24px"
                            style={{ objectFit: 'contain' }}
                            className="select-none"
                            draggable={false}
                          />
                        </div>
                        {hoveredTech === technology.name && (
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shadow-lg z-20 pointer-events-none">
                            {technology.name}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {canScrollNext && (
                  <button
                    onClick={scrollNext}
                    onMouseDown={(e) => e.stopPropagation()}
                    className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-900/90 hover:bg-gray-900 text-white shadow-lg transition-all ${isCompactArrows ? 'p-1.5' : 'p-2.5'}`}
                    aria-label="Scroll right"
                  >
                    <FaChevronRight size={isCompactArrows ? 10 : 12} />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex gap-3 justify-center mb-3 md:mb-5 [@media(max-height:800px)]:md:mb-3">
                {item.technologies.map((technology, index) => (
                  <div 
                    key={index}  
                    className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm transition-all"
                    onMouseEnter={() => setHoveredTech(technology.name)}
                    onMouseLeave={() => setHoveredTech(null)}
                  >
                    <div className="relative w-6 h-6">
                      <Image
                        alt={technology.name}
                        src={technology.image.src}
                        fill
                        sizes="24px"
                        style={{ objectFit: 'contain' }}
                        className="select-none"
                        draggable={false}
                      />
                    </div>
                    {hoveredTech === technology.name && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shadow-lg z-20 pointer-events-none">
                        {technology.name}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            disabled
            className={`w-full py-2.5 rounded-lg font-semibold text-white text-sm tracking-wide uppercase shadow-md ${getStatusColor(item.statusCode)}`}
          >
            {statusText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(ProjectCard);
