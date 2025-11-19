import React from 'react';
import { motion } from 'framer-motion';
import { StoryStepProps } from '../types';

export const Step5_DefineGood: React.FC<StoryStepProps> = () => {
    return (
        <div className="w-full h-full flex flex-col relative">
            {/* Stage: The Judge */}
            <div className="rpg-character-stage flex flex-col items-center justify-center pb-12">
                <motion.div
                    className="text-9xl mb-4 filter drop-shadow-lg"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                >
                    ⚖️
                </motion.div>

                <div className="flex gap-4">
                    <div className="bg-green-900/50 border border-green-400 px-3 py-1 rounded text-xs">ACCURACY</div>
                    <div className="bg-blue-900/50 border border-blue-400 px-3 py-1 rounded text-xs">TONE</div>
                    <div className="bg-red-900/50 border border-red-400 px-3 py-1 rounded text-xs">LENGTH</div>
                </div>
            </div>

            {/* Dialogue Box */}
            <div className="rpg-dialogue-box">
                <h3 className="text-yellow-400 font-bold mb-2 text-lg">STEP 1: DEFINE "GOOD"</h3>
                <p className="typing-effect">
                    Before we cook, we need to know what the judges want. <br />
                    In DSPy, we define <span className="text-green-400">Metrics</span>. Does the answer solve the user's problem? Is it polite?
                </p>
            </div>
        </div>
    );
};
