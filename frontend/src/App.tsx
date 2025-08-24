import React, { useState } from 'react';
import './App.css';

export default function App() {
  const [text, setText] = useState('');
  const [view, setView] = useState<'landing' | 'result'>('landing');

  const handleRun = () => {
    if (!text.trim()) return;
    setView('result');
    // Backend integration would run here
  };

  if (view === 'landing') {
    return (
      <div className="app">
        <h1>Interactive Tutor</h1>
        <p className="tagline">
          Enter a short message and watch how different approaches are evaluated to find a concise answer.
        </p>
        <textarea
          value={text}
          maxLength={500}
          onChange={e => setText(e.target.value)}
          placeholder="Enter up to 500 characters"
        />
        <button onClick={handleRun} disabled={!text.trim()}>
          Run
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>Result Preview</h1>
      <p>
        The system analyzes several program variants and highlights the best response here.
      </p>
      <button onClick={() => setView('landing')}>Run Again</button>
    </div>
  );
}

