import { useState } from 'react';

export enum Scene {
    ENTRANCE = 'entrance',
    NEXUS = 'nexus',
    ARCHIVE = 'archive',
    REFINERY = 'refinery',
    SANCTUM = 'sanctum',
    CORE = 'core'
}

export enum TileType {
    FLOOR = 0,
    WALL = 1,
    DOOR = 2,
    TERMINAL = 3
}

export interface NPC {
    id: string;
    x: number;
    y: number;
    name: string;
    sprite: string;
    dialogue: string[];
    portrait?: string;
    wisdom?: string;
    type?: 'elder' | 'computer' | 'guide';
}

export interface Exit {
    x: number;
    y: number;
    targetScene: Scene;
    targetX: number;
    targetY: number;
}

export interface SceneData {
    id: Scene;
    name: string;
    width: number;
    height: number;
    map: TileType[][];
    npcs: NPC[];
    exits: Exit[];
}

// Helper to create a simple room map
const createRoomMap = (width: number, height: number, doors: { x: number, y: number }[] = []): TileType[][] => {
    const map: TileType[][] = [];
    for (let y = 0; y < height; y++) {
        map[y] = [];
        for (let x = 0; x < width; x++) {
            if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                map[y][x] = TileType.WALL;
            } else {
                map[y][x] = TileType.FLOOR;
            }
        }
    }
    // Add doors
    doors.forEach(door => {
        if (map[door.y] && map[door.y][door.x] !== undefined) {
            map[door.y][door.x] = TileType.DOOR;
        }
    });
    return map;
};

// --- SCENE DEFINITIONS ---

// 1. THE NEXUS (Central Hub)
const nexusMap = createRoomMap(15, 11, [
    { x: 7, y: 0 }, // To Core (Top)
    { x: 0, y: 5 }, // To Archive (Left)
    { x: 14, y: 5 }, // To Sanctum (Right)
    { x: 7, y: 10 } // To Refinery (Bottom) - wait, Refinery is center? 
    // Let's follow the design doc:
    // Archive (Left), Refinery (Center/Bottom?), Sanctum (Right)
    // Core (Top)
    // Entrance (Bottom)
]);

// Adjusting Nexus layout:
// Top: Core
// Left: Archive
// Right: Sanctum
// Bottom: Entrance (start)
// Center-ish: Refinery? Or maybe Refinery is a separate room?
// Design doc says: Nexus -> Archive (Left), Refinery (Center), Sanctum (Right).
// Let's put Refinery door at the top-center, but below the Core door? Or maybe 3 doors on top wall?
// Let's do:
// Left Wall: Archive
// Right Wall: Sanctum
// Top Wall: Refinery
// Bottom Wall: Entrance
// The Core will be accessible after completing all 3, maybe via a central elevator or the Refinery leads to it?
// Design doc: "Nexus ... three open pathways ... locked massive door (The Core)"
// Let's put Core North, Archive West, Sanctum East, Refinery South (where we came from? No, Entrance is South).
// Let's put Refinery North-West or something.
// Actually, let's stick to a simple cross:
// North: Core
// West: Archive
// East: Sanctum
// South: Entrance
// Where is Refinery? Maybe "Center" meant the hub itself is the refinery? No.
// Let's put Refinery at (4, 0) and Core at (7, 0) and Sanctum at (10, 0)?
// Or:
// West Wall (0, 5): Archive
// East Wall (14, 5): Sanctum
// Top Wall (7, 0): Core
// Bottom Wall (7, 10): Entrance
// Where is Mipro (Refinery)? Maybe inside the Nexus? Or a door at (3, 0)?
// Let's put Refinery door at (3, 0) and Core at (7, 0) and Sanctum door at (11, 0)?
// Wait, Sanctum is Right.
// Let's do:
// Archive: Left (0, 5)
// Sanctum: Right (14, 5)
// Refinery: Top-Left (3, 0)
// Core: Top-Center (7, 0) - Locked initially
// Entrance: Bottom (7, 10)

const NEXUS: SceneData = {
    id: Scene.NEXUS,
    name: 'The Nexus',
    width: 15,
    height: 11,
    map: createRoomMap(15, 11, [
        { x: 0, y: 5 }, // Archive
        { x: 14, y: 5 }, // Sanctum
        { x: 3, y: 0 }, // Refinery
        { x: 7, y: 0 }, // Core
        { x: 7, y: 10 } // Entrance
    ]),
    npcs: [
        {
            id: 'epoch',
            x: 7,
            y: 5,
            name: 'Epoch',
            sprite: 'epoch',
            type: 'guide',
            portrait: 'epoch',
            dialogue: [
                'Welcome to the Nexus, Optimizer.',
                'This is the central hub of the DSPy Proving Grounds.',
                'To unlock the Core (North), you must gather wisdom from the three Masters.',
                'Master Bootstrap is in the Archive (West).',
                'Master Mipro is in the Refinery (North-West).',
                'Master Bayes is in the Sanctum (East).',
                'Good luck.'
            ]
        }
    ],
    exits: [
        { x: 0, y: 5, targetScene: Scene.ARCHIVE, targetX: 13, targetY: 5 },
        { x: 14, y: 5, targetScene: Scene.SANCTUM, targetX: 1, targetY: 5 },
        { x: 3, y: 0, targetScene: Scene.REFINERY, targetX: 7, targetY: 9 },
        { x: 7, y: 0, targetScene: Scene.CORE, targetX: 7, targetY: 9 },
        // Entrance just loops back to start of Nexus for now or could be a separate scene
        { x: 7, y: 10, targetScene: Scene.ENTRANCE, targetX: 7, targetY: 5 }
    ]
};

