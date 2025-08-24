/**
 * Modern full-screen optimization visualization showing DSPy in action
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Target, Trophy, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { VariantCardState } from '../types';

interface OptimizationVisualizationProps {
  variants: VariantCardState[];
  leader?: string;
  status: 'compiling' | 'running' | 'complete' | 'error';
  progress: number;
}

export function OptimizationVisualization({ 
  variants, 
  leader, 
  status, 
  progress 
}: OptimizationVisualizationProps) {
  const completedVariants = variants.filter(v => v.state === 'scored' || v.state === 'error').length;
  
  const getStepStatus = (step: string) => {
    switch (step) {
      case 'generating':
        return status === 'compiling' ? 'active' : status === 'running' || status === 'complete' ? 'complete' : 'pending';
      case 'testing':
        return status === 'running' && completedVariants === 0 ? 'active' : 
               status === 'running' && completedVariants > 0 || status === 'complete' ? 'complete' : 'pending';
      case 'scoring':
        return status === 'running' && completedVariants > 0 && completedVariants < variants.length ? 'active' :
               status === 'complete' ? 'complete' : 'pending';
      case 'selecting':
        return status === 'complete' ? 'complete' : 'pending';
      default:
        return 'pending';
    }
  };

  const steps = [
    {
      id: 'generating',
      icon: Brain,
      title: 'Generating Strategies',
      description: 'DSPy creates multiple prompt variants with different approaches',
      status: getStepStatus('generating')
    },
    {
      id: 'testing',
      icon: Zap,
      title: 'Testing Performance',
      description: 'Each variant is tested against the LLM to generate outputs',
      status: getStepStatus('testing')
    },
    {
      id: 'scoring',
      icon: Target,
      title: 'Evaluating Results',
      description: 'Deterministic metrics score each variant\'s performance',
      status: getStepStatus('scoring')
    },
    {
      id: 'selecting',
      icon: Trophy,
      title: 'Selecting Winner',
      description: 'The highest-scoring variant becomes the optimized prompt',
      status: getStepStatus('selecting')
    }
  ];

  const getVariantIcon = (state: string) => {
    switch (state) {
      case 'querying':
        return <Loader2 className="animate-spin" size={20} />;
      case 'scored':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-500" />;
      default:
        return <Clock size={20} className="text-gray-400" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-500';
    if (score >= 3.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Sort variants by ID for consistent display
  const sortedVariants = [...variants].sort((a, b) => 
    a.variant.variant_id.localeCompare(b.variant.variant_id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-lg font-semibold mb-6">
            <Brain size={24} />
            Step 2: DSPy Optimization in Progress
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black text-white mb-4">
            Watch AI Optimize Itself
          </h2>
          
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Multiple prompt strategies are competing to find the best approach. 
            Each variant uses different techniques to maximize performance.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = step.status === 'active';
                const isComplete = step.status === 'complete';
                
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-500 ${
                      isActive 
                        ? 'border-blue-400 bg-blue-500/20 shadow-lg shadow-blue-500/25' 
                        : isComplete
                        ? 'border-green-400 bg-green-500/20'
                        : 'border-white/20 bg-white/5'
                    }`}
                  >
                    {/* Step number */}
                    <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isActive 
                        ? 'bg-blue-500 text-white' 
                        : isComplete
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-600 text-gray-300'
                    }`}>
                      {index + 1}
                    </div>

                    {/* Icon */}
                    <div className={`mb-4 ${
                      isActive ? 'text-blue-400' : isComplete ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      <Icon size={32} />
                    </div>

                    {/* Content */}
                    <h3 className={`font-bold text-lg mb-2 ${
                      isActive ? 'text-blue-200' : isComplete ? 'text-green-200' : 'text-gray-300'
                    }`}>
                      {step.title}
                    </h3>
                    
                    <p className={`text-sm ${
                      isActive ? 'text-blue-300' : isComplete ? 'text-green-300' : 'text-gray-400'
                    }`}>
                      {step.description}
                    </p>

                    {/* Active animation */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 border-2 border-blue-400 rounded-2xl"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-semibold">Overall Progress</span>
                <span className="text-blue-200">{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Variant Competition */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h3 className="text-3xl font-bold text-white text-center mb-8">
            Prompt Variants Competition
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {sortedVariants.map((variantState, index) => {
                const { variant, score, state } = variantState;
                const isLeader = variant.variant_id === leader;
                
                return (
                  <motion.div
                    key={variant.variant_id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      scale: isLeader ? 1.05 : 1,
                      boxShadow: isLeader ? '0 25px 50px rgba(59, 130, 246, 0.3)' : '0 10px 25px rgba(0, 0, 0, 0.2)'
                    }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border-2 ${
                      isLeader ? 'border-yellow-400 bg-gradient-to-br from-yellow-500/20 to-orange-500/20' : 'border-white/20'
                    }`}
                  >
                    {/* Leader crown */}
                    <AnimatePresence>
                      {isLeader && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: -10 }}
                          className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg"
                        >
                          <Trophy size={16} />
                          LEADER
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Variant header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          {getVariantIcon(state)}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-white">
                            Variant {variant.variant_id.toUpperCase()}
                          </h4>
                          <p className="text-sm text-blue-200 capitalize">
                            {state === 'querying' ? 'Testing...' : 
                             state === 'scored' ? 'Complete' :
                             state === 'error' ? 'Failed' : 'Waiting...'}
                          </p>
                        </div>
                      </div>
                      
                      {variant.latency_ms && (
                        <div className="text-right">
                          <div className="text-xs text-blue-200">Response Time</div>
                          <div className="text-sm font-mono text-white">
                            {variant.latency_ms < 1000 ? `${variant.latency_ms}ms` : `${(variant.latency_ms / 1000).toFixed(1)}s`}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Strategy */}
                    <div className="mb-4 p-3 bg-white/10 rounded-lg">
                      <div className="text-xs font-semibold text-blue-200 mb-1">STRATEGY</div>
                      <div className="text-sm text-white">{variant.prompt_spec}</div>
                    </div>

                    {/* Output */}
                    <AnimatePresence>
                      {variant.output && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-3 mb-4"
                        >
                          <div>
                            <div className="text-xs font-semibold text-blue-200 mb-1">CLASSIFICATION</div>
                            <div className="inline-block px-3 py-1 bg-blue-500/30 text-blue-100 rounded-full text-sm font-medium">
                              {variant.output.category}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-xs font-semibold text-blue-200 mb-1">SUMMARY</div>
                            <p className="text-sm text-white leading-relaxed">
                              "{variant.output.summary}"
                            </p>
                          </div>
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
                          className="border-t border-white/20 pt-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-blue-200">PERFORMANCE SCORE</span>
                            <span className={`text-2xl font-bold ${getScoreColor(score.total)}`}>
                              {score.total.toFixed(1)}/5.0
                            </span>
                          </div>
                          
                          {/* Score breakdown */}
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            {Object.entries(score.components).map(([key, value]) => {
                              const labels = {
                                label_valid: 'Format',
                                label_match: 'Intent',
                                summary_len_ok: 'Length',
                                no_hedging: 'Confidence',
                                format_ok: 'Structure'
                              };
                              
                              return (
                                <div key={key} className="flex items-center justify-between">
                                  <span className="text-blue-200">
                                    {labels[key as keyof typeof labels]}:
                                  </span>
                                  <span className={`font-bold ${
                                    value === 1 ? 'text-green-400' : 'text-red-400'
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

          {/* Empty state */}
          {sortedVariants.length === 0 && (
            <div className="text-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block p-4 bg-blue-500/20 rounded-full mb-4"
              >
                <Brain size={48} className="text-blue-400" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-2">Generating Variants</h3>
              <p className="text-blue-200">
                DSPy is creating multiple prompt strategies...
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}