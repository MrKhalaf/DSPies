import React from 'react';
import { motion } from 'framer-motion';
import { StoryStepProps } from '../types';

export const Step1_Intro: React.FC<StoryStepProps> = () => {
    return (
        <div className="w-full h-full flex flex-col relative">
            {/* Character Stage (Top/Middle) */}
            <div className="rpg-character-stage">
                <motion.div
                    className="text-9xl filter drop-shadow-lg"
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    👨‍🍳
                </motion.div>
            </div>

            {/* Dialogue Box (Bottom) */}
            <div className="rpg-dialogue-box">
                <h3 className="text-yellow-400 font-bold mb-2 text-lg">CHEF CLAUDE</h3>
                <p className="typing-effect">
                    Welcome to the kitchen! I'm Chef Claude. Instead of food, we cook up <span className="text-cyan-400">Intelligence</span> here.
                </p>
                <div className="absolute bottom-4 right-4 text-xs text-gray-400 animate-pulse">
                    [CLICK NEXT]
                </div>
            </div>
        </div>
    );
};

