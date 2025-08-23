/**
 * Main App component for the Live Optimizing Classifier.
 * Orchestrates the optimization flow and manages global state.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

import { InputPanel } from './components/InputPanel';
import { VariantCard } from './components/VariantCard';
import { Scoreboard } from './components/Scoreboard';
import { OptimizationMeter } from './components/OptimizationMeter';
import { FinalPanel } from './components/FinalPanel';
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
  const canReplay = state.status === 'complete' && state.currentRun;
  const completedVariants = state.variants.filter(v => v.state === 'scored' || v.state === 'error').length;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
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
                <div className="font-medium text-red-800">Error</div>
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
        <InputPanel
          onRun={startOptimization}
          onReplay={replay}
          onToggleInternals={toggleInternals}
          showInternals={state.showInternals}
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
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Ready to Optimize
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Enter some text above and watch as DSPy tests multiple prompt variants 
                to find the best approach for classification and summarization.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="running"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Progress Section */}
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <OptimizationMeter
                    progress={state.progress}
                    status={state.status}
                    variantCount={3}
                    completedCount={completedVariants}
                  />
                </div>
                <div>
                  <Scoreboard
                    variants={state.variants}
                    leader={state.leader}
                  />
                </div>
              </div>

              {/* Variants Grid */}
              {state.variants.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Variant Testing
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {state.variants.map((variantState, index) => (
                        <VariantCard
                          key={variantState.variant.variant_id}
                          variantState={variantState}
                          showInternals={state.showInternals}
                          isLeader={variantState.variant.variant_id === state.leader}
                          rank={index + 1}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Final Results */}
              {state.status === 'complete' && (
                <FinalPanel
                  winnerVariant={getWinnerVariant()}
                  winnerScore={getWinnerScore()}
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
