import React from 'react';
import { motion } from 'framer-motion';
import { StoryStepProps } from '../types';

export const Step2_Problem: React.FC<StoryStepProps> = () => {
    return (
        <div className="w-full h-full flex flex-col relative">
            {/* Stage: Comparison */}
            <div className="rpg-character-stage flex gap-12 items-end pb-12">
                {/* Old Way */}
                <div className="flex flex-col items-center opacity-50 grayscale">
                    <div className="text-6xl mb-2">📜</div>
                    <div className="text-xs font-bold text-gray-400">MANUAL PROMPTS</div>
                </div>

                <div className="text-4xl text-yellow-400 font-bold">VS</div>

                {/* DSPy Way */}
                <div className="flex flex-col items-center">
                    <motion.div
                        className="text-8xl mb-2 filter drop-shadow-lg"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        🤖
                    </motion.div>
                    <div className="text-xs font-bold text-cyan-400">DSPy OPTIMIZER</div>
                </div>
            </div>

            {/* Dialogue Box */}
            <div className="rpg-dialogue-box">
                <h3 className="text-red-400 font-bold mb-2 text-lg">THE PROBLEM</h3>
                <p className="typing-effect">
                    Writing prompts by hand is like cooking with a random recipe every time. <br />
                    <span className="text-cyan-400">DSPy</span> is like an automated chef that tastes and improves the recipe for you!
                </p>
            </div>
        </div>
    );
};
