import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '../services/api';
import { Config } from '../types';

interface VibrantGameIntroProps {
  onStart: (inputText: string) => void;
  disabled?: boolean;
}

const VibrantGameIntro: React.FC<VibrantGameIntroProps> = ({ onStart, disabled }) => {
  const [config, setConfig] = useState<Config | null>(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    apiService.getConfig().then(setConfig).catch(() => {});
  }, []);

  const examples = (config?.demo_examples || []).slice(0, 4);
  const canStart = input.trim().length > 0 && !disabled && input.length <= (config?.max_input_chars || 500);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-black text-white">Play: DSPy Prompt Duel</h1>
          <p className="text-cyan-100/80 mt-1 font-semibold">Enter a message. Watch three strategies race. DSPy picks the winner.</p>
        </div>
        <div className="rounded-2xl border border-cyan-400/30 bg-black/30 p-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a customer message…"
            className="w-full h-28 md:h-32 rounded-xl border border-cyan-400/30 bg-black/20 text-white placeholder:text-cyan-200/50 text-sm p-3 focus:outline-none focus:border-pink-400/60"
            maxLength={config?.max_input_chars || 500}
            disabled={disabled}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex gap-2 flex-wrap">
              {examples.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(ex)}
                  disabled={disabled}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border ${
                    disabled ? 'opacity-60' : 'hover:border-cyan-300/60'
                  } border-cyan-400/30 text-cyan-100 bg-black/20`}
                >
                  “{ex.split(' ').slice(0, 4).join(' ')}…”
                </button>
              ))}
            </div>
            <div className="text-[11px] text-cyan-200/70">{input.length}/{config?.max_input_chars || 500}</div>
          </div>
          <div className="mt-3">
            <motion.button
              onClick={() => onStart(input.trim())}
              disabled={!canStart}
              whileHover={canStart ? { scale: 1.02 } : {}}
              whileTap={canStart ? { scale: 0.98 } : {}}
              className={`w-full py-3 rounded-xl text-sm font-black tracking-wide ${
                canStart
                  ? 'bg-gradient-to-r from-yellow-300 to-pink-300 text-black shadow-lg'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              Start Match
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VibrantGameIntro;



