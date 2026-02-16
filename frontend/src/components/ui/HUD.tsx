import { useGameStore } from '../../store/gameStore';

const ALL_CONCEPTS = [
  'DSPy Overview',
  'Signatures',
  'Modules',
  'Optimizers',
  'Metrics',
];

export function HUD() {
  const learnedConcepts = useGameStore(s => s.learnedConcepts);
  const learnedCount = learnedConcepts.length;
  const totalCount = ALL_CONCEPTS.length;
  const progressPercent = (learnedCount / totalCount) * 100;

  return (
    <div style={styles.container}>
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
          }}
        />
      </div>

      {/* Concept list */}
      <div style={styles.conceptList}>
        {ALL_CONCEPTS.map(concept => {
          const isLearned = learnedConcepts.includes(concept);
          return (
            <div key={concept} style={styles.conceptRow}>
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
    gap: '8px',
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
