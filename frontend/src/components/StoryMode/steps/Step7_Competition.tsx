import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { StoryStepProps } from '../types';

export const Step7_Competition: React.FC<StoryStepProps> = () => {
    const [battleLog, setBattleLog] = useState<string[]>([]);

    useEffect(() => {
        const sequence = [
            "Wizard 1 casts 'Formal Prompt'...",
            "Wizard 2 casts 'Friendly Prompt'...",
            "Wizard 3 casts 'Analyst Prompt'...",
            "The Judge is calculating scores..."
        ];

        let i = 0;
        const interval = setInterval(() => {
            if (i < sequence.length) {
                setBattleLog(prev => [...prev, sequence[i]]);
                i++;
            } else {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full flex flex-col relative">
            {/* Stage: Battle */}
            <div className="rpg-character-stage flex justify-between px-12 items-center pb-12">
                <div className="flex flex-col gap-4">
                    <div className="text-4xl">🧙‍♂️</div>
                    <div className="text-4xl">🧙‍♀️</div>
                    <div className="text-4xl">🧙</div>
                </div>

                <div className="text-6xl animate-pulse">⚡</div>

                <div className="text-8xl">⚖️</div>
            </div>

            {/* Dialogue Box (Battle Log) */}
            <div className="rpg-dialogue-box font-mono text-xs">
                <h3 className="text-purple-400 font-bold mb-2 text-lg">STEP 3: THE COMPETITION</h3>
                <div className="space-y-1">
                    {battleLog.map((log, i) => (
                        <div key={i} className="text-green-400">&gt; {log}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};
