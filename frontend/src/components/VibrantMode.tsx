import React from 'react';
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

  const handleHandoff = async ({ message, notes }: { message: string; notes: Record<'v1' | 'v2' | 'v3', string> }) => {
    // Compose input: include message and notes so the back-end gets a richer context
    const composed = [
      message && `Message: ${message}`,
      `Notes:\n- ${notes.v1}\n- ${notes.v2}\n- ${notes.v3}`
    ].filter(Boolean).join('\n\n');
    await startOptimization(composed || 'Notes only');
    setStep('arena');
  };

  React.useEffect(() => {
    if (state.status === 'complete' && step === 'arena') {
      setStep('results');
    }
  }, [state.status, step]);

  const handlePlayAgain = () => {
    reset();
    setStep('cave');
  };

  return (
    <div className="min-h-screen overflow-hidden relative" style={{ background: 'linear-gradient(to bottom right, #0b1226, #111827, #0b1226)', color: '#ffffff' }}>
      {/* Minimal grid overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(59, 130, 246, 0.2) 25%, rgba(59, 130, 246, 0.2) 26%, transparent 27%, transparent 74%, rgba(59, 130, 246, 0.2) 75%, rgba(59, 130, 246, 0.2) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(59, 130, 246, 0.2) 25%, rgba(59, 130, 246, 0.2) 26%, transparent 27%, transparent 74%, rgba(59, 130, 246, 0.2) 75%, rgba(59, 130, 246, 0.2) 76%, transparent 77%, transparent)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Exit Button (hide during cave step, shown in-scene) */}
      {step !== 'cave' && (
        <motion.button
          onClick={onExitVibrantMode}
          className="fixed top-6 right-6 z-50 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg font-bold text-white shadow-lg shadow-pink-500/50 border-2 border-pink-400 text-sm"
          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(236, 72, 153, 0.8)' }}
          whileTap={{ scale: 0.95 }}
        >
          ← EXIT
        </motion.button>
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-6" style={{ height: '100vh' }}>
        <div className="pt-14 h-full">
          <AnimatePresence mode="wait">
            {step === 'cave' && (
      <motion.div
                key="cave"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full"
              >
                <PhaserCaveScene onHandoff={handleHandoff} onExit={onExitVibrantMode} />
      </motion.div>
            )}
            {step === 'arena' && (
          <motion.div
                key="arena"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full"
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full"
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
    </div>
  );
};

export default VibrantMode;