// 2. ARCHIVE (Master Bootstrap)
const ARCHIVE: SceneData = {
    id: Scene.ARCHIVE,
    name: 'Archive of Examples',
    width: 15,
    height: 11,
    map: createRoomMap(15, 11, [{ x: 14, y: 5 }]), // Exit East back to Nexus
    npcs: [
        {
            id: 'elder_bootstrap',
            x: 2,
            y: 5,
            name: 'Master Bootstrap',
            sprite: 'elder_bootstrap',
            type: 'elder',
            portrait: 'bootstrap',
            wisdom: 'BootstrapFewShot',
            dialogue: [
                'Welcome to the Archive.',
                'I am Master Bootstrap. I learn from the past.',
                'My technique uses successful examples to guide the model.',
                'Collect good examples, and the path becomes clear.',
                '*You have learned the way of BootstrapFewShot*'
            ]
        }
    ],
    exits: [
        { x: 14, y: 5, targetScene: Scene.NEXUS, targetX: 1, targetY: 5 }
    ]
};

// 3. REFINERY (Master Mipro)
const REFINERY: SceneData = {
    id: Scene.REFINERY,
    name: 'Hall of Refinement',
    width: 15,
    height: 11,
    map: createRoomMap(15, 11, [{ x: 7, y: 10 }]), // Exit South back to Nexus
    npcs: [
        {
            id: 'elder_mipro',
            x: 7,
            y: 2,
            name: 'Master Mipro',
            sprite: 'elder_mipro',
            type: 'elder',
            portrait: 'mipro',
            wisdom: 'MIPRO',
            dialogue: [
                'This is the Refinery!',
                'I am Master Mipro. We test everything here!',
                'Instructions, examples... we generate variants and score them.',
                'Only the best survive the optimization process!',
                '*You have learned the way of MIPRO*'
            ]
        }
    ],
    exits: [
        { x: 7, y: 10, targetScene: Scene.NEXUS, targetX: 3, targetY: 1 }
    ]
};

// 4. SANCTUM (Master Bayes)
const SANCTUM: SceneData = {
    id: Scene.SANCTUM,
    name: 'Sanctum of Probability',
    width: 15,
    height: 11,
    map: createRoomMap(15, 11, [{ x: 0, y: 5 }]), // Exit West back to Nexus
    npcs: [
        {
            id: 'elder_bayes',
            x: 12,
            y: 5,
            name: 'Master Bayes',
            sprite: 'elder_bayes',
            type: 'elder',
            portrait: 'bayes',
            wisdom: 'BayesianOptimization',
            dialogue: [
                'Enter the void...',
                'I am Master Bayes. I see the unseen connections.',
                'We do not guess. We model the probability of success.',
                'Let the data guide your search through the infinite.',
                '*You have learned the way of Bayesian Optimization*'
            ]
        }
    ],
    exits: [
        { x: 0, y: 5, targetScene: Scene.NEXUS, targetX: 13, targetY: 5 }
    ]
};

// 5. CORE (Final Trial)
const CORE: SceneData = {
    id: Scene.CORE,
    name: 'The Core',
    width: 15,
    height: 11,
    map: createRoomMap(15, 11, [{ x: 7, y: 10 }]), // Exit South back to Nexus
    npcs: [
        {
            id: 'core_terminal',
            x: 7,
            y: 2,
            name: 'DSPy Core Terminal',
            sprite: 'computer',
            type: 'computer',
            portrait: 'epoch', // Using Epoch for terminal for now
            dialogue: [
                'DSPy CORE SYSTEM ONLINE.',
                'Insert the three Wisdom Keys to begin Final Optimization.',
                '...'
            ]
        }
    ],
    exits: [
        { x: 7, y: 10, targetScene: Scene.NEXUS, targetX: 7, targetY: 1 }
    ]
};

// 6. ENTRANCE (Start)
const ENTRANCE: SceneData = {
    id: Scene.ENTRANCE,
    name: 'Entrance',
    width: 15,
    height: 11,
    map: createRoomMap(15, 11, [{ x: 7, y: 0 }]), // Exit North to Nexus
    npcs: [],
    exits: [
        { x: 7, y: 0, targetScene: Scene.NEXUS, targetX: 7, targetY: 9 }
    ]
};

export const SCENES: Record<Scene, SceneData> = {
    [Scene.ENTRANCE]: ENTRANCE,
    [Scene.NEXUS]: NEXUS,
    [Scene.ARCHIVE]: ARCHIVE,
    [Scene.REFINERY]: REFINERY,
    [Scene.SANCTUM]: SANCTUM,
    [Scene.CORE]: CORE
};
