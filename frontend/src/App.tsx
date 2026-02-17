import { useState, useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { TitleScreen } from './components/ui/TitleScreen';
import { GameScene } from './components/GameScene';
import { DialogueBox } from './components/ui/DialogueBox';
import { HUD } from './components/ui/HUD';
import { ConceptCard } from './components/ui/ConceptCard';

export default function App() {
  const gameStarted = useGameStore(s => s.gameStarted);
  const [fadeOut, setFadeOut] = useState(false);
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    if (gameStarted && !showGame) {
      setShowGame(true);
    }
  }, [gameStarted, showGame]);

  // Fade out the overlay after showGame triggers a render with the black overlay visible
  useEffect(() => {
    if (showGame && !fadeOut) {
      const timer = setTimeout(() => setFadeOut(true), 100);
      return () => clearTimeout(timer);
    }
  }, [showGame, fadeOut]);

  if (!gameStarted && !showGame) {
    return <TitleScreen />;
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <GameScene />
      <HUD />
      <DialogueBox />
      <ConceptCard />

      {/* Black overlay for screen transition */}
      {showGame && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#000000',
            zIndex: 9999,
            opacity: fadeOut ? 0 : 1,
            transition: 'opacity 1s ease-out',
            pointerEvents: fadeOut ? 'none' : 'auto',
          }}
          onTransitionEnd={() => {
            if (fadeOut) {
              // Transition is complete, we could clean up but keep it for simplicity
            }
          }}
        />
      )}
    </div>
  );
}
