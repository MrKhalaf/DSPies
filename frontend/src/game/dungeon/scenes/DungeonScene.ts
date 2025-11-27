import Phaser from 'phaser';

type WiseId = 'v1' | 'v2' | 'v3';

interface DungeonSceneConfig {
  onHandoff: (payload: { message: string; notes: Record<WiseId, string> }) => void;
  onState: (state: {
    notesCount: number;
    nearNpc?: WiseId;
    nearOracle?: boolean;
    isMoving?: boolean;
    openDialogNpc?: WiseId;
    playerPos?: { x: number; y: number };
    currentRoom?: string;
  }) => void;
}

// Dungeon room types for variety
// Room types for potential future expansion
// type RoomType = 'entrance' | 'hallway' | 'chamber' | 'shrine';

export class DungeonScene extends Phaser.Scene {
  private cfg: DungeonSceneConfig;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key, A: Phaser.Input.Keyboard.Key, S: Phaser.Input.Keyboard.Key, D: Phaser.Input.Keyboard.Key };
  private player!: Phaser.GameObjects.Container;
  private playerSprite!: Phaser.GameObjects.Graphics;
  private playerGlow!: Phaser.GameObjects.Graphics;
  private playerVelocity = 90;
  private notes: Record<WiseId, string> = { v1: '', v2: '', v3: '' };
  private message = '';
  private tablets: Record<WiseId, Phaser.GameObjects.Container> = {} as any;
  private oracle!: Phaser.GameObjects.Container;
  private footstepTimer = 0;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private gridW = 28;
  private gridH = 18;
  private tile = 16;
  private fogOfWar!: Phaser.GameObjects.Graphics;
  private lightMask!: Phaser.GameObjects.Graphics;
  private ambientParticles: Phaser.GameObjects.Graphics[] = [];
  private torches: { sprite: Phaser.GameObjects.Container; baseY: number }[] = [];
  private playerBody!: Phaser.Physics.Arcade.Body;
  private glowTime = 0;
  private pulseTime = 0;

  constructor(cfg: DungeonSceneConfig) {
    super('DungeonScene');
    this.cfg = cfg;
  }

  preload() {
    // All textures procedurally generated - no external assets
  }

  create() {
    const tile = this.tile;
    const gridW = this.gridW;
    const gridH = this.gridH;
    
    this.cameras.main.setRoundPixels(true);
    this.physics.world.setBounds(0, 0, gridW * tile, gridH * tile);

    // Create dungeon layout
    this.createDungeonFloor();
    this.createDungeonWalls();
    this.createAtmosphericElements();
    this.createTablets();
    this.createOracle();
    this.createPlayer();
    this.createFogOfWar();
    this.createAmbientParticles();
    
    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as any;
    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.input.keyboard!.on('keydown-E', () => this.handleInteract());
    this.input.keyboard!.on('keydown-SPACE', () => this.handleInteract());
  }

  private createDungeonFloor() {
    const tile = this.tile;
    const gridW = this.gridW;
    const gridH = this.gridH;
    
    // Create varied floor tiles with subtle patterns
    for (let y = 0; y < gridH; y++) {
      for (let x = 0; x < gridW; x++) {
        const isWall = x === 0 || y === 0 || x === gridW - 1 || y === gridH - 1;
        if (isWall) continue;
        
        const gfx = this.add.graphics();
        const px = x * tile;
        const py = y * tile;
        
        // Base floor color with variation - brighter for better visibility
        const noise = Math.sin(x * 0.5) * Math.cos(y * 0.3) * 0.5 + 0.5;
        const color1 = new Phaser.Display.Color(28, 38, 58);
        const color2 = new Phaser.Display.Color(38, 50, 74);
        const baseColor = Phaser.Display.Color.Interpolate.ColorWithColor(
          color1,
          color2,
          100,
          Math.floor(noise * 100)
        );
        
        gfx.fillStyle(Phaser.Display.Color.GetColor(baseColor.r, baseColor.g, baseColor.b));
        gfx.fillRect(px, py, tile, tile);
        
        // Subtle crack patterns
        if (Math.random() > 0.85) {
          gfx.lineStyle(1, 0x0a0f1a, 0.5);
          const crackX = px + Math.random() * tile * 0.8;
          const crackY = py + Math.random() * tile * 0.8;
          gfx.lineBetween(crackX, crackY, crackX + 4 + Math.random() * 6, crackY + 2 + Math.random() * 4);
        }
        
        // Ancient rune markings on some tiles
        if (Math.random() > 0.95) {
          gfx.fillStyle(0x1a2744, 0.4);
          const runeSize = 4;
          gfx.fillCircle(px + tile/2, py + tile/2, runeSize);
        }
        
        // Tile border (very subtle)
        gfx.lineStyle(1, 0x0a0f1a, 0.3);
        gfx.strokeRect(px, py, tile, tile);
      }
    }
    
    // Create special floor patterns for key areas
    this.createOracleArea();
    this.createTabletAreas();
  }

  private createOracleArea() {
    const tile = this.tile;
    const centerX = Math.floor(this.gridW / 2);
    const centerY = 4;
    
    // Circular pattern around oracle position
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist <= 2.5) {
          const gfx = this.add.graphics();
          const px = (centerX + dx) * tile;
          const py = (centerY + dy) * tile;
          
          // Gradient from center - mystical cyan glow
          const intensity = 1 - dist / 2.5;
          const oracleColor1 = new Phaser.Display.Color(20, 28, 42);
          const oracleColor2 = new Phaser.Display.Color(20, 60, 80);
          const blendedColor = Phaser.Display.Color.Interpolate.ColorWithColor(
            oracleColor1,
            oracleColor2,
            100,
            Math.floor(intensity * 60)
          );
          
          gfx.fillStyle(Phaser.Display.Color.GetColor(blendedColor.r, blendedColor.g, blendedColor.b), 0.8);
          gfx.fillRect(px, py, tile, tile);
          
          // Concentric circle pattern
          if (dist > 0.5 && dist < 2) {
            gfx.lineStyle(1, 0x22d3ee, 0.2 * intensity);
            gfx.strokeCircle(px + tile/2, py + tile/2, 6);
          }
        }
      }
    }
  }

  private createTabletAreas() {
    const tile = this.tile;
    const positions = [
      { x: this.gridW - 5, y: 4 },
      { x: this.gridW - 5, y: 9 },
      { x: this.gridW - 5, y: 14 }
    ];
    
    positions.forEach((pos, idx) => {
      // Create mystical floor pattern under each tablet
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const gfx = this.add.graphics();
          const px = (pos.x + dx) * tile;
          const py = (pos.y + dy) * tile;
          
          const dist = Math.sqrt(dx*dx + dy*dy);
          const intensity = 1 - dist / 1.5;
          
          // Different color for each tablet
          const colors = [
            { r: 40, g: 60, b: 100 }, // Blue for v1
            { r: 100, g: 50, b: 90 }, // Purple/pink for v2
            { r: 100, g: 70, b: 30 }  // Amber for v3
          ];
          
          const color = colors[idx];
          gfx.fillStyle(Phaser.Display.Color.GetColor(
            Math.floor(color.r * intensity * 0.5 + 20),
            Math.floor(color.g * intensity * 0.5 + 24),
            Math.floor(color.b * intensity * 0.5 + 38)
          ), 0.6);
          gfx.fillRect(px, py, tile, tile);
        }
      }
    });
  }

  private createDungeonWalls() {
    const tile = this.tile;
    const gridW = this.gridW;
    const gridH = this.gridH;
    
    this.walls = this.physics.add.staticGroup();
    
    // Create wall graphics with depth
    for (let x = 0; x < gridW; x++) {
      this.createWallTile(x, 0, 'top');
      this.createWallTile(x, gridH - 1, 'bottom');
    }
    for (let y = 1; y < gridH - 1; y++) {
      this.createWallTile(0, y, 'left');
      this.createWallTile(gridW - 1, y, 'right');
    }
    
    // Physics bodies for walls
    for (let x = 0; x < gridW; x++) {
      this.walls.create(x * tile + tile/2, tile/2, undefined).setVisible(false).setSize(tile, tile);
      this.walls.create(x * tile + tile/2, (gridH - 1) * tile + tile/2, undefined).setVisible(false).setSize(tile, tile);
    }
    for (let y = 1; y < gridH - 1; y++) {
      this.walls.create(tile/2, y * tile + tile/2, undefined).setVisible(false).setSize(tile, tile);
      this.walls.create((gridW - 1) * tile + tile/2, y * tile + tile/2, undefined).setVisible(false).setSize(tile, tile);
    }
    
    // Add internal pillars for atmosphere
    const pillars = [
      { x: 5, y: 5 }, { x: 5, y: 12 },
      { x: 10, y: 8 },
      { x: 15, y: 5 }, { x: 15, y: 12 }
    ];
    
    pillars.forEach(p => {
      this.createPillar(p.x, p.y);
      this.walls.create(p.x * tile + tile/2, p.y * tile + tile/2, undefined).setVisible(false).setSize(tile, tile);
    });
  }

  private createWallTile(x: number, y: number, side: 'top' | 'bottom' | 'left' | 'right') {
    const tile = this.tile;
    const gfx = this.add.graphics();
    const px = x * tile;
    const py = y * tile;
    
    // Base wall
    gfx.fillStyle(0x0f1729);
    gfx.fillRect(px, py, tile, tile);
    
    // Stone texture
    gfx.fillStyle(0x141e33, 0.8);
    for (let i = 0; i < 3; i++) {
      const brickX = px + (i % 2) * 8;
      const brickY = py + Math.floor(i / 2) * 8;
      gfx.fillRect(brickX + 1, brickY + 1, 7, 7);
    }
    
    // Moss/age details
    if (Math.random() > 0.7) {
      gfx.fillStyle(0x1a3328, 0.5);
      gfx.fillRect(px + Math.random() * 8, py + Math.random() * 8, 4, 4);
    }
    
    // Depth shadow
    if (side === 'top') {
      gfx.fillStyle(0x000000, 0.4);
      gfx.fillRect(px, py + tile - 3, tile, 3);
    }
    if (side === 'left') {
      gfx.fillStyle(0x000000, 0.3);
      gfx.fillRect(px + tile - 2, py, 2, tile);
    }
  }

  private createPillar(x: number, y: number) {
    const tile = this.tile;
    const gfx = this.add.graphics();
    const px = x * tile;
    const py = y * tile;
    
    // Pillar base shadow
    gfx.fillStyle(0x000000, 0.4);
    gfx.fillEllipse(px + tile/2, py + tile - 2, tile - 2, 6);
    
    // Pillar body
    gfx.fillStyle(0x1a2744);
    gfx.fillRect(px + 2, py + 2, tile - 4, tile - 4);
    
    // Pillar highlight
    gfx.fillStyle(0x2a3754, 0.8);
    gfx.fillRect(px + 3, py + 3, 4, tile - 6);
    
    // Carved rune on pillar
    gfx.lineStyle(1, 0x22d3ee, 0.3);
    gfx.lineBetween(px + tile/2 - 2, py + 5, px + tile/2 + 2, py + 5);
    gfx.lineBetween(px + tile/2, py + 5, px + tile/2, py + tile - 5);
  }

  private createAtmosphericElements() {
    const tile = this.tile;
    
    // Create torches along walls
    const torchPositions = [
      { x: 3, y: 1 }, { x: 8, y: 1 }, { x: 14, y: 1 }, { x: 20, y: 1 }, { x: 25, y: 1 },
      { x: 1, y: 4 }, { x: 1, y: 9 }, { x: 1, y: 14 }
    ];
    
    torchPositions.forEach(pos => {
      const torch = this.createTorch(pos.x * tile + tile/2, pos.y * tile + tile/2);
      this.torches.push({ sprite: torch, baseY: pos.y * tile + tile/2 });
    });
  }

  private createTorch(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    // Torch bracket
    const bracket = this.add.graphics();
    bracket.fillStyle(0x5d4a34);
    bracket.fillRect(-2, -2, 4, 10);
    container.add(bracket);
    
    // Flame outer glow (large)
    const outerGlow = this.add.graphics();
    outerGlow.fillStyle(0xff6b35, 0.08);
    outerGlow.fillCircle(0, -4, 40);
    container.add(outerGlow);
    container.sendToBack(outerGlow);
    
    // Flame base
    const flameBase = this.add.graphics();
    flameBase.fillStyle(0xff6b35, 0.95);
    flameBase.fillCircle(0, -4, 4);
    container.add(flameBase);
    
    // Flame tip
    const flameTip = this.add.graphics();
    flameTip.fillStyle(0xffee00, 0.9);
    flameTip.fillCircle(0, -6, 3);
    container.add(flameTip);
    
    // Light glow
    const glow = this.add.graphics();
    glow.fillStyle(0xff9b55, 0.2);
    glow.fillCircle(0, -4, 25);
    container.add(glow);
    container.sendToBack(glow);
    
    return container;
  }

  private createTablets() {
    const tile = this.tile;
    const tabletData: Array<{ id: WiseId; x: number; y: number; name: string; shortName: string; color: number; colorHex: string }> = [
      { 
        id: 'v1', 
        x: this.gridW - 4, 
        y: 4, 
        name: 'Structure',
        shortName: 'FORMAL',
        color: 0x60a5fa,
        colorHex: '#60a5fa'
      },
      { 
        id: 'v2', 
        x: this.gridW - 4, 
        y: 9, 
        name: 'Warmth',
        shortName: 'FRIENDLY',
        color: 0xf472b6,
        colorHex: '#f472b6'
      },
      { 
        id: 'v3', 
        x: this.gridW - 4, 
        y: 14, 
        name: 'Wisdom',
        shortName: 'ANALYTICAL',
        color: 0xfbbf24,
        colorHex: '#fbbf24'
      }
    ];
    
    tabletData.forEach(({ id, x, y, name, shortName, color, colorHex }) => {
      const container = this.add.container(x * tile, y * tile);
      
      // Large ambient glow
      const ambientGlow = this.add.graphics();
      ambientGlow.fillStyle(color, 0.08);
      ambientGlow.fillCircle(tile/2, tile/2, 32);
      container.add(ambientGlow);
      container.sendToBack(ambientGlow);
      
      // Stone base shadow
      const shadow = this.add.graphics();
      shadow.fillStyle(0x000000, 0.5);
      shadow.fillEllipse(tile/2, tile + 4, tile + 6, 8);
      container.add(shadow);
      
      // Main stone tablet (taller, more visible)
      const stone = this.add.graphics();
      stone.fillStyle(0x2a3548);
      stone.fillRoundedRect(-2, -tile * 0.8, tile + 4, tile * 1.8, 4);
      // Inner border
      stone.lineStyle(1, color, 0.3);
      stone.strokeRoundedRect(-2, -tile * 0.8, tile + 4, tile * 1.8, 4);
      container.add(stone);
      
      // Glowing orb at center (larger, more prominent)
      const orbGlow = this.add.graphics();
      orbGlow.fillStyle(color, 0.2);
      orbGlow.fillCircle(tile/2, tile * 0.3, 14);
      container.add(orbGlow);
      
      const orb = this.add.graphics();
      orb.fillStyle(color, 0.9);
      orb.fillCircle(tile/2, tile * 0.3, 6);
      orb.fillStyle(0xffffff, 0.6);
      orb.fillCircle(tile/2 - 1, tile * 0.3 - 2, 2);
      container.add(orb);
      
      // Carved lines (representing inscription)
      const carving = this.add.graphics();
      carving.lineStyle(1, color, 0.4);
      carving.lineBetween(4, tile * 0.6, tile - 4, tile * 0.6);
      carving.lineBetween(6, tile * 0.7, tile - 6, tile * 0.7);
      container.add(carving);
      
      // Text label with solid background for readability
      const labelBg = this.add.graphics();
      labelBg.fillStyle(0x000000, 0.8);
      labelBg.fillRoundedRect(-8, -tile * 1.3, tile + 16, 14, 3);
      container.add(labelBg);
      
      const nameText = this.add.text(tile/2, -tile * 1.25, shortName, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '8px',
        color: colorHex,
        fontStyle: 'bold',
        align: 'center'
      }).setOrigin(0.5);
      container.add(nameText);
      
      // Ambient glow pulse
      const glowCircle = this.add.graphics();
      glowCircle.fillStyle(color, 0.1);
      glowCircle.fillCircle(tile/2, tile/2, 24);
      container.add(glowCircle);
      container.sendToBack(glowCircle);
      
      this.tablets[id] = container;
    });
  }

  private createOracle() {
    const tile = this.tile;
    const centerX = Math.floor(this.gridW / 2) * tile;
    const centerY = 4 * tile;
    
    const container = this.add.container(centerX, centerY);
    
    // Large outer glow
    const outerGlow = this.add.graphics();
    outerGlow.fillStyle(0x22d3ee, 0.06);
    outerGlow.fillCircle(0, 0, 60);
    outerGlow.fillStyle(0x22d3ee, 0.04);
    outerGlow.fillCircle(0, 0, 80);
    container.add(outerGlow);
    container.sendToBack(outerGlow);
    
    // Ancient computer base/desk
    const desk = this.add.graphics();
    desk.fillStyle(0x1a2844);
    desk.fillRoundedRect(-tile * 1.2, tile * 0.3, tile * 2.4, tile * 0.6, 2);
    // Desk legs
    desk.fillStyle(0x141e38);
    desk.fillRect(-tile, tile * 0.9, 4, 6);
    desk.fillRect(tile - 4, tile * 0.9, 4, 6);
    container.add(desk);
    
    // Main computer monitor body (ancient terminal style)
    const monitor = this.add.graphics();
    // Monitor outer frame (darker)
    monitor.fillStyle(0x1e3a5f);
    monitor.fillRoundedRect(-tile * 0.9, -tile * 1.1, tile * 1.8, tile * 1.5, 4);
    // Monitor inner bezel
    monitor.fillStyle(0x0c1929);
    monitor.fillRoundedRect(-tile * 0.75, -tile * 0.95, tile * 1.5, tile * 1.2, 3);
    container.add(monitor);
    
    // Glowing screen
    const screen = this.add.graphics();
    screen.fillStyle(0x0a1520);
    screen.fillRect(-tile * 0.6, -tile * 0.8, tile * 1.2, tile * 0.9);
    // Screen glow effect
    screen.fillStyle(0x22d3ee, 0.15);
    screen.fillRect(-tile * 0.6, -tile * 0.8, tile * 1.2, tile * 0.9);
    container.add(screen);
    
    // DSPy text on screen
    const dspyText = this.add.graphics();
    dspyText.fillStyle(0x22d3ee, 0.9);
    // D
    dspyText.fillRect(-tile * 0.45, -tile * 0.6, 2, 10);
    dspyText.fillRect(-tile * 0.45, -tile * 0.6, 5, 2);
    dspyText.fillRect(-tile * 0.45, -tile * 0.6 + 8, 5, 2);
    dspyText.fillRect(-tile * 0.45 + 4, -tile * 0.6 + 2, 2, 6);
    // S
    dspyText.fillRect(-tile * 0.25, -tile * 0.6, 6, 2);
    dspyText.fillRect(-tile * 0.25, -tile * 0.6, 2, 5);
    dspyText.fillRect(-tile * 0.25, -tile * 0.6 + 4, 6, 2);
    dspyText.fillRect(-tile * 0.25 + 4, -tile * 0.6 + 4, 2, 5);
    dspyText.fillRect(-tile * 0.25, -tile * 0.6 + 8, 6, 2);
    // P
    dspyText.fillRect(-tile * 0.02, -tile * 0.6, 2, 10);
    dspyText.fillRect(-tile * 0.02, -tile * 0.6, 6, 2);
    dspyText.fillRect(-tile * 0.02 + 4, -tile * 0.6, 2, 5);
    dspyText.fillRect(-tile * 0.02, -tile * 0.6 + 4, 6, 2);
    // y
    dspyText.fillRect(tile * 0.22, -tile * 0.6 + 2, 2, 3);
    dspyText.fillRect(tile * 0.22 + 4, -tile * 0.6 + 2, 2, 3);
    dspyText.fillRect(tile * 0.22 + 2, -tile * 0.6 + 4, 3, 2);
    dspyText.fillRect(tile * 0.22 + 3, -tile * 0.6 + 6, 2, 4);
    container.add(dspyText);
    
    // Blinking cursor on screen
    const cursor = this.add.graphics();
    cursor.fillStyle(0x22d3ee, 0.8);
    cursor.fillRect(tile * 0.4, -tile * 0.6, 3, 8);
    container.add(cursor);
    
    // Scanlines effect on screen
    const scanlines = this.add.graphics();
    scanlines.lineStyle(1, 0x000000, 0.15);
    for (let i = 0; i < 10; i++) {
      scanlines.lineBetween(-tile * 0.6, -tile * 0.8 + i * 3, tile * 0.6, -tile * 0.8 + i * 3);
    }
    container.add(scanlines);
    
    // Control panel / keyboard area
    const keyboard = this.add.graphics();
    keyboard.fillStyle(0x1e3a5f);
    keyboard.fillRoundedRect(-tile * 0.7, tile * 0.05, tile * 1.4, tile * 0.25, 2);
    // Keys
    keyboard.fillStyle(0x2a4a70);
    for (let i = 0; i < 7; i++) {
      keyboard.fillRect(-tile * 0.55 + i * 5, tile * 0.1, 4, 3);
      keyboard.fillRect(-tile * 0.55 + i * 5 + 1, tile * 0.17, 3, 3);
    }
    container.add(keyboard);
    
    // Indicator lights
    const lights = this.add.graphics();
    lights.fillStyle(0x22d3ee, 0.9);
    lights.fillCircle(-tile * 0.65, -tile * 1.0, 2);
    lights.fillStyle(0x4ade80, 0.8);
    lights.fillCircle(-tile * 0.55, -tile * 1.0, 2);
    container.add(lights);
    
    // Title label with background for readability
    const labelBg = this.add.graphics();
    labelBg.fillStyle(0x000000, 0.7);
    labelBg.fillRoundedRect(-30, -tile * 2.0, 60, 12, 3);
    container.add(labelBg);
    
    const title = this.add.text(0, -tile * 1.95, 'DSPy ORACLE', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '8px',
      color: '#67e8f9',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);
    container.add(title);
    
    const subtitleBg = this.add.graphics();
    subtitleBg.fillStyle(0x000000, 0.6);
    subtitleBg.fillRoundedRect(-35, -tile * 1.55, 70, 10, 2);
    container.add(subtitleBg);
    
    const subtitle = this.add.text(0, -tile * 1.5, 'Gather 3 wisdoms', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '6px',
      color: '#22d3ee',
      align: 'center'
    }).setOrigin(0.5);
    container.add(subtitle);
    
    this.oracle = container;
  }

  private createPlayer() {
    const tile = this.tile;
    const startX = 3 * tile;
    const startY = (this.gridH - 3) * tile;
    
    this.player = this.add.container(startX, startY);
    
    // Player shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.4);
    shadow.fillEllipse(tile/2, tile + 1, tile - 4, 4);
    this.player.add(shadow);
    
    // Player outer glow (for visibility)
    const outerGlow = this.add.graphics();
    outerGlow.fillStyle(0x2dd4bf, 0.1);
    outerGlow.fillCircle(tile/2, tile/2, 24);
    this.player.add(outerGlow);
    
    // Player glow (for visibility)
    this.playerGlow = this.add.graphics();
    this.playerGlow.fillStyle(0x2dd4bf, 0.25);
    this.playerGlow.fillCircle(tile/2, tile/2, 14);
    this.player.add(this.playerGlow);
    
    // Player body (simple but distinctive)
    this.playerSprite = this.add.graphics();
    // Body with border
    this.playerSprite.lineStyle(1, 0x5eead4, 0.8);
    this.playerSprite.fillStyle(0x2dd4bf);
    this.playerSprite.fillRoundedRect(2, 2, tile - 4, tile - 4, 3);
    this.playerSprite.strokeRoundedRect(2, 2, tile - 4, tile - 4, 3);
    // Inner highlight
    this.playerSprite.fillStyle(0x5eead4, 0.8);
    this.playerSprite.fillRect(4, 4, 4, 6);
    // Eyes
    this.playerSprite.fillStyle(0xffffff);
    this.playerSprite.fillRect(5, 5, 2, 2);
    this.playerSprite.fillRect(9, 5, 2, 2);
    this.player.add(this.playerSprite);
    
    // Make player physics body
    this.physics.world.enable(this.player);
    this.playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    this.playerBody.setCollideWorldBounds(true);
    this.playerBody.setSize(tile - 4, tile - 4);
    this.playerBody.setOffset(2, 2);
    
    // Collision with walls
    this.physics.add.collider(this.player, this.walls);
  }

  private createFogOfWar() {
    // Create atmospheric vignette effect
    this.fogOfWar = this.add.graphics();
    this.fogOfWar.setDepth(100);
  }

  private createAmbientParticles() {
    // Floating dust/motes
    for (let i = 0; i < 20; i++) {
      const particle = this.add.graphics();
      particle.fillStyle(0x67e8f9, 0.3 + Math.random() * 0.3);
      particle.fillCircle(0, 0, 1 + Math.random());
      particle.x = Math.random() * this.gridW * this.tile;
      particle.y = Math.random() * this.gridH * this.tile;
      (particle as any).floatSpeed = 0.2 + Math.random() * 0.3;
      (particle as any).floatPhase = Math.random() * Math.PI * 2;
      this.ambientParticles.push(particle);
    }
  }

  update(time: number, delta: number) {
    const speed = this.playerVelocity;
    let vx = 0, vy = 0;
    
    const left = this.cursors.left?.isDown || this.wasd?.A?.isDown;
    const right = this.cursors.right?.isDown || this.wasd?.D?.isDown;
    const up = this.cursors.up?.isDown || this.wasd?.W?.isDown;
    const down = this.cursors.down?.isDown || this.wasd?.S?.isDown;
    
    if (left) vx = -speed;
    else if (right) vx = speed;
    if (up) vy = -speed;
    else if (down) vy = speed;
    
    // Normalize diagonal movement
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    const isMoving = vx !== 0 || vy !== 0;
    this.playerBody.setVelocity(vx, vy);

    // Footstep sounds
    if (isMoving) {
      this.footstepTimer += delta;
      if (this.footstepTimer > 180) {
        this.footstepTimer = 0;
        this.playFootstep();
      }
    } else {
      this.footstepTimer = 0;
    }

    // Update visual effects
    this.updateVisualEffects(time, delta);
    this.updateFogOfWar();
    this.updateAmbientParticles(time);
    
    // Proximity detection
    const nearNpc = (['v1', 'v2', 'v3'] as WiseId[]).find(id => this.distToContainer(this.tablets[id]) < 28);
    const nearOracle = this.distToContainer(this.oracle) < 36;
    
    this.cfg.onState({
      notesCount: Object.values(this.notes).filter(n => n.trim().length > 0).length,
      nearNpc,
      nearOracle,
      isMoving,
      playerPos: { x: this.player.x, y: this.player.y }
    });
  }

  private updateVisualEffects(time: number, delta: number) {
    this.glowTime += delta * 0.003;
    this.pulseTime += delta * 0.002;
    
    // Pulse player glow
    const pulseIntensity = 0.15 + Math.sin(this.pulseTime) * 0.05;
    this.playerGlow.clear();
    this.playerGlow.fillStyle(0x2dd4bf, pulseIntensity);
    this.playerGlow.fillCircle(this.tile/2, this.tile/2, 12 + Math.sin(this.pulseTime) * 2);
    
    // Animate torch flames
    this.torches.forEach((torch, idx) => {
      const flicker = Math.sin(time * 0.01 + idx) * 0.5 + Math.random() * 0.3;
      torch.sprite.setScale(1 + flicker * 0.1);
    });
  }

  private updateFogOfWar() {
    this.fogOfWar.clear();
    
    // Create subtle vignette effect centered on player
    const px = this.player.x + this.tile/2;
    const py = this.player.y + this.tile/2;
    
    // Very subtle corner shadows only
    const corners = [
      { x: 0, y: 0 },
      { x: this.gridW * this.tile, y: 0 },
      { x: 0, y: this.gridH * this.tile },
      { x: this.gridW * this.tile, y: this.gridH * this.tile }
    ];
    
    corners.forEach(corner => {
      const dist = Math.sqrt((px - corner.x) ** 2 + (py - corner.y) ** 2);
      const shadowSize = 80;
      const alpha = Math.max(0, 0.3 - dist / 500);
      this.fogOfWar.fillStyle(0x000000, alpha);
      this.fogOfWar.fillCircle(corner.x, corner.y, shadowSize);
    });
  }

  private updateAmbientParticles(time: number) {
    this.ambientParticles.forEach(particle => {
      const speed = (particle as any).floatSpeed;
      const phase = (particle as any).floatPhase;
      particle.y -= speed;
      particle.x += Math.sin(time * 0.001 + phase) * 0.2;
      
      // Wrap around
      if (particle.y < 0) {
        particle.y = this.gridH * this.tile;
        particle.x = Math.random() * this.gridW * this.tile;
      }
    });
  }

  private handleInteract() {
    const nearNpc = (['v1', 'v2', 'v3'] as WiseId[]).find(id => this.distToContainer(this.tablets[id]) < 28);
    if (nearNpc) {
      this.cfg.onState({
        notesCount: Object.values(this.notes).filter(n => n.trim().length > 0).length,
        openDialogNpc: nearNpc
      });
      return;
    }
    
    const nearOracle = this.distToContainer(this.oracle) < 36;
    if (nearOracle) {
      const filled = Object.values(this.notes).filter(n => n.trim().length > 0).length;
      if (filled === 3) {
        this.cfg.onHandoff({ message: this.message, notes: this.notes });
      } else {
        this.cfg.onState({
          notesCount: filled,
          nearOracle: true
        });
      }
    }
  }

  private distToContainer(container: Phaser.GameObjects.Container) {
    const dx = container.x + this.tile/2 - (this.player.x + this.tile/2);
    const dy = container.y + this.tile/2 - (this.player.y + this.tile/2);
    return Math.sqrt(dx * dx + dy * dy);
  }

  private playFootstep() {
    const webCtx = (this.sound as any)?.context as (AudioContext | undefined);
    if (!webCtx) return;
    
    const osc = webCtx.createOscillator();
    const gain = webCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 80 + Math.random() * 30;
    gain.gain.value = 0.03;
    gain.gain.exponentialRampToValueAtTime(0.001, webCtx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(webCtx.destination);
    osc.start();
    setTimeout(() => {
      try { osc.stop(); } catch {}
      try { osc.disconnect(); } catch {}
      try { gain.disconnect(); } catch {}
    }, 80);
  }

  // Public API
  public setNote(id: WiseId, text: string) {
    this.notes[id] = text.trim();
    
    // Visual feedback - pulse the tablet
    const tablet = this.tablets[id];
    if (tablet) {
      this.tweens.add({
        targets: tablet,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 150,
        yoyo: true,
        ease: 'Power2'
      });
    }
    
    this.cfg.onState({
      notesCount: Object.values(this.notes).filter(n => n.trim().length > 0).length
    });
  }
  
  public setMessage(text: string) {
    this.message = text;
  }
}
