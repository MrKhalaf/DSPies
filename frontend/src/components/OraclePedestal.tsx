import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OraclePedestalProps {
  enabled: boolean;
  onSummon: () => void;
  notesCount: number;
}

const OraclePedestal: React.FC<OraclePedestalProps> = ({ enabled, onSummon, notesCount }) => {
  return (
    <div className="relative">
      <div className="w-48 h-48 md:w-56 md:h-56 rounded-full border border-cyan-400/30 bg-black/30 grid place-items-center shadow-2xl">
        <div className="text-center">
          <div className="text-4xl md:text-5xl">🔮</div>
          <div className="text-[11px] text-cyan-200/80 mt-1">DSPy Oracle</div>
        </div>
      </div>

      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute -bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.button
              onClick={onSummon}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-2 rounded-xl font-black text-xs bg-gradient-to-r from-yellow-300 to-orange-300 text-black border border-yellow-400/50 shadow-lg"
            >
              Hand Notes to Oracle ({notesCount}/3)
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OraclePedestal;


