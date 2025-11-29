/**
 * Pokemon-Style DSPy Game
 * A full-screen Pokemon RPG experience teaching DSPy concepts
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOptimization } from '../hooks/useOptimization';
import { VariantCardState } from '../types';
import './PokemonGame.css';

interface PokemonGameProps {
  onExit: () => void;
}

type GamePhase = 'title' | 'intro' | 'overworld' | 'battle' | 'input' | 'optimization' | 'results';
type WisdomId = 'v1' | 'v2' | 'v3';

interface Position {
  x: number;
  y: number;
}

interface Stone {
  id: WisdomId;
  name: string;
  icon: string;
  color: string;
  position: Position;
  dialogues: string[];
  inscription: string;
  teachingTopic: string;
}

const STONES: Stone[] = [
  {
    id: 'v1',
    name: 'Signatures Module',
    icon: '📋',
    color: '#60a5fa',
    position: { x: 2, y: 2 }, // Grid position - top left
    teachingTopic: 'Prompt Templates',
    inscription: 'Define your inputs and outputs clearly.',
    dialogues: [
      "Welcome to the Signatures Module!",
      "In DSPy, we don't write prompts by hand...",
      "Instead, we define SIGNATURES - declarative specs of what the LLM should do.",
      "A signature like 'question -> answer' tells DSPy the INPUT and OUTPUT.",
      "More complex: 'context, question -> reasoning, answer' adds chain-of-thought!",
      "This structure lets DSPy OPTIMIZE prompts automatically.",
      "Input your task: What is the STRUCTURE of what you need?"
    ]
  },
  {
    id: 'v2',
    name: 'Examples Module',
    icon: '📚',
    color: '#f472b6',
    position: { x: 14, y: 2 }, // Grid position - top right
    teachingTopic: 'Few-Shot Learning',
    inscription: 'Learn from demonstrations and examples.',
    dialogues: [
      "Welcome to the Examples Module!",
      "This covers EXAMPLES and FEW-SHOT learning.",
      "DSPy automatically finds the BEST examples to include in prompts.",
      "These examples TEACH the model how to respond correctly.",
      "Think of it as showing the model how to solve similar problems.",
      "The more examples it tries, the better it learns your style.",
      "What EXAMPLE approach would YOU take to solve this challenge?"
    ]
  },
  {
    id: 'v3',
    name: 'Optimizer Module',
    icon: '⚙️',
    color: '#fbbf24',
    position: { x: 2, y: 8 }, // Grid position - bottom left corner
    teachingTopic: 'Optimization',
    inscription: 'Iterate and improve through automated testing.',
    dialogues: [
      "Welcome to the Optimizer Module!",
      "This is where the real power of DSPy lives.",
      "DSPy uses techniques like Bootstrap, MIPRO, and BayesianSignatureOptimizer...",
      "These optimizers TEST different prompt versions automatically!",
      "They compete head-to-head - only the highest-scoring variant wins.",
      "Each variant is evaluated, and the best one becomes your solution.",
      "What insight can you provide to improve the optimization?"
    ]
  }
];

// Oracle grid position - center of dungeon
const ORACLE_GRID = { x: 8, y: 5 };

const INTRO_DIALOGUES = [
  "Welcome to the DSPy Learning Lab!",
  "Writing prompts by hand is tedious - fragile, unreliable, and hard to improve.",
  "DSPy is a framework for Declarative Self-improving Language Programs.",
  "Created by Stanford researchers, DSPy makes prompt engineering systematic.",
  "Instead of writing prompts, you DECLARE what you want...",
  "Define your task structure, provide examples, set your metrics...",
  "And DSPy OPTIMIZES to find the best prompt AUTOMATICALLY!",
  "Your task: Learn from the three DSPy Modules in this lab.",
  "📋 The Signatures Module teaches input/output definitions.",
  "📚 The Examples Module covers few-shot learning techniques.",
  "⚙️ The Optimizer Module explains automated improvement.",
  "Visit all three modules, then return to the DSPy Terminal.",
  "The Terminal will test THREE prompt strategies against each other...",
  "And select the WINNER based on real evaluation scores!",
  "Controls: ARROW KEYS or WASD to move. SPACE or ENTER to interact.",
  "Let's get started!"
];

const COMBATANTS = [
  { id: 'v1', name: 'Structured Prompt', subtitle: 'Clear & Defined', icon: '◈', color: '#60a5fa', gradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)' },
  { id: 'v2', name: 'Example-Based Prompt', subtitle: 'Learns from Data', icon: '❋', color: '#f472b6', gradient: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)' },
  { id: 'v3', name: 'Optimized Prompt', subtitle: 'Auto-Improved', icon: '✦', color: '#fbbf24', gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }
];

// Oracle position
const ORACLE_POSITION = { x: 400, y: 280 };

// Dungeon map configuration
const MAP_WIDTH = 17;
const MAP_HEIGHT = 11;
const TILE_SIZE = 48;

// Map tile types: 0=floor, 1=wall, 2=water/void, 3=special floor
const DUNGEON_MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,3,0,0,0,0,0,0,0,0,0,0,0,3,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
  [1,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,1],
  [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,3,0,0,0,0,0,0,0,0,0,0,0,3,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// Convert grid position to pixel position
const gridToPixel = (gx: number, gy: number) => ({
  x: gx * TILE_SIZE + TILE_SIZE / 2,
  y: gy * TILE_SIZE + TILE_SIZE / 2
});

// Convert pixel position to grid position
const pixelToGrid = (px: number, py: number) => ({
  gx: Math.floor(px / TILE_SIZE),
  gy: Math.floor(py / TILE_SIZE)
});

// Check if a grid position is walkable
const isWalkable = (gx: number, gy: number) => {
  if (gx < 0 || gx >= MAP_WIDTH || gy < 0 || gy >= MAP_HEIGHT) return false;
  return DUNGEON_MAP[gy][gx] !== 1;
};

const PokemonGame: React.FC<PokemonGameProps> = ({ onExit }) => {
  // Game state
  const [phase, setPhase] = useState<GamePhase>('title');
  const [playerGridPos, setPlayerGridPos] = useState<Position>({ x: 8, y: 9 }); // Grid position
  const [playerDirection, setPlayerDirection] = useState<'up' | 'down' | 'left' | 'right'>('up');
  const [isWalking, setIsWalking] = useState(false);
  const [isMoving, setIsMoving] = useState(false); // Prevent rapid movement
  
  // Dialogue state
  const [currentDialogue, setCurrentDialogue] = useState<string[]>([]);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dialogueSpeaker, setDialogueSpeaker] = useState('');
  
  // Stone/Battle state
  const [collectedWisdoms, setCollectedWisdoms] = useState<Record<WisdomId, string>>({ v1: '', v2: '', v3: '' });
  const [currentStone, setCurrentStone] = useState<Stone | null>(null);
  const [battleMenuIndex, setBattleMenuIndex] = useState(0);
  const [inputText, setInputText] = useState('');
  
  // Challenge input
  const [challengeText, setChallengeText] = useState('');
  
  // Optimization state
  const { state: optState, startOptimization, reset: resetOptimization } = useOptimization();
  
  // Screen effects
  const [showFlash, setShowFlash] = useState(false);
  
  // Refs
  const gameRef = useRef<HTMLDivElement>(null);
  const keysPressed = useRef<Set<string>>(new Set());
  
  // Focus game on mount
  useEffect(() => {
    gameRef.current?.focus();
  }, [phase]);

  // Typewriter effect
  useEffect(() => {
    if (currentDialogue.length > 0 && dialogueIndex < currentDialogue.length) {
      const targetText = currentDialogue[dialogueIndex];
      if (displayedText.length < targetText.length) {
        setIsTyping(true);
        const timer = setTimeout(() => {
          setDisplayedText(targetText.slice(0, displayedText.length + 1));
        }, 30);
        return () => clearTimeout(timer);
      } else {
        setIsTyping(false);
      }
    }
  }, [currentDialogue, dialogueIndex, displayedText]);

  // Grid-based movement
  const movePlayer = useCallback((dx: number, dy: number, direction: 'up' | 'down' | 'left' | 'right') => {
    if (isMoving || phase !== 'overworld' || currentDialogue.length > 0) return;
    
    setPlayerDirection(direction);
    
    const newX = playerGridPos.x + dx;
    const newY = playerGridPos.y + dy;
    
    // Check for stone collision
    const stoneAtPos = STONES.find(s => s.position.x === newX && s.position.y === newY);
    if (stoneAtPos) return;
    
    // Check for oracle collision
    if (newX === ORACLE_GRID.x && newY === ORACLE_GRID.y) return;
    
    // Check if walkable
    if (isWalkable(newX, newY)) {
      setIsMoving(true);
      setIsWalking(true);
      setPlayerGridPos({ x: newX, y: newY });
      
      // Reset movement lock after animation
      setTimeout(() => {
        setIsMoving(false);
        setIsWalking(false);
      }, 150);
    }
  }, [isMoving, phase, playerGridPos, currentDialogue]);

  // Movement key handling
  useEffect(() => {
    if (phase !== 'overworld') return;
    
    const handleMovement = (e: KeyboardEvent) => {
      if (currentDialogue.length > 0) return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          movePlayer(0, -1, 'up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          movePlayer(0, 1, 'down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          movePlayer(-1, 0, 'left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          movePlayer(1, 0, 'right');
          break;
      }
    };
    
    window.addEventListener('keydown', handleMovement);
    return () => window.removeEventListener('keydown', handleMovement);
  }, [phase, movePlayer, currentDialogue]);

  // Check proximity to stones/oracle (adjacent tiles)
  const getProximity = useCallback(() => {
    const adjacentPositions = [
      { x: playerGridPos.x, y: playerGridPos.y - 1 }, // up
      { x: playerGridPos.x, y: playerGridPos.y + 1 }, // down
      { x: playerGridPos.x - 1, y: playerGridPos.y }, // left
      { x: playerGridPos.x + 1, y: playerGridPos.y }, // right
    ];
    
    // Check stones
    for (const stone of STONES) {
      for (const pos of adjacentPositions) {
        if (stone.position.x === pos.x && stone.position.y === pos.y) {
          return { type: 'stone', entity: stone };
        }
      }
    }
    
    // Check Oracle
    for (const pos of adjacentPositions) {
      if (ORACLE_GRID.x === pos.x && ORACLE_GRID.y === pos.y) {
        return { type: 'oracle', entity: null };
      }
    }
    
    return null;
  }, [playerGridPos]);

  // Interaction handler
  const handleInteraction = useCallback(() => {
    const proximity = getProximity();
    
    if (proximity?.type === 'stone') {
      const stone = proximity.entity as Stone;
      setCurrentStone(stone);
      setDialogueSpeaker(stone.name);
      setCurrentDialogue(stone.dialogues);
      setDialogueIndex(0);
      setDisplayedText('');
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 300);
      setPhase('battle');
    } else if (proximity?.type === 'oracle') {
      const wisdomCount = Object.values(collectedWisdoms).filter(w => w.length > 0).length;
      if (wisdomCount < 3) {
        setDialogueSpeaker('DSPy Terminal');
        setCurrentDialogue([
          `You have completed ${wisdomCount} of 3 modules.`,
          "Visit all three DSPy modules before running optimization.",
          "Each contains concepts needed for the process."
        ]);
        setDialogueIndex(0);
        setDisplayedText('');
      } else {
        // Start the optimization battle
        triggerOptimization();
      }
    }
  }, [getProximity, collectedWisdoms]);

  // Trigger optimization
  const triggerOptimization = useCallback(async () => {
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 300);
    
    const composed = [
      challengeText && `Challenge: ${challengeText}`,
      `\nInputs from DSPy Modules:`,
      `◈ Signatures: "${collectedWisdoms.v1}"`,
      `❋ Examples: "${collectedWisdoms.v2}"`,
      `✦ Optimizer: "${collectedWisdoms.v3}"`
    ].filter(Boolean).join('\n');
    
    await startOptimization(composed || 'Analyze this optimization challenge');
    setPhase('optimization');
  }, [challengeText, collectedWisdoms, startOptimization]);

  // Advance dialogue
  const advanceDialogue = useCallback(() => {
    if (isTyping) {
      // Skip typing animation
      setDisplayedText(currentDialogue[dialogueIndex]);
      setIsTyping(false);
    } else if (dialogueIndex < currentDialogue.length - 1) {
      setDialogueIndex(prev => prev + 1);
      setDisplayedText('');
    } else {
      // End of dialogue
      if (phase === 'intro') {
        setCurrentDialogue([]);
        setPhase('overworld');
      } else if (phase === 'battle' && currentStone) {
        // Show input for wisdom
        setPhase('input');
      } else {
        setCurrentDialogue([]);
      }
    }
  }, [isTyping, dialogueIndex, currentDialogue, phase, currentStone]);

  // Submit wisdom
  const submitWisdom = useCallback(() => {
    if (!currentStone || !inputText.trim()) return;
    
    setCollectedWisdoms(prev => ({
      ...prev,
      [currentStone.id]: inputText.trim()
    }));
    
    setInputText('');
    setCurrentStone(null);
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 300);
    setPhase('overworld');
  }, [currentStone, inputText]);

  // Start game from title screen - defined before useEffect that uses it
  const startGame = useCallback(() => {
    setDialogueSpeaker('???');
    setCurrentDialogue(INTRO_DIALOGUES);
    setDialogueIndex(0);
    setDisplayedText('');
    setPhase('intro');
  }, []);

  // Key handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key);
      
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        
        if (phase === 'title') {
          startGame();
        } else if (phase === 'intro' || (phase === 'battle' && currentDialogue.length > 0)) {
          advanceDialogue();
        } else if (phase === 'overworld' && currentDialogue.length === 0) {
          handleInteraction();
        } else if (phase === 'overworld' && currentDialogue.length > 0) {
          advanceDialogue();
        }
      }
      
      if (e.key === 'Escape') {
        if (phase === 'input') {
          setPhase('overworld');
          setCurrentStone(null);
        } else if (phase === 'title' || phase === 'overworld') {
          onExit();
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [phase, advanceDialogue, handleInteraction, onExit, currentDialogue, startGame]);

  // Watch for optimization completion
  useEffect(() => {
    if (optState.status === 'complete' && phase === 'optimization') {
      const timer = setTimeout(() => setPhase('results'), 1500);
      return () => clearTimeout(timer);
    }
  }, [optState.status, phase]);

  // Play again handler
  const handlePlayAgain = useCallback(() => {
    resetOptimization();
    setCollectedWisdoms({ v1: '', v2: '', v3: '' });
    setChallengeText('');
    setPhase('overworld');
    setPlayerGridPos({ x: 8, y: 9 });
    setPlayerDirection('up');
  }, [resetOptimization]);

  // Get variant data
  const getVariantData = useCallback((id: string): VariantCardState | undefined => {
    return optState.variants.find(v => v.variant.variant_id === id);
  }, [optState.variants]);

  // Render title screen
  const renderTitleScreen = () => (
    <motion.div 
      className="title-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={startGame}
      style={{ cursor: 'pointer' }}
    >
      <motion.div
        className="title-logo"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.3 }}
      >
        ⚗️
      </motion.div>
      <motion.h1 
        className="title-text"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        DSPy QUEST
      </motion.h1>
      <motion.p 
        className="title-subtitle"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        The Prompt Optimization Adventure
      </motion.p>
      <motion.button
        className="title-prompt mt-8 px-8 py-4 border-2 border-indigo-500/50 rounded-lg hover:border-indigo-400 hover:bg-indigo-500/10 transition-all"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        onClick={startGame}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ▶ START GAME
      </motion.button>
      <motion.p
        className="text-[10px] text-indigo-400/50 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        or press SPACE / ENTER
      </motion.p>
      
      {/* Challenge input on title */}
      <motion.div
        className="mt-8 bg-black/50 p-4 rounded-lg border border-indigo-500/30"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{ maxWidth: '400px', width: '90%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[8px] text-indigo-300 mb-2">YOUR CHALLENGE (Optional)</p>
        <input
          type="text"
          value={challengeText}
          onChange={(e) => setChallengeText(e.target.value)}
          placeholder='e.g., "I was double charged..."'
          className="w-full bg-black/60 border-2 border-indigo-500/40 rounded px-3 py-2 text-[10px] text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-400"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter') {
              startGame();
            }
          }}
        />
      </motion.div>
    </motion.div>
  );

  // Render overworld
  const renderOverworld = () => {
    const proximity = getProximity();
    const wisdomCount = Object.values(collectedWisdoms).filter(w => w.length > 0).length;
    
    // Calculate map dimensions
    const mapPixelWidth = MAP_WIDTH * TILE_SIZE;
    const mapPixelHeight = MAP_HEIGHT * TILE_SIZE;
    
    return (
      <div className="overworld">
        {/* Centered dungeon container */}
        <div className="dungeon-viewport">
          <div 
            className="dungeon-map"
            style={{ 
              width: mapPixelWidth, 
              height: mapPixelHeight,
            }}
          >
            {/* Render tiles */}
            {DUNGEON_MAP.map((row, y) =>
              row.map((tile, x) => (
                <div
                  key={`${x}-${y}`}
                  className={`dungeon-tile tile-${tile}`}
                  style={{
                    left: x * TILE_SIZE,
                    top: y * TILE_SIZE,
                    width: TILE_SIZE,
                    height: TILE_SIZE,
                  }}
                />
              ))
            )}
            
            {/* Sacred Stones */}
            {STONES.map((stone) => {
              const hasWisdom = collectedWisdoms[stone.id].length > 0;
              const pixelPos = gridToPixel(stone.position.x, stone.position.y);
              return (
                <div
                  key={stone.id}
                  className={`sacred-stone ${hasWisdom ? 'consulted' : ''}`}
                  style={{ 
                    left: pixelPos.x - 40,
                    top: pixelPos.y - 50,
                    color: stone.color
                  }}
                >
                  <span className="stone-sprite">{stone.icon}</span>
                  <span className="stone-label">{stone.name}</span>
                </div>
              );
            })}
            
            {/* Oracle */}
            <div 
              className={`oracle-pedestal ${wisdomCount === 3 ? 'ready' : ''}`}
              style={{ 
                left: gridToPixel(ORACLE_GRID.x, ORACLE_GRID.y).x - 60,
                top: gridToPixel(ORACLE_GRID.x, ORACLE_GRID.y).y - 60
              }}
            >
              <span className="oracle-sprite">🖥️</span>
              <span className="oracle-label">{wisdomCount === 3 ? '✨ READY ✨' : 'TERMINAL'}</span>
            </div>
            
            {/* Player */}
            <motion.div 
              className={`player ${isWalking ? 'walking' : ''}`}
              animate={{
                left: gridToPixel(playerGridPos.x, playerGridPos.y).x - 24,
                top: gridToPixel(playerGridPos.x, playerGridPos.y).y - 40,
              }}
              transition={{ duration: 0.15, ease: 'linear' }}
            >
              <span className="player-sprite">🧙‍♂️</span>
            </motion.div>
          </div>
        </div>
        
        {/* HUD */}
        <div className="game-hud">
          <div className="quest-box">
            <div className="quest-title">⚔️ QUEST</div>
            <div className="wisdom-list">
              {STONES.map((stone) => {
                const hasWisdom = collectedWisdoms[stone.id].length > 0;
                return (
                  <div key={stone.id} className={`wisdom-item ${hasWisdom ? 'collected' : ''}`}>
                    <span className="wisdom-icon" style={{ color: stone.color }}>{stone.icon}</span>
                    <span className="wisdom-name">{stone.name}</span>
                    {hasWisdom && <span className="wisdom-check">✓</span>}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="controls-box">
            <div className="controls-row">
              <span className="key-badge">WASD</span>
              <span>Move</span>
              <span className="key-badge">SPACE</span>
              <span>Interact</span>
            </div>
          </div>
        </div>
        
        {/* Proximity prompt */}
        <AnimatePresence>
          {proximity && currentDialogue.length === 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="dialogue-container"
            >
              <div className="dialogue-box">
                <div className="dialogue-inner" style={{ minHeight: '60px' }}>
                  <div className="dialogue-text">
                    {proximity.type === 'stone' && (
                      <>Press SPACE to access the {(proximity.entity as Stone).name}</>
                    )}
                    {proximity.type === 'oracle' && wisdomCount < 3 && (
                      <>Complete {3 - wisdomCount} more module{3 - wisdomCount > 1 ? 's' : ''} before running optimization</>
                    )}
                    {proximity.type === 'oracle' && wisdomCount === 3 && (
                      <>✨ Press SPACE to run DSPy Optimization! ✨</>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Active dialogue */}
        <AnimatePresence>
          {currentDialogue.length > 0 && phase === 'overworld' && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="dialogue-container"
            >
              <div className="dialogue-box" onClick={advanceDialogue} style={{ cursor: 'pointer' }}>
                <div className="dialogue-inner">
                  <div className="dialogue-speaker">
                    <span className="speaker-name">{dialogueSpeaker}</span>
                  </div>
                  <div className="dialogue-text">
                    {displayedText}
                    {isTyping && <span className="dialogue-cursor" />}
                  </div>
                  {!isTyping && (
                    <div className="dialogue-continue">▼ CLICK or SPACE</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Render intro
  const renderIntro = () => (
    <div 
      className="overworld" 
      style={{ background: '#0f0f23', cursor: 'pointer' }}
      onClick={advanceDialogue}
    >
      <div className="ambient-particles">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`
            }}
          />
        ))}
      </div>
      
      <motion.div
        className="dialogue-container"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialogue-box" onClick={advanceDialogue}>
          <div className="dialogue-inner">
            <div className="dialogue-speaker">
              <span className="speaker-name">{dialogueSpeaker}</span>
            </div>
            <div className="dialogue-text">
              {displayedText}
              {isTyping && <span className="dialogue-cursor" />}
            </div>
            {!isTyping && (
              <div className="dialogue-continue">▼ CLICK or SPACE</div>
            )}
          </div>
        </div>
        {/* Skip intro button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCurrentDialogue([]);
            setPhase('overworld');
          }}
          className="absolute bottom-4 right-4 px-4 py-2 text-[10px] text-indigo-400/60 hover:text-indigo-300 border border-indigo-500/30 rounded-lg hover:border-indigo-400/50 transition-all"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          SKIP INTRO →
        </button>
      </motion.div>
    </div>
  );

  // Render battle screen
  const renderBattle = () => {
    if (!currentStone) return null;
    
    return (
      <motion.div 
        className="battle-screen battle-transition"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="battle-background">
          <div className="battle-arena" />
          
          {/* Enemy (Stone) */}
          <motion.div 
            className="enemy-platform"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span 
              className="enemy-sprite" 
              style={{ color: currentStone.color, filter: `drop-shadow(0 0 30px ${currentStone.color})` }}
            >
              {currentStone.icon}
            </span>
            <div className="enemy-name-box" style={{ borderColor: currentStone.color }}>
              <div className="enemy-name">{currentStone.name}</div>
              <div className="enemy-subtitle">{currentStone.teachingTopic}</div>
            </div>
          </motion.div>
          
          {/* Player */}
          <motion.div 
            className="player-platform"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="player-battle-sprite">🧙</span>
            <div className="player-name-box">
              <div className="player-name">OPTIMIZER</div>
            </div>
          </motion.div>
        </div>
        
        {/* Battle dialogue */}
        <div className="battle-dialogue" onClick={advanceDialogue} style={{ cursor: 'pointer' }}>
          <div className="battle-dialogue-box">
            <div className="battle-dialogue-text">
              {displayedText}
              {isTyping && <span className="dialogue-cursor" />}
            </div>
            {!isTyping && dialogueIndex < currentDialogue.length - 1 && (
              <div className="dialogue-continue">▼ CLICK to continue</div>
            )}
            {!isTyping && dialogueIndex === currentDialogue.length - 1 && (
              <div className="dialogue-continue">▼ CLICK to respond</div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // Render input screen
  const renderInput = () => {
    if (!currentStone) return null;
    
    return (
      <motion.div 
        className="input-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div 
          className="input-box"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          style={{ borderColor: currentStone.color }}
        >
          <div className="input-header">
            <span className="input-icon" style={{ color: currentStone.color }}>{currentStone.icon}</span>
            <div>
              <div className="input-title">{currentStone.name}</div>
              <div className="input-subtitle">Enter Your Input</div>
            </div>
          </div>
          
          <div className="input-inscription" style={{ borderColor: currentStone.color }}>
            "{currentStone.inscription}"
          </div>
          
          <textarea
            className="input-field"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Share your approach, strategy, or insight..."
            autoFocus
            style={{ borderColor: inputText ? currentStone.color : undefined }}
          />
          
          <div className="input-actions">
            <button 
              className="input-btn"
              onClick={() => {
                setPhase('overworld');
                setCurrentStone(null);
              }}
            >
              Depart
            </button>
            <button 
              className="input-btn primary"
              onClick={submitWisdom}
              disabled={!inputText.trim()}
              style={{ borderColor: currentStone.color, color: currentStone.color }}
            >
              ✓ Submit
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Render optimization battle
  const renderOptimization = () => {
    const battleTexts = [
      'The strategies clash in the arena...',
      'DSPy evaluates each approach...',
      'Scores are being calculated...',
      'Optimization complete!'
    ];
    
    return (
      <motion.div 
        className="optimization-battle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header */}
        <motion.div 
          className="text-center py-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <motion.div
            animate={optState.status === 'running' || optState.status === 'compiling' ? {
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            } : {}}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-4xl mb-2"
          >
            ⚔️
          </motion.div>
          <h2 className="text-xl text-white font-bold tracking-wider">OPTIMIZATION BATTLE</h2>
          <motion.p
            key={Math.floor(Date.now() / 2000) % 4}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-indigo-300 mt-2"
          >
            {battleTexts[Math.floor(Date.now() / 2000) % 4]}
          </motion.p>
        </motion.div>
        
        {/* Contestants */}
        <div className="opt-battle-arena">
          <div className="opt-contestants">
            {COMBATANTS.map((combatant, idx) => {
              const variant = getVariantData(combatant.id);
              const isLeader = optState.leader === combatant.id;
              const progress = !variant ? 0 :
                variant.state === 'querying' ? 30 :
                variant.state === 'output' ? 70 :
                variant.state === 'scored' ? 100 : 0;
              
              return (
                <motion.div
                  key={combatant.id}
                  className={`opt-contestant ${variant?.state === 'querying' || variant?.state === 'output' ? 'active' : ''} ${isLeader && optState.status === 'complete' ? 'winner' : ''}`}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  style={{ 
                    borderColor: isLeader && optState.status === 'complete' ? '#fbbf24' : 
                                 variant?.state === 'querying' || variant?.state === 'output' ? combatant.color : undefined
                  }}
                >
                  {isLeader && optState.status === 'complete' && (
                    <span className="opt-crown">👑</span>
                  )}
                  
                  <div className="opt-contestant-header">
                    <motion.span 
                      className="opt-contestant-icon"
                      style={{ color: combatant.color }}
                      animate={variant?.state === 'querying' ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      } : {}}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      {combatant.icon}
                    </motion.span>
                    <div>
                      <div className="opt-contestant-name">{combatant.name}</div>
                      <div className="opt-contestant-subtitle">{combatant.subtitle}</div>
                    </div>
                  </div>
                  
                  <div className="opt-progress-bar">
                    <motion.div
                      className="opt-progress-fill"
                      style={{ background: combatant.gradient }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  
                  <div className="opt-status">
                    {variant?.state === 'querying' && (
                      <>
                        <span className="opt-status-dot" style={{ background: combatant.color }} />
                        <span>Processing...</span>
                      </>
                    )}
                    {variant?.state === 'output' && (
                      <>
                        <span className="opt-status-dot" style={{ background: combatant.color }} />
                        <span>Evaluating...</span>
                      </>
                    )}
                    {variant?.state === 'scored' && (
                      <span>{isLeader ? '🏆 WINNER!' : 'Complete'}</span>
                    )}
                    {!variant && <span>Waiting...</span>}
                  </div>
                  
                  {variant?.score?.total !== undefined && (
                    <motion.div 
                      className="opt-score"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      {variant.score.total.toFixed(1)}
                    </motion.div>
                  )}
                  
                  {variant?.variant.output && (
                    <motion.div 
                      className="opt-output-preview"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                    >
                      "{variant.variant.output.summary}"
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
        
        {/* Bottom status */}
        <div className="battle-dialogue">
          <div className="battle-dialogue-box">
            <div className="battle-dialogue-text text-center">
              {optState.status === 'compiling' && '🔄 Initializing optimization...'}
              {optState.status === 'running' && '⚡ Testing variants... DSPy evaluates each approach...'}
              {optState.status === 'complete' && '🏆 Optimization complete! Best variant selected!'}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Render results
  const renderResults = () => {
    const winner = COMBATANTS.find(c => c.id === optState.leader);
    const winnerVariant = winner ? getVariantData(winner.id) : undefined;
    const others = COMBATANTS.filter(c => c.id !== optState.leader);
    
    return (
      <motion.div 
        className="results-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="results-header">
          <motion.div 
            className="results-crown"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
          >
            👑
          </motion.div>
          <motion.h1 
            className="results-title"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            VICTORY!
          </motion.h1>
          <motion.p 
            className="results-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            DSPy optimization complete
          </motion.p>
        </div>
        
        {winner && winnerVariant && (
          <motion.div 
            className="results-winner"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <div className="winner-header">
              <span className="winner-icon" style={{ color: winner.color }}>{winner.icon}</span>
              <div>
                <div className="winner-name">{winner.name}</div>
                <div className="winner-score">
                  Score: {winnerVariant.score?.total?.toFixed(1) || 'N/A'}
                </div>
              </div>
            </div>
            {winnerVariant.variant.output && (
              <div className="winner-output">
                <strong>Category:</strong> {winnerVariant.variant.output.category}<br/>
                <strong>Response:</strong> "{winnerVariant.variant.output.summary}"
              </div>
            )}
          </motion.div>
        )}
        
        <motion.div 
          className="results-others"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          {others.map((other) => {
            const variant = getVariantData(other.id);
            return (
              <div key={other.id} className="other-result">
                <div className="other-header">
                  <span className="other-icon" style={{ color: other.color }}>{other.icon}</span>
                  <div>
                    <div className="other-name">{other.name}</div>
                    <div className="other-score">
                      {variant?.score?.total?.toFixed(1) || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
        
        <motion.div 
          className="results-actions"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          <button className="results-btn" onClick={handlePlayAgain}>
            🔄 Play Again
          </button>
          <button className="results-btn" onClick={onExit}>
            🚪 Exit
          </button>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="pokemon-game" ref={gameRef} tabIndex={0}>
      {/* Screen flash effect */}
      <AnimatePresence>
        {showFlash && <div className="screen-flash" />}
      </AnimatePresence>
      
      {/* Render current phase */}
      {phase === 'title' && renderTitleScreen()}
      {phase === 'intro' && renderIntro()}
      {phase === 'overworld' && renderOverworld()}
      {phase === 'battle' && renderBattle()}
      {phase === 'input' && renderInput()}
      {phase === 'optimization' && renderOptimization()}
      {phase === 'results' && renderResults()}
    </div>
  );
};

export default PokemonGame;

