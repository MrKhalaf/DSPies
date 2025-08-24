/**
 * Modern full-screen app with guided experience and sleek design
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

import { LandingHero } from './LandingHero';
import { ModernInputSection } from './ModernInputSection';
import { OptimizationVisualization } from './OptimizationVisualization';
import { ModernResultsSection } from './ModernResultsSection';
import { useOptimization } from '../hooks/useOptimization';

type AppState = 'landing' | 'input' | 'optimizing' | 'results';

export function ModernApp() {
  const [appState, setAppState] = useState<AppState>('landing');
  const { state, startOptimization, replay, reset, error } = useOptimization();

  const handleGetStarted = () => {
    setAppState('input');
  };

  const handleStartOptimization = async (inputText: string) => {
    setAppState('optimizing');
    await startOptimization(inputText);
  };

  const handleReplay = () => {
    setAppState('optimizing');
    replay();
  };

  const handleNewOptimization = () => {
    reset();
    setAppState('input');
  };

  const handleReset = () => {
    reset();
    setAppState('landing');
  };

  // Auto-transition to results when optimization completes
  React.useEffect(() => {
    if (state.status === 'complete' && appState === 'optimizing') {
      setTimeout(() => setAppState('results'), 1000);
    }
  }, [state.status, appState]);

  const getWinnerVariant = () => {
    if (!state.leader) return undefined;
    return state.variants.find(v => v.variant.variant_id === state.leader);
  };

  const getWinnerScore = () => {
    const winner = getWinnerVariant();
    return winner?.score;
  };

  const isRunning = state.status === 'compiling' || state.status === 'running';

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Global error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-4 shadow-lg"
          >
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle size={24} />
                <div>
                  <div className="font-bold">Optimization Error</div>
                  <div className="text-red-100">{error}</div>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 rounded-lg font-medium transition-colors"
              >
                Reset Application
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content with smooth transitions */}
      <AnimatePresence mode="wait">
        {appState === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LandingHero onGetStarted={handleGetStarted} />
          </motion.div>
        )}

        {appState === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <ModernInputSection
              onRun={handleStartOptimization}
              isRunning={isRunning}
              disabled={!!error}
            />
          </motion.div>
        )}

        {appState === 'optimizing' && (
          <motion.div
            key="optimizing"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <OptimizationVisualization
              variants={state.variants}
              leader={state.leader}
              status={state.status as any}
              progress={state.progress}
            />
          </motion.div>
        )}

        {appState === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <ModernResultsSection
              winnerVariant={getWinnerVariant()}
              winnerScore={getWinnerScore()}
              allVariants={state.variants}
              onReplay={handleReplay}
              onNewOptimization={handleNewOptimization}
              inputText={state.currentRun?.input_text || ''}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation dots (optional) */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <div className="flex gap-2">
          {['landing', 'input', 'optimizing', 'results'].map((step, index) => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full transition-all ${
                appState === step 
                  ? 'bg-blue-600 w-8' 
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}