/**
 * Individual variant card component showing the state and results of a single prompt variant.
 * Displays the optimization process from querying to scoring with smooth animations.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Loader, Award } from 'lucide-react';
import { VariantCardState } from '../types';

interface VariantCardProps {
  variantState: VariantCardState;
  showInternals: boolean;
  isLeader: boolean;
  rank?: number;
}

export function VariantCard({ variantState, showInternals, isLeader, rank }: VariantCardProps) {
  const { variant, score, state } = variantState;

  const getStateIcon = () => {
    switch (state) {
      case 'idle':
        return <div className="w-5 h-5 rounded-full bg-gray-300" />;
      case 'querying':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'output':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'scored':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-gray-300" />;
    }
  };

  const getStateText = () => {
    switch (state) {
      case 'idle':
        return 'Waiting...';
      case 'querying':
        return 'Querying model...';
      case 'output':
        return 'Processing output...';
      case 'scored':
        return 'Complete';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const formatLatency = (ms?: number) => {
    if (!ms) return '';
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  };

  const getScoreColor = (total: number) => {
    if (total >= 4) return 'text-green-600';
    if (total >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1
    },
    leader: {
      scale: 1.02,
      boxShadow: "0 8px 25px rgba(59, 130, 246, 0.15)",
      borderColor: "rgb(59, 130, 246)"
    }
  };

  const scoreVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { delay: 0.2, duration: 0.3 }
    }
  };

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="hidden"
      animate={isLeader ? "leader" : "visible"}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative bg-white rounded-lg border-2 p-4 transition-all duration-300 ${
        isLeader ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
      }`}
    >
      {/* Leader Badge */}
      <AnimatePresence>
        {isLeader && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className="absolute -top-2 -right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"
          >
            <Award size={12} />
            Leader
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rank Badge */}
      {rank && (
        <div className="absolute -top-2 -left-2 bg-gray-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
          {rank}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStateIcon()}
          <span className="font-medium text-gray-900">{variant.variant_id.toUpperCase()}</span>
        </div>
        <div className="text-sm text-gray-500">
          {variant.latency_ms && formatLatency(variant.latency_ms)}
        </div>
      </div>

      {/* Status */}
      <div className="mb-3">
        <span className="text-sm text-gray-600">{getStateText()}</span>
      </div>

      {/* Prompt Spec (if showing internals) */}
      <AnimatePresence>
        {showInternals && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 p-2 bg-gray-100 rounded text-xs text-gray-700"
          >
            <div className="font-medium mb-1">Prompt Strategy:</div>
            <div>{variant.prompt_spec}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Output */}
      <AnimatePresence>
        {variant.output && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-3 space-y-2"
          >
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</span>
              <div className="inline-block ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {variant.output.category}
              </div>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Summary</span>
              <p className="text-sm text-gray-700 mt-1">{variant.output.summary}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {variant.error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700"
          >
            <div className="font-medium">Error:</div>
            <div>{variant.error}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Score */}
      <AnimatePresence>
        {score && (
          <motion.div
            variants={scoreVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="border-t pt-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Score</span>
              <span className={`text-lg font-bold ${getScoreColor(score.total)}`}>
                {score.total.toFixed(1)}
              </span>
            </div>
            
            {/* Score Breakdown */}
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className="flex justify-between">
                <span>Valid:</span>
                <span className={score.components.label_valid === 1 ? 'text-green-600' : 'text-red-600'}>
                  {score.components.label_valid === 1 ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Match:</span>
                <span className={score.components.label_match === 1 ? 'text-green-600' : 'text-red-600'}>
                  {score.components.label_match === 1 ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Length:</span>
                <span className={score.components.summary_len_ok === 1 ? 'text-green-600' : 'text-red-600'}>
                  {score.components.summary_len_ok === 1 ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Format:</span>
                <span className={score.components.format_ok === 1 ? 'text-green-600' : 'text-red-600'}>
                  {score.components.format_ok === 1 ? '✓' : '✗'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}