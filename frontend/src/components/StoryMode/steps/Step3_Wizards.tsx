import React from 'react';
import { motion } from 'framer-motion';
import { StoryStepProps } from '../types';

export const Step3_Wizards: React.FC<StoryStepProps> = () => {
    return (
        <div className="w-full h-full flex flex-col relative">
            {/* Stage: The 3 Wizards */}
            <div className="rpg-character-stage flex gap-8 items-end pb-12">
                {/* Wizard 1 */}
                <motion.div
                    className="flex flex-col items-center"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                >
                    <div className="text-6xl mb-2">🧙‍♂️</div>
                    <div className="text-[10px] bg-blue-900 px-2 py-1 rounded border border-blue-400">FORMAL</div>
                </motion.div>

                {/* Wizard 2 */}
                <motion.div
                    className="flex flex-col items-center"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                    <div className="text-6xl mb-2">🧙‍♀️</div>
                    <div className="text-[10px] bg-purple-900 px-2 py-1 rounded border border-purple-400">FRIENDLY</div>
                </motion.div>

                {/* Wizard 3 */}
                <motion.div
                    className="flex flex-col items-center"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                    <div className="text-6xl mb-2">🧙</div>
                    <div className="text-[10px] bg-orange-900 px-2 py-1 rounded border border-orange-400">ANALYST</div>
                </motion.div>
            </div>

            {/* Dialogue Box */}
            <div className="rpg-dialogue-box">
                <h3 className="text-purple-400 font-bold mb-2 text-lg">THE KITCHEN STAFF</h3>
                <p className="typing-effect">
                    Meet your team! These are different <span className="text-yellow-400">Prompt Variants</span>.
                    Each one tries to solve the problem in their own unique way.
                </p>
            </div>
        </div>
    );
};
