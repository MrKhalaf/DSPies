import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { npcs } from '../../data/npcs';

const CHAR_DELAY_MS = 22;

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

  const currentText = dialogue.isOpen
    ? dialogue.lines[dialogue.currentLine] || ''
    : '';

  useEffect(() => {
    if (!dialogue.isOpen) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    fullTextRef.current = currentText;
    charIndexRef.current = 0;
    setDisplayedText('');
    setIsTyping(true);

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

  useEffect(() => {
    if (!dialogue.isOpen || isTyping) return;

    const blinkTimer = setInterval(() => {
      setBlink((prev) => !prev);
    }, 450);

    return () => clearInterval(blinkTimer);
  }, [dialogue.isOpen, isTyping]);

  useEffect(() => {
    if (isTyping) setBlink(true);
  }, [isTyping]);

  const handleAdvance = useCallback(() => {
    if (!dialogue.isOpen) return;

    if (isTyping) {
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

  useEffect(() => {
    if (!dialogue.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ' || e.code === 'Enter') {
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

  const npcDef = npcs.find((n) => n.id === dialogue.npcId);
  const accentColor = npcDef?.accentColor || '#4a90d9';
  const bodyColor = npcDef?.bodyColor || '#3b5998';
  const npcInitial = npcDef?.name?.[0] || '?';

  return (
    <div style={styles.overlay} onClick={handleAdvance}>
      <style>{`
        @keyframes portraitFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        @keyframes portraitGlow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.06); }
        }

        @keyframes textPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>

      <div style={styles.container}>
        <div style={styles.backgroundSheen} />

        <div style={styles.portraitMount}>
          <div
            style={{
              ...styles.portraitAura,
              background: `radial-gradient(circle at 50% 45%, ${accentColor}aa 0%, ${accentColor}20 55%, transparent 80%)`,
              animation: isTyping ? 'portraitGlow 1.4s ease-in-out infinite' : 'none',
            }}
          />

          <div
            style={{
              ...styles.portraitCard,
              borderColor: `${accentColor}dd`,
              animation: 'portraitFloat 3.2s ease-in-out infinite',
            }}
          >
            <div
              style={{
                ...styles.portraitBackdrop,
                background: `linear-gradient(160deg, ${bodyColor} 0%, #101524 100%)`,
              }}
            />

            <div
              style={{
                ...styles.portraitHair,
                background: `linear-gradient(180deg, ${accentColor}, ${accentColor}bb)`,
              }}
            />

            <div style={styles.portraitFace}>
              <div style={styles.eyeRow}>
                <span style={styles.eye} />
                <span style={styles.eye} />
              </div>
              <span style={styles.mouth} />
            </div>

            <div
              style={{
                ...styles.portraitShoulders,
                background: `linear-gradient(180deg, ${bodyColor}, #1b2c4a)`,
              }}
            />

            <div style={styles.portraitInitial}>{npcInitial}</div>
          </div>
        </div>

        <div
          style={{
            ...styles.nameBadge,
            background: `linear-gradient(130deg, ${accentColor}, ${accentColor}bb)`,
          }}
        >
          {dialogue.npcName}
        </div>

        <div style={styles.textWrap}>
          <span style={styles.quoteMark}>"</span>
          <span style={styles.text}>{displayedText}</span>
          {isTyping && <span style={styles.cursor}>|</span>}
        </div>

        <div style={styles.bottomRow}>
          <div style={styles.progressDots}>
            {Array.from({ length: totalLines }, (_, i) => (
              <span
                key={i}
                style={{
                  ...styles.dot,
                  background:
                    i === currentLineIndex
                      ? '#ffe59c'
                      : i < currentLineIndex
                        ? 'rgba(255, 255, 255, 0.65)'
                        : 'rgba(255, 255, 255, 0.2)',
                  transform: i === currentLineIndex ? 'scale(1.35)' : 'scale(1)',
                }}
              />
            ))}
          </div>

          <div style={styles.hintBar}>
            {!isTyping && (
              <span
                style={{
                  ...styles.triangle,
                  opacity: blinkVisible ? 1 : 0.35,
                }}
              >
                {'\u25BC'}
              </span>
            )}
            <span
              style={{
                ...styles.hintText,
                animation: !isTyping ? 'textPulse 1s ease-in-out infinite' : 'none',
              }}
            >
              SPACE / ENTER
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 'clamp(8px, 1.8vh, 20px)',
    zIndex: 1000,
    padding: '0 clamp(8px, 2vw, 32px)',
    pointerEvents: 'auto',
  },
  container: {
    width: 'min(1240px, 100%)',
    margin: '0 auto',
    minHeight: 'clamp(190px, 29vh, 320px)',
    background: 'linear-gradient(160deg, rgba(10, 12, 20, 0.95) 0%, rgba(12, 19, 34, 0.93) 100%)',
    borderRadius: '22px',
    border: '2px solid rgba(170, 220, 255, 0.38)',
    padding: 'clamp(20px, 3vh, 36px) clamp(18px, 3vw, 38px) clamp(14px, 2vh, 24px) clamp(138px, 17vw, 238px)',
    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.55), inset 0 0 0 1px rgba(255,255,255,0.08)',
    position: 'relative',
    overflow: 'visible',
    backdropFilter: 'blur(3px)',
  },
  backgroundSheen: {
    position: 'absolute',
    inset: '8px',
    borderRadius: '16px',
    background: 'linear-gradient(105deg, rgba(255,255,255,0.08) 0%, transparent 25%, transparent 70%, rgba(255,255,255,0.04) 100%)',
    pointerEvents: 'none',
  },
  portraitMount: {
    position: 'absolute',
    left: 'clamp(-38px, -2.6vw, -24px)',
    top: 'clamp(-32px, -2vw, -12px)',
    width: 'clamp(132px, 16vw, 228px)',
    height: 'clamp(156px, 21vh, 260px)',
    pointerEvents: 'none',
  },
  portraitAura: {
    position: 'absolute',
    left: '-8%',
    right: '-8%',
    top: '-10%',
    bottom: '-8%',
    borderRadius: '50%',
    filter: 'blur(8px)',
    opacity: 0.45,
  },
  portraitCard: {
    position: 'absolute',
    inset: 0,
    borderRadius: '20px',
    border: '3px solid',
    boxShadow: '0 14px 30px rgba(0,0,0,0.55), inset 0 2px 0 rgba(255,255,255,0.2)',
    overflow: 'hidden',
    background: '#1a2238',
  },
  portraitBackdrop: {
    position: 'absolute',
    inset: 0,
    opacity: 0.95,
  },
  portraitHair: {
    position: 'absolute',
    top: '11%',
    left: '26%',
    width: '48%',
    height: '29%',
    borderRadius: '50% 50% 40% 40%',
    boxShadow: '0 4px 0 rgba(0,0,0,0.25)',
  },
  portraitFace: {
    position: 'absolute',
    top: '30%',
    left: '28%',
    width: '44%',
    height: '36%',
    background: 'linear-gradient(180deg, #f8d5b9, #e9b58f)',
    borderRadius: '46% 46% 43% 43%',
    border: '2px solid rgba(0,0,0,0.22)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'clamp(10px, 1.2vh, 14px)',
  },
  eyeRow: {
    display: 'flex',
    gap: 'clamp(10px, 1.2vw, 14px)',
    marginTop: '-2px',
  },
  eye: {
    width: 'clamp(6px, 0.9vw, 10px)',
    height: 'clamp(6px, 0.9vw, 10px)',
    backgroundColor: '#10131d',
    borderRadius: '50%',
    boxShadow: '0 0 0 2px rgba(255,255,255,0.32)',
    display: 'inline-block',
  },
  mouth: {
    width: 'clamp(18px, 1.8vw, 30px)',
    height: 'clamp(6px, 0.7vh, 8px)',
    borderRadius: '0 0 8px 8px',
    backgroundColor: 'rgba(120, 32, 42, 0.7)',
    display: 'inline-block',
  },
  portraitShoulders: {
    position: 'absolute',
    left: '18%',
    right: '18%',
    bottom: '-5%',
    height: '35%',
    borderRadius: '45% 45% 0 0',
    border: '2px solid rgba(0,0,0,0.18)',
  },
  portraitInitial: {
    position: 'absolute',
    bottom: '8px',
    right: '10px',
    color: 'rgba(255,255,255,0.9)',
    fontFamily: '"Press Start 2P", "Courier New", monospace',
    fontSize: 'clamp(10px, 0.9vw, 13px)',
    textShadow: '0 2px 6px rgba(0,0,0,0.45)',
  },
  nameBadge: {
    position: 'absolute',
    top: 'clamp(-14px, -1.4vh, -8px)',
    left: 'clamp(128px, 16vw, 236px)',
    padding: '6px 14px',
    borderRadius: '10px',
    color: '#ffffff',
    fontFamily: '"Press Start 2P", "Courier New", monospace',
    fontSize: 'clamp(10px, 0.9vw, 13px)',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    border: '2px solid rgba(255, 255, 255, 0.24)',
    boxShadow: '0 6px 12px rgba(0,0,0,0.35)',
    maxWidth: 'calc(100% - clamp(164px, 19vw, 260px))',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  textWrap: {
    position: 'relative',
    minHeight: 'clamp(82px, 11vh, 126px)',
    paddingRight: '6px',
    color: '#f5fbff',
  },
  quoteMark: {
    position: 'absolute',
    left: '-2px',
    top: '-16px',
    color: 'rgba(170, 220, 255, 0.4)',
    fontSize: 'clamp(38px, 4vw, 56px)',
    lineHeight: 1,
    fontFamily: 'Georgia, serif',
    pointerEvents: 'none',
  },
  text: {
    color: '#f7fdff',
    fontFamily: '"Trebuchet MS", "Verdana", sans-serif',
    fontSize: 'clamp(18px, 2.15vw, 30px)',
    lineHeight: 1.48,
    letterSpacing: '0.35px',
    textShadow: '0 2px 6px rgba(0,0,0,0.45)',
    marginLeft: '22px',
    display: 'inline-block',
  },
  cursor: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontFamily: '"Trebuchet MS", "Verdana", sans-serif',
    fontSize: 'clamp(18px, 2.15vw, 30px)',
    marginLeft: '4px',
  },
  bottomRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(175, 230, 255, 0.22)',
    marginTop: 'clamp(10px, 1.8vh, 18px)',
    paddingTop: 'clamp(8px, 1.5vh, 14px)',
    gap: '10px',
  },
  progressDots: {
    display: 'flex',
    gap: '7px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  dot: {
    display: 'inline-block',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    transition: 'all 0.22s ease',
  },
  hintBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  triangle: {
    color: '#ffe08a',
    fontSize: '13px',
    transition: 'opacity 0.15s ease',
  },
  hintText: {
    color: 'rgba(230, 244, 255, 0.68)',
    fontFamily: '"Press Start 2P", "Courier New", monospace',
    fontSize: 'clamp(9px, 0.8vw, 11px)',
    letterSpacing: '1px',
  },
};
