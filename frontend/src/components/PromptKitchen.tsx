/**
 * The Prompt Kitchen: A narrative-driven DSPy demo
 * Story: You're the head chef. 3 assistant chefs interpret your recipe.
 * Judges score each dish. The best wins!
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Trophy, Star, Sparkles, Clock, ChefHat, Award, Zap } from 'lucide-react';

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
  latency_ms?: number;
}

interface PromptKitchenProps {
  onRun: (input: string) => Promise<void>;
  variants: Variant[];
  isRunning: boolean;
  winner?: string;
}

// Chef characters with personality
const CHEFS = {
  v1: {
    name: 'Chef Formal',
    avatar: '👨‍🍳',
    color: 'blue',
    personality: 'Precise & Traditional',
    description: 'Follows recipes exactly, very structured'
  },
  v2: {
    name: 'Chef Friendly',
    avatar: '👩‍🍳',
    color: 'purple',
    personality: 'Warm & Conversational',
    description: 'Makes cooking feel like chatting with a friend'
  },
  v3: {
    name: 'Chef Analyst',
    avatar: '🧑‍🍳',
    color: 'orange',
    personality: 'Thoughtful & Detailed',
    description: 'Breaks down every ingredient and technique'
  }
};

const JUDGE_CRITERIA = [
  { key: 'label_valid', name: 'Correct Category', icon: '🎯' },
  { key: 'label_match', name: 'Intent Match', icon: '🧠' },
  { key: 'summary_len_ok', name: 'Perfect Length', icon: '📏' },
  { key: 'no_hedging', name: 'Confidence', icon: '💪' },
  { key: 'format_ok', name: 'Presentation', icon: '✨' }
];

export function PromptKitchen({ onRun, variants, isRunning, winner }: PromptKitchenProps) {
  const [recipe, setRecipe] = useState('');
  const [showStory, setShowStory] = useState(true);

  const exampleRecipes = [
    "I was double-charged after upgrading my plan",
    "The app keeps crashing when I try to login",
    "I want to cancel my subscription immediately",
    "This is urgent - my account is locked!"
  ];

  const handleCook = () => {
    if (recipe.trim()) {
      setShowStory(false);
      onRun(recipe);
    }
  };

  const isComplete = !isRunning && winner;
  const hasChefs = variants.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      {/* Header - The Kitchen */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="text-6xl"
              >
                👨‍🍳
              </motion.div>
              <div>
                <h1 className="text-4xl font-black mb-2">The Prompt Kitchen</h1>
                <p className="text-xl text-orange-100">
                  Watch 3 AI Chefs compete to cook the perfect response!
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowStory(!showStory)}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-all backdrop-blur-sm"
            >
              {showStory ? '🙈 Hide' : '📖 Show'} Story
            </button>
          </div>
        </div>
      </div>

      {/* Story Explainer */}
      <AnimatePresence>
        {showStory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b-4 border-orange-200 overflow-hidden"
          >
            <div className="container mx-auto px-6 py-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                  <div className="text-5xl mb-4">📝</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">1. You Give the Order</h3>
                  <p className="text-gray-700">
                    You're the head chef! Write a customer message that needs handling
                  </p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                  <div className="text-5xl mb-4">👨‍🍳👩‍🍳🧑‍🍳</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">2. Three Chefs Cook</h3>
                  <p className="text-gray-700">
                    Each chef has their own style - watch them work their magic!
                  </p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
                  <div className="text-5xl mb-4">🏆</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">3. Judges Crown Winner</h3>
                  <p className="text-gray-700">
                    Our judges score each dish - best one wins the golden spoon!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Kitchen Layout */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-12 gap-8">

          {/* Left: Your Recipe (Input) */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white rounded-2xl shadow-2xl p-6 sticky top-6 border-4 border-orange-200"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="text-4xl">📋</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Your Order</h2>
                  <p className="text-sm text-gray-600">What needs cooking today?</p>
                </div>
              </div>

              <textarea
                value={recipe}
                onChange={(e) => setRecipe(e.target.value)}
                placeholder="Enter a customer message..."
                className="w-full h-32 px-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none resize-none text-gray-900 text-lg"
                disabled={isRunning}
              />

              {!isComplete ? (
                <button
                  onClick={handleCook}
                  disabled={!recipe.trim() || isRunning}
                  className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-black py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-2xl disabled:cursor-not-allowed text-lg"
                >
                  {isRunning ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles size={24} />
                      </motion.div>
                      Chefs are Cooking...
                    </>
                  ) : (
                    <>
                      <ChefHat size={24} />
                      Send to Kitchen!
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleCook}
                  className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-black py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-2xl text-lg"
                >
                  <Play size={24} />
                  Cook Another Order
                </button>
              )}

              <div className="mt-6">
                <p className="text-sm font-bold text-gray-700 mb-3">🔥 Popular Orders:</p>
                <div className="space-y-2">
                  {exampleRecipes.map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => setRecipe(example)}
                      disabled={isRunning}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-orange-200"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Judge Criteria */}
              <div className="mt-6 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span>⚖️</span> Judge's Scorecard:
                </h3>
                <div className="space-y-2">
                  {JUDGE_CRITERIA.map((criterion) => (
                    <div key={criterion.key} className="flex items-center gap-2 text-sm text-gray-700">
                      <span>{criterion.icon}</span>
                      <span>{criterion.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: The Kitchen (Chefs at Work) */}
          <div className="lg:col-span-8">
            {!hasChefs && !isRunning && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl shadow-xl p-12 text-center border-4 border-dashed border-orange-200"
              >
                <div className="text-8xl mb-6">🍳</div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">Kitchen Ready!</h3>
                <p className="text-xl text-gray-600">
                  Send an order and watch our chefs spring into action
                </p>
              </motion.div>
            )}

            {/* Winner Announcement */}
            {isComplete && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: -50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white p-8 rounded-2xl shadow-2xl mb-6 border-4 border-yellow-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <motion.div
                      animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-7xl"
                    >
                      🏆
                    </motion.div>
                    <div>
                      <h3 className="text-3xl font-black mb-2">Winner Crowned!</h3>
                      <p className="text-xl text-yellow-100">
                        {CHEFS[winner as keyof typeof CHEFS]?.name} wins the golden spoon!
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-6xl mb-2">{CHEFS[winner as keyof typeof CHEFS]?.avatar}</div>
                    <div className="text-2xl font-black">{winner?.toUpperCase()}</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Chef Cards */}
            {(hasChefs || isRunning) && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <span>👨‍🍳</span> Chefs at Work
                  </h2>
                  {isRunning && (
                    <span className="text-orange-600 font-bold flex items-center gap-2 text-lg">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles size={20} />
                      </motion.div>
                      Cooking in progress...
                    </span>
                  )}
                </div>

                {variants.map((variant, idx) => (
                  <ChefCard
                    key={variant.id}
                    variant={variant}
                    chef={CHEFS[variant.id as keyof typeof CHEFS]}
                    delay={idx * 0.15}
                    isWinner={variant.id === winner}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ChefCardProps {
  variant: Variant;
  chef: typeof CHEFS.v1;
  delay: number;
  isWinner: boolean;
}

function ChefCard({ variant, chef, delay, isWinner }: ChefCardProps) {
  const [showRecipe, setShowRecipe] = useState(false);

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        border: 'border-blue-400',
        bg: 'from-blue-500 to-blue-600',
        text: 'text-blue-600',
        light: 'bg-blue-50',
        pill: 'bg-blue-100 text-blue-800'
      },
      purple: {
        border: 'border-purple-400',
        bg: 'from-purple-500 to-purple-600',
        text: 'text-purple-600',
        light: 'bg-purple-50',
        pill: 'bg-purple-100 text-purple-800'
      },
      orange: {
        border: 'border-orange-400',
        bg: 'from-orange-500 to-orange-600',
        text: 'text-orange-600',
        light: 'bg-orange-50',
        pill: 'bg-orange-100 text-orange-800'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const colors = getColorClasses(chef.color);
  const scorePercent = variant.score ? (variant.score / 5) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, type: "spring" }}
      className={`bg-white rounded-2xl shadow-xl overflow-hidden border-4 transition-all ${
        isWinner
          ? 'border-yellow-400 ring-8 ring-yellow-200 shadow-2xl'
          : `${colors.border}`
      }`}
    >
      {/* Chef Header */}
      <div className={`p-6 bg-gradient-to-r ${isWinner ? 'from-yellow-400 to-orange-400' : colors.bg} text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-6xl">{chef.avatar}</div>
            <div>
              <h3 className="text-2xl font-black">{chef.name}</h3>
              <p className="text-sm opacity-90">{chef.personality}</p>
              <p className="text-xs opacity-75 italic mt-1">{chef.description}</p>
            </div>
          </div>
          {variant.score !== undefined && (
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={i < Math.round(variant.score!) ? 'fill-current' : 'opacity-30'}
                  />
                ))}
              </div>
              <div className="text-3xl font-black">{variant.score.toFixed(1)}/5.0</div>
              {isWinner && (
                <div className="flex items-center gap-1 justify-end mt-1">
                  <Trophy size={16} />
                  <span className="text-sm font-bold">WINNER!</span>
                </div>
              )}
            </div>
          )}
          {variant.latency_ms && !variant.score && (
            <div className="flex items-center gap-2 text-sm opacity-75">
              <Clock size={16} />
              <span>{variant.latency_ms}ms</span>
            </div>
          )}
        </div>
      </div>

      {/* Recipe (Prompt) */}
      <div className={`p-4 ${colors.light} border-b-2 ${colors.border}`}>
        <button
          onClick={() => setShowRecipe(!showRecipe)}
          className={`w-full flex items-center justify-between ${colors.text} hover:opacity-75 transition-opacity`}
        >
          <span className="font-bold flex items-center gap-2">
            <span>📖</span> Chef's Recipe
          </span>
          <span className="text-sm">{showRecipe ? '▲ Hide' : '▼ Show'}</span>
        </button>
        <AnimatePresence>
          {showRecipe && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3"
            >
              <pre className="text-xs font-mono text-gray-700 bg-white p-4 rounded-lg border-2 border-gray-200 whitespace-pre-wrap overflow-x-auto">
                {variant.prompt}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* The Dish (Output) */}
      {variant.output ? (
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🍽️</span>
            <h4 className="text-lg font-bold text-gray-900">The Finished Dish</h4>
          </div>
          <div className="mb-4">
            <span className={`inline-block px-4 py-2 ${colors.pill} rounded-full text-sm font-bold`}>
              📁 {variant.output.category}
            </span>
          </div>
          <p className="text-gray-700 text-lg leading-relaxed">{variant.output.summary}</p>
        </div>
      ) : (
        <div className="p-6">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-center gap-3 text-gray-500 text-lg"
          >
            <Zap size={24} />
            <span className="font-medium">Chef is cooking...</span>
          </motion.div>
        </div>
      )}

      {/* Judge's Scores */}
      {variant.scoreBreakdown && (
        <div className="p-6 bg-gray-50 border-t-2 border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⚖️</span>
            <h4 className="text-lg font-bold text-gray-900">Judge's Scorecard</h4>
          </div>
          <div className="space-y-3">
            {JUDGE_CRITERIA.map((criterion) => {
              const score = variant.scoreBreakdown![criterion.key as keyof typeof variant.scoreBreakdown];
              const passed = score >= 0.8;
              return (
                <div key={criterion.key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 flex items-center gap-2">
                    <span>{criterion.icon}</span>
                    {criterion.name}
                  </span>
                  <div className="flex items-center gap-3">
                    {passed ? (
                      <Award size={18} className="text-green-600" />
                    ) : (
                      <span className="text-red-600 text-xl">✗</span>
                    )}
                    <span className={`text-sm font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                      {score.toFixed(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Score Bar */}
          <div className="mt-4 pt-4 border-t-2 border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-700">Overall Score</span>
              <span className="text-lg font-black text-gray-900">{scorePercent.toFixed(0)}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${scorePercent}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className={`h-full bg-gradient-to-r ${
                  isWinner
                    ? 'from-yellow-400 to-orange-500'
                    : colors.bg
                }`}
              />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
