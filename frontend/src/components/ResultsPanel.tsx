/**
 * Final results panel showing the optimization outcome with clear explanations
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Copy, RotateCcw, Download, Sparkles } from 'lucide-react';
import { VariantCardState, Score } from '../types';

interface ResultsPanelProps {
  winnerVariant?: VariantCardState;
  winnerScore?: Score;
  allVariants: VariantCardState[];
  onReplay: () => void;
  onCopyJson: () => void;
  inputText: string;
}

export function ResultsPanel({ 
  winnerVariant, 
  winnerScore, 
  allVariants,
  onReplay, 
  onCopyJson,
  inputText 
}: ResultsPanelProps) {
  if (!winnerVariant?.variant.output || !winnerScore) {
    return null;
  }

  const { variant } = winnerVariant;
  const { output } = variant;

  const getWhyItWonReasons = () => {
    const reasons = [];
    const components = winnerScore.components;

    if (components.label_valid === 1) reasons.push('✓ Valid category format');
    if (components.label_match === 1) reasons.push('✓ Correctly identified intent');
    if (components.summary_len_ok === 1) reasons.push('✓ Optimal summary length');
    if (components.no_hedging === 1) reasons.push('✓ Confident language');
    if (components.format_ok === 1) reasons.push('✓ Proper structure');

    return reasons;
  };

  const getComparisonData = () => {
    return allVariants
      .filter(v => v.score)
      .map(v => ({
        id: v.variant.variant_id,
        score: v.score!.total,
        latency: v.variant.latency_ms || 0,
        isWinner: v.variant.variant_id === variant.variant_id
      }))
      .sort((a, b) => b.score - a.score);
  };

  const copyResultToClipboard = async () => {
    if (!output) return;
    
    const resultData = {
      input: inputText,
      optimization_result: {
        winner: {
          variant_id: variant.variant_id,
          strategy: variant.prompt_spec,
          output: {
            category: output.category,
            summary: output.summary
          },
          performance: {
            score: winnerScore.total,
            latency_ms: variant.latency_ms,
            components: winnerScore.components
          }
        },
        all_variants: getComparisonData(),
        why_this_won: getWhyItWonReasons()
      }
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(resultData, null, 2));
      // Could add toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-xl border-2 border-green-200 p-8"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full text-xl font-bold shadow-lg mb-4"
        >
          <Trophy size={24} />
          Optimization Complete!
        </motion.div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Variant {variant.variant_id.toUpperCase()} Wins!
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          DSPy tested multiple prompt strategies and selected the best performer. 
          Here's what made this variant the winner:
        </p>
      </div>

      {/* Main Results */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Output */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Final Output</h3>
            
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-sm font-semibold text-gray-700 mb-2">CLASSIFICATION</div>
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold text-lg">
                  {output?.category}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-sm font-semibold text-gray-700 mb-2">SUMMARY</div>
                <p className="text-gray-900 text-lg leading-relaxed">
                  "{output?.summary}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Details */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Analysis</h3>
            
            {/* Score */}
            <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-gray-700">OVERALL SCORE</span>
                <span className="text-3xl font-bold text-green-600">
                  {winnerScore.total.toFixed(1)}/5.0
                </span>
              </div>
              
              {variant.latency_ms && (
                <div className="text-sm text-gray-600">
                  Completed in {variant.latency_ms < 1000 
                    ? `${variant.latency_ms}ms` 
                    : `${(variant.latency_ms / 1000).toFixed(1)}s`}
                </div>
              )}
            </div>

            {/* Why It Won */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm font-semibold text-gray-700 mb-3">WHY THIS VARIANT WON</div>
              <div className="space-y-2">
                {getWhyItWonReasons().map((reason, index) => (
                  <motion.div
                    key={reason}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg"
                  >
                    <Sparkles size={14} />
                    {reason}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Variant Comparison</h3>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Variant</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Score</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Speed</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Result</th>
              </tr>
            </thead>
            <tbody>
              {getComparisonData().map((variant, index) => (
                <tr key={variant.id} className={variant.isWinner ? 'bg-green-50' : ''}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        Variant {variant.id.toUpperCase()}
                      </span>
                      {variant.isWinner && (
                        <Trophy size={16} className="text-yellow-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${
                      variant.score >= 4.5 ? 'text-green-600' : 
                      variant.score >= 3.5 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {variant.score.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm">
                    {variant.latency < 1000 ? `${variant.latency}ms` : `${(variant.latency / 1000).toFixed(1)}s`}
                  </td>
                  <td className="px-4 py-3">
                    {variant.isWinner ? (
                      <span className="text-green-600 font-medium">Winner</span>
                    ) : (
                      <span className="text-gray-500">Runner-up</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        <motion.button
          onClick={onReplay}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <RotateCcw size={18} />
          Replay Optimization
        </motion.button>

        <motion.button
          onClick={copyResultToClipboard}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          <Copy size={18} />
          Copy Results
        </motion.button>

        <motion.button
          onClick={onCopyJson}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          <Download size={18} />
          Export Data
        </motion.button>
      </div>
    </motion.div>
  );
}