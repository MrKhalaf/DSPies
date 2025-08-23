/**
 * Educational component explaining what DSPy is doing during optimization
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Target, Award } from 'lucide-react';

interface DSPyExplainerProps {
  currentStep: 'idle' | 'generating' | 'testing' | 'scoring' | 'selecting' | 'complete';
  variantCount: number;
  completedCount: number;
}

export function DSPyExplainer({ currentStep, variantCount, completedCount }: DSPyExplainerProps) {
  const steps = [
    {
      id: 'generating',
      icon: Brain,
      title: 'Generating Prompt Variants',
      description: 'DSPy creates multiple different prompt strategies to solve the same task',
      detail: 'Each variant uses different instruction styles, examples, and approaches'
    },
    {
      id: 'testing',
      icon: Zap,
      title: 'Testing Each Variant',
      description: 'Running each prompt variant against the LLM to get outputs',
      detail: 'Measuring response time and quality for each approach'
    },
    {
      id: 'scoring',
      icon: Target,
      title: 'Scoring Performance',
      description: 'Evaluating each output using deterministic rules',
      detail: 'Checking format, accuracy, length, and other quality metrics'
    },
    {
      id: 'selecting',
      icon: Award,
      title: 'Selecting Best Variant',
      description: 'Choosing the highest-scoring prompt for production use',
      detail: 'The winner becomes your optimized prompt for this task'
    }
  ];

  const getCurrentStepIndex = () => {
    switch (currentStep) {
      case 'generating': return 0;
      case 'testing': return 1;
      case 'scoring': return 2;
      case 'selecting':
      case 'complete': return 3;
      default: return -1;
    }
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 mb-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🧠 DSPy Prompt Optimization in Action
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Watch as DSPy automatically finds the best prompt strategy for your task. 
          This is how you can optimize any LLM application without manual prompt engineering.
        </p>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Optimization Progress</span>
          <span className="text-sm text-gray-500">
            {currentStep === 'complete' ? 'Complete!' : `Testing ${completedCount}/${variantCount} variants`}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ 
              width: currentStep === 'complete' ? '100%' : 
                     currentStep === 'idle' ? '0%' :
                     `${(completedCount / Math.max(variantCount, 1)) * 100}%`
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Step Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex || currentStep === 'complete';
          const Icon = step.icon;

          return (
            <motion.div
              key={step.id}
              className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                isActive 
                  ? 'border-blue-500 bg-blue-50 shadow-lg' 
                  : isCompleted
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Step Number */}
              <div className={`absolute -top-3 -left-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                isActive 
                  ? 'bg-blue-500 text-white' 
                  : isCompleted
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {index + 1}
              </div>

              {/* Icon */}
              <div className={`mb-3 ${
                isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
              }`}>
                <Icon size={24} />
              </div>

              {/* Content */}
              <h3 className={`font-semibold mb-2 ${
                isActive ? 'text-blue-900' : isCompleted ? 'text-green-900' : 'text-gray-700'
              }`}>
                {step.title}
              </h3>
              
              <p className={`text-sm mb-2 ${
                isActive ? 'text-blue-700' : isCompleted ? 'text-green-700' : 'text-gray-600'
              }`}>
                {step.description}
              </p>
              
              <p className={`text-xs ${
                isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
              }`}>
                {step.detail}
              </p>

              {/* Active Animation */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 border-2 border-blue-400 rounded-lg"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Why This Matters */}
      <motion.div
        className="mt-6 p-4 bg-white rounded-lg border border-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h4 className="font-semibold text-gray-900 mb-2">💡 Why DSPy Optimization Matters</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-600">Automatic:</span>
            <span className="text-gray-600 ml-1">No manual prompt engineering needed</span>
          </div>
          <div>
            <span className="font-medium text-green-600">Data-Driven:</span>
            <span className="text-gray-600 ml-1">Finds the best approach through testing</span>
          </div>
          <div>
            <span className="font-medium text-purple-600">Scalable:</span>
            <span className="text-gray-600 ml-1">Works for any task or domain</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}