/**
 * The Prompt Chef's Journey
 * An interactive 16-bit pixel art story that teaches DSPy in 10 steps
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DSPyStory } from './components/DSPyStory';
import VibrantMode from './components/VibrantMode';
import { useSimpleDSPyDemo } from './hooks/useSimpleDSPyDemo';

import './App.css';

function App() {
  const [isVibrantMode, setIsVibrantMode] = useState(false);
  const { variants, isRunning, winner, error, startOptimization, reset } = useSimpleDSPyDemo();

  if (isVibrantMode) {
    return <VibrantMode onExitVibrantMode={() => setIsVibrantMode(false)} />;
  }

  return (
    <div className="relative">
      {/* Vibrant Mode Toggle Button */}
      <motion.button
        onClick={() => setIsVibrantMode(true)}
        className="fixed top-6 right-6 z-50 px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-lg font-bold text-white shadow-lg border-2 border-white/50"
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
        ⚡ ENTER VIBRANT MODE ⚡
      </motion.button>

      <DSPyStory
        variants={variants}
        isRunning={isRunning}
        winner={winner}
        onRun={startOptimization}
      />
    </div>
  );
}

export default App;
