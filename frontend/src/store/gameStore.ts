import { create } from 'zustand';

interface Position {
  x: number;
  z: number;
}

type Direction = 'up' | 'down' | 'left' | 'right';

interface DialogueState {
  npcId: string | null;
  lines: string[];
  currentLine: number;
  isOpen: boolean;
  npcName: string;
}

interface GameState {
  // Game phase
  gameStarted: boolean;
  startGame: () => void;

  // Player
  playerPosition: Position;
  playerDirection: Direction;
  isMoving: boolean;
  targetPosition: Position;

  // Movement
  movePlayer: (direction: Direction) => void;
  setPlayerPosition: (pos: Position) => void;
  setIsMoving: (moving: boolean) => void;

  // Collision map - set of "x,z" strings for blocked tiles
  collisionMap: Set<string>;
  initCollisionMap: () => void;
  isBlocked: (x: number, z: number) => boolean;

  // Dialogue
  dialogue: DialogueState;
  openDialogue: (npcId: string, npcName: string, lines: string[]) => void;
  advanceDialogue: () => void;
  closeDialogue: () => void;

  // Learning progress
  learnedConcepts: string[];
  learnConcept: (concept: string) => void;

  // NPC interaction
  nearbyNpcId: string | null;
  setNearbyNpc: (id: string | null) => void;

  // Concept card flash
  showConceptCard: { name: string; description: string } | null;
  flashConceptCard: (name: string, description: string) => void;
  hideConceptCard: () => void;
}

function buildCollisionMap(): Set<string> {
  const blocked = new Set<string>();

  const addTile = (x: number, z: number) => {
    blocked.add(`${x},${z}`);
  };

  const addRect = (x1: number, x2: number, z1: number, z2: number) => {
    for (let x = x1; x <= x2; x++) {
      for (let z = z1; z <= z2; z++) {
        addTile(x, z);
      }
    }
  };

  // --- Buildings ---
  // DSPy Lab: centered at (0, -7), roughly 4x3 area
  addRect(-2, 1, -9, -6);

  // Your House: centered at (-5, 3), roughly 3x2.5 area
  addRect(-7, -4, 2, 5);

  // Prompt Library: centered at (5, 3), roughly 3x2.5 area
  addRect(4, 7, 2, 5);

  // Module Shop: centered at (6, -2), roughly 2.5x2 area
  addRect(5, 8, -3, -1);

  // --- Trees: block single tiles ---
  const treeTiles: [number, number][] = [
    [-8, -5],
    [-8, 0],
    [-8, 5],
    [8, -5],
    [8, 5],
    [-3, -4],
    [3, -4],
    [-6, 7],
    [6, 7],
  ];
  for (const [tx, tz] of treeTiles) {
    addTile(tx, tz);
  }

  // --- Fences: block tiles along z = 9 from x = -9 to 9 ---
  for (let x = -9; x <= 9; x++) {
    addTile(x, 9);
  }

  // --- Town boundary: block anything outside x: [-9,9], z: [-9,9] ---
  // We handle this in isBlocked instead for efficiency, since it's an infinite set.

  return blocked;
}

export const useGameStore = create<GameState>((set, get) => ({
  // -- Game phase --
  gameStarted: false,
  startGame: () => {
    const state = get();
    if (state.collisionMap.size === 0) {
      state.initCollisionMap();
    }
    set({ gameStarted: true });
  },

  // -- Player --
  playerPosition: { x: 0, z: 0 },
  playerDirection: 'down' as Direction,
  isMoving: false,
  targetPosition: { x: 0, z: 0 },

  // -- Movement --
  movePlayer: (direction: Direction) => {
    const state = get();

    // Don't allow movement while dialogue is open
    if (state.dialogue.isOpen) {
      return;
    }

    // Don't allow movement while already moving
    if (state.isMoving) {
      return;
    }

    const offsets: Record<Direction, { dx: number; dz: number }> = {
      up: { dx: 0, dz: -1 },
      down: { dx: 0, dz: 1 },
      left: { dx: -1, dz: 0 },
      right: { dx: 1, dz: 0 },
    };

    const offset = offsets[direction];
    const targetX = state.playerPosition.x + offset.dx;
    const targetZ = state.playerPosition.z + offset.dz;

    if (state.isBlocked(targetX, targetZ)) {
      // Change facing direction but don't move
      set({ playerDirection: direction });
      return;
    }

    set({
      playerDirection: direction,
      targetPosition: { x: targetX, z: targetZ },
      isMoving: true,
    });
  },

  setPlayerPosition: (pos: Position) => {
    set({ playerPosition: pos });
  },

  setIsMoving: (moving: boolean) => {
    set({ isMoving: moving });
  },

  // -- Collision map --
  collisionMap: new Set<string>(),

  initCollisionMap: () => {
    set({ collisionMap: buildCollisionMap() });
  },

  isBlocked: (x: number, z: number) => {
    // Out-of-bounds check (town boundary)
    if (x < -9 || x > 9 || z < -9 || z > 9) {
      return true;
    }
    return get().collisionMap.has(`${x},${z}`);
  },

  // -- Dialogue --
  dialogue: {
    npcId: null,
    lines: [],
    currentLine: 0,
    isOpen: false,
    npcName: '',
  },

  openDialogue: (npcId: string, npcName: string, lines: string[]) => {
    set({
      dialogue: {
        npcId,
        npcName,
        lines,
        currentLine: 0,
        isOpen: true,
      },
    });
  },

  advanceDialogue: () => {
    const state = get();
    if (!state.dialogue.isOpen) return;

    const nextLine = state.dialogue.currentLine + 1;
    if (nextLine >= state.dialogue.lines.length) {
      // End of dialogue
      set({
        dialogue: {
          ...state.dialogue,
          isOpen: false,
          currentLine: 0,
          npcId: null,
        },
      });
    } else {
      set({
        dialogue: {
          ...state.dialogue,
          currentLine: nextLine,
        },
      });
    }
  },

  closeDialogue: () => {
    set({
      dialogue: {
        npcId: null,
        lines: [],
        currentLine: 0,
        isOpen: false,
        npcName: '',
      },
    });
  },

  // -- Learning progress --
  learnedConcepts: [],

  learnConcept: (concept: string) => {
    const state = get();
    if (!state.learnedConcepts.includes(concept)) {
      set({ learnedConcepts: [...state.learnedConcepts, concept] });
    }
  },

  // -- NPC interaction --
  nearbyNpcId: null,

  setNearbyNpc: (id: string | null) => {
    set({ nearbyNpcId: id });
  },

  // -- Concept card flash --
  showConceptCard: null,

  flashConceptCard: (name: string, description: string) => {
    set({ showConceptCard: { name, description } });
  },

  hideConceptCard: () => {
    set({ showConceptCard: null });
  },
}));
