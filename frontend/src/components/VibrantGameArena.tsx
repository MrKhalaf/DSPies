import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VariantCardState } from '../types';

interface VibrantGameArenaProps {
  variants: VariantCardState[];
  leader?: string;
  status: 'idle' | 'compiling' | 'running' | 'complete' | 'error';
  onReset?: () => void;
}

const combatants = [
  { 
    id: 'v1', 
    name: 'Formal Sentinel', 
    subtitle: 'Master of Structure',
    icon: '◈', 
    color: '#60a5fa',
    gradient: 'from-blue-400 via-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/10 to-cyan-500/5',
    shadowColor: 'rgba(96, 165, 250, 0.4)'
  },
  { 
    id: 'v2', 
    name: 'Warm Oracle', 
    subtitle: 'Voice of Connection',
    icon: '❋', 
    color: '#f472b6',
    gradient: 'from-pink-400 via-fuchsia-500 to-purple-500',
    bgGradient: 'from-pink-500/10 to-purple-500/5',
    shadowColor: 'rgba(244, 114, 182, 0.4)'
  },
  { 
    id: 'v3', 
    name: 'Analytical Sage', 
    subtitle: 'Seeker of Precision',
    icon: '✦', 
    color: '#fbbf24',
    gradient: 'from-amber-400 via-orange-500 to-red-500',
    bgGradient: 'from-amber-500/10 to-orange-500/5',
    shadowColor: 'rgba(251, 191, 36, 0.4)'
  }
];

function computeProgress(v?: VariantCardState, isLeader?: boolean) {
  if (!v) return 0;
  switch (v.state) {
    case 'querying': return 30;
    case 'output': return 70;
    case 'scored': return isLeader ? 100 : 95;
    case 'error': return 100;
    default: return 0;
  }
}

function getStateLabel(v?: VariantCardState, isLeader?: boolean) {
  if (!v) return 'Awaiting...';
  switch (v.state) {
    case 'querying': return 'Channeling wisdom...';
    case 'output': return 'Evaluating response...';
    case 'scored': return isLeader ? '⚔️ CHAMPION!' : 'Battle complete';
    case 'error': return 'Failed';
    default: return 'Ready';
  }
}

