import React from 'react';
import { motion } from 'framer-motion';

interface VibrantAhaHeaderProps {
  subtitle?: string;
}

const VibrantAhaHeader: React.FC<VibrantAhaHeaderProps> = ({ subtitle }) => {
  return (
    <motion.div
      className="w-full py-6 px-6 md:px-10"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1
            className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-cyan-300 via-pink-300 to-purple-300 bg-clip-text text-transparent"
            style={{ lineHeight: 1.15 }}
          >
            DSPy finds the best prompt automatically
          </h1>
          <p className="mt-1 text-sm md:text-base text-cyan-200/90 font-semibold">
            Generate multiple strategies → test automatically → pick the winner. Clear, fast, optimal.
          </p>
          {subtitle && (
            <p className="mt-1 text-xs md:text-sm text-cyan-200/70">{subtitle}</p>
          )}
        </div>
        <motion.div
          className="hidden md:flex items-center justify-center"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="px-3 py-2 rounded-lg border border-cyan-400/40 bg-black/30 text-cyan-200 text-xs font-bold">
            AHA
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default VibrantAhaHeader;

