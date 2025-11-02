/**
 * The Prompt Chef's Journey
 * An interactive 16-bit pixel art story that teaches DSPy in 10 steps
 */

import React from 'react';
import { DSPyStory } from './components/DSPyStory';
import { useSimpleDSPyDemo } from './hooks/useSimpleDSPyDemo';

import './App.css';

function App() {
  const { variants, isRunning, winner, error, startOptimization, reset } = useSimpleDSPyDemo();

  return (
    <DSPyStory
      variants={variants}
      isRunning={isRunning}
      winner={winner}
      onRun={startOptimization}
    />
  );
}

export default App;
