import React, { useCallback, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhaserGame } from '../game/dungeon/PhaserGame';

interface PhaserCaveSceneProps {
  onHandoff: (payload: { message: string; notes: Record<'v1' | 'v2' | 'v3', string> }) => void;
  onExit?: () => void;
}

type WiseId = 'v1' | 'v2' | 'v3';

const tabletInfo: Record<WiseId, { name: string; icon: string; color: string; gradient: string; inscription: string }> = {
  v1: { 
    name: 'Stone of Structure', 
    icon: '◈', 
    color: '#60a5fa', 
    gradient: 'from-blue-500/20 to-blue-900/40',
    inscription: 'The path to clarity is paved with precise form. Speak your truth in measured words.'
  },
  v2: { 
    name: 'Stone of Warmth', 
    icon: '❋', 
    color: '#f472b6', 
    gradient: 'from-pink-500/20 to-purple-900/40',
    inscription: 'Connection blooms where hearts are open. Let your words embrace the seeker.'
  },
  v3: { 
    name: 'Stone of Wisdom', 
    icon: '✦', 
    color: '#fbbf24', 
    gradient: 'from-amber-500/20 to-orange-900/40',
    inscription: 'In the depths of analysis lies truth. Seek precision, find enlightenment.'
  }
};

const PhaserCaveScene: React.FC<PhaserCaveSceneProps> = ({ onHandoff, onExit }) => {
  const [message, setMessage] = useState('');
  const [notesCount, setNotesCount] = useState(0);
  const [nearNpc, setNearNpc] = useState<WiseId | undefined>(undefined);
  const [nearOracle, setNearOracle] = useState<boolean | undefined>(undefined);
  const [, setIsMoving] = useState(false);
  const [dialogNpc, setDialogNpc] = useState<WiseId | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [savedNotes, setSavedNotes] = useState<Record<WiseId, string>>({ v1: '', v2: '', v3: '' });
  const [showIntro, setShowIntro] = useState(true);
  const apiRef = useRef<{ setNote: (id: WiseId, text: string) => void; setMessage: (text: string) => void } | null>(null);

  const onSceneState = useCallback((s: { notesCount: number; nearNpc?: WiseId; nearOracle?: boolean; isMoving?: boolean; }) => {
    setNotesCount(s.notesCount || 0);
    setNearNpc(s.nearNpc);
    setNearOracle(s.nearOracle);
    setIsMoving(!!s.isMoving);
  }, []);

  // Auto-dismiss intro
  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full min-h-screen relative overflow-hidden">
      {/* Deep atmospheric background */}
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(ellipse 120% 100% at 50% 0%, rgba(15, 23, 42, 0.3) 0%, transparent 50%),
          radial-gradient(ellipse 80% 50% at 50% 100%, rgba(6, 78, 59, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 20% 80%, rgba(34, 211, 238, 0.05) 0%, transparent 30%),
          radial-gradient(circle at 80% 20%, rgba(244, 114, 182, 0.05) 0%, transparent 30%),
          linear-gradient(to bottom, #030712 0%, #0a0f1e 50%, #0f172a 100%)
        `
      }} />

      {/* Animated starfield */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-cyan-200 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Intro overlay */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl mb-4"
              >
                ⚔️
              </motion.div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 mb-2">
                THE ANCIENT DUNGEON
              </h1>
              <p className="text-cyan-200/70 text-sm max-w-md">
                Seek wisdom from the three sacred stones. Return to the Oracle with your gathered insights.
              </p>
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-xs text-cyan-400/60 mt-4"
              >
                Use WASD or Arrow keys to move
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top HUD */}
      <div className="fixed top-4 left-0 right-0 z-[100] px-4">
        <div className="max-w-5xl mx-auto flex items-start justify-between gap-4">
          {/* Quest tracker */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-black/80 backdrop-blur-md rounded-xl border border-cyan-500/30 p-3 shadow-lg shadow-cyan-500/10"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-bold text-cyan-300 tracking-wider">QUEST</span>
            </div>
            <div className="space-y-1.5">
              {(['v1', 'v2', 'v3'] as WiseId[]).map((id) => {
                const info = tabletInfo[id];
                const hasNote = savedNotes[id].length > 0;
                return (
                  <div key={id} className="flex items-center gap-2">
                    <span className={`text-sm ${hasNote ? 'opacity-100' : 'opacity-40'}`} style={{ color: info.color }}>
                      {info.icon}
                    </span>
                    <span className={`text-xs ${hasNote ? 'text-white line-through opacity-60' : 'text-slate-400'}`}>
                      {info.name}
                    </span>
                    {hasNote && <span className="text-emerald-400 text-xs">✓</span>}
                  </div>
                );
              })}
            </div>
            <div className="mt-2 pt-2 border-t border-cyan-500/20">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Wisdoms gathered</span>
                <span className="font-bold text-cyan-300">{notesCount}/3</span>
              </div>
              <div className="mt-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(notesCount / 3) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 100 }}
                />
              </div>
            </div>
          </motion.div>

          {/* Controls hint */}
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-black/60 backdrop-blur-md rounded-lg border border-white/10 px-3 py-2"
          >
            <div className="flex items-center gap-3 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white font-mono">WASD</kbd>
                Move
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white font-mono">E</kbd>
                Interact
              </span>
            </div>
          </motion.div>

          {/* Exit button */}
          {onExit && (
            <motion.button
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              onClick={onExit}
              className="px-3 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-rose-500/80 to-pink-600/80 text-white border border-rose-400/30 shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 transition-shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ← Exit Dungeon
            </motion.button>
          )}
        </div>
      </div>

      {/* Request input */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="fixed top-28 left-1/2 -translate-x-1/2 z-[100]"
      >
        <div className="bg-black/80 backdrop-blur-md rounded-xl border border-cyan-500/30 p-3 shadow-lg shadow-cyan-500/10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-cyan-400 text-sm">📜</span>
            <span className="text-[10px] font-bold text-cyan-300 tracking-wider">YOUR CHALLENGE</span>
          </div>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='What problem do you bring to the Oracle? (e.g., "I was double-charged...")'
            className="w-[400px] max-w-[80vw] rounded-lg border border-cyan-500/30 bg-black/40 text-white placeholder:text-slate-500 text-xs px-3 py-2 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/20"
          />
        </div>
      </motion.div>

      {/* Game viewport */}
      <div className="relative z-10 w-full flex items-center justify-center" style={{ paddingTop: '150px', paddingBottom: '20px' }}>
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          {/* Decorative frame */}
          <div className="absolute -inset-2 bg-gradient-to-b from-cyan-500/20 via-transparent to-purple-500/20 rounded-2xl blur-sm" />
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 via-transparent to-pink-500/10 rounded-xl" />
          
          {/* Game container */}
          <div 
            className="relative rounded-xl border-2 border-cyan-500/30 overflow-hidden shadow-2xl shadow-cyan-500/10"
            style={{ width: 940, height: 605 }}
          >
            {/* Scanline effect */}
            <div 
              className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
              }}
            />
            
          <PhaserGame
            onHandoff={({ message: msg, notes }) => onHandoff({ message: msg || message, notes })}
            onState={(s) => {
              onSceneState(s);
              if ((s as any).openDialogNpc) {
                const id = (s as any).openDialogNpc as WiseId;
                setDialogNpc(id);
                  setTempNote(savedNotes[id] || '');
              }
            }}
            onReady={(api) => {
              apiRef.current = api as any;
            }}
          />

            {/* Proximity indicators */}
            <AnimatePresence>
              {nearNpc && !dialogNpc && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2"
                >
                  <div 
                    className="px-4 py-2 rounded-lg border backdrop-blur-sm text-xs font-bold flex items-center gap-2"
                    style={{ 
                      borderColor: tabletInfo[nearNpc].color + '60',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: tabletInfo[nearNpc].color
                    }}
                  >
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      {tabletInfo[nearNpc].icon}
                    </motion.span>
                    Press E to read the {tabletInfo[nearNpc].name}
                  </div>
                </motion.div>
              )}
              
              {nearOracle && !dialogNpc && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2"
                >
                  <div className={`px-4 py-2 rounded-lg border backdrop-blur-sm text-xs font-bold flex items-center gap-2 ${
                    notesCount === 3 
                      ? 'border-cyan-400/60 text-cyan-300 bg-cyan-950/70' 
                      : 'border-amber-400/40 text-amber-300 bg-amber-950/50'
                  }`}>
                    {notesCount === 3 ? (
                      <>
                        <motion.span animate={{ rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity }}>✧</motion.span>
                        Press E to consult the Oracle
                      </>
                    ) : (
                      <>
                        <span>⚠️</span>
                        Gather {3 - notesCount} more wisdom{3 - notesCount > 1 ? 's' : ''} first
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Corner decorations */}
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400/50 rounded-tl" />
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400/50 rounded-tr" />
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-purple-400/50 rounded-bl" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-purple-400/50 rounded-br" />
        </motion.div>
            </div>

      {/* Dialog overlay */}
      <AnimatePresence>
          {dialogNpc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`w-[600px] max-w-[95vw] rounded-2xl border overflow-hidden shadow-2xl bg-gradient-to-b ${tabletInfo[dialogNpc].gradient} backdrop-blur-md`}
              style={{ borderColor: tabletInfo[dialogNpc].color + '40' }}
            >
              {/* Header */}
              <div 
                className="px-6 py-4 border-b flex items-center justify-between"
                style={{ 
                  borderColor: tabletInfo[dialogNpc].color + '30',
                  background: `linear-gradient(to right, ${tabletInfo[dialogNpc].color}10, transparent)`
                }}
              >
                <div className="flex items-center gap-3">
                  <motion.span
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-2xl"
                    style={{ color: tabletInfo[dialogNpc].color }}
                  >
                    {tabletInfo[dialogNpc].icon}
                  </motion.span>
                  <div>
                    <h3 className="font-bold text-white">{tabletInfo[dialogNpc].name}</h3>
                    <p className="text-xs text-slate-400">Ancient Inscription</p>
                  </div>
                  </div>
                  <button
                    onClick={() => setDialogNpc(null)}
                  className="text-slate-400 hover:text-white transition-colors text-xl"
                  >
                  ×
                  </button>
              </div>

              {/* Stone inscription */}
              <div className="px-6 py-4 border-b" style={{ borderColor: tabletInfo[dialogNpc].color + '20' }}>
                <div className="relative">
                  <div className="absolute -left-2 top-0 bottom-0 w-1 rounded-full" style={{ backgroundColor: tabletInfo[dialogNpc].color + '40' }} />
                  <p className="text-sm text-slate-300 italic pl-4 leading-relaxed">
                    "{tabletInfo[dialogNpc].inscription}"
                  </p>
                </div>
              </div>

              {/* Input area */}
              <div className="p-6">
                <label className="block text-xs font-bold text-slate-400 mb-2 tracking-wider">
                  INSCRIBE YOUR WISDOM
                </label>
                <textarea
                  value={tempNote}
                  onChange={(e) => setTempNote(e.target.value)}
                  placeholder="What approach would you take? Share your strategy..."
                  className="w-full h-32 rounded-xl border bg-black/40 text-white placeholder:text-slate-500 text-sm p-4 focus:outline-none transition-colors resize-none"
                  style={{ 
                    borderColor: tabletInfo[dialogNpc].color + '30',
                  }}
                  onFocus={(e) => e.target.style.borderColor = tabletInfo[dialogNpc].color + '60'}
                  onBlur={(e) => e.target.style.borderColor = tabletInfo[dialogNpc].color + '30'}
                />
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Your wisdom will be carried to the Oracle
                  </p>
                  <div className="flex gap-2">
                  <button
                    onClick={() => setDialogNpc(null)}
                      className="px-4 py-2 rounded-lg text-sm font-bold border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
                  >
                      Depart
                  </button>
                    <motion.button
                    onClick={() => {
                      if (apiRef.current && dialogNpc && tempNote.trim()) {
                        apiRef.current.setNote(dialogNpc, tempNote.trim());
                          setSavedNotes(prev => ({ ...prev, [dialogNpc]: tempNote.trim() }));
                        setDialogNpc(null);
                        setTempNote('');
                      }
                    }}
                    disabled={!tempNote.trim()}
                      whileHover={tempNote.trim() ? { scale: 1.02 } : {}}
                      whileTap={tempNote.trim() ? { scale: 0.98 } : {}}
                      className={`px-5 py-2 rounded-lg text-sm font-black transition-all ${
                        tempNote.trim()
                          ? 'text-black shadow-lg'
                          : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      }`}
                      style={tempNote.trim() ? {
                        background: `linear-gradient(to right, ${tabletInfo[dialogNpc].color}, ${tabletInfo[dialogNpc].color}cc)`,
                        boxShadow: `0 4px 20px ${tabletInfo[dialogNpc].color}40`
                      } : {}}
                    >
                      ✓ Seal Wisdom
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};

export default PhaserCaveScene;
