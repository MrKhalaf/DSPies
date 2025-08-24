/**
 * Modern full-screen input section with guided experience
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Sparkles, MessageSquare, ArrowDown, Info } from 'lucide-react';
import { apiService } from '../services/api';
import { Config } from '../types';

interface ModernInputSectionProps {
  onRun: (inputText: string) => void;
  isRunning: boolean;
  disabled?: boolean;
}

export function ModernInputSection({ onRun, isRunning, disabled = false }: ModernInputSectionProps) {
  const [inputText, setInputText] = useState('');
  const [config, setConfig] = useState<Config | null>(null);
  const [selectedExample, setSelectedExample] = useState<number | null>(null);
  const [showGuide, setShowGuide] = useState(true);

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
    setShowGuide(false);
    setTimeout(() => setSelectedExample(null), 300);
  };

  const isInputValid = inputText.trim().length > 0 && 
    inputText.length <= (config?.max_input_chars || 500);

  const exampleCategories = [
    {
      title: "Billing Issues",
      examples: config?.demo_examples.filter(ex => 
        ex.includes('charge') || ex.includes('bill') || ex.includes('plan')
      ) || [],
      color: "from-red-500 to-pink-500"
    },
    {
      title: "Technical Problems", 
      examples: config?.demo_examples.filter(ex =>
        ex.includes('connection') || ex.includes('app') || ex.includes('crash')
      ) || [],
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Account Management",
      examples: config?.demo_examples.filter(ex =>
        ex.includes('cancel') || ex.includes('account') || ex.includes('urgent')
      ) || [],
      color: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full text-lg font-semibold mb-6">
            <MessageSquare size={24} />
            Step 1: Choose Your Input
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-4">
            Enter a Customer Message
          </h2>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            DSPy will automatically generate multiple prompt strategies to classify and summarize your message. 
            Watch as different approaches compete to find the optimal solution.
          </p>
        </motion.div>

        {/* Guide tooltip */}
        <AnimatePresence>
          {showGuide && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-4 right-4 bg-blue-600 text-white p-4 rounded-xl shadow-lg max-w-sm z-50"
            >
              <div className="flex items-start gap-3">
                <Info size={20} className="mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Getting Started</h4>
                  <p className="text-sm opacity-90">
                    Choose an example below or write your own customer message to see DSPy optimization in action!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="absolute top-2 right-2 text-white/70 hover:text-white"
              >
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-4xl mx-auto">
          {/* Input area */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-slate-200"
          >
            <div className="mb-6">
              <label className="block text-lg font-semibold text-slate-900 mb-3">
                Customer Message
              </label>
              
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a customer support message here, or choose an example below..."
                className="w-full h-32 px-6 py-4 text-lg border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all resize-none"
                maxLength={config?.max_input_chars || 500}
                disabled={disabled}
              />
              
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm text-slate-500">
                  {inputText.length}/{config?.max_input_chars || 500} characters
                </span>
                {!isInputValid && inputText.length > 0 && (
                  <span className="text-sm text-red-500 font-medium">
                    {inputText.length > (config?.max_input_chars || 500) 
                      ? 'Message too long' 
                      : 'Enter a message'}
                  </span>
                )}
              </div>
            </div>

            {/* Action button */}
            <div className="text-center">
              <motion.button
                onClick={handleRun}
                disabled={!isInputValid || disabled || isRunning}
                className={`inline-flex items-center gap-4 px-12 py-6 text-xl font-bold rounded-2xl transition-all transform ${
                  isInputValid && !disabled && !isRunning
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 hover:scale-105 shadow-2xl'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
                whileHover={isInputValid && !disabled && !isRunning ? { scale: 1.05 } : {}}
                whileTap={isInputValid && !disabled && !isRunning ? { scale: 0.95 } : {}}
              >
                {isRunning ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles size={24} />
                    </motion.div>
                    Optimizing Prompts...
                  </>
                ) : (
                  <>
                    <Play size={24} />
                    Start DSPy Optimization
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Example categories */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Or Try These Examples
              </h3>
              <p className="text-slate-600">
                Click any example to see how DSPy handles different types of customer messages
              </p>
              <ArrowDown size={24} className="mx-auto mt-4 text-slate-400 animate-bounce" />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {exampleCategories.map((category, categoryIndex) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + categoryIndex * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center mb-4`}>
                    <MessageSquare size={24} className="text-white" />
                  </div>
                  
                  <h4 className="text-lg font-bold text-slate-900 mb-4">
                    {category.title}
                  </h4>
                  
                  <div className="space-y-3">
                    {category.examples.map((example, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleUseExample(example, index)}
                        disabled={disabled}
                        className={`w-full text-left p-4 text-sm border-2 rounded-xl transition-all ${
                          selectedExample === index
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        whileHover={!disabled ? { scale: 1.02 } : {}}
                        whileTap={!disabled ? { scale: 0.98 } : {}}
                      >
                        <div className="font-medium text-slate-800 mb-1">
                          {example.split(' ').slice(0, 4).join(' ')}...
                        </div>
                        <div className="text-slate-600 text-xs">
                          "{example}"
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}