/**
 * Enhanced input panel with better UX and educational content
 */

import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Sparkles, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiService } from '../services/api';
import { Config } from '../types';

interface EnhancedInputPanelProps {
  onRun: (inputText: string) => void;
  onReplay: () => void;
  isRunning: boolean;
  canReplay: boolean;
  disabled?: boolean;
}

export function EnhancedInputPanel({
  onRun,
  onReplay,
  isRunning,
  canReplay,
  disabled = false
}: EnhancedInputPanelProps) {
  const [inputText, setInputText] = useState('');
  const [config, setConfig] = useState<Config | null>(null);
  const [selectedExample, setSelectedExample] = useState<number | null>(null);

  useEffect(() => {
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
    <div className="space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="text-purple-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">
            DSPy Live Optimization Demo
          </h1>
          <Sparkles className="text-blue-600" size={32} />
        </div>
        
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
          Watch artificial intelligence optimize itself! Enter any customer support message below 
          and see how DSPy automatically finds the best prompt strategy for classification and summarization.
        </p>

        <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Automatic prompt engineering</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Real-time optimization</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Performance comparison</span>
          </div>
        </div>
      </motion.div>

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="mb-4">
          <label htmlFor="input-text" className="block text-lg font-semibold text-gray-900 mb-2">
            Enter Customer Message
          </label>
          <p className="text-gray-600 mb-4">
            Type any customer support message to see DSPy optimize prompts for classification and summarization.
          </p>
          
          <textarea
            id="input-text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Example: I was double-charged after upgrading my plan and need a refund..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-lg"
            rows={4}
            maxLength={config?.max_input_chars || 500}
            disabled={disabled}
          />
          
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">
              {inputText.length}/{config?.max_input_chars || 500} characters
            </span>
            {!isInputValid && inputText.length > 0 && (
              <span className="text-sm text-red-500">
                {inputText.length > (config?.max_input_chars || 500) 
                  ? 'Message too long' 
                  : 'Enter a message'}
              </span>
            )}
          </div>
        </div>

        {/* Example Messages */}
        {config?.demo_examples && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={18} className="text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">
                Try these example messages:
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {config.demo_examples.map((example, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleUseExample(example, index)}
                  disabled={disabled}
                  className={`text-left p-3 text-sm border-2 rounded-lg transition-all ${
                    selectedExample === index
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  whileHover={!disabled ? { scale: 1.02 } : {}}
                  whileTap={!disabled ? { scale: 0.98 } : {}}
                >
                  <div className="font-medium text-gray-800 mb-1">
                    {example.split(' ').slice(0, 4).join(' ')}...
                  </div>
                  <div className="text-gray-600">
                    "{example}"
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 items-center">
          <motion.button
            onClick={handleRun}
            disabled={!isInputValid || disabled || isRunning}
            className={`flex items-center gap-3 px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
              isInputValid && !disabled && !isRunning
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            whileHover={isInputValid && !disabled && !isRunning ? { scale: 1.05 } : {}}
            whileTap={isInputValid && !disabled && !isRunning ? { scale: 0.95 } : {}}
          >
            <Play size={20} />
            {isRunning ? 'Optimizing...' : 'Start Optimization'}
          </motion.button>

          <motion.button
            onClick={onReplay}
            disabled={!canReplay || disabled}
            className={`flex items-center gap-2 px-6 py-4 rounded-lg font-semibold border-2 transition-all ${
              canReplay && !disabled
                ? 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                : 'border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            whileHover={canReplay && !disabled ? { scale: 1.05 } : {}}
            whileTap={canReplay && !disabled ? { scale: 0.95 } : {}}
          >
            <RotateCcw size={18} />
            Replay
          </motion.button>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="mt-4 text-sm text-gray-500 flex items-center gap-4">
          <span className="font-medium">Shortcuts:</span>
          <span>Enter = Start</span>
          <span>Ctrl+R = Replay</span>
        </div>
      </motion.div>
    </div>
  );
}