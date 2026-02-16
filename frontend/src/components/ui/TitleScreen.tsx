import { useEffect, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';

export function TitleScreen() {
  const startGame = useGameStore(s => s.startGame);

  const handleStart = useCallback(() => {
    startGame();
  }, [startGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleStart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleStart]);

  return (
    <div style={styles.container}>
      {/* Animated star background */}
      <div style={styles.starsLayer}>
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.star,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 1.5}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div style={styles.content}>
        {/* Title */}
        <h1 style={styles.title}>DSPyville</h1>
        <p style={styles.subtitle}>A Pokemon-Inspired DSPy Adventure</p>

        {/* Spacer */}
        <div style={{ height: '80px' }} />

        {/* Start prompt */}
        <button onClick={handleStart} style={styles.startButton}>
          Press SPACE to Start
        </button>

        {/* Spacer */}
        <div style={{ height: '60px' }} />

        {/* Controls hint */}
        <div style={styles.controlsSection}>
          <p style={styles.controlText}>WASD to move | SPACE to talk | Learn DSPy concepts!</p>
        </div>

        {/* Version */}
        <p style={styles.version}>v1.0 - Built with React Three Fiber</p>
      </div>

      {/* Inline CSS animations */}
      <style>{`
        @keyframes titleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
    position: 'relative',
    overflow: 'hidden',
  },
  starsLayer: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    animation: 'twinkle 2s ease-in-out infinite',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    textAlign: 'center',
    padding: '0 20px',
  },
  title: {
    fontSize: '48px',
    color: '#ffffff',
    textShadow: '0 0 20px rgba(100, 200, 255, 0.8), 0 0 40px rgba(100, 200, 255, 0.4), 0 4px 8px rgba(0, 0, 0, 0.5)',
    letterSpacing: '4px',
    margin: 0,
    animation: 'titleFloat 3s ease-in-out infinite',
    fontFamily: "'Press Start 2P', monospace",
  },
  subtitle: {
    fontSize: '14px',
    color: '#87CEEB',
    marginTop: '20px',
    letterSpacing: '2px',
    fontFamily: "'Press Start 2P', monospace",
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
  },
  startButton: {
    fontSize: '16px',
    color: '#ffd700',
    background: 'none',
    border: '2px solid rgba(255, 215, 0, 0.4)',
    borderRadius: '8px',
    padding: '16px 32px',
    cursor: 'pointer',
    fontFamily: "'Press Start 2P', monospace",
    animation: 'blink 1.5s ease-in-out infinite',
    textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
    transition: 'border-color 0.2s',
  },
  controlsSection: {
    padding: '12px 20px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  controlText: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: '1.8',
    fontFamily: "'Press Start 2P', monospace",
  },
  version: {
    fontSize: '8px',
    color: 'rgba(255, 255, 255, 0.3)',
    marginTop: '24px',
    fontFamily: "'Press Start 2P', monospace",
  },
};
