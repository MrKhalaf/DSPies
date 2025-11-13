import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '../services/api';
import { Config } from '../types';

interface VibrantInputPanelProps {
  onRun: (inputText: string) => void;
  isRunning: boolean;
  disabled?: boolean;
}

const VibrantInputPanel: React.FC<VibrantInputPanelProps> = ({ onRun, isRunning, disabled }) => {
  const [input, setInput] = useState('');
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    apiService.getConfig().then(setConfig).catch(() => {});
  }, []);

  const examples = (config?.demo_examples || []).slice(0, 3);
  const canRun = !!input.trim() && !isRunning && !disabled && input.length <= (config?.max_input_chars || 500);

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pt-2 pb-3 border-b border-cyan-400/20">
        <div className="text-xs font-bold text-cyan-200/80">Your message</div>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a customer message... e.g., “I was double-charged after upgrading my plan.”"
          className="w-full h-36 md:h-40 rounded-xl border border-cyan-400/30 bg-black/30 text-white placeholder:text-cyan-200/50 text-sm p-3 focus:outline-none focus:border-pink-400/60"
          maxLength={config?.max_input_chars || 500}
          disabled={disabled}
        />

        <div className="flex items-center justify-between">
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

        <div className="pt-1">
          <motion.button
            onClick={() => onRun(input.trim())}
            disabled={!canRun}
            whileHover={canRun ? { scale: 1.02 } : {}}
            whileTap={canRun ? { scale: 0.98 } : {}}
            className={`w-full py-3 rounded-xl text-sm font-black tracking-wide ${
              canRun
                ? 'bg-gradient-to-r from-green-500 to-cyan-500 text-black shadow-lg'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isRunning ? 'Optimizing…' : 'Run DSPy Optimization'}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default VibrantInputPanel;

