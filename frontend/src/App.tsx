/**
 * Main App component for the Live Optimizing Classifier.
 * Orchestrates the optimization flow and manages global state.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

import { EnhancedInputPanel } from './components/EnhancedInputPanel';
import { DSPyExplainer } from './components/DSPyExplainer';
import { VariantShowcase } from './components/VariantShowcase';
import { ResultsPanel } from './components/ResultsPanel';
import { useOptimization } from './hooks/useOptimization';

import './App.css';

function App() {
  const { state, startOptimization, replay, toggleInternals, reset, error } = useOptimization();

  const handleCopyFullJson = async () => {
    if (!state.currentRun) return;
    
    try {
      const fullData = {
        run: state.currentRun,
        ui_state: {
          variants: state.variants,
          leader: state.leader,
          progress: state.progress
        }
      };
      
      await navigator.clipboard.writeText(JSON.stringify(fullData, null, 2));
      // Could add toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const getWinnerVariant = () => {
    if (!state.leader) return undefined;
    return state.variants.find(v => v.variant.variant_id === state.leader);
  };

  const getWinnerScore = () => {
    const winner = getWinnerVariant();
    return winner?.score;
  };

  const isRunning = state.status === 'compiling' || state.status === 'running';
  const canReplay = state.status === 'complete' && !!state.currentRun;
  const completedVariants = state.variants.filter(v => v.state === 'scored' || v.state === 'error').length;

  const getCurrentStep = () => {
    if (state.status === 'idle') return 'idle';
    if (state.status === 'compiling') return 'generating';
    if (state.status === 'running') {
      if (completedVariants === 0) return 'testing';
      if (completedVariants < state.variants.length) return 'scoring';
      return 'selecting';
    }
    if (state.status === 'complete') return 'complete';
    return 'idle';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <div className="font-medium text-red-800">Optimization Error</div>
                <div className="text-red-700">{error}</div>
              </div>
              <button
                onClick={reset}
                className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                Reset
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Panel */}
        <EnhancedInputPanel
          onRun={startOptimization}
          onReplay={replay}
          isRunning={isRunning}
          canReplay={canReplay}
          disabled={!!error}
        />

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {state.status === 'idle' ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">✨</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Ready for AI Optimization
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Enter a customer message above to see DSPy automatically optimize prompts in real-time. 
                You'll watch multiple AI strategies compete to find the best solution!
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="running"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* DSPy Process Explainer */}
              <DSPyExplainer
                currentStep={getCurrentStep()}
                variantCount={Math.max(state.variants.length, 3)}
                completedCount={completedVariants}
              />

              {/* Variants Showcase */}
              <VariantShowcase
                variants={state.variants}
                leader={state.leader}
                showInternals={state.showInternals}
                onToggleInternals={toggleInternals}
              />

              {/* Final Results */}
              {state.status === 'complete' && (
                <ResultsPanel
                  winnerVariant={getWinnerVariant()}
                  winnerScore={getWinnerScore()}
                  allVariants={state.variants}
                  onReplay={replay}
                  onCopyJson={handleCopyFullJson}
                  inputText={state.currentRun?.input_text || ''}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
