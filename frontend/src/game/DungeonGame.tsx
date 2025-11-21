import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './DungeonGame.css';
import { Scene, SCENES, TileType, NPC, Exit } from './SceneManager';
import { DialogueSystem } from './DialogueSystem';

// Game constants
const TILE_SIZE = 48;
const GRID_WIDTH = 15;
const GRID_HEIGHT = 11;

// Direction enum
enum Direction {
    DOWN = 0,
    UP = 1,
    LEFT = 2,
    RIGHT = 3,
}

// Player position
interface Position {
    x: number;
    y: number;
}

export const DungeonGame: React.FC = () => {
    const gameRef = useRef<HTMLDivElement>(null);

    // Game State
    const [currentSceneId, setCurrentSceneId] = useState<Scene>(Scene.ENTRANCE);
    const [playerPos, setPlayerPos] = useState<Position>({ x: 7, y: 5 }); // Start pos
    const [playerDirection, setPlayerDirection] = useState<Direction>(Direction.DOWN);
    const [isMoving, setIsMoving] = useState(false);

    // Global State
    const [inventory, setInventory] = useState<string[]>([]); // Collected wisdom keys
    const [flags, setFlags] = useState<Record<string, boolean>>({});

    // Dialogue State
    const [activeDialogue, setActiveDialogue] = useState<{ lines: string[], name?: string, portrait?: string } | null>(null);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizationResults, setOptimizationResults] = useState<any>(null);

    // Get current scene data
    const currentScene = SCENES[currentSceneId];

    // Auto-focus the game on mount
    useEffect(() => {
        gameRef.current?.focus();
    }, []);

    // Check if position is walkable
    const isWalkable = useCallback((x: number, y: number): boolean => {
        if (x < 0 || x >= currentScene.width || y < 0 || y >= currentScene.height) return false;

        const tile = currentScene.map[y][x];
        if (tile === TileType.WALL) return false;

        // Check NPC collision
        const npcAtPos = currentScene.npcs.find(npc => npc.x === x && npc.y === y);
        if (npcAtPos) return false;

        return true;
    }, [currentScene]);

    // Handle Scene Transition
    const switchScene = useCallback((exit: Exit) => {
        setIsMoving(true);
        // Fade out effect could go here
        setTimeout(() => {
            setCurrentSceneId(exit.targetScene);
            setPlayerPos({ x: exit.targetX, y: exit.targetY });
            setIsMoving(false);
        }, 300);
    }, []);

    // Handle movement
    const movePlayer = useCallback((dx: number, dy: number, direction: Direction) => {
        if (activeDialogue || isMoving || isOptimizing) return;

        const newX = playerPos.x + dx;
        const newY = playerPos.y + dy;

        setPlayerDirection(direction);

        // Check for exits first
        const exit = currentScene.exits.find(e => e.x === newX && e.y === newY);
        if (exit) {
            switchScene(exit);
            return;
        }

        if (isWalkable(newX, newY)) {
            setIsMoving(true);
            setPlayerPos({ x: newX, y: newY });
            setTimeout(() => setIsMoving(false), 200);
        }
    }, [playerPos, isWalkable, activeDialogue, isMoving, isOptimizing, currentScene, switchScene]);

    // Handle interaction
    const handleInteraction = useCallback(() => {
        if (activeDialogue || isOptimizing) return;

        // Check for NPC in front of player
        const checkX = playerPos.x + (playerDirection === Direction.LEFT ? -1 : playerDirection === Direction.RIGHT ? 1 : 0);
        const checkY = playerPos.y + (playerDirection === Direction.UP ? -1 : playerDirection === Direction.DOWN ? 1 : 0);

        const npc = currentScene.npcs.find(n => n.x === checkX && n.y === checkY);

        if (npc) {
            // Special logic for Computer/Core
            if (npc.type === 'computer') {
                if (inventory.length < 3) {
                    setActiveDialogue({
                        lines: [
                            'DSPy CORE SYSTEM',
                            'ERROR: Missing Wisdom Keys.',
                            `Current Keys: ${inventory.length}/3`,
                            'Please consult all three Masters.'
                        ],
                        name: npc.name,
                        portrait: npc.portrait
                    });
                } else {
                    setActiveDialogue({
                        lines: [
                            'DSPy CORE SYSTEM',
                            'All Wisdom Keys detected.',
                            'Initiating Final Optimization Sequence...',
                        ],
                        name: npc.name,
                        portrait: npc.portrait
                    });
                    // Trigger optimization after dialogue? 
                    // We'll handle this in onDialogueComplete
                }
            } else {
                // Normal NPC
                // Check if we already have this wisdom
                const hasWisdom = npc.wisdom && inventory.includes(npc.wisdom);

                if (hasWisdom) {
                    setActiveDialogue({
                        lines: ['You have already mastered this technique.'],
                        name: npc.name,
                        portrait: npc.portrait
                    });
                } else {
                    setActiveDialogue({
                        lines: npc.dialogue,
                        name: npc.name,
                        portrait: npc.portrait
                    });
                }
            }
        }
    }, [playerPos, playerDirection, activeDialogue, isOptimizing, currentScene, inventory]);

    // Handle Dialogue Completion
    const handleDialogueComplete = () => {
        // Check if we just talked to an Elder and need to collect wisdom
        if (activeDialogue && activeDialogue.name) {
            // Find the NPC we just talked to
            // This is a bit hacky, ideally we store currentNPC in state
            const npc = currentScene.npcs.find(n => n.name === activeDialogue.name);
            if (npc && npc.wisdom && !inventory.includes(npc.wisdom)) {
                setInventory(prev => [...prev, npc.wisdom!]);
                // Maybe show a notification?
            }

            // If we just talked to the Core and have all keys
            if (npc && npc.type === 'computer' && inventory.length >= 3) {
                runOptimization();
            }
        }
        setActiveDialogue(null);
    };

    // Run DSPy optimization
    const runOptimization = async () => {
        setIsOptimizing(true);

        // Simulate calling DSPy backend
        try {
            const response = await fetch('http://localhost:8000/api/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompts: inventory,
                    task: 'final_trial'
                })
            });

            if (response.ok) {
                const results = await response.json();
                setOptimizationResults(results);
                setActiveDialogue({
                    lines: [
                        'OPTIMIZATION COMPLETE!',
                        'The Ensemble has converged.',
                        `Final Score: ${results.score || '99.9'}%`,
                        'You are now a Grand Optimizer!'
                    ],
                    name: 'SYSTEM',
                    portrait: 'epoch'
                });
            } else {
                throw new Error('Optimization failed');
            }
        } catch (error) {
            // Fallback for demo
            setTimeout(() => {
                setActiveDialogue({
                    lines: [
                        'OPTIMIZATION COMPLETE (SIMULATED)',
                        'Bootstrap + MIPRO + Bayesian = SUCCESS',
                        'Final Score: 99.9%',
                        'You are now a Grand Optimizer!'
                    ],
                    name: 'SYSTEM',
                    portrait: 'epoch'
                });
                setIsOptimizing(false);
            }, 2000);
        }
    };

    // Keyboard controls
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (activeDialogue) return; // Let DialogueSystem handle input

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    movePlayer(0, -1, Direction.UP);
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    movePlayer(0, 1, Direction.DOWN);
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    movePlayer(-1, 0, Direction.LEFT);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    movePlayer(1, 0, Direction.RIGHT);
                    break;
                case ' ':
                case 'Enter':
                    e.preventDefault();
                    handleInteraction();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [movePlayer, handleInteraction, activeDialogue]);

    return (
        <div className="dungeon-game" ref={gameRef} tabIndex={0}>
            {/* Game viewport */}
            <div className="game-viewport">
                <div
                    className="dungeon-grid"
                    style={{
                        width: currentScene.width * TILE_SIZE,
                        height: currentScene.height * TILE_SIZE,
                    }}
                >
                    {/* Render tiles */}
                    {currentScene.map.map((row, y) =>
                        row.map((tile, x) => (
                            <div
                                key={`${x}-${y}`}
                                className={`tile type-${tile}`}
                                style={{
                                    left: x * TILE_SIZE,
                                    top: y * TILE_SIZE,
                                    width: TILE_SIZE,
                                    height: TILE_SIZE,
                                }}
                            />
                        ))
                    )}

                    {/* Render NPCs */}
                    {currentScene.npcs.map(npc => (
                        <div
                            key={npc.id}
                            className={`npc ${npc.type}`}
                            style={{
                                left: npc.x * TILE_SIZE,
                                top: npc.y * TILE_SIZE,
                                width: TILE_SIZE,
                                height: TILE_SIZE,
                            }}
                        >
                            {/* Placeholder sprite logic - replace with actual sprite sheet usage */}
                            <div className={`npc-sprite sprite-${npc.sprite}`}>
                                {npc.type === 'elder' ? '🧙' : npc.type === 'computer' ? '💻' : '🤖'}
                            </div>
                            {npc.wisdom && inventory.includes(npc.wisdom) && (
                                <div className="wisdom-indicator">✓</div>
                            )}
                        </div>
                    ))}

                    {/* Render player */}
                    <motion.div
                        className={`player direction-${playerDirection}`}
                        animate={{
                            left: playerPos.x * TILE_SIZE,
                            top: playerPos.y * TILE_SIZE,
                        }}
                        transition={{ duration: 0.2 }}
                        style={{
                            width: TILE_SIZE,
                            height: TILE_SIZE,
                        }}
                    >
                        <div className="player-sprite">🧑</div>
                    </motion.div>
                </div>

                {/* Scene Name Overlay */}
                <div className="scene-name">
                    {currentScene.name}
                </div>
            </div>

            {/* Status bar */}
            <div className="status-bar">
                <div className="status-item">
                    <span className="status-label">Wisdom Keys:</span>
                    <span className="status-value">{inventory.length}/3</span>
                </div>
                <div className="status-item">
                    <span className="status-label">Current Protocol:</span>
                    <span className="status-value">{currentScene.name}</span>
                </div>
            </div>

            {/* Dialogue System */}
            {activeDialogue && (
                <DialogueSystem
                    dialogue={activeDialogue.lines}
                    speakerName={activeDialogue.name}
                    speakerPortrait={activeDialogue.portrait}
                    onComplete={handleDialogueComplete}
                />
            )}

            {/* Controls hint */}
            <div className="controls-hint">
                <div>WASD: Move</div>
                <div>SPACE: Interact</div>
            </div>

            {/* Loading overlay for optimization */}
            <AnimatePresence>
                {isOptimizing && (
                    <motion.div
                        className="optimization-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="optimization-spinner"></div>
                        <div className="optimization-text">Running Ensemble Optimization...</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

