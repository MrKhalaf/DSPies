import React from 'react';
import { motion } from 'framer-motion';
import { SoundManager } from '../utils/SoundManager';

interface VibrantInputSectionProps {
  userInput: string;
  setUserInput: (value: string) => void;
  onStartDemo: () => void;
  isRunning: boolean;
  soundManager: SoundManager | null;
}

const VibrantInputSection: React.FC<VibrantInputSectionProps> = ({
  userInput,
  setUserInput,
  onStartDemo,
  isRunning,
  soundManager
}) => {
  const examples = [
    "I was double-charged after upgrading my plan",
    "The app keeps crashing when I try to login",
    "I want to cancel my subscription immediately",
    "This is urgent - my account is locked!"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="max-w-5xl mx-auto"
    >
      <div className="bg-gradient-to-br from-purple-900/80 to-blue-900/80 backdrop-blur-xl border-4 border-pink-500 rounded-3xl p-12 shadow-2xl shadow-pink-500/50 relative overflow-hidden">
        {/* Animated Corner Accents */}
        <motion.div
          className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/20 rounded-br-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-32 h-32 bg-pink-500/20 rounded-tl-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        />

        <motion.h2
          className="text-6xl font-black text-center mb-8 bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🎯 TRY IT YOURSELF 🎯
        </motion.h2>

        <p className="text-2xl text-cyan-200 text-center mb-12 font-semibold">
          Enter any customer support message. Watch three different AI prompts compete. See which wins.
        </p>

        {/* Input Area */}
        <div className="relative mb-8">
          <motion.div
            className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-500 rounded-2xl opacity-30 blur-xl"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onFocus={() => soundManager?.playHover()}
            style={{
              position: 'relative',
              width: '100%',
              height: '12rem',
              background: 'rgba(0, 0, 0, 0.6)',
              border: '4px solid #22d3ee',
              borderRadius: '1rem',
              padding: '1.5rem',
              fontSize: '1.5rem',
              color: '#ffffff',
              fontFamily: 'monospace',
              resize: 'none',
              transition: 'all 0.3s'
            }}
            placeholder="Type your customer message here..."
            disabled={isRunning}
          />
        </div>

        {/* Example Buttons */}
        <div className="mb-12">
          <p className="text-cyan-300 text-center mb-6 text-xl font-bold">
            ⚡ OR TRY THESE EXAMPLES ⚡
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {examples.map((example, idx) => (
              <motion.button
                key={idx}
                onClick={() => {
                  soundManager?.playClick();
                  setUserInput(example);
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-pink-400 rounded-xl p-4 text-left text-white font-semibold hover:from-purple-500 hover:to-pink-500 transition-all relative overflow-hidden group"
                whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(236, 72, 153, 0.6)' }}
                whileTap={{ scale: 0.97 }}
                disabled={isRunning}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/30 to-cyan-400/0"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
                <span className="relative z-10">{example}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <motion.div className="text-center">
          <motion.button
            onClick={onStartDemo}
            disabled={isRunning || !userInput.trim()}
            className={`
              relative px-16 py-6 text-3xl font-black rounded-2xl
              ${isRunning || !userInput.trim()
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 text-white cursor-pointer'
              }
              border-4 border-white/50 shadow-2xl
              overflow-hidden
            `}
            whileHover={!isRunning && userInput.trim() ? {
              scale: 1.1,
              boxShadow: '0 0 50px rgba(0, 255, 255, 1), 0 0 100px rgba(0, 255, 255, 0.5)'
            } : {}}
            whileTap={!isRunning && userInput.trim() ? { scale: 0.95 } : {}}
          >
            {!isRunning && userInput.trim() && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            <span className="relative z-10 drop-shadow-lg">
              {isRunning ? '⚡ BATTLE IN PROGRESS ⚡' : '🚀 START THE BATTLE! 🚀'}
            </span>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default VibrantInputSection;
