import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './DungeonGame.css';

interface DialogueSystemProps {
    dialogue: string[];
    speakerName?: string;
    speakerPortrait?: string; // 'bootstrap', 'mipro', 'bayes', 'epoch', etc.
    onComplete: () => void;
}

export const DialogueSystem: React.FC<DialogueSystemProps> = ({
    dialogue,
    speakerName,
    speakerPortrait,
    onComplete
}) => {
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    const currentLine = dialogue[currentLineIndex];

    // Typing effect
    useEffect(() => {
        setDisplayedText('');
        setIsTyping(true);
        let charIndex = 0;

        const intervalId = setInterval(() => {
            if (charIndex < currentLine.length) {
                setDisplayedText(prev => prev + currentLine[charIndex]);
                charIndex++;
            } else {
                setIsTyping(false);
                clearInterval(intervalId);
            }
        }, 30); // Typing speed

        return () => clearInterval(intervalId);
    }, [currentLine]);

    // Handle advance
    const handleAdvance = useCallback(() => {
        if (isTyping) {
            // Instant finish
            setDisplayedText(currentLine);
            setIsTyping(false);
        } else {
            // Next line or finish
            if (currentLineIndex < dialogue.length - 1) {
                setCurrentLineIndex(prev => prev + 1);
            } else {
                onComplete();
            }
        }
    }, [isTyping, currentLine, currentLineIndex, dialogue.length, onComplete]);

    // Keyboard listener for space/enter
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                handleAdvance();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleAdvance]);

    // Get portrait style based on prop
    const getPortraitStyle = () => {
        if (!speakerPortrait) return {};

        // Map portrait names to sprite sheet coordinates
        // Assuming 64x64 portraits in a row
        const portraitMap: Record<string, number> = {
            'bootstrap': 0,
            'mipro': 1,
            'bayes': 2,
            'epoch': 3
        };

        const index = portraitMap[speakerPortrait] || 0;

        // Use require/import for assets in real app, but for now using relative path
        // Note: In a real Vite app, we'd import these. For now, assuming public or src assets.
        // Since we copied to src/game/assets, we might need to import them at top level or move to public.
        // For this implementation, let's assume we'll fix the asset loading path in CSS or import.
        return {
            backgroundImage: `url(/src/game/assets/portraits.png)`,
            backgroundPosition: `-${index * 64}px 0`,
            width: '64px',
            height: '64px',
            imageRendering: 'pixelated' as const
        };
    };

    return (
        <AnimatePresence>
            <motion.div
                className="dialogue-box"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
            >
                <div className="dialogue-container">
                    {speakerPortrait && (
                        <div className="dialogue-portrait" style={getPortraitStyle()} />
                    )}
                    <div className="dialogue-content-wrapper">
                        {speakerName && (
                            <div className="dialogue-speaker">{speakerName}</div>
                        )}
                        <div className="dialogue-text">
                            {displayedText}
                            {!isTyping && (
                                <span className="dialogue-cursor">▼</span>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
