/**
 * Modern full-screen results section showing optimization outcome
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw, Download, Sparkles, Target, Zap, ArrowRight } from 'lucide-react';
import { VariantCardState, Score } from '../types';

interface ModernResultsSectionProps {
  winnerVariant?: VariantCardState;
  winnerScore?: Score;
  allVariants: VariantCardState[];
  onReplay: () => void;
  onNewOptimization: () => void;
  inputText: string;
}

export function ModernResultsSection({ 
  winnerVariant, 
  winnerScore, 
  allVariants,
  onReplay, 
  onNewOptimization,
  inputText 
}: ModernResultsSectionProps) {
  if (!winnerVariant?.variant.output || !winnerScore) {
    return null;
  }

  const { variant } = winnerVariant;
  const { output } = variant;

  const getPerformanceInsights = () => {
    const insights = [];
    const components = winnerScore.components;

    if (components.label_valid === 1) insights.push({ text: 'Perfect format compliance', icon: '✓', color: 'text-green-500' });
    if (components.label_match === 1) insights.push({ text: 'Accurate intent detection', icon: '🎯', color: 'text-blue-500' });
    if (components.summary_len_ok === 1) insights.push({ text: 'Optimal summary length', icon: '📏', color: 'text-purple-500' });
    if (components.no_hedging === 1) insights.push({ text: 'Confident language', icon: '💪', color: 'text-orange-500' });
    if (components.format_ok === 1) insights.push({ text: 'Structured output', icon: '🏗️', color: 'text-indigo-500' });

    return insights;
  };

  const getCompetitionData = () => {
    return allVariants
      .filter(v => v.score)
      .map(v => ({
        id: v.variant.variant_id,
        strategy: v.variant.prompt_spec,
        score: v.score!.total,
        latency: v.variant.latency_ms || 0,
        isWinner: v.variant.variant_id === variant.variant_id,
        output: v.variant.output
      }))
      .sort((a, b) => b.score - a.score);
  };

  const exportResults = async () => {
    const resultData = {
      optimization_summary: {
        input: inputText,
        winner: {
          variant_id: variant.variant_id,
          strategy: variant.prompt_spec,
          score: winnerScore.total,
          latency_ms: variant.latency_ms
        },
        performance_metrics: winnerScore.components,
        all_competitors: getCompetitionData()
      },
      insights: getPerformanceInsights(),
      timestamp: new Date().toISOString()
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(resultData, null, 2));
    } catch (err) {
      console.error('Failed to copy results:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Celebration background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Celebration header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
            className="inline-flex items-center gap-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-full text-xl font-bold shadow-2xl mb-6"
          >
            <Trophy size={32} />
            Step 3: Optimization Complete!
            <Sparkles size={32} />
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-4">
            DSPy Found the Perfect Strategy
          </h2>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            After testing multiple approaches, Variant {variant.variant_id.toUpperCase()} emerged as the winner 
            with a score of {winnerScore.total.toFixed(1)}/5.0. Here's what made it the best choice.
          </p>
        </motion.div>

        {/* Winner showcase */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-white to-green-50 rounded-3xl shadow-2xl p-8 mb-12 border-2 border-green-200"
        >
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Output showcase */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                  <Target size={24} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Optimized Output</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-6 border border-green-200 shadow-lg">
                  <div className="text-sm font-semibold text-slate-600 mb-2">CLASSIFICATION RESULT</div>
                  <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-bold text-xl">
                    {output?.category}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-green-200 shadow-lg">
                  <div className="text-sm font-semibold text-slate-600 mb-3">GENERATED SUMMARY</div>
                  <p className="text-lg text-slate-800 leading-relaxed font-medium">
                    "{output?.summary}"
                  </p>
                </div>
              </div>
            </div>

            {/* Performance analysis */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl">
                  <Zap size={24} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Performance Analysis</h3>
              </div>

              {/* Score display */}
              <div className="bg-white rounded-2xl p-6 border border-green-200 shadow-lg mb-4">
                <div className="text-center">
                  <div className="text-sm font-semibold text-slate-600 mb-2">OVERALL SCORE</div>
                  <div className="text-5xl font-black text-green-600 mb-2">
                    {winnerScore.total.toFixed(1)}
                  </div>
                  <div className="text-slate-500">out of 5.0</div>
                  
                  {variant.latency_ms && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="text-sm text-slate-600">
                        Completed in <span className="font-bold text-slate-900">
                          {variant.latency_ms < 1000 ? `${variant.latency_ms}ms` : `${(variant.latency_ms / 1000).toFixed(1)}s`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Performance insights */}
              <div className="bg-white rounded-2xl p-6 border border-green-200 shadow-lg">
                <div className="text-sm font-semibold text-slate-600 mb-4">WHY THIS VARIANT WON</div>
                <div className="space-y-3">
                  {getPerformanceInsights().map((insight, index) => (
                    <motion.div
                      key={insight.text}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-green-50 rounded-xl"
                    >
                      <span className="text-xl">{insight.icon}</span>
                      <span className="font-medium text-slate-800">{insight.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Competition results */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-3xl shadow-2xl p-8 mb-12 border border-slate-200"
        >
          <h3 className="text-3xl font-bold text-slate-900 text-center mb-8">
            Competition Results
          </h3>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Variant</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Strategy</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Score</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Speed</th>
                </tr>
              </thead>
              <tbody>
                {getCompetitionData().map((variant, index) => (
                  <tr key={variant.id} className={`${variant.isWinner ? 'bg-green-50' : ''} border-t border-slate-200`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-slate-400 text-white' :
                          index === 2 ? 'bg-amber-600 text-white' :
                          'bg-slate-200 text-slate-600'
                        }`}>
                          {index + 1}
                        </span>
                        {variant.isWinner && <Trophy size={16} className="text-yellow-500" />}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900">
                        {variant.id.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {variant.strategy.split(':')[0]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-lg font-bold ${
                        variant.score >= 4.5 ? 'text-green-600' : 
                        variant.score >= 3.5 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {variant.score.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-slate-600">
                        {variant.latency < 1000 ? `${variant.latency}ms` : `${(variant.latency / 1000).toFixed(1)}s`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap gap-6 justify-center"
        >
          <motion.button
            onClick={onReplay}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            <RotateCcw size={24} />
            Replay Optimization
          </motion.button>

          <motion.button
            onClick={exportResults}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 px-8 py-4 border-2 border-slate-300 text-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all"
          >
            <Download size={24} />
            Export Results
          </motion.button>

          <motion.button
            onClick={onNewOptimization}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            <Sparkles size={24} />
            Try New Message
            <ArrowRight size={24} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}