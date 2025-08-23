/**
 * Scoreboard component showing ranked variants with live updates.
 * Displays variants sorted by score with smooth reordering animations.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Award } from 'lucide-react';
import { VariantCardState } from '../types';

interface ScoreboardProps {
  variants: VariantCardState[];
  leader?: string;
}

export function Scoreboard({ variants, leader }: ScoreboardProps) {
  // Sort variants by score (descending), then by latency (ascending)
  const sortedVariants = [...variants]
    .filter(v => v.score) // Only show variants with scores
    .sort((a, b) => {
      if (!a.score || !b.score) return 0;
      
      // Primary sort: score (higher is better)
      if (a.score.total !== b.score.total) {
        return b.score.total - a.score.total;
      }
      
      // Secondary sort: latency (lower is better)
      const aLatency = a.variant.latency_ms || Infinity;
      const bLatency = b.variant.latency_ms || Infinity;
      return aLatency - bLatency;
    });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">{rank}</div>;
    }
  };

  const getScoreColor = (total: number) => {
    if (total >= 4) return 'text-green-600';
    if (total >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatLatency = (ms?: number) => {
    if (!ms) return '';
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  };

  if (sortedVariants.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">Scoreboard</h3>
        <div className="text-center text-gray-500 py-8">
          <div className="text-4xl mb-2">🏆</div>
          <p>Scores will appear here as variants complete</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <h3 className="text-lg font-medium text-gray-900 mb-4">Scoreboard</h3>
      
      <div className="space-y-3">
        <AnimatePresence>
          {sortedVariants.map((variantState, index) => {
            const { variant, score } = variantState;
            const rank = index + 1;
            const isLeader = variant.variant_id === leader;
            
            return (
              <motion.div
                key={variant.variant_id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  scale: isLeader ? 1.02 : 1
                }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                  isLeader 
                    ? 'border-blue-400 bg-blue-50 shadow-md' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                {/* Rank and Variant */}
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {getRankIcon(rank)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {variant.variant_id.toUpperCase()}
                      {isLeader && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full"
                        >
                          LEADER
                        </motion.span>
                      )}
                    </div>
                    {variant.output && (
                      <div className="text-sm text-gray-600">
                        {variant.output.category}
                      </div>
                    )}
                  </div>
                </div>

                {/* Score and Latency */}
                <div className="text-right">
                  {score && (
                    <div className={`text-lg font-bold ${getScoreColor(score.total)}`}>
                      {score.total.toFixed(1)}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    {formatLatency(variant.latency_ms)}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Summary Stats */}
      {sortedVariants.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 pt-4 border-t border-gray-200"
        >
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-medium text-gray-900">
                {sortedVariants.length}
              </div>
              <div className="text-gray-500">Variants</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {sortedVariants[0]?.score?.total.toFixed(1) || '0.0'}
              </div>
              <div className="text-gray-500">Best Score</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {formatLatency(
                  Math.min(...sortedVariants.map(v => v.variant.latency_ms || Infinity))
                )}
              </div>
              <div className="text-gray-500">Fastest</div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}