const VibrantGameArena: React.FC<VibrantGameArenaProps> = ({ variants, leader, status }) => {
  const [, setShowCombatText] = useState(false);
  const [battlePhase, setBattlePhase] = useState(0);

  const withMap = useMemo(() => {
    const map: Record<string, VariantCardState | undefined> = {};
    combatants.forEach(({ id }) => {
      map[id] = variants.find(v => v.variant.variant_id === id);
    });
    return map;
  }, [variants]);

  // Battle phase progression
  useEffect(() => {
    if (status === 'running' || status === 'compiling') {
      setShowCombatText(true);
      const interval = setInterval(() => {
        setBattlePhase(p => (p + 1) % 4);
      }, 800);
      return () => clearInterval(interval);
    }
  }, [status]);

  const battleTexts = [
    'The strategies clash...',
    'Wisdom flows through the dungeon...',
    'The Oracle weighs each approach...',
    'Power courses through the stones...'
  ];

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      {/* Atmospheric background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Central glow */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, transparent 70%)',
          }}
          animate={{
            scale: status === 'running' ? [1, 1.2, 1] : 1,
            opacity: status === 'running' ? [0.5, 0.8, 0.5] : 0.3,
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Particle effects */}
        {(status === 'running' || status === 'compiling') && [...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            style={{
              left: `${30 + Math.random() * 40}%`,
              top: `${30 + Math.random() * 40}%`,
            }}
            animate={{
              y: [0, -100],
              x: [0, (Math.random() - 0.5) * 50],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-5xl relative z-10 px-4">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <motion.div
            animate={status === 'running' || status === 'compiling' ? {
              boxShadow: ['0 0 20px rgba(34, 211, 238, 0.3)', '0 0 40px rgba(34, 211, 238, 0.6)', '0 0 20px rgba(34, 211, 238, 0.3)']
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-cyan-400/30 bg-black/50 backdrop-blur-sm mb-4"
          >
            <motion.div
              animate={status === 'running' ? { rotate: 360 } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-cyan-400"
            >
              ◇
            </motion.div>
            <span className="text-sm font-bold tracking-wider text-cyan-100">
              {status === 'running' || status === 'compiling' 
                ? 'BATTLE IN PROGRESS' 
                : status === 'complete' 
                  ? 'CHAMPION CROWNED' 
                  : 'ARENA READY'}
            </span>
            <motion.div
              animate={status === 'running' ? { rotate: -360 } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-cyan-400"
            >
              ◇
            </motion.div>
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300">
            The Oracle's Arena
          </h1>
          
          <AnimatePresence mode="wait">
            {(status === 'running' || status === 'compiling') && (
              <motion.p
                key={battlePhase}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className="text-cyan-200/70 mt-2 text-sm"
              >
                {battleTexts[battlePhase]}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Combatants Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {combatants.map(({ id, name, subtitle, icon, color, gradient, bgGradient, shadowColor }, idx) => {
            const v = withMap[id];
            const isLeader = leader === id;
            const progress = computeProgress(v, isLeader);
            const score = v?.score?.total;
            const stateLabel = getStateLabel(v, isLeader);

            return (
              <motion.div
                key={id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative rounded-2xl border overflow-hidden backdrop-blur-sm ${
                  isLeader && status === 'complete'
                    ? 'border-yellow-400/60'
                    : 'border-white/10'
                }`}
                style={{
                  boxShadow: isLeader && status === 'complete' 
                    ? `0 0 30px ${shadowColor}, 0 0 60px ${shadowColor}` 
                    : undefined
                }}
              >
                {/* Winner glow */}
                {isLeader && status === 'complete' && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{
                      boxShadow: [`inset 0 0 30px ${color}30`, `inset 0 0 50px ${color}50`, `inset 0 0 30px ${color}30`]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}

                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-b ${bgGradient} opacity-50`} />
                <div className="absolute inset-0 bg-black/40" />

                {/* Content */}
                <div className="relative p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={v?.state === 'querying' ? {
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0]
                        } : {}}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="text-3xl"
                        style={{ color }}
                      >
                        {icon}
                      </motion.div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{name}</h3>
                        <p className="text-xs text-slate-400">{subtitle}</p>
                      </div>
                    </div>
                    
                    {/* Score badge */}
                    <AnimatePresence mode="wait">
                      {score !== undefined && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className={`px-3 py-1 rounded-full text-sm font-black ${
                            isLeader 
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-black' 
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          {score.toFixed(1)}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="h-3 rounded-full bg-black/40 overflow-hidden border border-white/5">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                      />
                    </div>
                  </div>

                  {/* State label */}
                  <div className="flex items-center justify-between">
                    <motion.span
                      animate={v?.state === 'querying' || v?.state === 'output' ? {
                        opacity: [0.7, 1, 0.7]
                      } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                      className={`text-xs font-medium ${
                        isLeader && status === 'complete' ? 'text-yellow-300' : 'text-slate-400'
                      }`}
                    >
                      {stateLabel}
                    </motion.span>
                    
                    {/* Activity indicator */}
                    {(v?.state === 'querying' || v?.state === 'output') && (
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: color }}
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: i * 0.2
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Champion crown */}
                  {isLeader && status === 'complete' && (
                    <motion.div
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="absolute -top-2 -right-2"
                    >
                      <motion.span
                        animate={{ 
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-3xl"
                      >
                        👑
                      </motion.span>
                    </motion.div>
                  )}
                </div>

                {/* Output preview */}
                <AnimatePresence>
                  {v?.variant.output && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 bg-black/30"
                    >
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span 
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{ 
                              backgroundColor: color + '20',
                              color: color
                            }}
                          >
                            {v.variant.output.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-2">
                          "{v.variant.output.summary}"
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom decorative element */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mt-8"
        >
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-slate-600" />
            <span>DSPy Oracle Engine</span>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-slate-600" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VibrantGameArena;
