import React from 'react';
import { motion } from 'framer-motion';
import { StoryStepProps } from '../types';

export const Step10_Conclusion: React.FC<StoryStepProps> = () => {
    return (
        <div className="w-full h-full flex flex-col relative">
            {/* Stage: Graduation */}
            <div className="rpg-character-stage flex flex-col items-center justify-center pb-12">
                <motion.div
                    className="text-9xl mb-4 filter drop-shadow-lg"
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    🎓
                </motion.div>
                <div className="text-yellow-400 font-bold text-xl pixel-text-shadow">PROMPT CHEF</div>
            </div>

            {/* Dialogue Box */}
            <div className="rpg-dialogue-box">
                <h3 className="text-yellow-400 font-bold mb-2 text-lg">CONGRATULATIONS!</h3>
                <p className="typing-effect">
                    You now understand the DSPy way! Don't write prompts by hand. <br />
                    Define the <span className="text-green-400">Goal</span>, create <span className="text-blue-400">Metrics</span>, and let the <span className="text-purple-400">Optimizer</span> cook!
                </p>
                <div className="absolute bottom-4 right-4 text-xs text-gray-400 animate-pulse">
                    [PRESS ESC TO EXIT]
                </div>
            </div>
        </div>
    );
};
