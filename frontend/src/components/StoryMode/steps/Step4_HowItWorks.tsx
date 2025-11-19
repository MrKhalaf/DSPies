import React from 'react';
import { motion } from 'framer-motion';
import { StoryStepProps } from '../types';

export const Step4_HowItWorks: React.FC<StoryStepProps> = () => {
    return (
        <div className="w-full h-full flex flex-col relative">
            {/* Stage: The Process */}
            <div className="rpg-character-stage flex flex-col items-center justify-center pb-12">
                <div className="flex items-center gap-4 mb-8">
                    <div className="text-4xl">🧙‍♂️</div>
                    <div className="text-2xl text-gray-500">➡</div>
                    <div className="text-4xl">📝</div>
                    <div className="text-2xl text-gray-500">➡</div>
                    <div className="text-4xl">⚖️</div>
                </div>

                <motion.div
                    className="text-6xl filter drop-shadow-lg"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    🏆
                </motion.div>
            </div>

            {/* Dialogue Box */}
            <div className="rpg-dialogue-box">
                <h3 className="text-green-400 font-bold mb-2 text-lg">THE COOKING COMPETITION</h3>
                <p className="typing-effect">
                    How do we pick the best chef? We hold a competition! <br />
                    1. They cook (Generate) <br />
                    2. We taste (Score) <br />
                    3. The winner becomes the new recipe!
                </p>
            </div>
        </div>
    );
};
