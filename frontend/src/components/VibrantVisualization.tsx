import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SoundManager } from '../utils/SoundManager';

interface Variant {
  id: string;
  name: string;
  output?: {
    category: string;
    summary: string;
  };
  score?: number;
  scoreComponents?: {
    label_valid: number;
    label_match: number;
    summary_len_ok: number;
    no_hedging: number;
    format_ok: number;
  };
  latency_ms?: number;
}

interface VibrantVisualizationProps {
  variants: Variant[];
  isRunning: boolean;
  winner: string | null;
  soundManager: SoundManager | null;
}

const VibrantVisualization: React.FC<VibrantVisualizationProps> = ({
  variants,
  isRunning,
  winner,
  soundManager
}) => {
  const [pulseColors, setPulseColors] = useState<string[]>(['cyan', 'pink', 'purple']);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setPulseColors(['pink', 'purple', 'cyan']);
        setTimeout(() => setPulseColors(['purple', 'cyan', 'pink']), 300);
        setTimeout(() => setPulseColors(['cyan', 'pink', 'purple']), 600);
      }, 900);
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  const variantData = [
    { id: 'v1', name: 'FORMAL SENTINEL', color: 'blue', icon: '🤖', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'v2', name: 'FRIENDLY ORACLE', color: 'purple', icon: '✨', gradient: 'from-purple-500 to-pink-500' },
    { id: 'v3', name: 'ANALYTICAL SAGE', color: 'orange', icon: '🔮', gradient: 'from-orange-500 to-yellow-500' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto"
    >
      {/* Status Header */}
      <motion.div
        className="text-center mb-12"
        animate={{ scale: isRunning ? [1, 1.05, 1] : 1 }}
        transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
      >
        {isRunning && (
          <motion.h2
            className="text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ⚡ 3 PROMPTS COMPETING... ⚡
          </motion.h2>
        )}
        {winner && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 1 }}
          >
            <h2 className="text-7xl font-black mb-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              👑 WINNER FOUND 👑
            </h2>
          </motion.div>
        )}
      </motion.div>

      {/* Variant Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {variantData.map((vData, idx) => {
          const variant = variants.find(v => v.id === vData.id);
          const isWinner = winner === vData.id;
          const hasOutput = !!variant?.output;
          const hasScore = variant?.score !== undefined;

          return (
            <motion.div
              key={vData.id}
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              className="relative"
            >
              {/* Winner Glow */}
              {isWinner && (
                <motion.div
                  className="absolute -inset-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-3xl opacity-50 blur-2xl"
                  animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}

              <motion.div
                className={`
                  relative bg-black/60 backdrop-blur-xl border-4 rounded-3xl p-8 h-full
                  ${isWinner ? 'border-yellow-400' : `border-${vData.color}-500`}
                  shadow-2xl
                `}
                style={{
                  boxShadow: isWinner
                    ? '0 0 60px rgba(251, 191, 36, 0.6)'
                    : `0 0 30px rgba(${vData.color === 'blue' ? '59, 130, 246' : vData.color === 'purple' ? '168, 85, 247' : '249, 115, 22'}, 0.4)`
                }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Crown for winner */}
                {isWinner && (
                  <motion.div
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-6xl"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1, rotate: [0, -10, 10, 0] }}
                    transition={{ rotate: { duration: 2, repeat: Infinity } }}
                  >
                    👑
                  </motion.div>
                )}

                {/* Avatar and Name */}
                <div className="text-center mb-6">
                  <motion.div
                    className="text-7xl mb-4"
                    animate={hasOutput ? {
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {vData.icon}
                  </motion.div>
                  <h3 className={`text-2xl font-black bg-gradient-to-r ${vData.gradient} bg-clip-text text-transparent`}>
                    {vData.name}
                  </h3>
                </div>

                {/* Processing Indicator */}
                {isRunning && !hasOutput && (
                  <motion.div
                    className="mb-6"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="flex justify-center gap-2">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className={`w-4 h-4 rounded-full bg-${pulseColors[i]}-400`}
                          animate={{ y: [0, -15, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                    <p className="text-center text-cyan-300 mt-4 font-bold">
                      PROCESSING...
                    </p>
                  </motion.div>
                )}

                {/* Output */}
                {hasOutput && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 space-y-4"
                  >
                    <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 rounded-xl p-4 border-2 border-cyan-500">
                      <p className="text-cyan-300 text-sm font-bold mb-1">CATEGORY:</p>
                      <p className="text-white text-xl font-bold uppercase">{variant?.output?.category}</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-4 border-2 border-pink-500">
                      <p className="text-pink-300 text-sm font-bold mb-1">SUMMARY:</p>
                      <p className="text-white text-lg">{variant?.output?.summary}</p>
                    </div>
                  </motion.div>
                )}

                {/* Score */}
                {hasScore && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <div className="relative mb-4">
                      <motion.div
                        className="text-6xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"
                        animate={isWinner ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 1, repeat: isWinner ? Infinity : 0 }}
                      >
                        {variant?.score?.toFixed(1)} / 5.0
                      </motion.div>
                    </div>

                    {/* Score Components */}
                    {variant?.scoreComponents && (
                      <div className="space-y-2">
                        {Object.entries(variant.scoreComponents).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between text-sm">
                            <span className="text-cyan-300">{key.replace(/_/g, ' ').toUpperCase()}</span>
                            <motion.div
                              className="flex gap-1"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              {value === 1 ? '✅' : '❌'}
                            </motion.div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Latency */}
                    {variant?.latency_ms && (
                      <p className="text-cyan-400 text-sm mt-4">
                        ⚡ {variant.latency_ms}ms
                      </p>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Winner Announcement Banner */}
      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-32 left-0 right-0 flex justify-center z-50"
          >
            <motion.div
              className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-black px-16 py-6 rounded-full font-black text-4xl shadow-2xl border-4 border-white"
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 0 40px rgba(251, 191, 36, 0.8)',
                  '0 0 80px rgba(251, 191, 36, 1)',
                  '0 0 40px rgba(251, 191, 36, 0.8)'
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🏆 {variantData.find(v => v.id === winner)?.name} WINS! 🏆
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VibrantVisualization;
