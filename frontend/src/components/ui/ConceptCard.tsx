import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';

const DISPLAY_DURATION_MS = 3000;
const FADE_OUT_MS = 500;

export function ConceptCard() {
  const showConceptCard = useGameStore((s) => s.showConceptCard);
  const hideConceptCard = useGameStore((s) => s.hideConceptCard);

  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);
  const [currentCard, setCurrentCard] = useState<{
    name: string;
    description: string;
  } | null>(null);

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (fadeOutTimerRef.current) {
      clearTimeout(fadeOutTimerRef.current);
      fadeOutTimerRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (showConceptCard) {
      cleanup();

      // Store card data so it persists during fade-out
      setCurrentCard({ ...showConceptCard });
      setAnimateOut(false);
      setAnimateIn(false);
      setVisible(true);

      // Use double-rAF to ensure the initial state is painted before transitioning
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => {
          setAnimateIn(true);
        });
      });

      // Start exit after display duration
      hideTimerRef.current = setTimeout(() => {
        setAnimateOut(true);
        setAnimateIn(false);

        fadeOutTimerRef.current = setTimeout(() => {
          setVisible(false);
          setAnimateOut(false);
          setCurrentCard(null);
          hideConceptCard();
        }, FADE_OUT_MS);
      }, DISPLAY_DURATION_MS);

      return cleanup;
    }
  }, [showConceptCard, hideConceptCard, cleanup]);

  if (!visible || !currentCard) return null;

  const containerAnimStyle: React.CSSProperties = animateOut
    ? {
        transform: 'translate(-50%, -50%) scale(0.9)',
        opacity: 0,
        transition: `transform ${FADE_OUT_MS}ms ease-in, opacity ${FADE_OUT_MS}ms ease-in`,
      }
    : animateIn
      ? {
          transform: 'translate(-50%, -50%) scale(1)',
          opacity: 1,
          transition: 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 300ms ease-out',
        }
      : {
          transform: 'translate(-50%, -50%) scale(0.3)',
          opacity: 0,
        };

  return (
    <div style={styles.overlay}>
      <div style={{ ...styles.container, ...containerAnimStyle }}>
        {/* Star decorations */}
        <div style={{ ...styles.star, top: '12px', left: '16px' }}>
          {'\u2726'}
        </div>
        <div style={{ ...styles.star, top: '12px', right: '16px' }}>
          {'\u2726'}
        </div>
        <div style={{ ...styles.star, bottom: '12px', left: '16px' }}>
          {'\u2726'}
        </div>
        <div style={{ ...styles.star, bottom: '12px', right: '16px' }}>
          {'\u2726'}
        </div>

        {/* Header */}
        <div style={styles.header}>CONCEPT LEARNED!</div>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Concept name */}
        <div style={styles.conceptName}>{currentCard.name}</div>

        {/* Description */}
        <div style={styles.description}>{currentCard.description}</div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2000,
    pointerEvents: 'none',
  },
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '320px',
    padding: '28px 24px 24px 24px',
    borderRadius: '16px',
    background: 'linear-gradient(145deg, #1a1a4e, #0d0d2b)',
    border: '3px solid #ffd700',
    boxShadow:
      '0 0 30px rgba(255, 215, 0, 0.4), 0 0 60px rgba(255, 215, 0, 0.2), 0 12px 40px rgba(0, 0, 0, 0.6)',
    textAlign: 'center' as const,
    overflow: 'hidden',
  },
  star: {
    position: 'absolute' as const,
    color: '#ffd700',
    fontSize: '16px',
    opacity: 0.7,
  },
  header: {
    color: '#ffd700',
    fontFamily: '"Press Start 2P", "Courier New", monospace',
    fontSize: '13px',
    fontWeight: 'bold',
    letterSpacing: '2px',
    marginBottom: '10px',
    textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
  },
  divider: {
    width: '60%',
    height: '2px',
    margin: '0 auto 14px auto',
    background: 'linear-gradient(90deg, transparent, #ffd700, transparent)',
  },
  conceptName: {
    color: '#ffffff',
    fontFamily: '"Press Start 2P", "Courier New", monospace',
    fontSize: '17px',
    fontWeight: 'bold',
    lineHeight: '1.4',
    marginBottom: '12px',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
  },
  description: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: '"Courier New", monospace',
    fontSize: '13px',
    fontStyle: 'italic',
    lineHeight: '1.5',
    padding: '0 8px',
  },
};
