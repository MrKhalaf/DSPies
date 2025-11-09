import React from 'react';
import { motion } from 'framer-motion';
import { SoundManager } from '../utils/SoundManager';

interface VibrantInputSectionProps {
  userInput: string;
  setUserInput: (value: string) => void;
  onStartDemo: () => void;
  isRunning: boolean;
  soundManager: SoundManager | null;
}

const VibrantInputSection: React.FC<VibrantInputSectionProps> = ({
  userInput,
  setUserInput,
  onStartDemo,
  isRunning,
  soundManager
}) => {
  const examples = [
    "I was double-charged after upgrading my plan",
    "The app keeps crashing when I try to login",
    "I want to cancel my subscription immediately",
    "This is urgent - my account is locked!"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="max-w-5xl mx-auto"
    >
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.9), rgba(30, 58, 138, 0.9))',
        backdropFilter: 'blur(20px)',
        border: '4px solid transparent',
        borderRadius: '2rem',
        padding: '3rem',
        boxShadow: '0 25px 50px -12px rgba(236, 72, 153, 0.5), inset 0 0 60px rgba(236, 72, 153, 0.1)',
        overflow: 'hidden'
      }}>
        {/* Animated border gradient */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, #06b6d4, #ec4899, #a855f7, #06b6d4)',
            backgroundSize: '300% 100%',
            borderRadius: '2rem',
            padding: '4px',
            zIndex: -1,
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor'
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />

        {/* Energy orbs floating around */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${i % 2 === 0 ? 'rgba(6, 182, 212, 0.3)' : 'rgba(236, 72, 153, 0.3)'}, transparent)`,
              filter: 'blur(20px)',
              left: `${(i * 20) % 100}%`,
              top: `${(i * 30) % 100}%`
            }}
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 50, 0],
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 8 + i,
              repeat: Infinity,
              delay: i * 0.5
            }}
          />
        ))}

        <motion.h2
          className="text-6xl font-black text-center mb-8 bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🎯 TRY IT YOURSELF 🎯
        </motion.h2>

        <p className="text-2xl text-cyan-200 text-center mb-12 font-semibold">
          Enter any customer support message. Watch three different AI prompts compete. See which wins.
        </p>

        {/* Input Area */}
        <div className="relative mb-8">
          {/* Animated border glow */}
          <motion.div
            style={{
              position: 'absolute',
              inset: '-6px',
              background: 'linear-gradient(90deg, #06b6d4, #ec4899, #a855f7, #06b6d4)',
              backgroundSize: '300% 100%',
              borderRadius: '1.5rem',
              opacity: 0.6,
              filter: 'blur(15px)',
              zIndex: 0
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />

          {/* Corner accents */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                width: '20px',
                height: '20px',
                border: '3px solid #22d3ee',
                ...(i === 0 && { top: '-3px', left: '-3px', borderRight: 'none', borderBottom: 'none' }),
                ...(i === 1 && { top: '-3px', right: '-3px', borderLeft: 'none', borderBottom: 'none' }),
                ...(i === 2 && { bottom: '-3px', left: '-3px', borderRight: 'none', borderTop: 'none' }),
                ...(i === 3 && { bottom: '-3px', right: '-3px', borderLeft: 'none', borderTop: 'none' }),
                zIndex: 2
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}

          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onFocus={() => soundManager?.playHover()}
            style={{
              position: 'relative',
              width: '100%',
              height: '12rem',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(168, 85, 247, 0.1))',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(34, 211, 238, 0.5)',
              borderRadius: '1rem',
              padding: '1.5rem',
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#ffffff',
              fontFamily: 'monospace',
              resize: 'none',
              transition: 'all 0.3s',
              boxShadow: 'inset 0 0 30px rgba(34, 211, 238, 0.2), 0 0 40px rgba(236, 72, 153, 0.3)',
              zIndex: 1
            }}
            onFocus={(e) => {
              soundManager?.playHover();
              e.target.style.border = '2px solid rgba(236, 72, 153, 0.8)';
              e.target.style.boxShadow = 'inset 0 0 30px rgba(236, 72, 153, 0.3), 0 0 60px rgba(236, 72, 153, 0.5)';
            }}
            onBlur={(e) => {
              e.target.style.border = '2px solid rgba(34, 211, 238, 0.5)';
              e.target.style.boxShadow = 'inset 0 0 30px rgba(34, 211, 238, 0.2), 0 0 40px rgba(236, 72, 153, 0.3)';
            }}
            placeholder="⚡ TYPE YOUR MESSAGE HERE ⚡"
            disabled={isRunning}
          />
        </div>

        {/* Example Buttons */}
        <div className="mb-12">
          <motion.p
            className="text-cyan-300 text-center mb-6 text-2xl font-black"
            animate={{
              textShadow: [
                '0 0 10px rgba(34, 211, 238, 0.5)',
                '0 0 20px rgba(236, 72, 153, 0.5)',
                '0 0 10px rgba(34, 211, 238, 0.5)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            💥 QUICK START EXAMPLES 💥
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {examples.map((example, idx) => (
              <motion.div key={idx} className="relative">
                {/* Glowing background */}
                <motion.div
                  style={{
                    position: 'absolute',
                    inset: '-4px',
                    background: `linear-gradient(${45 + idx * 90}deg, #06b6d4, #ec4899)`,
                    borderRadius: '1rem',
                    opacity: 0.3,
                    filter: 'blur(10px)'
                  }}
                  whileHover={{ opacity: 0.6, scale: 1.05 }}
                />
                <motion.button
                  onClick={() => {
                    soundManager?.playClick();
                    setUserInput(example);
                  }}
                  style={{
                    position: 'relative',
                    width: '100%',
                    background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.8), rgba(30, 58, 138, 0.8))',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(236, 72, 153, 0.5)',
                    borderRadius: '1rem',
                    padding: '1.25rem',
                    textAlign: 'left',
                    color: '#ffffff',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)'
                  }}
                  whileHover={{
                    scale: 1.03,
                    border: '2px solid rgba(34, 211, 238, 0.8)',
                    boxShadow: '0 0 40px rgba(34, 211, 238, 0.6)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isRunning}
                >
                  {/* Scan line effect */}
                  <motion.div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)'
                    }}
                    animate={{
                      left: ['100%', '100%', '-100%']
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: idx * 0.5
                    }}
                  />
                  <span style={{ position: 'relative', zIndex: 1 }}>
                    <span style={{ color: '#22d3ee', marginRight: '0.5rem' }}>▶</span>
                    {example}
                  </span>
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <motion.div className="text-center">
          <div className="relative inline-block">
            {/* Outer pulsing rings */}
            {!isRunning && userInput.trim() && (
              <>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    style={{
                      position: 'absolute',
                      inset: '-20px',
                      border: '3px solid rgba(34, 211, 238, 0.5)',
                      borderRadius: '2rem',
                      pointerEvents: 'none'
                    }}
                    animate={{
                      scale: [1, 1.5, 1.5],
                      opacity: [0.8, 0, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.6
                    }}
                  />
                ))}
              </>
            )}

            {/* Main button */}
            <motion.button
              onClick={onStartDemo}
              disabled={isRunning || !userInput.trim()}
              style={{
                position: 'relative',
                padding: '2rem 4rem',
                fontSize: '2.5rem',
                fontWeight: '900',
                borderRadius: '1.5rem',
                border: isRunning || !userInput.trim() ? '4px solid #4b5563' : '4px solid rgba(255, 255, 255, 0.8)',
                background: isRunning || !userInput.trim()
                  ? '#374151'
                  : 'linear-gradient(135deg, #10b981, #06b6d4, #3b82f6)',
                backgroundSize: '200% 200%',
                color: isRunning || !userInput.trim() ? '#6b7280' : '#ffffff',
                cursor: isRunning || !userInput.trim() ? 'not-allowed' : 'pointer',
                overflow: 'hidden',
                boxShadow: isRunning || !userInput.trim()
                  ? 'none'
                  : '0 0 60px rgba(6, 182, 212, 0.8), inset 0 0 30px rgba(255, 255, 255, 0.2)',
                textShadow: isRunning || !userInput.trim() ? 'none' : '0 0 20px rgba(0, 0, 0, 0.5)',
                zIndex: 1
              }}
              animate={!isRunning && userInput.trim() ? {
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                scale: [1, 1.02, 1]
              } : {}}
              transition={{
                backgroundPosition: { duration: 3, repeat: Infinity },
                scale: { duration: 1.5, repeat: Infinity }
              }}
              whileHover={!isRunning && userInput.trim() ? {
                scale: 1.08,
                boxShadow: '0 0 100px rgba(6, 182, 212, 1), 0 0 150px rgba(59, 130, 246, 0.5), inset 0 0 40px rgba(255, 255, 255, 0.3)'
              } : {}}
              whileTap={!isRunning && userInput.trim() ? { scale: 0.95 } : {}}
            >
              {/* Lightning bolts on sides */}
              {!isRunning && userInput.trim() && (
                <>
                  <motion.span
                    style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '3rem'
                    }}
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                  >
                    ⚡
                  </motion.span>
                  <motion.span
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '3rem'
                    }}
                    animate={{
                      rotate: [0, -10, 10, 0],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1, delay: 0.3 }}
                  >
                    ⚡
                  </motion.span>
                </>
              )}

              {/* Shimmer effect */}
              {!isRunning && userInput.trim() && (
                <motion.div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '50%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
                    transform: 'skewX(-20deg)'
                  }}
                  animate={{
                    left: ['100%', '100%', '-100%']
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                />
              )}

              <span style={{ position: 'relative', zIndex: 1, letterSpacing: '0.1em' }}>
                {isRunning ? '🔥 BATTLE IN PROGRESS 🔥' : '🚀 IGNITE BATTLE 🚀'}
              </span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default VibrantInputSection;
