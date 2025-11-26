import { personalPoints } from '@config/about';
import { motion } from 'framer-motion';

export default function PersonalTab() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-8 max-w-3xl mx-auto px-2"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Beyond the Code</h2>
        <p className="text-gray-400 text-sm md:text-base">A few things that make me, me.</p>
      </div>

      {/* Points - Compact cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {personalPoints.map((point, index) => (
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
                <h3 className="text-base font-bold text-white mb-1">{point.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{point.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
