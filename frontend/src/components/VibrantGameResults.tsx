import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { VariantCardState, Score } from '../types';

interface VibrantGameResultsProps {
  variants: VariantCardState[];
  leader?: string;
  onPlayAgain: () => void;
  inputText?: string;
}

const VibrantGameResults: React.FC<VibrantGameResultsProps> = ({ variants, leader, onPlayAgain, inputText }) => {
  const winner = useMemo(() => {
    if (!leader) return undefined;
    return variants.find(v => v.variant.variant_id === leader);
  }, [variants, leader]);

  const competition = useMemo(() => {
    return [...variants]
      .filter(v => v.score)
      .sort((a, b) => (b.score!.total) - (a.score!.total));
  }, [variants]);

  if (!winner?.score || !winner.variant.output) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-cyan-100">No results to show</div>
      </div>
    );
  }

  const components = winner.score.components;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-black"
          >
            🏆 Winner: {winner.variant.variant_id.toUpperCase()} • {winner.score.total.toFixed(1)}
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-black text-white mt-3">Why this won</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-5">
          <div className="rounded-2xl border border-cyan-400/30 bg-black/30 p-4">
            <div className="text-xs font-bold text-cyan-200/80 mb-2">Optimized Output</div>
            <div className="rounded-xl border border-cyan-400/20 bg-black/20 p-3 mb-2">
              <div className="text-[11px] text-cyan-200/80 mb-1">CATEGORY</div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-black">
                {winner.variant.output.category}
              </div>
            </div>
            <div className="rounded-xl border border-cyan-400/20 bg-black/20 p-3">
              <div className="text-[11px] text-cyan-200/80 mb-1">SUMMARY</div>
              <div className="text-sm text-white">"{winner.variant.output.summary}"</div>
            </div>
          </div>
          <div className="rounded-2xl border border-cyan-400/30 bg-black/30 p-4">
            <div className="text-xs font-bold text-cyan-200/80 mb-2">Why it won</div>
            <div className="flex flex-wrap gap-1.5">
              <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${components.label_valid ? 'text-emerald-200 border-emerald-400/40 bg-emerald-900/30' : 'text-rose-200 border-rose-400/40 bg-rose-900/30'}`}>Valid Label</span>
              <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${components.label_match ? 'text-emerald-200 border-emerald-400/40 bg-emerald-900/30' : 'text-rose-200 border-rose-400/40 bg-rose-900/30'}`}>Intent Match</span>
              <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${components.summary_len_ok ? 'text-emerald-200 border-emerald-400/40 bg-emerald-900/30' : 'text-rose-200 border-rose-400/40 bg-rose-900/30'}`}>Summary Length</span>
              <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${components.no_hedging ? 'text-emerald-200 border-emerald-400/40 bg-emerald-900/30' : 'text-rose-200 border-rose-400/40 bg-rose-900/30'}`}>No Hedging</span>
              <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${components.format_ok ? 'text-emerald-200 border-emerald-400/40 bg-emerald-900/30' : 'text-rose-200 border-rose-400/40 bg-rose-900/30'}`}>Format OK</span>
            </div>

            <div className="mt-3 rounded-xl border border-cyan-400/20 bg-black/20">
              <div className="text-[11px] text-cyan-200/80 px-3 py-2 border-b border-cyan-400/20">The AHA</div>
              <div className="text-sm text-cyan-100/90 p-3">
                DSPy tries multiple prompt strategies at once, scores them against your definition of "good", and picks the best. No guesswork, just results.
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-400/30 bg-black/30 p-4 mt-5">
          <div className="text-xs font-bold text-cyan-200/80 mb-2">Leaderboard</div>
          <div className="space-y-2">
            {competition.map((v, idx) => (
              <div key={v.variant.variant_id} className={`rounded-xl border ${idx === 0 ? 'border-yellow-400/50' : 'border-cyan-400/20'} bg-black/20 p-3 flex items-center justify-between`}>
                <div className="text-white text-sm font-bold">{v.variant.variant_id.toUpperCase()}</div>
                <div className="text-xs font-black text-yellow-200">{v.score?.total.toFixed(1)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={onPlayAgain}
            className="px-5 py-3 rounded-xl font-black text-sm bg-gradient-to-r from-cyan-400 to-blue-400 text-black"
          >
            Play Again
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default VibrantGameResults;

