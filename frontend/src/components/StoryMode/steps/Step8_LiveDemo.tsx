import React from 'react';
import { Sparkles } from 'lucide-react';
import { StoryStepProps } from '../types';

export const Step8_LiveDemo: React.FC<StoryStepProps> = ({ userInput, setUserInput, onRunDemo, hasStartedDemo }) => {
    return (
        <div className="w-full h-full flex flex-col relative">
            {/* Stage: Interactive Terminal */}
            <div className="rpg-character-stage flex flex-col items-center justify-center pb-4 w-full px-8">
                {!hasStartedDemo ? (
                    <div className="w-full max-w-2xl bg-blue-900/30 border-2 border-blue-400 p-4 rounded">
                        <div className="text-xs text-blue-300 mb-2">QUEST: CUSTOMER ISSUE</div>
                        <textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Type a customer complaint here..."
                            className="w-full h-24 bg-black/50 border border-blue-500 rounded p-2 text-white font-mono mb-4 focus:border-yellow-400 outline-none text-sm"
                        />

                        <div className="flex gap-2 mb-4 overflow-x-auto">
                            {[
                                "I was double-charged",
                                "App crashes on login",
                                "Cancel subscription"
                            ].map((ex, i) => (
                                <button
                                    key={i}
                                    onClick={() => setUserInput(ex)}
                                    className="whitespace-nowrap px-2 py-1 bg-blue-800/50 border border-blue-600 rounded text-[10px] hover:bg-blue-700"
                                >
                                    {ex}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => onRunDemo(userInput)}
                            className="w-full py-2 bg-green-600 hover:bg-green-500 text-white font-bold text-sm rounded border-2 border-white flex items-center justify-center gap-2"
                        >
                            <Sparkles size={16} /> START BATTLE <Sparkles size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="text-6xl mb-4 animate-bounce">⚡</div>
                        <h3 className="text-2xl font-bold text-yellow-400 mb-2">BATTLE IN PROGRESS!</h3>
                        <p className="text-gray-400 text-xs">The wizards are casting their prompts...</p>
                    </div>
                )}
            </div>

            {/* Dialogue Box */}
            <div className="rpg-dialogue-box">
                <h3 className="text-green-400 font-bold mb-2 text-lg">YOUR TURN!</h3>
                <p className="typing-effect">
                    {hasStartedDemo
                        ? "Hold tight! The competition is heating up..."
                        : "Enter a real customer problem above. The wizards will compete to solve it live!"}
                </p>
            </div>
        </div>
    );
};
