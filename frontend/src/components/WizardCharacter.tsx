import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WizardCharacterProps {
  id: 'v1' | 'v2' | 'v3';
  name: string;
  emoji: string;
  gradient: string; // tailwind gradient, e.g. 'from-blue-500 to-cyan-500'
  initialNote?: string;
  onSaveNote: (id: string, note: string) => void;
  disabled?: boolean;
}

const WizardCharacter: React.FC<WizardCharacterProps> = ({
  id,
  name,
  emoji,
  gradient,
  initialNote = '',
  onSaveNote,
  disabled
}) => {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(initialNote);

  const canSave = note.trim().length > 0 && !disabled;

  return (
    <div className="relative select-none">
      {/* Wizard avatar */}
      <motion.button
        onClick={() => setOpen(true)}
        disabled={disabled}
        whileHover={!disabled ? { scale: 1.06 } : {}}
        whileTap={!disabled ? { scale: 0.96 } : {}}
        className={`rounded-2xl border px-5 py-4 bg-black/30 text-white text-left shadow-lg ${
          disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
        } border-cyan-400/30`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${gradient}`}>
            <span className="drop-shadow">{emoji}</span>
          </div>
          <div>
            <div className="text-sm font-black">{name}</div>
            <div className="text-[11px] text-cyan-200/80">{id.toUpperCase()}</div>
          </div>
        </div>
      </motion.button>

      {/* Dialog / Note editor */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-0 right-0 mt-3 z-20"
          >
            <div className="rounded-2xl border border-cyan-400/30 bg-black/70 backdrop-blur p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-cyan-200/80">
                  Speak to {name}
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-cyan-200/70 hover:text-white text-xs font-bold"
                >
                  Close
                </button>
              </div>
              <div className="text-[13px] text-cyan-100/90 mb-3">
                {emoji} “Share your insight on how to solve this. I will take notes.”
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={`Notes from ${name}...`}
                className="w-full h-24 rounded-xl border border-cyan-400/30 bg-black/40 text-white placeholder:text-cyan-200/50 text-sm p-3 focus:outline-none focus:border-pink-400/60"
              />
              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-lg text-xs font-bold border border-cyan-400/30 text-cyan-100 hover:bg-black/40"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onSaveNote(id, note.trim());
                    setOpen(false);
                  }}
                  disabled={!canSave}
                  className={`px-3 py-2 rounded-lg text-xs font-black ${
                    canSave
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-400 text-black'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Save Note
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WizardCharacter;



