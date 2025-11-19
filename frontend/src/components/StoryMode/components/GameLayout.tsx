import React from 'react';
import { motion } from 'framer-motion';
import './GameLayout.css';

interface GameLayoutProps {
    children: React.ReactNode;
    title?: string;
    level?: number;
}

export const GameLayout: React.FC<GameLayoutProps> = ({ children, title, level = 1 }) => {
    return (
        <div className="game-layout-container">
            {/* CRT Scanline Effect */}
            <div className="scanlines"></div>

            {/* Main Game Frame */}
            <div className="game-frame">
                {/* Header / HUD */}
                <div className="game-hud">
                    <div className="hud-title">{title || "THE PROMPT CHEF"}</div>
                    <div className="hud-status">LVL {level}</div>
                </div>

                {/* The "Screen" Content */}
                <div className="game-screen">
                    {children}
                </div>
            </div>
        </div>
    );
};
