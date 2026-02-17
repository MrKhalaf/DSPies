import { useEffect, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';

export function TitleScreen() {
  const startGame = useGameStore(s => s.startGame);

  const handleStart = useCallback(() => {
    startGame();
  }, [startGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.key === 'Enter') {
        e.preventDefault();
        handleStart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleStart]);

  return (
    <div style={styles.container}>
      {/* Animated gradient overlay */}
      <div style={styles.gradientOverlay} />

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

      {/* Shooting stars */}
      <div style={styles.shootingStarsLayer}>
        <div style={{ ...styles.shootingStar, top: '15%', left: '10%', animationDelay: '0s' }} />
        <div style={{ ...styles.shootingStar, top: '35%', left: '60%', animationDelay: '4s' }} />
        <div style={{ ...styles.shootingStar, top: '55%', left: '30%', animationDelay: '8s' }} />
      </div>

      {/* Main content */}
      <div style={styles.content}>
        {/* Title */}
        <h1 style={styles.title}>DSPyville</h1>
        <p style={styles.subtitle}>A Pokemon-Inspired DSPy Adventure</p>

        {/* Spacer */}
        <div style={{ height: '80px' }} />

        {/* Start prompt */}
        <button type="button" onClick={handleStart} style={styles.startButton}>
          Press SPACE or ENTER to Start
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

      {/* Town silhouette skyline */}
      <div style={styles.skyline}>
        {/* Buildings */}
        <div style={{ ...styles.building, width: '40px', height: '60px', left: '5%' }} />
        <div style={{ ...styles.building, width: '30px', height: '80px', left: '10%' }} />
        <div style={{ ...styles.building, width: '50px', height: '50px', left: '17%' }} />
        <div style={{ ...styles.building, width: '25px', height: '70px', left: '25%' }} />
        <div style={{ ...styles.building, width: '60px', height: '45px', left: '32%' }} />
        <div style={{ ...styles.building, width: '35px', height: '90px', left: '42%' }} />
        <div style={{ ...styles.building, width: '45px', height: '55px', left: '50%' }} />
        <div style={{ ...styles.building, width: '30px', height: '75px', left: '58%' }} />
        <div style={{ ...styles.building, width: '55px', height: '40px', left: '65%' }} />
        <div style={{ ...styles.building, width: '25px', height: '85px', left: '73%' }} />
        <div style={{ ...styles.building, width: '40px', height: '50px', left: '80%' }} />
        <div style={{ ...styles.building, width: '35px', height: '65px', left: '88%' }} />
        {/* Trees (triangles via CSS borders) */}
        <div style={{ ...styles.tree, left: '15%' }} />
        <div style={{ ...styles.tree, left: '38%' }} />
        <div style={{ ...styles.tree, left: '55%' }} />
        <div style={{ ...styles.tree, left: '70%' }} />
        <div style={{ ...styles.tree, left: '92%' }} />
      </div>

      {/* Inline CSS animations */}
      <style>{`
        @keyframes titleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes startPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
            text-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.3);
          }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1); }
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes shootingStarAnim {
          0% {
            transform: translate(0, 0) rotate(-35deg) scaleX(0);
            opacity: 0;
          }
          5% {
            opacity: 1;
            transform: translate(0, 0) rotate(-35deg) scaleX(1);
          }
          30% {
            transform: translate(200px, 120px) rotate(-35deg) scaleX(1);
            opacity: 0.6;
          }
          40% {
            transform: translate(300px, 180px) rotate(-35deg) scaleX(0.5);
            opacity: 0;
          }
          100% {
            transform: translate(300px, 180px) rotate(-35deg) scaleX(0);
            opacity: 0;
          }
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
  gradientOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(26,26,46,0.6) 0%, rgba(30,15,60,0.4) 50%, rgba(26,26,46,0.6) 100%)',
    backgroundSize: '200% 200%',
    animation: 'gradientShift 8s ease infinite',
    pointerEvents: 'none',
    zIndex: 0,
  },
  starsLayer: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 1,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    animation: 'twinkle 2s ease-in-out infinite',
  },
  shootingStarsLayer: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 1,
  },
  shootingStar: {
    position: 'absolute',
    width: '80px',
    height: '2px',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)',
    borderRadius: '1px',
    animation: 'shootingStarAnim 6s linear infinite',
    opacity: 0,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
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
    animation: 'startPulse 1.5s ease-in-out infinite',
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
  skyline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100px',
    pointerEvents: 'none',
    zIndex: 1,
  },
  building: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(15, 20, 40, 0.7)',
    borderRadius: '2px 2px 0 0',
  },
  tree: {
    position: 'absolute',
    bottom: 0,
    width: 0,
    height: 0,
    borderLeft: '12px solid transparent',
    borderRight: '12px solid transparent',
    borderBottom: '30px solid rgba(15, 25, 35, 0.6)',
  },
};
