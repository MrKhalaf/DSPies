import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';

const ALL_CONCEPTS = [
  'DSPy Overview',
  'Signatures',
  'Modules',
  'Optimizers',
  'Metrics',
];

const CONCEPT_ICONS: Record<string, string> = {
  'DSPy Overview': '\uD83D\uDCD6',
  'Signatures': '\u270D\uFE0F',
  'Modules': '\uD83E\uDDE9',
  'Optimizers': '\u26A1',
  'Metrics': '\uD83D\uDCCA',
};

export function HUD() {
  const learnedConcepts = useGameStore(s => s.learnedConcepts);
  const learnedCount = learnedConcepts.length;
  const totalCount = ALL_CONCEPTS.length;
  const progressPercent = (learnedCount / totalCount) * 100;

  const [hasAppeared, setHasAppeared] = useState(false);
  const [flashedConcept, setFlashedConcept] = useState<string | null>(null);
  const prevLearnedRef = useRef<string[]>([]);

  // Slide-in animation on mount
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setHasAppeared(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  // Detect newly learned concept for flash animation
  useEffect(() => {
    const prev = prevLearnedRef.current;
    const newlyLearned = learnedConcepts.find(c => !prev.includes(c));
    prevLearnedRef.current = [...learnedConcepts];

    if (newlyLearned) {
      setFlashedConcept(newlyLearned);
      const timer = setTimeout(() => setFlashedConcept(null), 800);
      return () => clearTimeout(timer);
    }
  }, [learnedConcepts]);

  return (
    <div style={{
      ...styles.container,
      transform: hasAppeared ? 'translateX(0)' : 'translateX(120%)',
      opacity: hasAppeared ? 1 : 0,
      transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease-out',
    }}>
      {/* Shimmer and flash keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes conceptFlash {
          0% { background-color: rgba(34, 197, 94, 0.5); }
          100% { background-color: transparent; }
        }
      `}</style>

      {/* Header */}
      <div style={styles.header}>DSPy Concepts</div>

      {/* Progress text */}
      <div style={styles.progressText}>
        {learnedCount} / {totalCount} Learned
      </div>

      {/* Progress bar */}
      <div style={styles.progressBarOuter}>
        <div
          style={{
            ...styles.progressBarInner,
            width: `${progressPercent}%`,
            backgroundImage: progressPercent > 0
              ? 'linear-gradient(90deg, #ffd700, #ffaa00, #ffd700, #fff5cc, #ffd700, #ffaa00)'
              : undefined,
            backgroundSize: '200% 100%',
            animation: progressPercent > 0 ? 'shimmer 2s linear infinite' : 'none',
          }}
        />
      </div>

      {/* Concept list */}
      <div style={styles.conceptList}>
        {ALL_CONCEPTS.map(concept => {
          const isLearned = learnedConcepts.includes(concept);
          const isFlashing = flashedConcept === concept;
          const icon = CONCEPT_ICONS[concept] || '';
          return (
            <div
              key={concept}
              style={{
                ...styles.conceptRow,
                animation: isFlashing ? 'conceptFlash 0.8s ease-out' : 'none',
                borderRadius: '4px',
                padding: '2px 4px',
              }}
            >
              <span style={{
                ...styles.conceptEmoji,
                opacity: isLearned ? 1 : 0.3,
                filter: isLearned ? 'none' : 'grayscale(100%)',
              }}>
                {icon}
              </span>
              <span style={{
                ...styles.conceptIcon,
                color: isLearned ? '#22c55e' : 'rgba(255, 255, 255, 0.3)',
              }}>
                {isLearned ? '\u2713' : '\u25CB'}
              </span>
              <span style={{
                ...styles.conceptName,
                color: isLearned ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
              }}>
                {concept}
              </span>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Controls section */}
      <div style={styles.controlsHeader}>Controls</div>
      <div style={styles.controlRow}>WASD - Move</div>
      <div style={styles.controlRow}>SPACE - Talk</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    top: '16px',
    right: '16px',
    background: 'rgba(0, 0, 0, 0.7)',
    borderRadius: '12px',
    padding: '16px',
    color: '#ffffff',
    fontSize: '10px',
    fontFamily: "'Press Start 2P', monospace",
    minWidth: '200px',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    zIndex: 10,
    backdropFilter: 'blur(4px)',
    pointerEvents: 'none',
  },
  header: {
    color: '#ffd700',
    fontSize: '11px',
    marginBottom: '10px',
    textAlign: 'center',
    textShadow: '0 0 8px rgba(255, 215, 0, 0.4)',
  },
  progressText: {
    fontSize: '9px',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '6px',
    textAlign: 'center',
  },
  progressBarOuter: {
    width: '100%',
    height: '8px',
    background: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '14px',
  },
  progressBarInner: {
    height: '100%',
    background: 'linear-gradient(90deg, #ffd700, #ffaa00)',
    borderRadius: '4px',
    transition: 'width 0.5s ease-out',
  },
  conceptList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  conceptRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  conceptEmoji: {
    fontSize: '12px',
    width: '18px',
    textAlign: 'center',
    flexShrink: 0,
    transition: 'opacity 0.3s ease, filter 0.3s ease',
  },
  conceptIcon: {
    fontSize: '12px',
    width: '16px',
    textAlign: 'center',
    flexShrink: 0,
  },
  conceptName: {
    fontSize: '8px',
    lineHeight: '1.4',
  },
  divider: {
    width: '100%',
    height: '1px',
    background: 'rgba(255, 255, 255, 0.2)',
    margin: '14px 0 10px 0',
  },
  controlsHeader: {
    color: '#87CEEB',
    fontSize: '9px',
    marginBottom: '8px',
  },
  controlRow: {
    fontSize: '8px',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: '4px',
    lineHeight: '1.6',
  },
};
