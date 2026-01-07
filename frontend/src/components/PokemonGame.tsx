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
type AreaId = 'outdoor' | 'lab' | 'pokecenter' | 'mart';

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
  area: AreaId;
  dialogues: string[];
  inscription: string;
  teachingTopic: string;
}

const STONES: Stone[] = [
  {
    id: 'v1',
    name: 'GYM 1: SIGNATURES',
    icon: '📋',
    color: '#60a5fa',
    position: { x: 10, y: 3 }, // Grid position - center of LAB
    area: 'lab',
    teachingTopic: 'Gym Leader STRUCT',
    inscription: 'Define your inputs and outputs clearly.',
    dialogues: [
      "I'm STRUCT, leader of the SIGNATURES GYM!",
      "In DSPy, you define WHAT you want - input → output!",
      "Show me YOUR signature structure to earn this badge!"
    ]
  },
  {
    id: 'v2',
    name: 'GYM 2: EXAMPLES',
    icon: '📚',
    color: '#f472b6',
    position: { x: 5, y: 5 }, // Grid position - in POKECENTER
    area: 'pokecenter',
    teachingTopic: 'Gym Leader DEMO',
    inscription: 'Learn from demonstrations and examples.',
    dialogues: [
      "Welcome, trainer! I'm DEMO of the EXAMPLES GYM!",
      "DSPy learns from examples - just like you train Pokemon!",
      "Give me YOUR example approach for this badge!"
    ]
  },
  {
    id: 'v3',
    name: 'GYM 3: OPTIMIZER',
    icon: '⚙️',
    color: '#fbbf24',
    position: { x: 15, y: 5 }, // Grid position - in MART
    area: 'mart',
    teachingTopic: 'Gym Leader TUNE',
    inscription: 'Iterate and improve through automated testing.',
    dialogues: [
      "So YOU'RE the new trainer! I'm TUNE, the OPTIMIZER master!",
      "My specialty? Testing prompts until only the BEST survives!",
      "Share your optimization insight to claim the final badge!"
    ]
  }
];

// Oracle grid position - center of expanded lab
const ORACLE_GRID = { x: 9, y: 6 };

const INTRO_DIALOGUES = [
  "Hey! You must be the new PROMPT TRAINER!",
  "I'm PROF. DSPY. I study how AI learns to respond better!",
  "Inside this LAB are 3 GYMS. Beat them all to face the TERMINAL!",
  "Good luck, trainer! ARROW KEYS move, SPACE interacts. Go!"
];

const COMBATANTS = [
  { id: 'v1', name: 'Structured Prompt', subtitle: 'Clear & Defined', icon: '◈', color: '#60a5fa', gradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)' },
  { id: 'v2', name: 'Example-Based Prompt', subtitle: 'Learns from Data', icon: '❋', color: '#f472b6', gradient: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)' },
  { id: 'v3', name: 'Optimized Prompt', subtitle: 'Auto-Improved', icon: '✦', color: '#fbbf24', gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }
];

// Oracle position
const ORACLE_POSITION = { x: 400, y: 280 };

// Dungeon map configuration - Pokemon Pearl style (smaller tiles)
const MAP_WIDTH = 21;
const MAP_HEIGHT = 15;
const TILE_SIZE = 32;

