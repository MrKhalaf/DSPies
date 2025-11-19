import React from 'react';
import { motion } from 'framer-motion';

export const ProgressBar: React.FC<{ current: number; total: number }> = ({ current, total }) => {
    const progress = (current / total) * 100;

    return (
        <div className="w-full">
            <div className="flex justify-between text-xs mb-1 font-bold text-blue-200">
                <span>STEP {current} OF {total}</span>
                <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-4 bg-gray-900 border-2 border-white/20 rounded-full relative overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                />
                {/* Pixel grid overlay */}
                <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')] opacity-20"></div>
            </div>
        </div>
    );
};
