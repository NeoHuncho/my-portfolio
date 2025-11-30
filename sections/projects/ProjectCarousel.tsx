'use client';
import type { ProjectCardItem } from '@config/projects';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import ProjectCard from './ProjectCard';

interface ProjectCarouselProps {
  items: ProjectCardItem[];
}

export default function ProjectCarousel({ items }: ProjectCarouselProps) {
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isCompactArrows = useMediaQuery('(max-width: 768px)');
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start', 
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
    dragFree: true,
    watchDrag: (emblaApi, evt) => {
      const target = evt.target as HTMLElement;
      // Prevent dragging if the event originated from tech carousel
      return !target.closest('[data-tech-carousel]');
    }
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col justify-center"
    >
      <div className="relative">
        {canScrollPrev && (
          <button
            onClick={scrollPrev}
            className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-gray-900/80 hover:bg-gray-900 text-white rounded-full shadow-xl transition-all backdrop-blur-sm border border-gray-700/50 ${isCompactArrows ? 'p-2' : 'p-3'}`}
            aria-label="Scroll left"
          >
            <FaChevronLeft size={isCompactArrows ? 14 : 16} />
          </button>
        )}
        {canScrollNext && (
          <button
            onClick={scrollNext}
            className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-gray-900/80 hover:bg-gray-900 text-white rounded-full shadow-xl transition-all backdrop-blur-sm border border-gray-700/50 ${isCompactArrows ? 'p-2' : 'p-3'}`}
            aria-label="Scroll right"
          >
            <FaChevronRight size={isCompactArrows ? 14 : 16} />
          </button>
        )}
        <div className="overflow-hidden cursor-grab active:cursor-grabbing h-auto flex flex-col justify-center" ref={emblaRef}>
          <div className="flex -ml-6 py-4">
            {items.map((item, index) => (
              <div 
                className="flex-[0_0_100%] md:flex-[0_0_60%] [@media(max-height:800px)]:md:flex-[0_0_50%] 2xl:flex-[0_0_35%] min-w-0 pl-6 flex flex-col justify-center" 
                key={`${item.image.name}-${index}`}
              >
                <ProjectCard item={item} isCompactArrows={isCompactArrows} />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {items.length > 1 && (
        <div className="flex justify-center gap-2 mt-4 pb-4">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`transition-all duration-300 rounded-full ${
                index === selectedIndex
                  ? 'w-3 h-3 bg-blue-400 ring-2 ring-blue-200 shadow-[0_0_8px_rgba(59,130,246,0.45)]'
                  : 'w-2 h-2 bg-gray-600 hover:bg-gray-500 ring-1 ring-transparent'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
