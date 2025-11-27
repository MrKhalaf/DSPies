import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOptimization } from '../hooks/useOptimization';
import PhaserCaveScene from './PhaserCaveScene';
import VibrantGameArena from './VibrantGameArena';
import VibrantGameResults from './VibrantGameResults';

interface VibrantModeProps {
  onExitVibrantMode: () => void;
}

type GameStep = 'cave' | 'arena' | 'results';

const VibrantMode: React.FC<VibrantModeProps> = ({ onExitVibrantMode }) => {
  const { state, startOptimization, reset } = useOptimization();
  const [step, setStep] = React.useState<GameStep>('cave');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleHandoff = async ({ message, notes }: { message: string; notes: Record<'v1' | 'v2' | 'v3', string> }) => {
    setIsTransitioning(true);
    
    // Compose input with rich context
    const composed = [
      message && `Challenge: ${message}`,
      `\nWisdoms gathered from the Sacred Stones:`,
      `◈ Stone of Structure: "${notes.v1}"`,
      `❋ Stone of Warmth: "${notes.v2}"`,
      `✦ Stone of Wisdom: "${notes.v3}"`
    ].filter(Boolean).join('\n');
    
    // Small delay for transition effect
    await new Promise(r => setTimeout(r, 500));
    await startOptimization(composed || message || 'Analyze this challenge');
    setStep('arena');
    setIsTransitioning(false);
  };

  useEffect(() => {
    if (state.status === 'complete' && step === 'arena') {
      // Small delay before showing results for dramatic effect
      const timer = setTimeout(() => setStep('results'), 1500);
      return () => clearTimeout(timer);
    }
  }, [state.status, step]);

  const handlePlayAgain = () => {
    reset();
    setStep('cave');
  };

  return (
    <div className="min-h-screen overflow-hidden relative" style={{ 
      background: 'linear-gradient(135deg, #030712 0%, #0a0f1e 30%, #0f172a 60%, #0a0f1e 80%, #030712 100%)',
      color: '#ffffff' 
    }}>
      {/* Deep atmospheric layers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Animated gradient orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, transparent 50%)',
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
            background: 'radial-gradient(circle, rgba(244, 114, 182, 0.15) 0%, transparent 50%)',
            filter: 'blur(60px)',
          }}
        />
        
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34, 211, 238, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 211, 238, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Vignette overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)'
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
              width: 1 + Math.random() * 2,
              height: 1 + Math.random() * 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: ['#22d3ee', '#f472b6', '#fbbf24', '#60a5fa'][Math.floor(Math.random() * 4)],
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Transition overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="relative"
            >
              <div className="w-20 h-20 rounded-full border-4 border-cyan-400/30 border-t-cyan-400 animate-spin" />
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center text-3xl"
              >
                ◈
              </motion.div>
            </motion.div>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute mt-32 text-cyan-300 text-sm font-bold"
            >
              The Oracle awakens...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit Button (show only after cave) */}
      <AnimatePresence>
        {step !== 'cave' && (
          <motion.button
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            onClick={onExitVibrantMode}
            className="fixed top-6 right-6 z-50 px-4 py-2 rounded-xl font-bold text-white text-sm border border-rose-400/40 bg-gradient-to-r from-rose-500/80 to-pink-600/80 shadow-lg shadow-rose-500/20"
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(244, 63, 94, 0.5)' }}
            whileTap={{ scale: 0.95 }}
          >
            ← Exit
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="relative z-10 w-full min-h-screen">
        <AnimatePresence mode="wait">
          {step === 'cave' && (
            <motion.div
              key="cave"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="w-full h-screen"
            >
              <PhaserCaveScene onHandoff={handleHandoff} onExit={onExitVibrantMode} />
            </motion.div>
          )}
          
          {step === 'arena' && (
            <motion.div
              key="arena"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="w-full min-h-screen py-8"
            >
              <VibrantGameArena
                variants={state.variants}
                leader={state.leader}
                status={state.status}
              />
            </motion.div>
          )}
          
          {step === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full min-h-screen py-8"
            >
              <VibrantGameResults
                variants={state.variants}
                leader={state.leader}
                onPlayAgain={handlePlayAgain}
                inputText={state.currentRun?.input_text}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VibrantMode;
