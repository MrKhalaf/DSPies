/**
 * DSPy Dungeon - Pokemon-style prompt optimization adventure
 * Walk around, consult three wise elders, optimize your prompts
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DungeonGame } from './game/DungeonGame';

import './App.css';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);

  if (isPlaying) {
    return <DungeonGame />;
  }

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center">
      {/* Title */}
      <div className="absolute top-20 text-center">
        <motion.h1
          className="text-6xl font-bold mb-4"
          style={{
            fontFamily: "'Press Start 2P', monospace",
            color: '#9bbc0f',
            textShadow: '4px 4px 0px #0f380f'
          }}
          animate={{
            textShadow: [
              '4px 4px 0px #0f380f',
              '6px 6px 0px #0f380f',
              '4px 4px 0px #0f380f'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          DSPy DUNGEON
        </motion.h1>
        <p
          className="text-sm"
          style={{
            fontFamily: "'Press Start 2P', monospace",
            color: '#306230',
            lineHeight: 1.8
          }}
        >
          A PROMPT OPTIMIZATION ADVENTURE
        </p>
      </div>

      {/* Start Button */}
      <motion.button
        onClick={() => setIsPlaying(true)}
        className="px-8 py-4 rounded-lg font-bold shadow-lg border-4 text-xl"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          background: '#9bbc0f',
          color: '#0f380f',
          borderColor: '#0f380f',
        }}
        whileHover={{
          scale: 1.05,
          boxShadow: '0 0 30px rgba(155, 188, 15, 0.8)'
        }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: [
            '0 0 20px rgba(155, 188, 15, 0.5)',
            '0 0 30px rgba(155, 188, 15, 0.7)',
            '0 0 20px rgba(155, 188, 15, 0.5)'
          ]
        }}
        transition={{
          boxShadow: { duration: 2, repeat: Infinity }
        }}
      >
        ▶ START GAME
      </motion.button>

      {/* Instructions */}
      <div
        className="absolute bottom-20 text-center max-w-2xl px-8"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          color: '#306230',
          fontSize: '10px',
          lineHeight: 2
        }}
      >
        <p className="mb-4">SEEK THE WISDOM OF THREE ELDERS</p>
        <p className="mb-4">BRING THEIR KNOWLEDGE TO THE COMPUTER</p>
        <p>OPTIMIZE YOUR PROMPTS WITH DSPy</p>
      </div>
    </div>
  );
}

export default App;
