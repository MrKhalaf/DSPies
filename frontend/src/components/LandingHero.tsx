/**
 * Modern landing hero section explaining DSPy optimization
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Target, Brain, Sparkles } from 'lucide-react';

interface LandingHeroProps {
  onGetStarted: () => void;
}

export function LandingHero({ onGetStarted }: LandingHeroProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="p-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl"
              >
                <Brain size={48} className="text-white" />
              </motion.div>
              <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                DSPy
              </h1>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl"
              >
                <Sparkles size={48} className="text-white" />
              </motion.div>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Live Prompt Optimization
            </h2>
            
            <p className="text-xl md:text-2xl text-purple-200 max-w-4xl mx-auto leading-relaxed">
              Watch artificial intelligence automatically optimize itself in real-time. 
              See how DSPy finds the perfect prompt strategy without any manual engineering.
            </p>
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid md:grid-cols-3 gap-8 mb-12"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Zap size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Automatic Optimization</h3>
              <p className="text-purple-200">
                No manual prompt engineering. DSPy automatically generates and tests multiple strategies.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Target size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Metric-Driven</h3>
              <p className="text-purple-200">
                Optimizes for specific performance metrics using deterministic evaluation functions.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Brain size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Live Visualization</h3>
              <p className="text-purple-200">
                Watch the optimization process unfold with real-time performance comparisons.
              </p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <button
              onClick={onGetStarted}
              className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xl font-bold px-12 py-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-4 mx-auto"
            >
              <span>Experience DSPy Optimization</span>
              <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </button>
            
            <p className="text-purple-300 mt-4 text-lg">
              See how AI optimizes prompts for customer support classification
            </p>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1 h-3 bg-white/50 rounded-full mt-2"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}