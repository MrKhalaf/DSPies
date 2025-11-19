import React from 'react';
import { motion } from 'framer-motion';
import { StoryStepProps } from '../types';

export const Step9_Results: React.FC<StoryStepProps> = ({ variants, winner, isRunning }) => {
    return (
        <div className="w-full h-full flex flex-col relative">
            {/* Stage: Podium */}
            <div className="rpg-character-stage flex items-end justify-center gap-4 pb-12 w-full px-4">
                {isRunning ? (
                    <div className="text-6xl animate-spin">⏳</div>
                ) : (
                    variants.map((v, i) => {
                        const isWinner = v.id === winner;
                        const height = isWinner ? 'h-32' : 'h-20';
                        const color = isWinner ? 'bg-yellow-600' : 'bg-gray-700';
                        const border = isWinner ? 'border-yellow-400' : 'border-gray-500';

                        return (
                            <motion.div
                                key={v.id}
                                className={`flex flex-col items-center justify-end w-1/4`}
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: i * 0.2 }}
                            >
                                <div className="text-4xl mb-2">{isWinner ? '👑' : '🧙'}</div>
                                <div className={`w-full ${height} ${color} border-4 ${border} rounded-t-lg flex items-end justify-center pb-2`}>
                                    <span className="text-xs font-bold">{v.score?.toFixed(1)}</span>
                                </div>
                                <div className="text-[10px] mt-1 text-center truncate w-full">{v.id}</div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Dialogue Box */}
            <div className="rpg-dialogue-box">
                <h3 className="text-yellow-400 font-bold mb-2 text-lg">THE RESULTS 🏆</h3>
                <p className="typing-effect">
                    {winner
                        ? `And the winner is ${winner.toUpperCase()}! It had the highest score based on our metrics.`
                        : "Calculating the final scores..."}
                </p>
            </div>
        </div>
    );
};
