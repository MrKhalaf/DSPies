/**
 * The Prompt Chef's Journey
 * An interactive 16-bit pixel art story that teaches DSPy in 10 steps
 * High school reading level - makes DSPy intuitive through play
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles, Trophy, Zap, Target, Brain, Award } from 'lucide-react';

interface Variant {
  id: string;
  name: string;
  prompt: string;
  output?: { category: string; summary: string };
  score?: number;
  scoreBreakdown?: any;
}

interface DSPyStoryProps {
  onRun: (input: string) => Promise<void>;
  variants: Variant[];
  isRunning: boolean;
  winner?: string;
}

const PIXEL_STYLES = `
  .pixel-text {
    font-family: 'Courier New', monospace;
    image-rendering: pixelated;
    text-shadow: 2px 2px 0px rgba(0,0,0,0.3);
  }

  .pixel-border {
    box-shadow:
      0 0 0 4px #000,
      0 0 0 8px #fff,
      0 0 0 12px #000;
  }

  .pixelated {
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
  }
`;

export function DSPyStory({ onRun, variants, isRunning, winner }: DSPyStoryProps) {
  const [step, setStep] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [hasStartedDemo, setHasStartedDemo] = useState(false);

  const nextStep = () => {
    if (step < STORY_STEPS.length - 1) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const startDemo = () => {
    setHasStartedDemo(true);
    if (userInput.trim()) {
      onRun(userInput);
    } else {
      onRun("I was double-charged after upgrading my plan");
    }
  };

  const StoryStep = STORY_STEPS[step];

  return (
    <>
      <style>{PIXEL_STYLES}</style>
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 overflow-hidden">
        {/* Pixel Stars Background */}
        <div className="fixed inset-0 opacity-30">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white pixelated"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Main Story Container */}
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
          {/* Progress Bar */}
          <div className="mb-8 pixel-border bg-black p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="pixel-text text-white font-bold">CHAPTER {step + 1} / {STORY_STEPS.length}</span>
              <span className="pixel-text text-yellow-300 font-bold">{Math.round((step / (STORY_STEPS.length - 1)) * 100)}%</span>
            </div>
            <div className="h-4 bg-gray-800 relative overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                initial={{ width: 0 }}
                animate={{ width: `${(step / (STORY_STEPS.length - 1)) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
              {/* Pixel blocks on progress bar */}
              <div className="absolute inset-0 grid grid-cols-10">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="border-r-2 border-gray-900" />
                ))}
              </div>
            </div>
          </div>

          {/* Story Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <StoryStep
                onNext={nextStep}
                onPrev={prevStep}
                userInput={userInput}
                setUserInput={setUserInput}
                startDemo={startDemo}
                variants={variants}
                isRunning={isRunning}
                winner={winner}
                hasStartedDemo={hasStartedDemo}
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={prevStep}
              disabled={step === 0}
              className="pixel-border bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 text-white font-bold py-3 px-6 disabled:cursor-not-allowed transition-all pixel-text"
            >
              ← BACK
            </button>

            {step < STORY_STEPS.length - 1 && (
              <button
                onClick={nextStep}
                className="pixel-border bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 transition-all pixel-text flex items-center gap-2"
              >
                NEXT →
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Story Step Components
const Step1: React.FC<any> = () => (
  <div className="pixel-border bg-black p-8 text-white">
    <div className="text-center mb-8">
      <motion.div
        className="text-9xl mb-4"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        👨‍🍳
      </motion.div>
      <h1 className="pixel-text text-5xl font-bold text-yellow-300 mb-4">THE PROMPT CHEF'S JOURNEY</h1>
      <p className="pixel-text text-2xl text-gray-300">An Interactive Adventure</p>
    </div>

    <div className="bg-gray-900 p-6 rounded-lg mb-6">
      <p className="pixel-text text-xl leading-relaxed">
        Welcome! You are <span className="text-yellow-300 font-bold">Chef Claude</span>,
        a master of AI prompts. Your restaurant serves customers who need help with
        their problems.
      </p>
    </div>

    <div className="bg-blue-900 p-6 rounded-lg">
      <p className="pixel-text text-lg text-blue-200">
        🎮 <strong>Controls:</strong> Click NEXT to continue the story.
        You'll learn how DSPy works through an interactive adventure!
      </p>
    </div>
  </div>
);

const Step2: React.FC<any> = () => (
  <div className="pixel-border bg-black p-8 text-white">
    <h2 className="pixel-text text-4xl font-bold text-red-400 mb-6">⚠️ THE PROBLEM</h2>

    <div className="grid md:grid-cols-2 gap-6 mb-6">
      <div className="bg-red-900 p-6 rounded-lg border-4 border-red-600">
        <div className="text-6xl mb-4 text-center">😫</div>
        <h3 className="pixel-text text-2xl font-bold mb-3 text-yellow-300">The Old Way (Manual)</h3>
        <ul className="pixel-text space-y-2 text-red-200">
          <li>❌ Write a prompt</li>
          <li>❌ Test it</li>
          <li>❌ Rewrite it</li>
          <li>❌ Test again</li>
          <li>❌ Repeat 10+ times</li>
          <li>❌ Takes HOURS</li>
        </ul>
      </div>

      <div className="bg-green-900 p-6 rounded-lg border-4 border-green-600">
        <div className="text-6xl mb-4 text-center">✨</div>
        <h3 className="pixel-text text-2xl font-bold mb-3 text-yellow-300">The DSPy Way (Magic!)</h3>
        <ul className="pixel-text space-y-2 text-green-200">
          <li>✅ Define what "good" means</li>
          <li>✅ DSPy generates prompts</li>
          <li>✅ DSPy tests them all</li>
          <li>✅ DSPy picks the best</li>
          <li>✅ Takes SECONDS</li>
          <li>✅ Works better!</li>
        </ul>
      </div>
    </div>

    <div className="bg-purple-900 p-6 rounded-lg">
      <p className="pixel-text text-xl text-purple-200">
        <strong>🤔 The Question:</strong> What if instead of writing prompts yourself,
        you had magic helpers who could try different approaches and compete to find the best one?
      </p>
    </div>
  </div>
);

const Step3: React.FC<any> = () => (
  <div className="pixel-border bg-black p-8 text-white">
    <h2 className="pixel-text text-4xl font-bold text-purple-400 mb-6">✨ MEET THE DSPy WIZARDS</h2>

    <p className="pixel-text text-xl mb-8 text-gray-300">
      DSPy gives you THREE magic helpers. Each one has a different personality and style:
    </p>

    <div className="space-y-6">
      <motion.div
        className="bg-blue-900 p-6 rounded-lg border-4 border-blue-500 flex items-center gap-6"
        whileHover={{ scale: 1.02 }}
      >
        <div className="text-8xl">🧙‍♂️</div>
        <div>
          <h3 className="pixel-text text-3xl font-bold text-blue-300 mb-2">Wizard #1: "The Formal"</h3>
          <p className="pixel-text text-lg text-blue-200">
            Speaks like a textbook. Very precise and professional.
          </p>
          <p className="pixel-text text-sm text-blue-400 mt-2 italic">
            "Please classify this text into the appropriate category and provide a summary."
          </p>
        </div>
      </motion.div>

      <motion.div
        className="bg-purple-900 p-6 rounded-lg border-4 border-purple-500 flex items-center gap-6"
        whileHover={{ scale: 1.02 }}
      >
        <div className="text-8xl">🧙‍♀️</div>
        <div>
          <h3 className="pixel-text text-3xl font-bold text-purple-300 mb-2">Wizard #2: "The Friendly"</h3>
          <p className="pixel-text text-lg text-purple-200">
            Talks like your best friend. Warm and conversational.
          </p>
          <p className="pixel-text text-sm text-purple-400 mt-2 italic">
            "Hey! Can you help me figure out what this customer needs?"
          </p>
        </div>
      </motion.div>

      <motion.div
        className="bg-orange-900 p-6 rounded-lg border-4 border-orange-500 flex items-center gap-6"
        whileHover={{ scale: 1.02 }}
      >
        <div className="text-8xl">🧙</div>
        <div>
          <h3 className="pixel-text text-3xl font-bold text-orange-300 mb-2">Wizard #3: "The Analyst"</h3>
          <p className="pixel-text text-lg text-orange-200">
            Thinks deeply. Breaks everything down step-by-step.
          </p>
          <p className="pixel-text text-sm text-orange-400 mt-2 italic">
            "Let's analyze this systematically to determine the primary intent..."
          </p>
        </div>
      </motion.div>
    </div>
  </div>
);

const Step4: React.FC<any> = () => (
  <div className="pixel-border bg-black p-8 text-white">
    <h2 className="pixel-text text-4xl font-bold text-green-400 mb-6">📚 HOW DSPy WORKS</h2>

    <div className="bg-gray-900 p-6 rounded-lg mb-6">
      <p className="pixel-text text-2xl text-yellow-300 font-bold mb-4">Think of it like a cooking competition:</p>
    </div>

    <div className="space-y-4">
      <div className="bg-blue-900 p-4 rounded-lg flex items-start gap-4">
        <div className="text-5xl">1️⃣</div>
        <div>
          <h3 className="pixel-text text-xl font-bold text-blue-300 mb-2">YOU write the recipe (the task)</h3>
          <p className="pixel-text text-gray-300">
            "I need to classify customer messages into categories: billing, technical, urgent, etc."
          </p>
        </div>
      </div>

      <div className="bg-purple-900 p-4 rounded-lg flex items-start gap-4">
        <div className="text-5xl">2️⃣</div>
        <div>
          <h3 className="pixel-text text-xl font-bold text-purple-300 mb-2">THREE wizards each cook their version</h3>
          <p className="pixel-text text-gray-300">
            Each wizard writes their own prompt (their "recipe") based on their personality.
          </p>
        </div>
      </div>

      <div className="bg-green-900 p-4 rounded-lg flex items-start gap-4">
        <div className="text-5xl">3️⃣</div>
        <div>
          <h3 className="pixel-text text-xl font-bold text-green-300 mb-2">JUDGES taste each dish and score it</h3>
          <p className="pixel-text text-gray-300">
            Automatic scoring rules check: Is the category correct? Is it concise? Is it confident?
          </p>
        </div>
      </div>

      <div className="bg-yellow-900 p-4 rounded-lg flex items-start gap-4">
        <div className="text-5xl">4️⃣</div>
        <div>
          <h3 className="pixel-text text-xl font-bold text-yellow-300 mb-2">THE WINNER is crowned!</h3>
          <p className="pixel-text text-gray-300">
            The wizard with the highest score wins. Their prompt is the best!
          </p>
        </div>
      </div>
    </div>

    <div className="bg-gradient-to-r from-purple-900 to-pink-900 p-6 rounded-lg mt-6">
      <p className="pixel-text text-xl text-white font-bold text-center">
        🎯 That's DSPy: Automatic prompt testing + picking the best one!
      </p>
    </div>
  </div>
);

const Step5: React.FC<any> = () => (
  <div className="pixel-border bg-black p-8 text-white">
    <h2 className="pixel-text text-4xl font-bold text-yellow-400 mb-6">⚖️ STEP 1: DEFINE "GOOD"</h2>

    <p className="pixel-text text-xl mb-6 text-gray-300">
      Before the competition starts, you need to tell the judges what makes a response "good."
    </p>

    <div className="bg-gray-900 p-6 rounded-lg mb-6">
      <h3 className="pixel-text text-2xl font-bold text-yellow-300 mb-4">The Judging Criteria:</h3>

      <div className="space-y-3">
        <div className="flex items-center gap-4 bg-green-900 p-3 rounded">
          <span className="text-3xl">🎯</span>
          <div>
            <strong className="pixel-text text-green-300">Correct Category:</strong>
            <span className="pixel-text text-green-200"> Is it billing/technical/urgent/etc?</span>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-blue-900 p-3 rounded">
          <span className="text-3xl">🧠</span>
          <div>
            <strong className="pixel-text text-blue-300">Intent Match:</strong>
            <span className="pixel-text text-blue-200"> Does it understand what the customer really wants?</span>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-purple-900 p-3 rounded">
          <span className="text-3xl">📏</span>
          <div>
            <strong className="pixel-text text-purple-300">Perfect Length:</strong>
            <span className="pixel-text text-purple-200"> Is the summary 20 words or less?</span>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-orange-900 p-3 rounded">
          <span className="text-3xl">💪</span>
          <div>
            <strong className="pixel-text text-orange-300">Confidence:</strong>
            <span className="pixel-text text-orange-200"> No wishy-washy words like "maybe" or "I think"</span>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-pink-900 p-3 rounded">
          <span className="text-3xl">✨</span>
          <div>
            <strong className="pixel-text text-pink-300">Presentation:</strong>
            <span className="pixel-text text-pink-200"> Is it properly formatted?</span>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-yellow-900 p-6 rounded-lg">
      <p className="pixel-text text-lg text-yellow-200">
        💡 <strong>Key Insight:</strong> YOU decide what "good" means. DSPy just finds the
        prompt that best matches YOUR criteria!
      </p>
    </div>
  </div>
);

const Step6: React.FC<any> = () => (
  <div className="pixel-border bg-black p-8 text-white">
    <h2 className="pixel-text text-4xl font-bold text-blue-400 mb-6">🎨 STEP 2: DSPy GENERATES VARIANTS</h2>

    <p className="pixel-text text-xl mb-6 text-gray-300">
      Now the magic happens! DSPy creates different prompt strategies automatically.
    </p>

    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-6 rounded-lg border-4 border-blue-500">
        <div className="flex items-center gap-4 mb-3">
          <span className="text-5xl">🧙‍♂️</span>
          <h3 className="pixel-text text-2xl font-bold text-blue-200">Wizard #1's Prompt:</h3>
        </div>
        <div className="bg-black p-4 rounded font-mono text-sm text-blue-300">
          "Classify the following text into one of these categories: [billing, technical, urgent, cancellation, other].
          Provide a concise one-sentence summary of the issue."
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-900 to-purple-700 p-6 rounded-lg border-4 border-purple-500">
        <div className="flex items-center gap-4 mb-3">
          <span className="text-5xl">🧙‍♀️</span>
          <h3 className="pixel-text text-2xl font-bold text-purple-200">Wizard #2's Prompt:</h3>
        </div>
        <div className="bg-black p-4 rounded font-mono text-sm text-purple-300">
          "Hey! I need your help classifying this customer message. What category does it fit into (billing, technical, urgent, etc.)?
          Also, can you give me a quick summary of what they need?"
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-900 to-orange-700 p-6 rounded-lg border-4 border-orange-500">
        <div className="flex items-center gap-4 mb-3">
          <span className="text-5xl">🧙</span>
          <h3 className="pixel-text text-2xl font-bold text-orange-200">Wizard #3's Prompt:</h3>
        </div>
        <div className="bg-black p-4 rounded font-mono text-sm text-orange-300">
          "Analyze the provided text to determine the primary intent. Categorize it as billing-related, technical-support, urgent-matter,
          cancellation-request, or other. Synthesize a factual summary statement."
        </div>
      </div>
    </div>

    <div className="bg-green-900 p-6 rounded-lg mt-6">
      <p className="pixel-text text-lg text-green-200">
        🎯 <strong>Notice:</strong> Same task, three DIFFERENT approaches! DSPy tries them all automatically.
      </p>
    </div>
  </div>
);

const Step7: React.FC<any> = () => (
  <div className="pixel-border bg-black p-8 text-white">
    <h2 className="pixel-text text-4xl font-bold text-purple-400 mb-6">🏆 STEP 3: THE COMPETITION!</h2>

    <p className="pixel-text text-xl mb-6 text-gray-300">
      All three wizards work on the same customer message. Let's see who does best!
    </p>

    <div className="bg-gray-900 p-6 rounded-lg mb-6">
      <div className="text-center mb-4">
        <span className="text-4xl">📨</span>
      </div>
      <p className="pixel-text text-xl text-center text-yellow-300 font-bold">
        Customer Message:
      </p>
      <p className="pixel-text text-lg text-center text-white mt-2">
        "I was double-charged after upgrading my plan"
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-4 mb-6">
      {[
        { wizard: '🧙‍♂️', score: 4.2, color: 'blue', result: { cat: 'billing', summary: 'Customer experienced duplicate charge on plan upgrade' } },
        { wizard: '🧙‍♀️', score: 5.0, color: 'purple', result: { cat: 'billing', summary: 'Double charged after upgrade' } },
        { wizard: '🧙', score: 4.0, color: 'orange', result: { cat: 'billing', summary: 'Analysis indicates billing discrepancy occurred during plan transition' } }
      ].map((w, i) => (
        <motion.div
          key={i}
          className={`bg-${w.color}-900 p-4 rounded-lg border-4 border-${w.color}-500`}
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-center text-5xl mb-2">{w.wizard}</div>
          <div className="pixel-text text-sm text-gray-300 mb-2">
            <strong>Category:</strong> {w.result.cat}
          </div>
          <div className="pixel-text text-sm text-gray-300 mb-3">
            <strong>Summary:</strong> {w.result.summary}
          </div>
          <div className="bg-black p-2 rounded text-center">
            <span className="pixel-text text-yellow-300 font-bold text-xl">⭐ {w.score}/5.0</span>
          </div>
          {w.score === 5.0 && (
            <div className="text-center mt-2 text-2xl">🏆</div>
          )}
        </motion.div>
      ))}
    </div>

    <div className="bg-yellow-900 p-6 rounded-lg">
      <p className="pixel-text text-lg text-yellow-200">
        🏆 <strong>Winner: Wizard #2!</strong> Short, clear, confident. Perfect score!
      </p>
    </div>
  </div>
);

const Step8: React.FC<any> = ({ userInput, setUserInput, startDemo, hasStartedDemo }) => (
  <div className="pixel-border bg-black p-8 text-white">
    <h2 className="pixel-text text-4xl font-bold text-green-400 mb-6">🎮 NOW WATCH IT LIVE!</h2>

    <p className="pixel-text text-xl mb-6 text-gray-300">
      Ready to see DSPy in action? Enter a customer message below and watch the three wizards compete!
    </p>

    {!hasStartedDemo ? (
      <>
        <div className="bg-gray-900 p-6 rounded-lg mb-6">
          <label className="pixel-text text-lg text-yellow-300 font-bold block mb-3">
            Enter a customer message:
          </label>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Try: 'My app keeps crashing when I login'"
            className="w-full h-32 bg-black border-4 border-green-500 rounded p-4 text-white pixel-text text-lg resize-none focus:border-yellow-500 outline-none"
          />

          <div className="mt-4">
            <p className="pixel-text text-sm text-gray-400 mb-2">Or try an example:</p>
            <div className="space-y-2">
              {[
                "I was double-charged after upgrading my plan",
                "The app keeps crashing when I try to login",
                "I want to cancel my subscription immediately"
              ].map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setUserInput(ex)}
                  className="w-full text-left bg-blue-900 hover:bg-blue-800 p-3 rounded pixel-text text-sm text-blue-200 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={startDemo}
          className="w-full pixel-border bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-bold py-6 px-8 text-2xl pixel-text transition-all flex items-center justify-center gap-3"
        >
          <Sparkles size={32} />
          START THE COMPETITION!
          <Sparkles size={32} />
        </button>
      </>
    ) : (
      <div className="bg-gray-900 p-6 rounded-lg">
        <p className="pixel-text text-xl text-center text-yellow-300 mb-4">
          ⚡ Competition in Progress! ⚡
        </p>
        <p className="pixel-text text-center text-gray-300">
          Click NEXT to see the results!
        </p>
      </div>
    )}
  </div>
);

const Step9: React.FC<any> = ({ variants, winner, isRunning }) => (
  <div className="pixel-border bg-black p-8 text-white">
    <h2 className="pixel-text text-4xl font-bold text-yellow-400 mb-6">🏆 THE RESULTS!</h2>

    {isRunning && (
      <div className="bg-purple-900 p-8 rounded-lg text-center">
        <motion.div
          className="text-8xl mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          ✨
        </motion.div>
        <p className="pixel-text text-2xl text-purple-200">Wizards are working their magic...</p>
      </div>
    )}

    {!isRunning && variants.length > 0 && (
      <div className="space-y-6">
        {winner && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 p-8 rounded-lg border-4 border-yellow-300 text-center"
          >
            <motion.div
              className="text-9xl mb-4"
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              🏆
            </motion.div>
            <h3 className="pixel-text text-4xl font-bold mb-2">WINNER: {winner.toUpperCase()}!</h3>
            <p className="pixel-text text-xl">Highest score - Best prompt strategy!</p>
          </motion.div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          {variants.map((v) => {
            const isWinner = v.id === winner;
            const wizards = { v1: '🧙‍♂️', v2: '🧙‍♀️', v3: '🧙' };
            const colors = { v1: 'blue', v2: 'purple', v3: 'orange' };

            return (
              <div
                key={v.id}
                className={`p-4 rounded-lg border-4 ${
                  isWinner
                    ? 'bg-yellow-900 border-yellow-500'
                    : `bg-${colors[v.id as keyof typeof colors]}-900 border-${colors[v.id as keyof typeof colors]}-500`
                }`}
              >
                <div className="text-center text-6xl mb-3">{wizards[v.id as keyof typeof wizards]}</div>
                {v.output && (
                  <>
                    <div className="pixel-text text-sm mb-2">
                      <strong>Category:</strong> {v.output.category}
                    </div>
                    <div className="pixel-text text-sm mb-3">
                      <strong>Summary:</strong> {v.output.summary}
                    </div>
                  </>
                )}
                {v.score !== undefined && (
                  <div className="bg-black p-2 rounded text-center">
                    <span className="pixel-text text-yellow-300 font-bold text-xl">
                      ⭐ {v.score.toFixed(1)}/5.0
                    </span>
                  </div>
                )}
                {isWinner && <div className="text-center mt-2 text-3xl">👑</div>}
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
);

const Step10: React.FC<any> = () => (
  <div className="pixel-border bg-black p-8 text-white">
    <h2 className="pixel-text text-4xl font-bold text-rainbow mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
      🎉 YOU DID IT!
    </h2>

    <div className="bg-gradient-to-r from-purple-900 to-pink-900 p-8 rounded-lg mb-6 text-center">
      <p className="pixel-text text-3xl font-bold mb-4">You now understand DSPy!</p>
      <div className="text-7xl mb-4">🎓</div>
    </div>

    <div className="space-y-4 mb-6">
      <div className="bg-green-900 p-4 rounded-lg">
        <p className="pixel-text text-lg text-green-200">
          ✅ <strong>What DSPy Does:</strong> Automatically generates and tests multiple prompt strategies
        </p>
      </div>

      <div className="bg-blue-900 p-4 rounded-lg">
        <p className="pixel-text text-lg text-blue-200">
          ✅ <strong>How It Works:</strong> You define "good," DSPy finds the best prompt to achieve it
        </p>
      </div>

      <div className="bg-purple-900 p-4 rounded-lg">
        <p className="pixel-text text-lg text-purple-200">
          ✅ <strong>Why It's Magic:</strong> Saves hours of manual testing. Better results, less work!
        </p>
      </div>
    </div>

    <div className="bg-yellow-900 p-6 rounded-lg">
      <h3 className="pixel-text text-2xl font-bold text-yellow-300 mb-3">🚀 What's Next?</h3>
      <p className="pixel-text text-lg text-yellow-200">
        Use DSPy for your own projects! Any time you need to work with AI:
      </p>
      <ul className="pixel-text mt-3 space-y-2 text-yellow-200">
        <li>• Customer support automation</li>
        <li>• Content classification</li>
        <li>• Question answering</li>
        <li>• Text summarization</li>
        <li>• And much more!</li>
      </ul>
    </div>

    <div className="text-center mt-8">
      <p className="pixel-text text-2xl text-gray-300">
        Thanks for playing! 🎮
      </p>
    </div>
  </div>
);

const STORY_STEPS = [Step1, Step2, Step3, Step4, Step5, Step6, Step7, Step8, Step9, Step10];
