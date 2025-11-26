import profileImage from '@assets/about/profile.jpg';
import { professionalPoints } from '@config/about';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function ProfessionalTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-8 max-w-4xl mx-auto px-2"
    >
      {/* Profile Image - Smaller on mobile */}
      <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-3 border-blue-500/40 shadow-xl bg-gray-800 shrink-0">
        <Image src={profileImage} alt="Profile" fill style={{ objectFit: 'cover' }} />
      </div>

      {/* Points Grid - Mobile optimized */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {professionalPoints.map((point, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-gray-800/60 p-4 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:bg-gray-800/80"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">{point.icon}</span>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-blue-400 mb-1">{point.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{point.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
