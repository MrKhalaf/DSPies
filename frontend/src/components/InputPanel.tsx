/**
 * Input panel component for entering text and starting optimization.
 * Includes example inputs and controls for the optimization process.
 */

import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiService } from '../services/api';
import { Config } from '../types';

interface InputPanelProps {
  onRun: (inputText: string) => void;
  onReplay: () => void;
  onToggleInternals: () => void;
  showInternals: boolean;
  isRunning: boolean;
  canReplay: boolean;
  disabled?: boolean;
}

export function InputPanel({
  onRun,
  onReplay,
  onToggleInternals,
  showInternals,
  isRunning,
  canReplay,
  disabled = false
}: InputPanelProps) {
  const [inputText, setInputText] = useState('');
  const [config, setConfig] = useState<Config | null>(null);
  const [selectedExample, setSelectedExample] = useState<number | null>(null);

  useEffect(() => {
    // Load configuration on mount
    apiService.getConfig()
      .then(setConfig)
      .catch(console.error);
  }, []);

  const handleRun = () => {
    if (inputText.trim() && !disabled) {
      onRun(inputText.trim());
    }
  };

  const handleUseExample = (example: string, index: number) => {
    setInputText(example);
    setSelectedExample(index);
    setTimeout(() => setSelectedExample(null), 200);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleRun();
    } else if (e.key === 'r' && e.ctrlKey) {
      e.preventDefault();
      if (canReplay) onReplay();
    }
  };

  const isInputValid = inputText.trim().length > 0 && 
    inputText.length <= (config?.max_input_chars || 500);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6 mb-6"
    >
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Live Optimizing Classifier
        </h1>
        <p className="text-gray-600">
          Watch DSPy optimize prompts in real-time. Enter text to classify and see multiple variants compete.
        </p>
      </div>

      {/* Input Area */}
      <div className="mb-4">
        <label htmlFor="input-text" className="block text-sm font-medium text-gray-700 mb-2">
          Text to classify
        </label>
        <textarea
          id="input-text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Enter text to classify (e.g., 'I was double-charged after upgrading my plan')"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          maxLength={config?.max_input_chars || 500}
          disabled={disabled}
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">
            {inputText.length}/{config?.max_input_chars || 500} characters
          </span>
          {!isInputValid && inputText.length > 0 && (
            <span className="text-xs text-red-500">
              {inputText.length > (config?.max_input_chars || 500) 
                ? 'Text too long' 
                : 'Enter some text'}
            </span>
          )}
        </div>
      </div>

      {/* Example Inputs */}
      {config?.demo_examples && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Or try an example:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {config.demo_examples.map((example, index) => (
              <motion.button
                key={index}
                onClick={() => handleUseExample(example, index)}
                disabled={disabled}
                className={`text-left p-2 text-sm border rounded-md transition-colors ${
                  selectedExample === index
                    ? 'bg-blue-100 border-blue-300'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                whileHover={!disabled ? { scale: 1.02 } : {}}
                whileTap={!disabled ? { scale: 0.98 } : {}}
              >
                "{example}"
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <motion.button
          onClick={handleRun}
          disabled={!isInputValid || disabled || isRunning}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
            isInputValid && !disabled && !isRunning
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          whileHover={isInputValid && !disabled && !isRunning ? { scale: 1.05 } : {}}
          whileTap={isInputValid && !disabled && !isRunning ? { scale: 0.95 } : {}}
        >
          <Play size={16} />
          {isRunning ? 'Running...' : 'Run Optimization'}
        </motion.button>

        <motion.button
          onClick={onReplay}
          disabled={!canReplay || disabled}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium border transition-colors ${
            canReplay && !disabled
              ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
              : 'border-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          whileHover={canReplay && !disabled ? { scale: 1.05 } : {}}
          whileTap={canReplay && !disabled ? { scale: 0.95 } : {}}
        >
          <RotateCcw size={16} />
          Replay
        </motion.button>

        <motion.button
          onClick={onToggleInternals}
          disabled={disabled}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium border transition-colors ${
            !disabled
              ? showInternals
                ? 'border-blue-300 bg-blue-50 text-blue-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              : 'border-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          whileHover={!disabled ? { scale: 1.05 } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
        >
          {showInternals ? <EyeOff size={16} /> : <Eye size={16} />}
          {showInternals ? 'Hide' : 'Show'} Internals
        </motion.button>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="mt-4 text-xs text-gray-500">
        <span className="font-medium">Shortcuts:</span> Enter = Run, Ctrl+R = Replay
      </div>
    </motion.div>
  );
}