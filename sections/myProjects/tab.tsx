import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

interface Technology {
  name: string;
  image: { src: string };
}

interface ProjectItem {
  link?: string;
  image: { name: string; image: { src: string } };
  title: string;
  github?: string;
  subTitle: string;
  technologies: Technology[];
  statusCode: number;
  status: string;
  period?: string;
}

const ProjectCard = ({ item }: { item: ProjectItem }) => {
  const [hovered, setHovered] = useState(false);
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);

  const getStatusColor = (code: number) => {
      switch(code) {
          case 1: return 'bg-blue-600';
          case 2: return 'bg-green-600';
          case 3: return 'bg-red-600';
          default: return 'bg-blue-600';
      }
  };

  return (
    <div
      className="h-full flex flex-col rounded-2xl shadow-2xl border border-gray-700 bg-gray-800 overflow-hidden transition-transform duration-300 ease-out"
      style={{
        transform: hovered && item.link ? 'scale(1.02)' : 'scale(1)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <a href={item.link} target="_blank" rel="noreferrer" className="block relative w-full group">
        <div className="relative h-64 w-full overflow-hidden bg-gray-900">
           {item.period && (
             <div className="absolute top-3 left-3 z-10 bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-semibold shadow-lg">
               {item.period}
             </div>
           )}
           <Image
              src={item.image.image.src}
              alt={item.image.name}
              fill
              style={{ objectFit: 'cover' }}
              className={item.link ? 'transition-transform duration-500 group-hover:scale-110' : ''}
              unoptimized
           />
        </div>
      </a>
      
      <div className="flex flex-col flex-grow p-6">
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-2xl font-bold text-white truncate pr-2">{item.title}</h3>
            {item.github && (
              <a href={item.github} target="_blank" className="flex-shrink-0 hover:opacity-80 transition-opacity">
                <Image src="/assets/socials/github_white.svg" height={24} width={24} alt="Github" />
              </a>
            )}
          </div>
          <h5 className="text-base font-medium text-gray-300 leading-relaxed mb-4">
            {item.subTitle}
          </h5>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-700">
          <div className="flex flex-wrap gap-3 justify-center mb-5">
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
                    style={{ objectFit: 'contain' }}
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

          <button
            disabled
            className={`w-full py-2.5 rounded-lg font-semibold text-white text-sm tracking-wide uppercase shadow-md ${getStatusColor(item.statusCode)}`}
          >
            {item.status}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProjectTab = ({ items }: { items: ProjectItem[] }) => {
  const [emblaRef] = useEmblaCarousel({ 
      align: 'start', 
      slidesToScroll: 1,
      containScroll: 'trimSnaps',
      dragFree: true
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8"
    >
      <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
        <div className="flex -ml-6 py-4">
            {items.map((item) => (
            <div 
                className={`flex-[0_0_85%] md:flex-[0_0_45%] lg:flex-[0_0_35%] min-w-0 pl-6`} 
                key={item.title}
            >
                <ProjectCard item={item} />
            </div>
            ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectTab;
