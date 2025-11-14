import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { VariantCardState } from '../types';

interface VibrantGameArenaProps {
  variants: VariantCardState[];
  leader?: string;
  status: 'idle' | 'compiling' | 'running' | 'complete' | 'error';
  onReset?: () => void;
}

const names = [
  { id: 'v1', label: 'Formal', emoji: '🤖', color: 'from-blue-400 to-cyan-400' },
  { id: 'v2', label: 'Friendly', emoji: '✨', color: 'from-pink-400 to-purple-400' },
  { id: 'v3', label: 'Analytical', emoji: '🔬', color: 'from-amber-400 to-orange-400' }
];

function computeProgress(v?: VariantCardState, isLeader?: boolean) {
  if (!v) return 0;
  switch (v.state) {
    case 'querying': return 25;
    case 'output': return 60;
    case 'scored': return isLeader ? 100 : 90;
    case 'error': return 100;
    default: return 0;
  }
}

const VibrantGameArena: React.FC<VibrantGameArenaProps> = ({ variants, leader, status }) => {
  const withMap = useMemo(() => {
    const map: Record<string, VariantCardState | undefined> = {};
    names.forEach(({ id }) => {
      map[id] = variants.find(v => v.variant.variant_id === id);
    });
    return map;
  }, [variants]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border border-cyan-400/30 bg-black/30 text-cyan-100 text-xs font-bold">
            {status === 'running' || status === 'compiling' ? 'Race in progress…' : status === 'complete' ? 'Race finished' : 'Ready'}
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white mt-2">Three strategies racing to win</h2>
        </div>
        <div className="space-y-4">
          {names.map(({ id, label, emoji, color }) => {
            const v = withMap[id];
            const isLeader = leader === id;
            const progress = computeProgress(v, isLeader);
            const score = v?.score?.total;
            return (
              <div key={id} className="rounded-xl border border-cyan-400/20 bg-black/30 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{emoji}</span>
                    <span className="text-white font-bold text-sm">{label}</span>
                    <span className="text-[10px] text-cyan-200/70">{id.toUpperCase()}</span>
                  </div>
                  <div className="text-xs font-black text-yellow-200">
                    {score !== undefined ? score.toFixed(1) : '—'}
                  </div>
                </div>
                <div className="w-full h-3 rounded-full bg-black/40 border border-cyan-400/20 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: 'spring', stiffness: 60, damping: 20 }}
                  />
                </div>
                <div className="mt-1 text-[10px] text-cyan-200/70">
                  {v?.state === 'querying' && 'Generating…'}
                  {v?.state === 'output' && 'Scoring…'}
                  {v?.state === 'scored' && (leader === id ? 'Winner!' : 'Finished')}
                  {v?.state === 'error' && 'Error'}
                  {!v && (status === 'running' || status === 'compiling') && 'Waiting to start…'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VibrantGameArena;


