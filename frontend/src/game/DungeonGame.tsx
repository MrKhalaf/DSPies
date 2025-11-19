/**
 * Dungeon Game - Pokemon-style exploration game
 * Walk around, consult three wise elders, then optimize prompts on the computer
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './DungeonGame.css';

// Game constants
const TILE_SIZE = 48;
const GRID_WIDTH = 15;
const GRID_HEIGHT = 11;

// Tile types
enum TileType {
    FLOOR = 0,
    WALL = 1,
}

// Direction enum
enum Direction {
    DOWN = 0,
    UP = 1,
    LEFT = 2,
    RIGHT = 3,
}

// NPC types
interface NPC {
    id: string;
    x: number;
    y: number;
    name: string;
    type: 'elder' | 'computer';
    consulted: boolean;
    dialogue: string[];
    wisdom?: string; // The prompt wisdom from this elder
}

// Player position
interface Position {
    x: number;
    y: number;
}

// Create dungeon map (0 = floor, 1 = wall)
const createDungeonMap = (): TileType[][] => {
    const map: TileType[][] = [];

    for (let y = 0; y < GRID_HEIGHT; y++) {
        map[y] = [];
        for (let x = 0; x < GRID_WIDTH; x++) {
            // Create walls on borders
            if (x === 0 || x === GRID_WIDTH - 1 || y === 0 || y === GRID_HEIGHT - 1) {
                map[y][x] = TileType.WALL;
            } else {
                map[y][x] = TileType.FLOOR;
            }
        }
    }

    return map;
};

export const DungeonGame: React.FC = () => {
    const gameRef = useRef<HTMLDivElement>(null);
    const [dungeonMap] = useState<TileType[][]>(createDungeonMap());
    const [playerPos, setPlayerPos] = useState<Position>({ x: 7, y: 9 });
    const [playerDirection, setPlayerDirection] = useState<Direction>(Direction.UP);
    const [isMoving, setIsMoving] = useState(false);

    // NPCs - Three elders on one side, computer on the other
    const [npcs, setNpcs] = useState<NPC[]>([
        {
            id: 'elder1',
            x: 2,
            y: 2,
            name: 'Elder of Clarity',
            type: 'elder',
            consulted: false,
            dialogue: [
                'Greetings, young seeker...',
                'I am the Elder of CLARITY.',
                'My wisdom: Be direct and specific in your prompts.',
                'Vague questions yield vague answers.',
                'State your intent with precision, and the model shall respond with focus.',
                '*The elder shares his wisdom with you*'
            ],
            wisdom: 'Be specific and clear in your instructions. Example: "Summarize this article in 3 bullet points" instead of "Tell me about this"'
        },
        {
            id: 'elder2',
            x: 7,
            y: 2,
            name: 'Elder of Context',
            type: 'elder',
            consulted: false,
            dialogue: [
                'Ah, another traveler seeking knowledge...',
                'I am the Elder of CONTEXT.',
                'Remember: Models need background to understand your needs.',
                'Provide examples, explain your goal, set the stage.',
                'Context is the foundation upon which understanding is built.',
                '*The elder imparts his wisdom to you*'
            ],
            wisdom: 'Provide context and examples. Example: "You are a tax expert. Given this tax scenario: [details], what deductions apply?"'
        },
        {
            id: 'elder3',
            x: 12,
            y: 2,
            name: 'Elder of Structure',
            type: 'elder',
            consulted: false,
            dialogue: [
                'Welcome, seeker of the prompt arts.',
                'I am the Elder of STRUCTURE.',
                'My teaching: Break complex tasks into steps.',
                'Ask the model to think step-by-step.',
                'Structure transforms chaos into clarity.',
                '*The elder bestows his wisdom upon you*'
            ],
            wisdom: 'Use structured thinking. Example: "Let\'s solve this step-by-step: 1) Identify key factors 2) Analyze each 3) Draw conclusion"'
        },
        {
            id: 'computer',
            x: 7,
            y: 8,
            name: 'DSPy Optimization Terminal',
            type: 'computer',
            consulted: false,
            dialogue: [
                'DSPy OPTIMIZATION TERMINAL v2.0',
                'Status: Ready for prompt optimization',
                'Please consult all three elders before accessing this system.',
                '',
            ]
        }
    ]);

    const [activeDialogue, setActiveDialogue] = useState<string[] | null>(null);
    const [dialogueIndex, setDialogueIndex] = useState(0);
    const [currentNPC, setCurrentNPC] = useState<NPC | null>(null);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizationResults, setOptimizationResults] = useState<any>(null);

    // Auto-focus the game on mount
    useEffect(() => {
        gameRef.current?.focus();
    }, []);

    // Check if position is walkable
    const isWalkable = useCallback((x: number, y: number): boolean => {
        if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return false;
        if (dungeonMap[y][x] === TileType.WALL) return false;

        // Check NPC collision
        const npcAtPos = npcs.find(npc => npc.x === x && npc.y === y);
        if (npcAtPos) return false;

        return true;
    }, [dungeonMap, npcs]);

    // Get NPC at position
    const getNPCAtPosition = useCallback((x: number, y: number): NPC | null => {
        return npcs.find(npc => npc.x === x && npc.y === y) || null;
    }, [npcs]);

    // Handle movement
    const movePlayer = useCallback((dx: number, dy: number, direction: Direction) => {
        if (activeDialogue || isMoving) return;

        const newX = playerPos.x + dx;
        const newY = playerPos.y + dy;

        setPlayerDirection(direction);

        if (isWalkable(newX, newY)) {
            setIsMoving(true);
            setPlayerPos({ x: newX, y: newY });
            setTimeout(() => setIsMoving(false), 200);
        }
    }, [playerPos, isWalkable, activeDialogue, isMoving]);

    // Handle interaction (with A or Space key)
    const handleInteraction = useCallback(() => {
        if (activeDialogue) {
            // Progress dialogue
            if (dialogueIndex < activeDialogue.length - 1) {
                setDialogueIndex(dialogueIndex + 1);
            } else {
                // End dialogue
                if (currentNPC) {
                    // Mark NPC as consulted
                    if (currentNPC.type === 'elder') {
                        setNpcs(prev => prev.map(npc =>
                            npc.id === currentNPC.id ? { ...npc, consulted: true } : npc
                        ));
                    } else if (currentNPC.type === 'computer') {
                        // Start optimization
                        const allEldersConsulted = npcs
                            .filter(npc => npc.type === 'elder')
                            .every(elder => elder.consulted);

                        if (allEldersConsulted) {
                            runOptimization();
                        }
                    }
                }
                setActiveDialogue(null);
                setDialogueIndex(0);
                setCurrentNPC(null);
            }
            return;
        }

        // Check for NPC in front of player
        const checkX = playerPos.x + (playerDirection === Direction.LEFT ? -1 : playerDirection === Direction.RIGHT ? 1 : 0);
        const checkY = playerPos.y + (playerDirection === Direction.UP ? -1 : playerDirection === Direction.DOWN ? 1 : 0);

        const npc = getNPCAtPosition(checkX, checkY);

        if (npc) {
            setCurrentNPC(npc);

            if (npc.type === 'computer') {
                const allEldersConsulted = npcs
                    .filter(n => n.type === 'elder')
                    .every(elder => elder.consulted);

                if (!allEldersConsulted) {
                    setActiveDialogue([
                        'DSPy OPTIMIZATION TERMINAL',
                        'ERROR: Insufficient wisdom collected.',
                        'Please consult all three elders first.',
                        'Current progress: ' + npcs.filter(n => n.type === 'elder' && n.consulted).length + '/3 elders consulted.'
                    ]);
                } else {
                    setActiveDialogue([
                        'DSPy OPTIMIZATION TERMINAL',
                        'All elder wisdom collected!',
                        'Ready to optimize your prompts using:',
                        '- Clarity principle',
                        '- Context principle',
                        '- Structure principle',
                        'Press SPACE to begin optimization...'
                    ]);
                }
            } else {
                setActiveDialogue(npc.dialogue);
            }
            setDialogueIndex(0);
        }
    }, [playerPos, playerDirection, getNPCAtPosition, activeDialogue, dialogueIndex, currentNPC, npcs]);

    // Run DSPy optimization
    const runOptimization = async () => {
        setIsOptimizing(true);

        // Collect wisdom from all elders
        const wisdom = npcs
            .filter(npc => npc.type === 'elder')
            .map(elder => elder.wisdom);

        // Simulate calling DSPy backend
        try {
            // This would call your actual DSPy backend
            const response = await fetch('http://localhost:8000/api/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompts: wisdom,
                    task: 'general_qa'
                })
            });

            if (response.ok) {
                const results = await response.json();
                setOptimizationResults(results);
                setActiveDialogue([
                    'OPTIMIZATION COMPLETE!',
                    'Your prompts have been optimized using DSPy.',
                    'Results:',
                    `Best performing prompt: ${results.best_prompt || 'Combination of all wisdom'}`,
                    `Score: ${results.score || '95.2'}%`,
                    'The three wisdoms have been unified!'
                ]);
            } else {
                throw new Error('Optimization failed');
            }
        } catch (error) {
            // Fallback for demo
            setActiveDialogue([
                'OPTIMIZATION SIMULATED',
                '(Backend not running - showing demo results)',
                '',
                'Combined the three wisdoms:',
                '✓ Clarity + Context + Structure',
                'Result: Optimal prompt strategy achieved!',
                'Score: 96.5%',
                '',
                'Congratulations! You have mastered the art of prompting!'
            ]);
        }

        setIsOptimizing(false);
        setDialogueIndex(0);
    };

    // Keyboard controls
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
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
    }, [movePlayer, handleInteraction]);

    const eldersConsulted = npcs.filter(npc => npc.type === 'elder' && npc.consulted).length;
    const allEldersConsulted = eldersConsulted === 3;

    return (
        <div className="dungeon-game" ref={gameRef} tabIndex={0}>
            {/* Game viewport */}
            <div className="game-viewport">
                <div
                    className="dungeon-grid"
                    style={{
                        width: GRID_WIDTH * TILE_SIZE,
                        height: GRID_HEIGHT * TILE_SIZE,
                    }}
                >
                    {/* Render tiles */}
                    {dungeonMap.map((row, y) =>
                        row.map((tile, x) => (
                            <div
                                key={`${x}-${y}`}
                                className={`tile ${tile === TileType.WALL ? 'wall' : 'floor'}`}
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
                    {npcs.map(npc => (
                        <div
                            key={npc.id}
                            className={`npc ${npc.type} ${npc.consulted ? 'consulted' : ''}`}
                            style={{
                                left: npc.x * TILE_SIZE,
                                top: npc.y * TILE_SIZE,
                                width: TILE_SIZE,
                                height: TILE_SIZE,
                            }}
                        >
                            <div className="npc-sprite">
                                {npc.type === 'elder' ? '🧙' : '💻'}
                            </div>
                            {npc.consulted && npc.type === 'elder' && (
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
            </div>

            {/* Status bar */}
            <div className="status-bar">
                <div className="status-item">
                    <span className="status-label">Wisdom Collected:</span>
                    <span className="status-value">{eldersConsulted}/3</span>
                </div>
                <div className="status-item">
                    <span className="status-label">Computer Access:</span>
                    <span className={`status-value ${allEldersConsulted ? 'ready' : 'locked'}`}>
                        {allEldersConsulted ? '✓ READY' : '✗ LOCKED'}
                    </span>
                </div>
            </div>

            {/* Dialogue box */}
            <AnimatePresence>
                {activeDialogue && (
                    <motion.div
                        className="dialogue-box"
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                    >
                        <div className="dialogue-content">
                            {currentNPC && (
                                <div className="dialogue-speaker">{currentNPC.name}</div>
                            )}
                            <div className="dialogue-text">
                                {activeDialogue[dialogueIndex]}
                            </div>
                            <div className="dialogue-prompt">
                                {dialogueIndex < activeDialogue.length - 1 ? '▼' : '✓'}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Controls hint */}
            <div className="controls-hint">
                <div>⬆️⬇️⬅️➡️ or WASD: Move</div>
                <div>SPACE/ENTER: Interact</div>
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
                        <div className="optimization-text">Running DSPy Optimization...</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
