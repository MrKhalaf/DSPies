/**
 * The Prompt Chef's Journey
 * An interactive 16-bit pixel art story that teaches DSPy in 10 steps
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { StoryContainer } from './components/StoryMode/StoryContainer';
import { useSimpleDSPyDemo } from './hooks/useSimpleDSPyDemo';

import './App.css';

function App() {
  const [isVibrantMode, setIsVibrantMode] = useState(false);
  // The hook is now used inside StoryContainer, but we might keep it here if we want to share state,
  // or just let StoryContainer handle it. For now, let's keep App clean.

  if (isVibrantMode) {
    return <StoryContainer onExit={() => setIsVibrantMode(false)} />;
  }

  return (
    <div className="relative min-h-screen bg-gray-900 flex items-center justify-center">
      {/* Vibrant Mode Toggle Button */}
      <motion.button
        onClick={() => setIsVibrantMode(true)}
        className="px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-lg font-bold text-white shadow-lg border-2 border-white/50 text-xl"
        whileHover={{
          scale: 1.05,
          boxShadow: '0 0 30px rgba(236, 72, 153, 0.8), 0 0 60px rgba(0, 255, 255, 0.4)'
        }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: [
            '0 0 20px rgba(236, 72, 153, 0.5)',
            '0 0 30px rgba(0, 255, 255, 0.5)',
            '0 0 20px rgba(236, 72, 153, 0.5)'
          ]
        }}
        transition={{
          boxShadow: { duration: 2, repeat: Infinity }
        }}
      >
        ⚡ START THE JOURNEY ⚡
      </motion.button>

      <div className="absolute bottom-10 text-gray-500 text-sm">
        Click to enter the Prompt Chef's Journey
      </div>
    </div>
  );
}

export default App;
