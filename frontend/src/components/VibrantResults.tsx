import React from 'react';
import { motion } from 'framer-motion';
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
}

interface VibrantResultsProps {
  variants: Variant[];
  winner: string;
  soundManager: SoundManager | null;
}

const VibrantResults: React.FC<VibrantResultsProps> = ({ variants, winner, soundManager }) => {
  const sortedVariants = [...variants].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-6xl mx-auto"
    >
      {/* Celebration Header */}
      <motion.div
        className="text-center mb-16"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 1.5 }}
      >
        <motion.div
          className="text-9xl mb-6"
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🎉
        </motion.div>
        <h1 className="text-8xl font-black mb-6 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
          VICTORY ACHIEVED!
        </h1>
        <p className="text-3xl text-cyan-300 font-bold">
          The Neural Battle is complete. Analysis below.
        </p>
      </motion.div>

      {/* Winner Podium */}
      <motion.div
        className="mb-16 bg-gradient-to-br from-yellow-900/50 to-orange-900/50 backdrop-blur-xl border-4 border-yellow-400 rounded-3xl p-12 shadow-2xl shadow-yellow-400/50"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-center">
          <motion.div
            className="text-9xl mb-6"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            👑
          </motion.div>
          <h2 className="text-6xl font-black mb-8 text-yellow-300">
            CHAMPION
          </h2>
          {sortedVariants[0] && (
            <>
              <div className="bg-black/60 rounded-2xl p-8 mb-6">
                <p className="text-pink-400 text-xl font-bold mb-2">CATEGORY:</p>
                <p className="text-white text-4xl font-black mb-6 uppercase">
                  {sortedVariants[0].output?.category}
                </p>
                <p className="text-cyan-400 text-xl font-bold mb-2">SUMMARY:</p>
                <p className="text-white text-3xl font-semibold">
                  {sortedVariants[0].output?.summary}
                </p>
              </div>
              <motion.div
                className="text-8xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {sortedVariants[0].score?.toFixed(1)} / 5.0
              </motion.div>
            </>
          )}
        </div>
      </motion.div>

      {/* Full Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mb-16"
      >
        <h3 className="text-5xl font-black text-center mb-8 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
          FINAL LEADERBOARD
        </h3>
        <div className="space-y-6">
          {sortedVariants.map((variant, idx) => {
            const medals = ['🥇', '🥈', '🥉'];
            const isWinner = variant.id === winner;

            return (
              <motion.div
                key={variant.id}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1 + idx * 0.2 }}
                className={`
                  bg-black/60 backdrop-blur-xl border-4 rounded-2xl p-8
                  ${isWinner ? 'border-yellow-400 shadow-2xl shadow-yellow-400/50' : 'border-cyan-500'}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <span className="text-6xl">{medals[idx]}</span>
                    <div>
                      <h4 className="text-3xl font-black text-white mb-2">
                        Variant {variant.id.toUpperCase()}
                      </h4>
                      <p className="text-cyan-300 text-xl">{variant.output?.summary}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
                      {variant.score?.toFixed(1)}
                    </div>
                    <div className="flex gap-1 justify-end">
                      {[1, 2, 3, 4, 5].map(i => (
                        <span key={i} className="text-2xl">
                          {i <= Math.round(variant.score || 0) ? '⭐' : '☆'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Score Breakdown */}
                {variant.scoreComponents && (
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(variant.scoreComponents).map(([key, value]) => (
                      <div
                        key={key}
                        className={`
                          text-center p-3 rounded-lg border-2
                          ${value === 1
                            ? 'bg-green-900/30 border-green-400'
                            : 'bg-red-900/30 border-red-400'
                          }
                        `}
                      >
                        <div className="text-3xl mb-1">{value === 1 ? '✅' : '❌'}</div>
                        <div className="text-xs text-white font-bold uppercase">
                          {key.replace(/_/g, ' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Key Learnings */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5 }}
        className="bg-gradient-to-br from-purple-900/80 to-blue-900/80 backdrop-blur-xl border-4 border-pink-500 rounded-3xl p-12 shadow-2xl shadow-pink-500/50"
      >
        <h3 className="text-5xl font-black text-center mb-8 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
          🧠 KNOWLEDGE ACQUIRED 🧠
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            {
              icon: '⚡',
              title: 'WHAT DSPy DOES',
              text: 'Automatically generates and tests multiple prompt strategies in parallel'
            },
            {
              icon: '🎯',
              title: 'HOW IT WORKS',
              text: 'You define "good," DSPy finds the best prompt to achieve it'
            },
            {
              icon: '🚀',
              title: 'WHY IT\'S POWERFUL',
              text: 'Saves hours of manual testing. Better results, less work!'
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="bg-black/40 rounded-2xl p-6 border-2 border-cyan-400 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7 + idx * 0.2 }}
              whileHover={{ scale: 1.05, borderColor: '#ec4899' }}
            >
              <div className="text-6xl mb-4">{item.icon}</div>
              <h4 className="text-2xl font-black text-cyan-300 mb-3">{item.title}</h4>
              <p className="text-white text-lg">{item.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Next Steps */}
        <div className="text-center">
          <h4 className="text-4xl font-black text-yellow-400 mb-6">🌟 WHAT'S NEXT? 🌟</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white text-lg">
            {['Customer Support', 'Content Classification', 'Question Answering', 'Text Summarization'].map((item, idx) => (
              <motion.div
                key={idx}
                className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl p-4 font-bold"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2 + idx * 0.1 }}
                whileHover={{ scale: 1.1, boxShadow: '0 0 30px rgba(236, 72, 153, 0.8)' }}
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          className="text-center mt-12 text-5xl font-black bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          MISSION COMPLETE! 🎮
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default VibrantResults;
