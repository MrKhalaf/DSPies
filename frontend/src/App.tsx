/**
 * Main App component for the Live Optimizing Classifier.
 * The Prompt Kitchen: A narrative-driven experience with chef characters!
 */

import React from 'react';
import { PromptKitchen } from './components/PromptKitchen';
import { useSimpleDSPyDemo } from './hooks/useSimpleDSPyDemo';

import './App.css';

function App() {
  const { variants, isRunning, winner, error, startOptimization, reset } = useSimpleDSPyDemo();

  return (
    <PromptKitchen
      variants={variants}
      isRunning={isRunning}
      winner={winner}
      onRun={startOptimization}
    />
  );
}

export default App;
