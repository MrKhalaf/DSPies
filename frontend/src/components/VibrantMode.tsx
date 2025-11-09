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
    setCurrentChapter(9);

    try {
      const response = await fetch('http://localhost:8000/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userInput })
      });

      const data = await response.json();
      setRunId(data.run_id);

      const eventSource = new EventSource(`http://localhost:8000/api/run/${data.run_id}/stream`);

      eventSource.addEventListener('VariantOutput', (e) => {
        const event = JSON.parse(e.data);
        soundManager.current?.playVariantComplete();
        setVariants(prev => {
          const existing = prev.find(v => v.id === event.variant_id);
          if (existing) {
            return prev.map(v => v.id === event.variant_id
              ? { ...v, output: event.output, latency_ms: event.latency_ms }
              : v
            );
          }
          return [...prev, {
            id: event.variant_id,
            name: event.variant_id,
            instruction: '',
            output: event.output,
            latency_ms: event.latency_ms
          }];
        });
      });

      eventSource.addEventListener('VariantScored', (e) => {
        const event = JSON.parse(e.data);
        soundManager.current?.playScore();
        setVariants(prev => prev.map(v =>
          v.id === event.variant_id
            ? { ...v, score: event.score, scoreComponents: event.score_components }
            : v
        ));
      });

      eventSource.addEventListener('RunComplete', (e) => {
        const event = JSON.parse(e.data);
        soundManager.current?.playVictory();
        setWinner(event.winner);
        setIsRunning(false);
        eventSource.close();
      });

      eventSource.addEventListener('Error', (e) => {
        soundManager.current?.playError();
        console.error('Error:', e.data);
        setIsRunning(false);
        eventSource.close();
      });

    } catch (error) {
      soundManager.current?.playError();
      console.error('Failed to start run:', error);
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white overflow-hidden relative">
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
            animate={{ width: `${(currentChapter / 10) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <div className="text-center mt-2 text-cyan-400 font-bold">
          CHAPTER {currentChapter} / 10
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 pb-20 relative z-10">
        <AnimatePresence mode="wait">
          {currentChapter === 8 && (
            <VibrantInputSection
              key="input"
              userInput={userInput}
              setUserInput={setUserInput}
              onStartDemo={handleStartDemo}
              isRunning={isRunning}
              soundManager={soundManager.current}
            />
          )}

          {currentChapter === 9 && (
            <VibrantVisualization
              key="visualization"
              variants={variants}
              isRunning={isRunning}
              winner={winner}
              soundManager={soundManager.current}
            />
          )}

          {currentChapter === 10 && winner && (
            <VibrantResults
              key="results"
              variants={variants}
              winner={winner}
              soundManager={soundManager.current}
            />
          )}

          {currentChapter < 8 && (
            <ChapterContent key={currentChapter} chapter={currentChapter} />
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-8 z-40">
        <motion.button
          onClick={handlePrev}
          disabled={currentChapter === 1}
          className={`px-8 py-4 rounded-lg font-bold text-xl ${
            currentChapter === 1
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
          }`}
          whileHover={currentChapter > 1 ? { scale: 1.05 } : {}}
          whileTap={currentChapter > 1 ? { scale: 0.95 } : {}}
        >
          ← BACK
        </motion.button>
        <motion.button
          onClick={handleNext}
          disabled={currentChapter === 10}
          className={`px-8 py-4 rounded-lg font-bold text-xl ${
            currentChapter === 10
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/50'
          }`}
          whileHover={currentChapter < 10 ? { scale: 1.05 } : {}}
          whileTap={currentChapter < 10 ? { scale: 0.95 } : {}}
        >
          NEXT →
        </motion.button>
      </div>
    </div>
  );
};

// Chapter content components for chapters 1-7
const ChapterContent: React.FC<{ chapter: number }> = ({ chapter }) => {
  const content = {
    1: {
      title: 'THE PROBLEM',
      text: 'Writing AI prompts is hard. You try one. It fails. You rewrite it. Test again. Repeat 20 times. Hours wasted.',
      icon: '😫',
      subtext: 'There has to be a better way...'
    },
    2: {
      title: 'WHAT IF AI COULD DO THIS FOR YOU?',
      text: 'Imagine: You describe what you want. AI generates 10 different prompts. Tests them all. Picks the best one. Done in seconds.',
      icon: '💡',
      subtext: 'This is DSPy.'
    },
    3: {
      title: 'HERE\'S HOW IT WORKS',
      text: 'Step 1: You write rules for what makes a "good" answer. Step 2: DSPy creates different prompt styles. Step 3: Each one competes. Step 4: The winner is chosen automatically.',
      icon: '⚡',
      subtext: 'Let me show you...'
    },
    4: {
      title: 'THE CHALLENGE',
      text: 'Task: Sort customer messages. Is it billing? Technical? Urgent? We need the AI to categorize correctly AND write a short summary.',
      icon: '🎯',
      subtext: 'Simple task. But how do we find the BEST prompt?'
    },
    5: {
      title: 'DEFINE "GOOD"',
      text: 'We create 5 rules: ✓ Category must be correct ✓ Must understand the real problem ✓ Summary under 20 words ✓ No uncertain language ✓ Proper format',
      icon: '📋',
      subtext: 'These are our judges. They score each attempt.'
    },
    6: {
      title: 'DSPY CREATES 3 STRATEGIES',
      text: 'Strategy 1: Formal and precise. Strategy 2: Friendly and conversational. Strategy 3: Analytical and detailed. Same task. Completely different approaches.',
      icon: '🤖',
      subtext: 'Which one will win?'
    },
    7: {
      title: 'READY TO WATCH?',
      text: 'You\'ll type a customer message. Three AI strategies will compete. Our judges will score them. The best one wins. All in real-time.',
      icon: '🚀',
      subtext: 'Click NEXT to start the battle!'
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
      <div className="bg-black/40 backdrop-blur-xl border-4 border-cyan-500 rounded-3xl p-12 shadow-2xl shadow-cyan-500/50">
        <motion.div
          className="text-9xl text-center mb-8"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {current.icon}
        </motion.div>
        <h2 className="text-5xl font-black text-center mb-8 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent leading-tight">
          {current.title}
        </h2>
        <p className="text-2xl text-cyan-100 leading-relaxed text-center mb-6">
          {current.text}
        </p>
        <motion.p
          className="text-xl text-pink-400 font-bold text-center italic"
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