// Map tile types: 0=floor, 1=wall, 2=water, 3=special floor, 4=grass, 5=path, 6=tree, 7=door, 8=pokecenter, 9=mart
const LAB_MAP = [
  [1,1,1,1,1,1,1,1,1,1,7,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
  [1,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,1],
  [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
  [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
  [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// Outdoor map - D/P Route 201 style with winding paths, pond, and multiple buildings
const OUTDOOR_MAP = [
  [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],
  [6,4,4,4,6,4,4,4,4,5,5,5,4,4,4,4,6,4,4,4,6],
  [6,4,4,4,4,4,4,4,5,5,4,5,5,4,4,4,4,4,4,4,6],
  [6,4,2,2,4,4,4,5,5,4,4,4,5,5,4,4,4,6,4,4,6],
  [6,4,2,2,2,4,5,5,4,4,4,4,4,5,5,4,4,4,4,4,6],
  [6,4,4,2,4,5,5,4,4,1,7,1,4,4,5,5,4,4,4,4,6],
  [6,4,4,4,5,5,4,4,4,1,1,1,4,4,4,5,5,4,4,4,6],
  [6,4,4,5,5,4,4,4,4,1,1,1,4,4,4,4,5,5,4,4,6],
  [6,4,5,5,4,4,4,4,5,5,5,5,5,4,4,4,4,5,4,4,6],
  [6,5,5,4,4,1,7,1,5,4,4,4,5,1,7,1,4,4,5,4,6],
  [6,5,4,4,4,1,1,1,5,4,4,4,5,1,1,1,4,4,5,4,6],
  [6,5,4,4,4,1,1,1,5,5,5,5,5,1,1,1,4,4,5,5,6],
  [6,5,5,4,4,4,4,4,4,4,4,4,4,4,4,4,4,5,5,4,6],
  [6,4,5,5,5,5,4,4,6,4,4,4,6,4,4,5,5,5,4,4,6],
  [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],
];

// Pokemon Center interior - D/P style with healing counter
const POKECENTER_MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,3,3,3,3,3,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// Mart interior - D/P style with shop counter
const MART_MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,3,3,3,3,3,3,3,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1],
  [1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1],
  [1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// Area configurations
interface AreaConfig {
  map: number[][];
  name: string;
  playerStart: Position;
  exits: { position: Position; targetArea: AreaId; targetPosition: Position }[];
}

const AREAS: Record<AreaId, AreaConfig> = {
  outdoor: {
    map: OUTDOOR_MAP,
    name: 'ROUTE 201',
    playerStart: { x: 10, y: 8 },
    exits: [
      { position: { x: 10, y: 5 }, targetArea: 'lab', targetPosition: { x: 10, y: 12 } },      // DSPy Lab (center building)
      { position: { x: 6, y: 9 }, targetArea: 'pokecenter', targetPosition: { x: 10, y: 12 } }, // Pokemon Center (left building)
      { position: { x: 14, y: 9 }, targetArea: 'mart', targetPosition: { x: 10, y: 12 } }       // Mart (right building)
    ]
  },
  lab: {
    map: LAB_MAP,
    name: 'DSPY LAB',
    playerStart: { x: 10, y: 12 },
    exits: [{ position: { x: 10, y: 0 }, targetArea: 'outdoor', targetPosition: { x: 10, y: 4 } }]
  },
  pokecenter: {
    map: POKECENTER_MAP,
    name: 'POKEMON CENTER',
    playerStart: { x: 10, y: 12 },
    exits: [{ position: { x: 10, y: 13 }, targetArea: 'outdoor', targetPosition: { x: 6, y: 8 } }]
  },
  mart: {
    map: MART_MAP,
    name: 'POKE MART',
    playerStart: { x: 10, y: 12 },
    exits: [{ position: { x: 10, y: 13 }, targetArea: 'outdoor', targetPosition: { x: 14, y: 8 } }]
  }
};

// Legacy reference for backward compatibility
const DUNGEON_MAP = LAB_MAP;

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

// Check if a grid position is walkable (pass the current map)
const isWalkable = (gx: number, gy: number, map: number[][]) => {
  if (gx < 0 || gx >= MAP_WIDTH || gy < 0 || gy >= MAP_HEIGHT) return false;
  const tile = map[gy][gx];
  // 1=wall, 6=tree are not walkable
  return tile !== 1 && tile !== 6;
};

const PokemonGame: React.FC<PokemonGameProps> = ({ onExit }) => {
  // Game state
  const [phase, setPhase] = useState<GamePhase>('title');
  const [currentArea, setCurrentArea] = useState<AreaId>('outdoor'); // Start outdoors
  const [playerGridPos, setPlayerGridPos] = useState<Position>({ x: 10, y: 8 }); // Grid position - matches ROUTE 201 playerStart
  const [playerDirection, setPlayerDirection] = useState<'up' | 'down' | 'left' | 'right'>('down');
  const [isWalking, setIsWalking] = useState(false);
  const [isMoving, setIsMoving] = useState(false); // Prevent rapid movement
  
  // Dialogue state
  const [currentDialogue, setCurrentDialogue] = useState<string[]>([]);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dialogueSpeaker, setDialogueSpeaker] = useState('');
  const [dialoguePortrait, setDialoguePortrait] = useState<{ icon: string; colorClass: string } | null>(null);

  // Helper to get portrait class from color
  const getPortraitClass = (color: string): string => {
    if (color === '#60a5fa') return 'portrait-blue';
    if (color === '#f472b6') return 'portrait-pink';
    if (color === '#fbbf24') return 'portrait-yellow';
    return 'portrait-prof';
  };
  
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

  // Door transition state
  const [transitionPhase, setTransitionPhase] = useState<'none' | 'fade-out' | 'fade-in'>('none');
  const [transitionAreaName, setTransitionAreaName] = useState<string>('');

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
    const areaConfig = AREAS[currentArea];
    const currentMap = areaConfig.map;

    // Check for stone collision in the current area
    const stoneAtPos = STONES.find(s => s.area === currentArea && s.position.x === newX && s.position.y === newY);
    if (stoneAtPos) return;

    // Check for oracle collision (only in lab)
    if (currentArea === 'lab') {
      if (newX === ORACLE_GRID.x && newY === ORACLE_GRID.y) return;
    }

    // Check for door/exit tiles (tile type 7)
    const targetTile = currentMap[newY]?.[newX];
    if (targetTile === 7) {
      // Find matching exit
      const exit = areaConfig.exits.find(e => e.position.x === newX && e.position.y === newY);
      if (exit) {
        setIsMoving(true);
        // Start fade-out transition
        const targetAreaConfig = AREAS[exit.targetArea];
        setTransitionAreaName(targetAreaConfig.name);
        setTransitionPhase('fade-out');

        // After fade-out completes (200ms), switch area and start fade-in
        setTimeout(() => {
          setCurrentArea(exit.targetArea);
          setPlayerGridPos(exit.targetPosition);
          setTransitionPhase('fade-in');

          // After fade-in completes (200ms), end transition
          setTimeout(() => {
            setTransitionPhase('none');
            setTransitionAreaName('');
            setIsMoving(false);
          }, 200);
        }, 200);
        return;
      }
    }

    // Check if walkable
    if (isWalkable(newX, newY, currentMap)) {
      setIsMoving(true);
      setIsWalking(true);
      setPlayerGridPos({ x: newX, y: newY });

      // Reset movement lock after animation
      setTimeout(() => {
        setIsMoving(false);
        setIsWalking(false);
      }, 150);
    }
  }, [isMoving, phase, playerGridPos, currentDialogue, currentArea]);

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

    // Check stones in the current area
    for (const stone of STONES) {
      if (stone.area !== currentArea) continue; // Only check stones in current area
      for (const pos of adjacentPositions) {
        if (stone.position.x === pos.x && stone.position.y === pos.y) {
          return { type: 'stone', entity: stone };
        }
      }
    }

    // Check Oracle (only in lab)
    if (currentArea === 'lab') {
      for (const pos of adjacentPositions) {
        if (ORACLE_GRID.x === pos.x && ORACLE_GRID.y === pos.y) {
          return { type: 'oracle', entity: null };
        }
      }
    }

    return null;
  }, [playerGridPos, currentArea]);

  // Interaction handler
  const handleInteraction = useCallback(() => {
    const proximity = getProximity();

    if (proximity?.type === 'stone') {
      const stone = proximity.entity as Stone;
      setCurrentStone(stone);
      setDialogueSpeaker(stone.name);
      setDialoguePortrait({ icon: stone.icon, colorClass: getPortraitClass(stone.color) });
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
        setDialoguePortrait({ icon: '🖥️', colorClass: 'portrait-terminal' });
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
        setDialoguePortrait(null);
        setPhase('overworld');
      } else if (phase === 'battle' && currentStone) {
        // Show input for wisdom
        setPhase('input');
      } else {
        setCurrentDialogue([]);
        setDialoguePortrait(null);
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
    setDialogueSpeaker('PROF. DSPY');
    setDialoguePortrait({ icon: '🧪', colorClass: 'portrait-prof' });
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
    setCurrentArea('outdoor');
    setPlayerGridPos({ x: 10, y: 8 });
    setPlayerDirection('down');
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
    const areaConfig = AREAS[currentArea];
    const currentMap = areaConfig.map;

    // Calculate map dimensions
    const mapPixelWidth = MAP_WIDTH * TILE_SIZE;
    const mapPixelHeight = MAP_HEIGHT * TILE_SIZE;

    return (
      <div className={`overworld area-${currentArea}`}>
        {/* Centered dungeon container */}
        <div className="dungeon-viewport">
          <div
            className={`dungeon-map ${currentArea === 'outdoor' ? 'outdoor-map' : ''}`}
            style={{
              width: mapPixelWidth,
              height: mapPixelHeight,
            }}
          >
            {/* Render tiles */}
            {currentMap.map((row, y) =>
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

            {/* Sacred Stones - render stones in current area */}
            {STONES.filter(stone => stone.area === currentArea).map((stone) => {
              const hasWisdom = collectedWisdoms[stone.id].length > 0;
              const pixelPos = gridToPixel(stone.position.x, stone.position.y);
              return (
                <div
                  key={stone.id}
                  className={`sacred-stone ${hasWisdom ? 'consulted' : ''}`}
                  style={{
                    left: pixelPos.x - 20,
                    top: pixelPos.y - 30,
                    color: stone.color
                  }}
                >
                  <span className="stone-sprite" aria-label={stone.name}></span>
                  <span className="stone-label">{stone.name}</span>
                </div>
              );
            })}

            {/* Oracle - only in lab */}
            {currentArea === 'lab' && (
              <div
                className={`oracle-pedestal ${wisdomCount === 3 ? 'ready' : ''}`}
                style={{
                  left: gridToPixel(ORACLE_GRID.x, ORACLE_GRID.y).x - 30,
                  top: gridToPixel(ORACLE_GRID.x, ORACLE_GRID.y).y - 30
                }}
              >
                <span className="oracle-sprite" aria-label="DSPy Terminal"></span>
                <span className="oracle-label">{wisdomCount === 3 ? 'READY' : 'TERMINAL'}</span>
              </div>
            )}

            {/* Player */}
            <motion.div
              className={`player ${isWalking ? 'walking' : ''}`}
              animate={{
                left: gridToPixel(playerGridPos.x, playerGridPos.y).x - 12,
                top: gridToPixel(playerGridPos.x, playerGridPos.y).y - 28,
              }}
              transition={{ duration: 0.15, ease: 'linear' }}
            >
              <span className="player-sprite" aria-label="player"></span>
            </motion.div>
          </div>
        </div>
        
        {/* HUD */}
        <div className="game-hud">
          <div className="quest-box">
            <div className="quest-title">📍 {areaConfig.name}</div>
            <div className="wisdom-list">
              {STONES.map((stone) => {
                const hasWisdom = collectedWisdoms[stone.id].length > 0;
                return (
                  <div key={stone.id} className={`wisdom-item ${hasWisdom ? 'collected' : ''}`}>
                    <span className="wisdom-icon" style={{ color: stone.color }}>{stone.icon}</span>
                    <span className="wisdom-name">{hasWisdom ? '✓' : '○'}</span>
                  </div>
                );
              })}
            </div>
            <div className="badge-count">{wisdomCount}/3 BADGES</div>
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
                  {dialoguePortrait && (
                    <div className={`dialogue-portrait ${dialoguePortrait.colorClass}`}>
                      {dialoguePortrait.icon}
                    </div>
                  )}
                  <div className="dialogue-content">
                    <div className="dialogue-speaker">
                      <span className="speaker-name">{dialogueSpeaker}</span>
                    </div>
                    <div className="dialogue-text">
                      {displayedText}
                      {isTyping && <span className="dialogue-cursor" />}
                    </div>
                    {!isTyping && (
                      <div className="dialogue-continue"></div>
                    )}
                  </div>
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
            {dialoguePortrait && (
              <div className={`dialogue-portrait ${dialoguePortrait.colorClass}`}>
                {dialoguePortrait.icon}
              </div>
            )}
            <div className="dialogue-content">
              <div className="dialogue-speaker">
                <span className="speaker-name">{dialogueSpeaker}</span>
              </div>
              <div className="dialogue-text">
                {displayedText}
                {isTyping && <span className="dialogue-cursor" />}
              </div>
              {!isTyping && (
                <div className="dialogue-continue"></div>
              )}
            </div>
          </div>
        </div>
        {/* Skip intro button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCurrentDialogue([]);
            setDialoguePortrait(null);
            setPhase('overworld');
          }}
          className="absolute bottom-4 right-4 px-4 py-2 text-[10px] text-indigo-400/60 hover:text-indigo-300 border border-indigo-500/30 rounded-lg hover:border-indigo-400/50 transition-all"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          SKIP INTRO
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
              style={{ color: currentStone.color }}
              aria-label={currentStone.name}
            ></span>
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
            <span className="player-battle-sprite" aria-label="Player"></span>
            <div className="player-name-box">
              <div className="player-name">OPTIMIZER</div>
            </div>
          </motion.div>
        </div>
        
        {/* Battle dialogue */}
        <div className="battle-dialogue" onClick={advanceDialogue} style={{ cursor: 'pointer' }}>
          <div className="battle-dialogue-box">
            {dialoguePortrait && (
              <div className={`dialogue-portrait ${dialoguePortrait.colorClass}`}>
                {dialoguePortrait.icon}
              </div>
            )}
            <div className="dialogue-content">
              <div className="battle-dialogue-text">
                {displayedText}
                {isTyping && <span className="dialogue-cursor" />}
              </div>
              {!isTyping && dialogueIndex < currentDialogue.length - 1 && (
                <div className="dialogue-continue"></div>
              )}
              {!isTyping && dialogueIndex === currentDialogue.length - 1 && (
                <div className="dialogue-continue"></div>
              )}
            </div>
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
      {/* Screen flash effect (for battle transitions) */}
      <AnimatePresence>
        {showFlash && <div className="screen-flash" />}
      </AnimatePresence>

      {/* Door transition effect - smooth fade to/from black with area name */}
      {transitionPhase !== 'none' && (
        <div className={`screen-transition ${transitionPhase}`}>
          {transitionAreaName && (
            <span className="transition-area-name">{transitionAreaName}</span>
          )}
        </div>
      )}

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

