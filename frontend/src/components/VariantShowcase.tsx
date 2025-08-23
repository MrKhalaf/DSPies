/**
 * Enhanced variant display showing the optimization process clearly
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Loader, Trophy, Eye, EyeOff } from 'lucide-react';
import { VariantCardState } from '../types';

interface VariantShowcaseProps {
  variants: VariantCardState[];
  leader?: string;
  showInternals: boolean;
  onToggleInternals: () => void;
}

export function VariantShowcase({ variants, leader, showInternals, onToggleInternals }: VariantShowcaseProps) {
  const getStateInfo = (state: string) => {
    switch (state) {
      case 'idle':
        return { icon: Clock, color: 'gray', text: 'Waiting...', bgColor: 'bg-gray-100' };
      case 'querying':
        return { icon: Loader, color: 'blue', text: 'Querying LLM...', bgColor: 'bg-blue-50' };
      case 'output':
        return { icon: Clock, color: 'yellow', text: 'Processing...', bgColor: 'bg-yellow-50' };
      case 'scored':
        return { icon: CheckCircle, color: 'green', text: 'Complete', bgColor: 'bg-green-50' };
      case 'error':
        return { icon: XCircle, color: 'red', text: 'Error', bgColor: 'bg-red-50' };
      default:
        return { icon: Clock, color: 'gray', text: 'Unknown', bgColor: 'bg-gray-100' };
    }
  };

  const getScoreColor = (total: number) => {
    if (total >= 4.5) return 'text-green-600';
    if (total >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatLatency = (ms?: number) => {
    if (!ms) return '';
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  };

  // Sort variants by ID to ensure consistent order
  const sortedVariants = [...variants].sort((a, b) => 
    a.variant.variant_id.localeCompare(b.variant.variant_id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Prompt Variants Competition</h3>
          <p className="text-gray-600">Each variant uses a different strategy to solve the same task</p>
        </div>
        
        <button
          onClick={onToggleInternals}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
            showInternals
              ? 'border-blue-300 bg-blue-50 text-blue-700'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {showInternals ? <EyeOff size={16} /> : <Eye size={16} />}
          {showInternals ? 'Hide' : 'Show'} Strategies
        </button>
      </div>

      {/* Variants Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {sortedVariants.map((variantState, index) => {
            const { variant, score, state } = variantState;
            const isLeader = variant.variant_id === leader;
            const stateInfo = getStateInfo(state);
            const StateIcon = stateInfo.icon;

            return (
              <motion.div
                key={variant.variant_id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: isLeader ? 1.05 : 1,
                  boxShadow: isLeader ? '0 20px 40px rgba(59, 130, 246, 0.15)' : '0 4px 6px rgba(0, 0, 0, 0.05)'
                }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`relative bg-white rounded-xl border-2 p-6 ${
                  isLeader ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50' : 'border-gray-200'
                }`}
              >
                {/* Leader Badge */}
                <AnimatePresence>
                  {isLeader && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -10 }}
                      className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg"
                    >
                      <Trophy size={14} />
                      LEADER
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Variant Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${stateInfo.bgColor}`}>
                      <StateIcon 
                        size={20} 
                        className={`text-${stateInfo.color}-600 ${state === 'querying' ? 'animate-spin' : ''}`} 
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">
                        Variant {variant.variant_id.toUpperCase()}
                      </h4>
                      <p className={`text-sm text-${stateInfo.color}-600`}>
                        {stateInfo.text}
                      </p>
                    </div>
                  </div>
                  
                  {variant.latency_ms && (
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Response Time</div>
                      <div className="font-mono text-sm font-medium">
                        {formatLatency(variant.latency_ms)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Strategy (if showing internals) */}
                <AnimatePresence>
                  {showInternals && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 p-3 bg-gray-50 rounded-lg border"
                    >
                      <div className="text-xs font-semibold text-gray-700 mb-1">STRATEGY:</div>
                      <div className="text-sm text-gray-600">{variant.prompt_spec}</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Output */}
                <AnimatePresence>
                  {variant.output && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3 mb-4"
                    >
                      <div>
                        <div className="text-xs font-semibold text-gray-700 mb-1">CLASSIFICATION:</div>
                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          isLeader ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {variant.output.category}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs font-semibold text-gray-700 mb-1">SUMMARY:</div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          "{variant.output.summary}"
                        </p>
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
                      className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <div className="text-xs font-semibold text-red-700 mb-1">ERROR:</div>
                      <div className="text-sm text-red-600">{variant.error}</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Score */}
                <AnimatePresence>
                  {score && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="border-t pt-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-700">PERFORMANCE SCORE</span>
                        <span className={`text-2xl font-bold ${getScoreColor(score.total)}`}>
                          {score.total.toFixed(1)}/5.0
                        </span>
                      </div>
                      
                      {/* Score Breakdown */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(score.components).map(([key, value]) => {
                          const labels = {
                            label_valid: 'Valid Format',
                            label_match: 'Intent Match',
                            summary_len_ok: 'Good Length',
                            no_hedging: 'Confident',
                            format_ok: 'Proper Structure'
                          };
                          
                          return (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-gray-600">
                                {labels[key as keyof typeof labels]}:
                              </span>
                              <span className={`font-mono font-bold ${
                                value === 1 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {value === 1 ? '✓' : '✗'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {sortedVariants.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Ready for Optimization</h3>
          <p className="text-gray-500">
            Variants will appear here as DSPy tests different prompt strategies
          </p>
        </div>
      )}
    </div>
  );
}