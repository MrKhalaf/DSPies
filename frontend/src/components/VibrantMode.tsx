import React from 'react';
import { motion } from 'framer-motion';
import VibrantAhaHeader from './VibrantAhaHeader';
import VibrantInputPanel from './VibrantInputPanel';
import VibrantCompactResults from './VibrantCompactResults';
import { useOptimization } from '../hooks/useOptimization';

interface VibrantModeProps {
  onExitVibrantMode: () => void;
}

const VibrantMode: React.FC<VibrantModeProps> = ({ onExitVibrantMode }) => {
  const { state, startOptimization, error } = useOptimization();
  const isRunning = state.status === 'compiling' || state.status === 'running';

  return (
    <div className="min-h-screen overflow-hidden relative" style={{ background: 'linear-gradient(to bottom right, #581c87, #1e3a8a, #000000)', color: '#ffffff' }}>
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(0, 255, 255, 0.3) 25%, rgba(0, 255, 255, 0.3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, 0.3) 75%, rgba(0, 255, 255, 0.3) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(0, 255, 255, 0.3) 25%, rgba(0, 255, 255, 0.3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, 0.3) 75%, rgba(0, 255, 255, 0.3) 76%, transparent 77%, transparent)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Exit Button */}
      <motion.button
        onClick={onExitVibrantMode}
        className="fixed top-6 right-6 z-50 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg font-bold text-white shadow-lg shadow-pink-500/50 border-2 border-pink-400 text-sm"
        whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(236, 72, 153, 0.8)' }}
        whileTap={{ scale: 0.95 }}
      >
        ← EXIT
      </motion.button>

      {/* AHA Header */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <VibrantAhaHeader />
      </div>

      {/* Split Pane */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-6">
        <div
          className="rounded-2xl border border-cyan-400/30 bg-black/30 overflow-hidden"
          style={{ height: 'calc(100vh - 150px)' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 h-full">
            {/* Left: Input */}
            <div className="border-b md:border-b-0 md:border-r border-cyan-400/20">
              <VibrantInputPanel
                onRun={(text) => startOptimization(text)}
                isRunning={isRunning}
                disabled={!!error}
              />
            </div>

            {/* Right: Results */}
            <div className="h-full">
              <VibrantCompactResults
                variants={state.variants}
                leader={state.leader}
                status={state.status}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VibrantMode;
