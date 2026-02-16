# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**DSPyville** - A Pokemon Diamond/Pearl inspired 3D town that teaches DSPy concepts through exploration and NPC dialogue. Built with React Three Fiber, the game lets players walk around a charming isometric town, talk to characters, and learn the key pillars of DSPy (Signatures, Modules, Optimizers, Metrics).

## Tech Stack

- **React 19** + TypeScript
- **React Three Fiber** (Three.js React renderer)
- **@react-three/drei** (Three.js helpers)
- **Zustand** (state management)
- **Three.js** (3D rendering)

## Development Commands

```bash
cd frontend
npm install
npm start          # Dev server on port 3100
npm run build      # Production build
npm test           # Run tests
```

## Architecture

### Game Flow
1. Title screen -> Player presses SPACE
2. 3D town loads with isometric camera
3. Player moves with WASD/arrows (grid-based)
4. Walking near NPCs shows "!" indicator
5. SPACE opens Pokemon-style dialogue
6. Each NPC teaches a DSPy concept
7. HUD tracks learned concepts (5 total)

### File Structure

```
frontend/src/
├── App.tsx                          # Root: title screen vs game
├── index.tsx                        # React entry point
├── index.css                        # Global styles
├── store/
│   └── gameStore.ts                 # Zustand store (player, dialogue, concepts)
├── data/
│   └── npcs.ts                      # NPC definitions and dialogue
├── components/
│   ├── GameScene.tsx                # Canvas + scene setup + camera
│   ├── World.tsx                    # Town: ground, paths, buildings, trees, fences
│   ├── entities/
│   │   ├── Player.tsx               # Player character + WASD movement
│   │   ├── NPC.tsx                  # NPC character + proximity detection
│   │   ├── Building.tsx             # Reusable building component
│   │   ├── Tree.tsx                 # Low-poly tree (pine/round variants)
│   │   ├── Fence.tsx                # Fence segments
│   │   └── Sign.tsx                 # Wooden sign with text
│   └── ui/
│       ├── TitleScreen.tsx          # Start screen
│       ├── DialogueBox.tsx          # Pokemon-style dialogue overlay
│       ├── HUD.tsx                  # Concept tracker + controls
│       └── ConceptCard.tsx          # "Concept Learned!" celebration
└── types/
    └── index.ts                     # TypeScript interfaces
```

### State Management (Zustand)

The `gameStore` manages:
- **Player**: position, direction, movement state
- **Collision**: set of blocked tiles (buildings, trees, fences, boundaries)
- **Dialogue**: NPC dialogue state machine
- **Learning**: tracked DSPy concepts
- **NPC proximity**: which NPC is nearby

### DSPy Concepts Taught

| NPC | Concept | Key Teaching |
|-----|---------|-------------|
| Prof. Oak-sley | DSPy Overview | Program LMs, don't prompt them |
| Signature Sam | Signatures | Declare inputs/outputs |
| Module Maya | Modules | Predict, ChainOfThought, ReAct |
| Optimizer Ollie | Optimizers | BootstrapFewShot, MIPROv2 |
| Metric Mia | Metrics | Score outputs to guide optimization |

## Common Modifications

### Adding a New NPC
1. Add NPC definition to `frontend/src/data/npcs.ts`
2. Add collision tile for their position in `gameStore.ts:buildCollisionMap()`
3. The NPC will auto-render from the `npcs` array in `GameScene.tsx`

### Adding a New Building
1. Add `<Building>` in `World.tsx` with position, size, colors, label
2. Add collision tiles in `gameStore.ts:buildCollisionMap()`

### Modifying Town Layout
- Building positions are in `World.tsx`
- Collision map is in `gameStore.ts:buildCollisionMap()`
- NPC positions are in `data/npcs.ts`
- Keep these three in sync when moving things around

### Changing the Camera
- Camera setup is in `GameScene.tsx`
- Uses orthographic camera with zoom 45
- Camera follows player with smooth lerp

## Important Notes

- **No backend required**: This is a pure frontend game, no API calls
- **Grid-based movement**: Player moves 1 unit at a time with smooth interpolation
- **Collision system**: Uses a Set of "x,z" string keys for O(1) lookup
- **All 3D is procedural**: No external models, everything built from Three.js primitives
- **Flat shading**: All materials use flatShading for the low-poly aesthetic
