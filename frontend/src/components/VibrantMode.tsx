import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VibrantInputSection from './VibrantInputSection';
import VibrantVisualization from './VibrantVisualization';
import VibrantResults from './VibrantResults';
import { SoundManager } from '../utils/SoundManager';

interface Variant {
  id: string;
  name: string;
  instruction: string;
  output?: {
    category: string;
    summary: string;
  };
  score?: number;
  scoreComponents?: {
    label_valid: number;
    label_match: number;
    summary_len_ok: number;
    no_hedging: number;
    format_ok: number;
  };
  latency_ms?: number;
}

interface VibrantModeProps {
  onExitVibrantMode: () => void;
}

const VibrantMode: React.FC<VibrantModeProps> = ({ onExitVibrantMode }) => {
  const [currentChapter, setCurrentChapter] = useState(1);
  const [hasCompletedDemo, setHasCompletedDemo] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [hasStartedDemo, setHasStartedDemo] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number}>>([]);
  const soundManager = useRef<SoundManager | null>(null);

  useEffect(() => {
    soundManager.current = new SoundManager();
    soundManager.current.playAmbient();

    return () => {
      soundManager.current?.cleanup();
    };
  }, []);

  useEffect(() => {
    // Create floating particles
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100
    }));
    setParticles(newParticles);
  }, []);

  const handleNext = () => {
    if (currentChapter < 10) {
      soundManager.current?.playClick();
      setCurrentChapter(currentChapter + 1);
    }
  };

  const handlePrev = () => {
    if (currentChapter > 1) {
      soundManager.current?.playClick();
      setCurrentChapter(currentChapter - 1);
    }
  };

  const handleStartDemo = async () => {
    if (!userInput.trim()) {
      soundManager.current?.playError();
      return;
    }

    soundManager.current?.playStart();
    setHasStartedDemo(true);
    setIsRunning(true);
    setVariants([]);
    setWinner(null);
    setCurrentChapter(4);

    try {
      console.log('🚀 Starting run with input:', userInput);
      const response = await fetch('http://localhost:8000/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input_text: userInput })
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('❌ API Error:', errorData);
        throw new Error(`API returned ${response.status}: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log('✅ Run created:', data);

      if (!data.run_id) {
        throw new Error('No run_id in response');
      }

      setRunId(data.run_id);

      // Connect to SSE stream immediately
      const streamUrl = `http://localhost:8000/api/run/${data.run_id}/stream`;
      console.log('📡 Connecting to stream:', streamUrl);
      const eventSource = new EventSource(streamUrl);

      eventSource.onopen = () => {
        console.log('✅ SSE connection opened');
      };

      eventSource.onerror = (error) => {
        console.error('❌ SSE error:', error);
      };

      eventSource.onmessage = (e) => {
        console.log('📨 SSE message received:', e.data);
        try {
          const event = JSON.parse(e.data);
          console.log('📋 Parsed event:', event);

          // Handle different event types (events have payload wrapper)
          const payload = event.payload || event;

          if (event.type === 'VariantOutput') {
            console.log('📊 Variant output:', payload);
            soundManager.current?.playVariantComplete();
            setVariants(prev => {
              const existing = prev.find(v => v.id === payload.variant_id);
              if (existing) {
                return prev.map(v => v.id === payload.variant_id
                  ? { ...v, output: payload.output, latency_ms: payload.latency_ms }
                  : v
                );
              }
              return [...prev, {
                id: payload.variant_id,
                name: payload.variant_id,
                instruction: '',
                output: payload.output,
                latency_ms: payload.latency_ms
              }];
            });
          } else if (event.type === 'VariantScored') {
            console.log('⭐ Variant scored:', payload);
            soundManager.current?.playScore();
            setVariants(prev => prev.map(v =>
              v.id === payload.variant_id
                ? { ...v, score: payload.score?.total, scoreComponents: payload.score?.components }
                : v
            ));
          } else if (event.type === 'RunComplete') {
            console.log('🏆 Run complete! Winner:', payload.winner_variant_id);
            soundManager.current?.playVictory();
            setWinner(payload.winner_variant_id);
            setIsRunning(false);
            setHasCompletedDemo(true);
            // Move to explanation chapter 5 after demo
            setCurrentChapter(5);
            eventSource.close();
          } else if (event.type === 'Error') {
            console.error('❌ Backend error:', event);
            soundManager.current?.playError();
            setIsRunning(false);
            eventSource.close();
          }
        } catch (error) {
          console.error('Failed to parse SSE event:', error, 'Raw data:', e.data);
        }
      };

    } catch (error) {
      soundManager.current?.playError();
      console.error('Failed to start run:', error);
      setIsRunning(false);
      alert('❌ Failed to connect to backend API.\n\nMake sure the backend server is running on http://localhost:8000\n\nSee the terminal for details.');
    }
  };

  return (
    <div className="min-h-screen overflow-hidden relative" style={{ background: 'linear-gradient(to bottom right, #581c87, #1e3a8a, #000000)', color: '#ffffff' }}>
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(0, 255, 255, 0.3) 25%, rgba(0, 255, 255, 0.3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, 0.3) 75%, rgba(0, 255, 255, 0.3) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(0, 255, 255, 0.3) 25%, rgba(0, 255, 255, 0.3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, 0.3) 75%, rgba(0, 255, 255, 0.3) 76%, transparent 77%, transparent)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Exit Button */}
      <motion.button
        onClick={() => {
          soundManager.current?.playClick();
          onExitVibrantMode();
        }}
        className="fixed top-6 right-6 z-50 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg font-bold text-white shadow-lg shadow-pink-500/50 border-2 border-pink-400"
        whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(236, 72, 153, 0.8)' }}
        whileTap={{ scale: 0.95 }}
      >
        ← EXIT VIBRANT MODE
      </motion.button>

      {/* Header */}
      <motion.div
        className="text-center py-12 relative z-10"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className="text-7xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
          animate={{
            textShadow: [
              '0 0 20px rgba(0, 255, 255, 0.5)',
              '0 0 40px rgba(236, 72, 153, 0.5)',
              '0 0 20px rgba(0, 255, 255, 0.5)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ⚡ DSPY EXPLAINED ⚡
        </motion.h1>
        <p className="text-2xl text-cyan-300 font-bold tracking-wider">
          AUTOMATIC PROMPT OPTIMIZATION IN ACTION
        </p>
      </motion.div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-8 mb-8">
        <div className="relative h-4 bg-black/50 rounded-full border-2 border-cyan-500 overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${(currentChapter / 8) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <div className="text-center mt-2 text-cyan-400 font-bold">
          STEP {currentChapter} / 8
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 2rem 5rem 2rem', position: 'relative', zIndex: 10 }}>
        <AnimatePresence mode="wait">
          {currentChapter === 3 && (
            <VibrantInputSection
              key="input"
              userInput={userInput}
              setUserInput={setUserInput}
              onStartDemo={handleStartDemo}
              isRunning={isRunning}
              soundManager={soundManager.current}
            />
          )}

          {currentChapter === 4 && (
            <VibrantVisualization
              key="visualization"
              variants={variants}
              isRunning={isRunning}
              winner={winner}
              soundManager={soundManager.current}
            />
          )}

          {currentChapter === 8 && hasCompletedDemo && winner && (
            <VibrantResults
              key="results"
              variants={variants}
              winner={winner}
              soundManager={soundManager.current}
            />
          )}

          {currentChapter < 3 && (
            <ChapterContent key={currentChapter} chapter={currentChapter} />
          )}

          {currentChapter >= 5 && currentChapter <= 7 && hasCompletedDemo && (
            <ChapterContent key={currentChapter} chapter={currentChapter} />
          )}

          {currentChapter === 8 && !hasCompletedDemo && (
            <ChapterContent key={currentChapter} chapter={currentChapter} />
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '2rem',
        zIndex: 40
      }}>
        <motion.button
          onClick={handlePrev}
          disabled={currentChapter === 1}
          style={{
            padding: '1rem 2rem',
            borderRadius: '0.5rem',
            fontWeight: 'bold',
            fontSize: '1.25rem',
            background: currentChapter === 1 ? '#374151' : 'linear-gradient(to right, #06b6d4, #2563eb)',
            color: currentChapter === 1 ? '#6b7280' : '#ffffff',
            cursor: currentChapter === 1 ? 'not-allowed' : 'pointer',
            boxShadow: currentChapter === 1 ? 'none' : '0 10px 15px -3px rgba(6, 182, 212, 0.5)',
            border: 'none'
          }}
          whileHover={currentChapter > 1 ? { scale: 1.05 } : {}}
          whileTap={currentChapter > 1 ? { scale: 0.95 } : {}}
        >
          ← BACK
        </motion.button>
        <motion.button
          onClick={handleNext}
          disabled={currentChapter === 8}
          style={{
            padding: '1rem 2rem',
            borderRadius: '0.5rem',
            fontWeight: 'bold',
            fontSize: '1.25rem',
            background: currentChapter === 8 ? '#374151' : 'linear-gradient(to right, #ec4899, #9333ea)',
            color: currentChapter === 8 ? '#6b7280' : '#ffffff',
            cursor: currentChapter === 8 ? 'not-allowed' : 'pointer',
            boxShadow: currentChapter === 8 ? 'none' : '0 10px 15px -3px rgba(236, 72, 153, 0.5)',
            border: 'none'
          }}
          whileHover={currentChapter < 8 ? { scale: 1.05 } : {}}
          whileTap={currentChapter < 8 ? { scale: 0.95 } : {}}
        >
          NEXT →
        </motion.button>
      </div>
    </div>
  );
};

// Chapter content components
const ChapterContent: React.FC<{ chapter: number }> = ({ chapter }) => {
  const content: Record<number, {title: string, text: string, icon: string, subtext: string}> = {
    1: {
      title: 'THE PROBLEM',
      text: 'Writing good AI prompts takes forever. You write one, test it, rewrite it, test again... 20+ iterations later, you\'re exhausted.',
      icon: '😫',
      subtext: 'What if there was a faster way?'
    },
    2: {
      title: 'THE SOLUTION',
      text: 'DSPy automatically generates multiple prompt strategies, tests them all, and picks the best one. In seconds.',
      icon: '⚡',
      subtext: 'Let\'s see it in action!'
    },
    // Ch 3 = Input, Ch 4 = Results, then explanations:
    5: {
      title: 'WHAT JUST HAPPENED?',
      text: 'You saw 3 different AI prompt strategies compete. Each had a unique approach: Formal, Friendly, and Analytical. DSPy ran them all simultaneously.',
      icon: '🤖',
      subtext: 'But how did it know which one won?'
    },
    6: {
      title: 'THE SCORING SYSTEM',
      text: 'We defined 5 rules for "good": ✓ Correct category ✓ Understands intent ✓ Concise summary ✓ Confident tone ✓ Proper format. Each strategy was scored against these rules.',
      icon: '📊',
      subtext: 'The highest score wins!'
    },
    7: {
      title: 'THE POWER OF DSPy',
      text: 'This demo tested 3 prompts. In production, DSPy can test hundreds of variations. Same effort for you. Infinitely better results.',
      icon: '🚀',
      subtext: 'That\'s automatic optimization.'
    },
    8: {
      title: 'YOU\'RE READY!',
      text: 'You just experienced DSPy: Define your quality criteria, let it generate and test variants, get the optimal prompt. Now imagine using this for ANY AI task.',
      icon: '🎉',
      subtext: 'Welcome to the future of prompt engineering!'
    }
  };

  const current = content[chapter as keyof typeof content];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div style={{
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(20px)',
        border: '4px solid #06b6d4',
        borderRadius: '1.5rem',
        padding: '3rem',
        boxShadow: '0 25px 50px -12px rgba(6, 182, 212, 0.5)'
      }}>
        <motion.div
          style={{ fontSize: '8rem', textAlign: 'center', marginBottom: '2rem' }}
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {current.icon}
        </motion.div>
        <h2 style={{
          fontSize: '3rem',
          fontWeight: '900',
          textAlign: 'center',
          marginBottom: '2rem',
          background: 'linear-gradient(to right, #22d3ee, #ec4899)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: '1.2'
        }}>
          {current.title}
        </h2>
        <p style={{
          fontSize: '1.5rem',
          color: '#e0f2fe',
          lineHeight: '1.75',
          textAlign: 'center',
          marginBottom: '1.5rem'
        }}>
          {current.text}
        </p>
        <motion.p
          style={{
            fontSize: '1.25rem',
            color: '#f472b6',
            fontWeight: 'bold',
            textAlign: 'center',
            fontStyle: 'italic'
          }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {current.subtext}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default VibrantMode;
