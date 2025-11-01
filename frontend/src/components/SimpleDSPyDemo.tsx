/**
 * Simple, educational single-screen DSPy demo
 * Shows the "aha!" moment immediately: DSPy tests multiple prompts and picks the best
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Zap, Target, CheckCircle2, XCircle, Info } from 'lucide-react';

interface Variant {
  id: string;
  name: string;
  prompt: string;
  output?: {
    category: string;
    summary: string;
  };
  score?: number;
  scoreBreakdown?: {
    label_valid: number;
    label_match: number;
    summary_len_ok: number;
    no_hedging: number;
    format_ok: number;
  };
  isWinner?: boolean;
  latency_ms?: number;
}

interface SimpleDSPyDemoProps {
  onRun: (input: string) => Promise<void>;
  variants: Variant[];
  isRunning: boolean;
  winner?: string;
}

export function SimpleDSPyDemo({ onRun, variants, isRunning, winner }: SimpleDSPyDemoProps) {
  const [inputText, setInputText] = useState('');
  const [showExplainer, setShowExplainer] = useState(true);

  const exampleInputs = [
    "I was double-charged after upgrading my plan",
    "The app keeps crashing when I try to login",
    "I want to cancel my subscription immediately",
    "This is urgent - my account is locked!"
  ];

  const handleRun = () => {
    if (inputText.trim()) {
      setShowExplainer(false);
      onRun(inputText);
    }
  };

  const hasResults = variants.some(v => v.output);
  const isComplete = !isRunning && winner;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header with simple explainer */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                DSPy: Automatic Prompt Optimization
              </h1>
              <p className="text-lg text-gray-600">
                Stop manually tweaking prompts. Define what "good" means, DSPy finds the best approach automatically.
              </p>
            </div>
            <button
              onClick={() => setShowExplainer(!showExplainer)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Info size={20} />
              {showExplainer ? 'Hide' : 'Show'} How It Works
            </button>
          </div>
        </div>
      </div>

      {/* Explainer Panel */}
      <AnimatePresence>
        {showExplainer && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white overflow-hidden"
          >
            <div className="container mx-auto px-6 py-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl font-bold">1</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">You Define "Good"</h3>
                  <p className="text-blue-100">
                    Set scoring rules: correct label, concise summary, no hedging, proper format
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl font-bold">2</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">DSPy Generates Variants</h3>
                  <p className="text-blue-100">
                    Automatically creates different prompt strategies: formal, conversational, analytical
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl font-bold">3</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Best One Wins</h3>
                  <p className="text-blue-100">
                    DSPy scores each variant and selects the highest performer automatically
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Demo Area - Single Screen Layout */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-12 gap-6">

          {/* Left: Input Section */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Input</h2>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter a customer support message..."
                className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none text-gray-900"
                disabled={isRunning}
              />

              {!isComplete ? (
                <button
                  onClick={handleRun}
                  disabled={!inputText.trim() || isRunning}
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                >
                  {isRunning ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Zap size={20} />
                      </motion.div>
                      DSPy is Optimizing...
                    </>
                  ) : (
                    <>
                      <Play size={20} />
                      Run DSPy Optimization
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleRun}
                  className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                >
                  <RotateCcw size={20} />
                  Try Another Input
                </button>
              )}

              <div className="mt-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Try these examples:</p>
                <div className="space-y-2">
                  {exampleInputs.map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputText(example)}
                      disabled={isRunning}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scoring Criteria Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-bold text-gray-900 mb-2">Scoring Criteria:</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✓ Correct category (billing/technical/etc.)</li>
                  <li>✓ Summary ≤20 words</li>
                  <li>✓ No uncertain language</li>
                  <li>✓ Proper JSON format</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right: Variants Racing Side-by-Side */}
          <div className="lg:col-span-8">
            {!hasResults && !isRunning && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Target size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to See DSPy in Action?</h3>
                <p className="text-gray-600 text-lg">
                  Enter a message on the left and click "Run DSPy Optimization" to watch multiple prompts compete in real-time
                </p>
              </div>
            )}

            {(hasResults || isRunning) && (
              <div className="space-y-4">
                {/* Completion Banner */}
                {isComplete && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <CheckCircle2 size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Optimization Complete!</h3>
                          <p className="text-green-100">DSPy tested 3 prompt variants and selected the best performer</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-green-100">Winner</div>
                        <div className="text-2xl font-bold">{winner}</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Prompt Variants Racing
                  </h2>
                  {isRunning && (
                    <span className="text-blue-600 font-bold flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Zap size={20} />
                      </motion.div>
                      Optimizing...
                    </span>
                  )}
                </div>

                {/* Variant Cards */}
                <div className="grid gap-4">
                  {variants.map((variant, idx) => (
                    <VariantCard
                      key={variant.id}
                      variant={variant}
                      delay={idx * 0.2}
                      isWinner={variant.id === winner}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface VariantCardProps {
  variant: Variant;
  delay: number;
  isWinner: boolean;
}

function VariantCard({ variant, delay, isWinner }: VariantCardProps) {
  const [showPrompt, setShowPrompt] = useState(true);

  const scorePercent = variant.score ? (variant.score / 5) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 transition-all ${
        isWinner
          ? 'border-green-500 ring-4 ring-green-200'
          : 'border-gray-200'
      }`}
    >
      {/* Header */}
      <div className={`p-4 flex items-center justify-between ${
        isWinner ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-gray-50'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
            isWinner ? 'bg-white text-green-600' : 'bg-white text-gray-700'
          }`}>
            {variant.id}
          </div>
          <div>
            <h3 className={`font-bold ${isWinner ? 'text-white' : 'text-gray-900'}`}>
              {variant.name}
            </h3>
            {variant.latency_ms && (
              <p className={`text-sm ${isWinner ? 'text-green-100' : 'text-gray-500'}`}>
                {variant.latency_ms}ms
              </p>
            )}
          </div>
        </div>

        {variant.score !== undefined && (
          <div className="text-right">
            <div className={`text-2xl font-bold ${isWinner ? 'text-white' : 'text-gray-900'}`}>
              {variant.score.toFixed(1)}/5.0
            </div>
            {isWinner && (
              <div className="text-green-100 text-sm font-medium">Winner!</div>
            )}
          </div>
        )}
      </div>

      {/* Prompt Section - Always Visible */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold text-gray-700 uppercase">Generated Prompt</h4>
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            {showPrompt ? 'Hide' : 'Show'}
          </button>
        </div>
        <AnimatePresence>
          {showPrompt && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <pre className="text-xs font-mono text-gray-700 bg-white p-3 rounded border border-gray-200 whitespace-pre-wrap">
                {variant.prompt}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Output Section */}
      {variant.output ? (
        <div className="p-4">
          <div className="mb-3">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {variant.output.category}
            </span>
          </div>
          <p className="text-gray-700">{variant.output.summary}</p>
        </div>
      ) : (
        <div className="p-4">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-center gap-2 text-gray-500"
          >
            <Zap size={16} />
            <span>Generating response...</span>
          </motion.div>
        </div>
      )}

      {/* Score Breakdown */}
      {variant.scoreBreakdown && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <h4 className="text-sm font-bold text-gray-700 mb-3">Score Breakdown</h4>
          <div className="space-y-2">
            {Object.entries(variant.scoreBreakdown).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">
                  {key.replace(/_/g, ' ')}
                </span>
                <div className="flex items-center gap-2">
                  {value === 1 ? (
                    <CheckCircle2 size={16} className="text-green-600" />
                  ) : (
                    <XCircle size={16} className="text-red-600" />
                  )}
                  <span className="text-sm font-medium text-gray-900">
                    {value.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Visual score bar */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${scorePercent}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`h-full ${
                  isWinner
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500'
                }`}
              />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
