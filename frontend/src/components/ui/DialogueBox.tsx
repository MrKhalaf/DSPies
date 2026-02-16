import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { npcs } from '../../data/npcs';

const CHAR_DELAY_MS = 30;

export function DialogueBox() {
  const dialogue = useGameStore((s) => s.dialogue);
  const advanceDialogue = useGameStore((s) => s.advanceDialogue);
  const closeDialogue = useGameStore((s) => s.closeDialogue);
  const learnConcept = useGameStore((s) => s.learnConcept);
  const learnedConcepts = useGameStore((s) => s.learnedConcepts);
  const flashConceptCard = useGameStore((s) => s.flashConceptCard);

  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [blinkVisible, setBlink] = useState(true);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fullTextRef = useRef('');
  const charIndexRef = useRef(0);

  // Get the current line text
  const currentText = dialogue.isOpen
    ? dialogue.lines[dialogue.currentLine] || ''
    : '';

  // Start typewriter effect when current line changes
  useEffect(() => {
    if (!dialogue.isOpen) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    // Reset for new line
    fullTextRef.current = currentText;
    charIndexRef.current = 0;
    setDisplayedText('');
    setIsTyping(true);

    // Clear previous timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      charIndexRef.current += 1;
      const nextText = fullTextRef.current.slice(0, charIndexRef.current);
      setDisplayedText(nextText);

      if (charIndexRef.current >= fullTextRef.current.length) {
        setIsTyping(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }, CHAR_DELAY_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [dialogue.isOpen, dialogue.currentLine, currentText]);

  // Blink the triangle indicator
  useEffect(() => {
    if (!dialogue.isOpen || isTyping) return;

    const blinkTimer = setInterval(() => {
      setBlink((prev) => !prev);
    }, 500);

    return () => clearInterval(blinkTimer);
  }, [dialogue.isOpen, isTyping]);

  // Reset blink when typing starts
  useEffect(() => {
    if (isTyping) setBlink(true);
  }, [isTyping]);

  const handleAdvance = useCallback(() => {
    if (!dialogue.isOpen) return;

    if (isTyping) {
      // Skip to full line
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setDisplayedText(fullTextRef.current);
      setIsTyping(false);
      return;
    }

    const isLastLine = dialogue.currentLine >= dialogue.lines.length - 1;

    if (isLastLine) {
      // Dialogue is done -- learn concept if applicable
      const npcDef = npcs.find((n) => n.id === dialogue.npcId);
      if (npcDef && !learnedConcepts.includes(npcDef.concept.name)) {
        learnConcept(npcDef.concept.name);
        flashConceptCard(npcDef.concept.name, npcDef.concept.description);
      }
      closeDialogue();
    } else {
      advanceDialogue();
    }
  }, [
    dialogue.isOpen,
    dialogue.currentLine,
    dialogue.lines.length,
    dialogue.npcId,
    isTyping,
    advanceDialogue,
    closeDialogue,
    learnConcept,
    learnedConcepts,
    flashConceptCard,
  ]);

  // Listen for SPACE key
  useEffect(() => {
    if (!dialogue.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        handleAdvance();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [dialogue.isOpen, handleAdvance]);

  if (!dialogue.isOpen) return null;

  const totalLines = dialogue.lines.length;
  const currentLineIndex = dialogue.currentLine;

  // Find the NPC def for the accent color
  const npcDef = npcs.find((n) => n.id === dialogue.npcId);
  const accentColor = npcDef?.accentColor || '#4a90d9';

  return (
    <div style={styles.overlay} onClick={handleAdvance}>
      <div style={styles.container}>
        {/* NPC name badge */}
        <div
          style={{
            ...styles.nameBadge,
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
          }}
        >
          {dialogue.npcName}
        </div>

        {/* Dialogue text */}
        <div style={styles.textArea}>
          <span style={styles.text}>{displayedText}</span>
          {isTyping && <span style={styles.cursor}>|</span>}
        </div>

        {/* Bottom row: progress dots + continue hint */}
        <div style={styles.bottomRow}>
          {/* Progress dots */}
          <div style={styles.progressDots}>
            {Array.from({ length: totalLines }, (_, i) => (
              <span
                key={i}
                style={{
                  ...styles.dot,
                  background:
                    i === currentLineIndex
                      ? '#ffffff'
                      : i < currentLineIndex
                        ? 'rgba(255, 255, 255, 0.6)'
                        : 'rgba(255, 255, 255, 0.25)',
                  transform: i === currentLineIndex ? 'scale(1.3)' : 'scale(1)',
                }}
              />
            ))}
          </div>

          {/* Continue indicator */}
          {!isTyping && (
            <div style={styles.continueHint}>
              <span
                style={{
                  ...styles.triangle,
                  opacity: blinkVisible ? 1 : 0.3,
                }}
              >
                {'\u25BC'}
              </span>
              <span style={styles.hintText}>SPACE</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    width: '90%',
    maxWidth: '700px',
    pointerEvents: 'auto',
  },
  container: {
    background: 'rgba(0, 0, 0, 0.88)',
    borderRadius: '12px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    padding: '20px 24px 14px 24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
    position: 'relative' as const,
  },
  nameBadge: {
    position: 'absolute' as const,
    top: '-14px',
    left: '20px',
    padding: '4px 14px',
    borderRadius: '8px',
    color: '#ffffff',
    fontFamily: '"Press Start 2P", "Courier New", monospace',
    fontSize: '11px',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  textArea: {
    minHeight: '50px',
    marginTop: '6px',
    marginBottom: '10px',
  },
  text: {
    color: '#ffffff',
    fontFamily: '"Courier New", monospace',
    fontSize: '16px',
    lineHeight: '1.6',
    letterSpacing: '0.3px',
  },
  cursor: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: '"Courier New", monospace',
    fontSize: '16px',
    animation: 'none',
  },
  bottomRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    paddingTop: '8px',
  },
  progressDots: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  dot: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    transition: 'all 0.2s ease',
  },
  continueHint: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  triangle: {
    color: '#ffd700',
    fontSize: '12px',
    transition: 'opacity 0.15s ease',
  },
  hintText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontFamily: '"Press Start 2P", "Courier New", monospace',
    fontSize: '9px',
    letterSpacing: '1px',
  },
};
