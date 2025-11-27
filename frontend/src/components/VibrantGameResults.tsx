import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VariantCardState } from '../types';

interface VibrantGameResultsProps {
  variants: VariantCardState[];
  leader?: string;
  onPlayAgain: () => void;
  inputText?: string;
}

const combatantInfo: Record<string, { name: string; icon: string; color: string; gradient: string }> = {
  v1: { name: 'Formal Sentinel', icon: '◈', color: '#60a5fa', gradient: 'from-blue-400 to-cyan-400' },
  v2: { name: 'Warm Oracle', icon: '❋', color: '#f472b6', gradient: 'from-pink-400 to-purple-400' },
  v3: { name: 'Analytical Sage', icon: '✦', color: '#fbbf24', gradient: 'from-amber-400 to-orange-400' }
};

const VibrantGameResults: React.FC<VibrantGameResultsProps> = ({ variants, leader, onPlayAgain, inputText }) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [revealStage, setRevealStage] = useState(0);

  const winner = useMemo(() => {
    if (!leader) return undefined;
    return variants.find(v => v.variant.variant_id === leader);
  }, [variants, leader]);

  const competition = useMemo(() => {
    return [...variants]
      .filter(v => v.score)
      .sort((a, b) => (b.score!.total) - (a.score!.total));
  }, [variants]);

  const winnerInfo = leader ? combatantInfo[leader] : null;

  // Progressive reveal
  useEffect(() => {
    const timers = [
      setTimeout(() => setRevealStage(1), 300),
      setTimeout(() => setRevealStage(2), 800),
      setTimeout(() => setRevealStage(3), 1300),
      setTimeout(() => setShowConfetti(false), 4000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  if (!winner?.score || !winner.variant.output || !winnerInfo) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-cyan-100">No results to show</div>
      </div>
    );
  }

  const components = winner.score.components;

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
      {/* Dramatic background */}
      <div className="absolute inset-0">
        {/* Radial glow from winner */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]"
          style={{
            background: `radial-gradient(circle, ${winnerInfo.color}20 0%, transparent 60%)`
          }}
        />
        
        {/* Confetti particles */}
        <AnimatePresence>
          {showConfetti && [...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                y: -20,
                x: `${10 + Math.random() * 80}vw`,
                rotate: 0,
                opacity: 1
              }}
              animate={{ 
                y: '110vh',
                rotate: Math.random() * 720 - 360,
                opacity: [1, 1, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: 'linear'
              }}
              className="absolute"
              style={{
                width: 8 + Math.random() * 8,
                height: 8 + Math.random() * 8,
                backgroundColor: [winnerInfo.color, '#22d3ee', '#fbbf24', '#f472b6'][Math.floor(Math.random() * 4)],
                borderRadius: Math.random() > 0.5 ? '50%' : '2px'
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="w-full max-w-5xl relative z-10 px-4">
        {/* Victory Banner */}
        <motion.div
          initial={{ y: -50, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', bounce: 0.4 }}
          className="text-center mb-8"
        >
          {/* Crown animation */}
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            👑
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl border-2 mb-4"
            style={{
              backgroundColor: winnerInfo.color + '20',
              borderColor: winnerInfo.color + '60',
              boxShadow: `0 0 40px ${winnerInfo.color}40`
            }}
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-3xl"
            >
              {winnerInfo.icon}
            </motion.span>
            <div>
              <div className="text-white font-black text-2xl">{winnerInfo.name}</div>
              <div className="text-sm" style={{ color: winnerInfo.color }}>
                Champion • Score: {winner.score.total.toFixed(1)}
              </div>
            </div>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300">
            VICTORY
          </h1>
        </motion.div>

        {/* Main content grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Winning Output */}
          <AnimatePresence>
            {revealStage >= 1 && (
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="rounded-2xl border overflow-hidden backdrop-blur-sm"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  borderColor: winnerInfo.color + '30'
                }}
              >
                <div 
                  className="px-5 py-3 border-b flex items-center gap-2"
                  style={{ 
                    borderColor: winnerInfo.color + '20',
                    background: `linear-gradient(to right, ${winnerInfo.color}15, transparent)`
                  }}
                >
                  <span className="text-lg" style={{ color: winnerInfo.color }}>{winnerInfo.icon}</span>
                  <span className="text-sm font-bold text-white">The Winning Response</span>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 tracking-wider mb-1">CLASSIFICATION</div>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`inline-flex px-4 py-1.5 rounded-full text-sm font-black bg-gradient-to-r ${winnerInfo.gradient} text-black`}
                    >
                      {winner.variant.output.category}
                    </motion.span>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 tracking-wider mb-1">SUMMARY</div>
                    <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                      <p className="text-white text-sm leading-relaxed">"{winner.variant.output.summary}"</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Score Breakdown */}
          <AnimatePresence>
            {revealStage >= 2 && (
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="rounded-2xl border border-cyan-500/20 overflow-hidden backdrop-blur-sm bg-black/50"
              >
                <div className="px-5 py-3 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-transparent">
                  <span className="text-sm font-bold text-cyan-100">Why It Won</span>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { key: 'label_valid', label: 'Valid Label', icon: '✓' },
                      { key: 'label_match', label: 'Intent Match', icon: '◉' },
                      { key: 'summary_len_ok', label: 'Length OK', icon: '↔' },
                      { key: 'no_hedging', label: 'No Hedging', icon: '⚡' },
                      { key: 'format_ok', label: 'Format OK', icon: '□' }
                    ].map(({ key, label, icon }, idx) => {
                      const passed = (components as any)[key];
                      return (
                        <motion.div
                          key={key}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`px-3 py-2 rounded-lg border text-xs font-bold flex items-center gap-2 ${
                            passed
                              ? 'border-emerald-400/40 bg-emerald-900/20 text-emerald-300'
                              : 'border-rose-400/40 bg-rose-900/20 text-rose-300'
                          }`}
                        >
                          <span>{passed ? '✓' : '✕'}</span>
                          <span>{label}</span>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
                    <div className="text-[10px] font-bold text-cyan-400 tracking-wider mb-2">THE INSIGHT</div>
                    <p className="text-sm text-cyan-100/90 leading-relaxed">
                      DSPy evaluated multiple prompt strategies simultaneously, scored each against your defined criteria, 
                      and crowned the champion. <span style={{ color: winnerInfo.color }}>{winnerInfo.name}</span>'s approach 
                      proved most effective for this challenge.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Leaderboard */}
        <AnimatePresence>
          {revealStage >= 3 && (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-6 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-sm bg-black/40"
            >
              <div className="px-5 py-3 border-b border-white/10">
                <span className="text-sm font-bold text-white">Final Rankings</span>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {competition.map((v, idx) => {
                    const info = combatantInfo[v.variant.variant_id];
                    const isWinner = idx === 0;
                    return (
                      <motion.div
                        key={v.variant.variant_id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`flex items-center justify-between p-3 rounded-xl border ${
                          isWinner 
                            ? 'border-yellow-400/40 bg-yellow-400/5' 
                            : 'border-white/5 bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${
                            idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-black' :
                            idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-black' :
                            'bg-gradient-to-br from-amber-700 to-orange-800 text-white'
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg" style={{ color: info.color }}>{info.icon}</span>
                            <span className="text-white font-bold">{info.name}</span>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-black ${
                          isWinner ? 'bg-yellow-400 text-black' : 'bg-white/10 text-white'
                        }`}>
                          {v.score?.total.toFixed(1)}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Play Again Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-8 text-center"
        >
          <motion.button
            onClick={onPlayAgain}
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(34, 211, 238, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-xl font-black text-lg bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 text-black shadow-lg shadow-cyan-500/30"
          >
            ⚔️ Enter the Dungeon Again
          </motion.button>
          <p className="text-xs text-slate-500 mt-3">
            Challenge the Oracle with a new problem
          </p>
        </motion.div>

        {/* Decorative footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="flex justify-center mt-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-cyan-600 to-transparent" />
            <span className="text-xs text-slate-500">Powered by DSPy Oracle Engine</span>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-cyan-600 to-transparent" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VibrantGameResults;
