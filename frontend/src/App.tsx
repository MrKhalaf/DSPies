/**
 * Main App component for the Live Optimizing Classifier.
 * Simple, educational experience showcasing DSPy optimization.
 */

import React from 'react';
import { SimpleDSPyDemo } from './components/SimpleDSPyDemo';
import { useSimpleDSPyDemo } from './hooks/useSimpleDSPyDemo';

import './App.css';

function App() {
  const { variants, isRunning, winner, error, startOptimization, reset } = useSimpleDSPyDemo();

  return (
    <SimpleDSPyDemo
      variants={variants}
      isRunning={isRunning}
      winner={winner}
      onRun={startOptimization}
    />
  );
}

export default App;
