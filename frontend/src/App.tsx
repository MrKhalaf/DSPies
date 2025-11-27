/**
 * DSPy Dungeon - Interactive prompt optimization adventure
 * Explore the dungeon, consult the sacred stones, optimize with the Oracle
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import VibrantMode from './components/VibrantMode';
import { DungeonGame } from './game/DungeonGame';

import './App.css';

function App() {
  const [isVibrantMode, setIsVibrantMode] = useState(false);
  const [isClassicMode, setIsClassicMode] = useState(false);

  if (isVibrantMode) {
    return <VibrantMode onExitVibrantMode={() => setIsVibrantMode(false)} />;
  }

  if (isClassicMode) {
    return <DungeonGame />;
  }

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 50%)',
            filter: 'blur(60px)',
          }}
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 50%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 2 + Math.random() * 3,
              height: 2 + Math.random() * 3,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: ['#22d3ee', '#a855f7', '#ec4899', '#fbbf24'][Math.floor(Math.random() * 4)],
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 0.7, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Title */}
      <div className="absolute top-16 text-center z-10">
        <motion.h1
          className="text-5xl md:text-6xl font-black mb-4"
          style={{
            background: 'linear-gradient(135deg, #22d3ee 0%, #a855f7 50%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 60px rgba(34, 211, 238, 0.3)'
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          DSPy DUNGEON
        </motion.h1>
        <p className="text-cyan-300/70 text-sm tracking-widest">
          A PROMPT OPTIMIZATION ADVENTURE
        </p>
      </div>

      {/* Mode Selection */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Ultra Mode - Primary */}
        <motion.button
          onClick={() => setIsVibrantMode(true)}
          className="relative px-10 py-5 rounded-2xl font-black text-white text-xl shadow-2xl overflow-hidden group"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
          }}
          whileHover={{
            scale: 1.05,
            boxShadow: '0 0 60px rgba(34, 211, 238, 0.5), 0 0 100px rgba(168, 85, 247, 0.3)'
          }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Animated border gradient */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: 'linear-gradient(90deg, #22d3ee, #a855f7, #ec4899, #22d3ee)',
              backgroundSize: '300% 100%',
              padding: '3px',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
          
          {/* Inner glow */}
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-50"
            animate={{
              boxShadow: [
                'inset 0 0 30px rgba(34, 211, 238, 0.3)',
                'inset 0 0 40px rgba(168, 85, 247, 0.4)',
                'inset 0 0 30px rgba(34, 211, 238, 0.3)',
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
          
          {/* Button content */}
          <span className="relative flex items-center gap-3">
            <motion.span
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-2xl"
            >
              ⚔️
            </motion.span>
            <span className="tracking-wider">DUNGEON MODE</span>
            <motion.span
              animate={{ 
                rotate: [0, -10, 10, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="text-2xl"
            >
              ⚔️
            </motion.span>
          </span>
        </motion.button>

        {/* Classic Mode - Secondary */}
        <motion.button
          onClick={() => setIsClassicMode(true)}
          className="px-6 py-3 rounded-lg font-bold text-sm border-2 border-green-500/50 text-green-400 hover:bg-green-500/10"
          style={{
            fontFamily: "'Press Start 2P', monospace",
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🎮 CLASSIC MODE
        </motion.button>
      </div>

      {/* Description */}
      <div className="absolute bottom-16 text-center max-w-xl px-8 z-10">
        <p className="text-cyan-300/50 text-xs leading-relaxed">
          Explore the dungeon • Consult the three sacred stones • 
          Gather wisdom • Return to the Oracle • Optimize your prompts with DSPy
        </p>
      </div>
    </div>
  );
}

export default App;
