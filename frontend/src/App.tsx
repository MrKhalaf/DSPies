/**
 * DSPy Quest - Pokemon-style Prompt Optimization Adventure
 * Explore, battle, and learn DSPy through an immersive game experience
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import VibrantMode from './components/VibrantMode';
import { DungeonGame } from './game/DungeonGame';

import './App.css';

function App() {
  const [isVibrantMode, setIsVibrantMode] = useState(false);
  const [isClassicMode, setIsClassicMode] = useState(false);

  // Memoize particles to prevent re-renders
  const particles = useMemo(() => 
    [...Array(50)].map((_, i) => ({
      id: i,
      size: 2 + Math.random() * 4,
      left: Math.random() * 100,
      top: Math.random() * 100,
      color: ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#22d3ee'][Math.floor(Math.random() * 5)],
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 3,
    }))
  , []);

  if (isVibrantMode) {
    return <VibrantMode onExitVibrantMode={() => setIsVibrantMode(false)} />;
  }

  if (isClassicMode) {
    return <DungeonGame />;
  }

  return (
    <div className="relative min-h-screen bg-[#0f0f23] flex items-center justify-center overflow-hidden">
      {/* Deep space background */}
      <div className="absolute inset-0">
        {/* Gradient layers */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 20% 100%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 80% 100%, rgba(34, 211, 238, 0.08) 0%, transparent 50%),
              linear-gradient(180deg, #0a0a1a 0%, #0f0f23 50%, #1a1a2e 100%)
            `
          }}
        />
        
        {/* Subtle grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99, 102, 241, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px'
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              top: `${p.top}%`,
              backgroundColor: p.color,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        {/* Logo/Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 1 }}
          className="mb-6"
        >
          <motion.div
            animate={{ 
              filter: [
                'drop-shadow(0 0 20px rgba(99, 102, 241, 0.5))',
                'drop-shadow(0 0 40px rgba(139, 92, 246, 0.7))',
                'drop-shadow(0 0 20px rgba(99, 102, 241, 0.5))'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-7xl"
          >
            ⚗️
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-7xl font-black mb-3 tracking-tight"
          style={{
            fontFamily: "'Press Start 2P', system-ui, sans-serif",
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 30%, #a855f7 60%, #22d3ee 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 80px rgba(99, 102, 241, 0.4)'
          }}
        >
          DSPy QUEST
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-indigo-300/70 text-sm tracking-[0.3em] mb-12 uppercase"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          Pokemon-Style Optimization
        </motion.p>

        {/* Main Play Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={() => setIsVibrantMode(true)}
          className="relative group mb-6"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Glow effect */}
          <motion.div
            className="absolute -inset-1 rounded-2xl opacity-75 blur-lg"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)',
            }}
            animate={{
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Button */}
          <div 
            className="relative px-12 py-5 rounded-2xl border-4 border-indigo-500/50"
            style={{
              background: 'linear-gradient(180deg, #1a1a3e 0%, #0f0f28 100%)',
              fontFamily: "'Press Start 2P', monospace",
            }}
          >
            <div className="flex items-center gap-4 text-white">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-2xl"
              >
                🎮
              </motion.span>
              <span className="text-lg tracking-wider">PLAY GAME</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="text-xl"
              >
                ▶
              </motion.span>
            </div>
          </div>
        </motion.button>

        {/* Classic Mode Link */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          onClick={() => setIsClassicMode(true)}
          className="px-6 py-2 text-xs text-indigo-400/60 hover:text-indigo-300 transition-colors"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          [ CLASSIC MODE ]
        </motion.button>

        {/* Description */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-16 max-w-lg"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-indigo-500/50" />
            <span className="text-indigo-400/60 text-[10px] tracking-widest" style={{ fontFamily: "'Press Start 2P', monospace" }}>
              HOW TO PLAY
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-indigo-500/50" />
          </div>
          <p className="text-indigo-300/40 text-[10px] leading-relaxed" style={{ fontFamily: "'Press Start 2P', monospace" }}>
            Explore the dungeon • Battle the Sacred Stones • 
            Learn DSPy secrets • Face the Oracle • 
            Witness prompt optimization in action!
          </p>
        </motion.div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-indigo-500/20 rounded-tl-lg" />
      <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-indigo-500/20 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-purple-500/20 rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-purple-500/20 rounded-br-lg" />
    </div>
  );
}

export default App;
