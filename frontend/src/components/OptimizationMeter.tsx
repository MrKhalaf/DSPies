/**
 * Progress meter component showing optimization progress.
 * Displays animated progress bar and completion status.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface OptimizationMeterProps {
  progress: number; // 0-100
  status: 'idle' | 'compiling' | 'running' | 'complete' | 'error';
  variantCount?: number;
  completedCount?: number;
}

export function OptimizationMeter({ 
  progress, 
  status, 
  variantCount = 3, 
  completedCount = 0 
}: OptimizationMeterProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'idle':
        return null;
      case 'compiling':
        return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'running':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'idle':
        return 'Ready to optimize';
      case 'compiling':
        return 'Compiling options...';
      case 'running':
        return `Testing variants (${completedCount}/${variantCount})`;
      case 'complete':
        return 'Optimization complete!';
      case 'error':
        return 'Optimization failed';
      default:
        return '';
    }
  };

  const getProgressColor = () => {
    switch (status) {
      case 'complete':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'running':
        return 'bg-blue-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        {getStatusIcon()}
        <div>
          <h3 className="font-medium text-gray-900">Optimization Progress</h3>
          <p className="text-sm text-gray-600">{getStatusText()}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${getProgressColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ 
              duration: 0.5, 
              ease: "easeOut",
              type: status === 'running' ? 'spring' : 'tween'
            }}
          />
        </div>
        
        {/* Progress Text */}
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>{Math.round(progress)}% complete</span>
          {status === 'running' && (
            <span>{completedCount}/{variantCount} variants</span>
          )}
        </div>
      </div>

      {/* Completion Animation */}
      {status === 'complete' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg text-center"
        >
          <div className="text-green-700 font-medium text-sm">
            🎉 Best variant selected!
          </div>
        </motion.div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-center"
        >
          <div className="text-red-700 font-medium text-sm">
            Optimization encountered an error
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}