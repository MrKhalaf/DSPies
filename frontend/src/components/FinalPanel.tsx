/**
 * Final results panel showing the winning variant and detailed breakdown.
 * Displays the final output with explanations and action buttons.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Copy, Download, RotateCcw, Trophy } from 'lucide-react';
import { VariantCardState, Score } from '../types';

interface FinalPanelProps {
  winnerVariant?: VariantCardState;
  winnerScore?: Score;
  onReplay: () => void;
  onCopyJson: () => void;
  inputText: string;
}

export function FinalPanel({ 
  winnerVariant, 
  winnerScore, 
  onReplay, 
  onCopyJson,
  inputText 
}: FinalPanelProps) {
  if (!winnerVariant?.variant.output || !winnerScore) {
    return null;
  }

  const { variant } = winnerVariant;
  const { output } = variant;

  const getWhyItWonChips = () => {
    const chips = [];
    const components = winnerScore.components;

    if (components.label_valid === 1) chips.push('Valid label');
    if (components.label_match === 1) chips.push('Intent match');
    if (components.summary_len_ok === 1) chips.push('Good length');
    if (components.no_hedging === 1) chips.push('No hedging');
    if (components.format_ok === 1) chips.push('Proper format');

    return chips;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleCopyResult = () => {
    const resultJson = {
      input: inputText,
      winner: {
        variant_id: variant.variant_id,
        category: output.category,
        summary: output.summary,
        score: winnerScore.total,
        latency_ms: variant.latency_ms
      },
      score_breakdown: winnerScore.components,
      why_it_won: getWhyItWonChips()
    };

    copyToClipboard(JSON.stringify(resultJson, null, 2));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-green-200 p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-500 rounded-full">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Optimization Complete</h2>
          <p className="text-gray-600">Variant {variant.variant_id.toUpperCase()} selected as the winner</p>
        </div>
      </div>

      {/* Results */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Output */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Classification
            </label>
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium">
              {output.category}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Summary
            </label>
            <p className="text-gray-900 bg-white p-3 rounded-lg border">
              {output.summary}
            </p>
          </div>
        </div>

        {/* Score Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Final Score
            </label>
            <div className="text-3xl font-bold text-green-600">
              {winnerScore.total.toFixed(1)}/5.0
            </div>
            {variant.latency_ms && (
              <div className="text-sm text-gray-500">
                Completed in {variant.latency_ms < 1000 
                  ? `${variant.latency_ms}ms` 
                  : `${(variant.latency_ms / 1000).toFixed(1)}s`}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Why it won
            </label>
            <div className="flex flex-wrap gap-2">
              {getWhyItWonChips().map((chip, index) => (
                <motion.span
                  key={chip}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                >
                  ✓ {chip}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Score Breakdown
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(winnerScore.components).map(([key, value]) => {
            const labels = {
              label_valid: 'Valid Label',
              label_match: 'Intent Match', 
              summary_len_ok: 'Length OK',
              no_hedging: 'No Hedging',
              format_ok: 'Format OK'
            };
            
            return (
              <div key={key} className="text-center">
                <div className={`text-lg font-bold ${value === 1 ? 'text-green-600' : 'text-red-600'}`}>
                  {value.toFixed(1)}
                </div>
                <div className="text-xs text-gray-600">
                  {labels[key as keyof typeof labels]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <motion.button
          onClick={onReplay}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw size={16} />
          Replay Animation
        </motion.button>

        <motion.button
          onClick={handleCopyResult}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Copy size={16} />
          Copy Result JSON
        </motion.button>

        <motion.button
          onClick={onCopyJson}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Download size={16} />
          Export Full Data
        </motion.button>
      </div>
    </motion.div>
  );
}