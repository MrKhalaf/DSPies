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
  }) => void;
}

export class DungeonScene extends Phaser.Scene {
  private cfg: DungeonSceneConfig;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyE!: Phaser.Input.Keyboard.Key;
  private wasd!: { W: Phaser.Input.Keyboard.Key, A: Phaser.Input.Keyboard.Key, S: Phaser.Input.Keyboard.Key, D: Phaser.Input.Keyboard.Key };
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerVelocity = 60;
  private notes: Record<WiseId, string> = { v1: '', v2: '', v3: '' };
  private message = '';
  private npcs: Record<WiseId, Phaser.GameObjects.Sprite> = {} as any;
  private oracle!: Phaser.GameObjects.Sprite;
  private footstepTimer = 0;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private gridW = 20;
  private gridH = 12;
  private tile = 16;

  constructor(cfg: DungeonSceneConfig) {
    super('DungeonScene');
    this.cfg = cfg;
  }

  preload() {
    // Procedurally generate textures to avoid external binary assets for now
    this.createRectTexture('floorA', 16, 16, 0x0b1020);
    this.createRectTexture('floorB', 16, 16, 0x0d1326);
    this.createRectTexture('wall', 16, 16, 0x0a0f1e);
    this.createRectTexture('bench', 16, 16, 0x243b63);
    this.createRectTexture('player', 16, 16, 0x2dd4bf);
    this.createRectTexture('npc1', 16, 16, 0x60a5fa);
    this.createRectTexture('npc2', 16, 16, 0xf472b6);
    this.createRectTexture('npc3', 16, 16, 0xf59e0b);
    this.createRectTexture('oracle', 16, 16, 0x22d3ee);
    this.createRectTexture('indicator', 4, 4, 0xfacc15);
  }

  create() {
    const tile = this.tile;
    const gridW = this.gridW;
    const gridH = this.gridH;
    this.cameras.main.setRoundPixels(true);
    this.physics.world.setBounds(0, 0, gridW * tile, gridH * tile);

    // Build simple room
    for (let y = 0; y < gridH; y++) {
      for (let x = 0; x < gridW; x++) {
        const isWall = x === 0 || y === 0 || x === gridW - 1 || y === gridH - 1;
        const tex = isWall ? 'wall' : ((x + y) % 2 === 0 ? 'floorA' : 'floorB');
        this.add.image(x * tile + tile / 2, y * tile + tile / 2, tex).setOrigin(0.5).setScale(1);
      }
    }

    // Static walls for collision
    this.walls = this.physics.add.staticGroup();
    for (let x = 0; x < gridW; x++) {
      this.walls.create(x * tile + tile / 2, tile / 2, 'wall').setVisible(false);
      this.walls.create(x * tile + tile / 2, (gridH - 1) * tile + tile / 2, 'wall').setVisible(false);
    }
    for (let y = 1; y < gridH - 1; y++) {
      this.walls.create(tile / 2, y * tile + tile / 2, 'wall').setVisible(false);
      this.walls.create((gridW - 1) * tile + tile / 2, y * tile + tile / 2, 'wall').setVisible(false);
    }

    // Oracle dais
    const ox = Math.floor(gridW / 2);
    const oy = 2;
    this.oracle = this.add.sprite(ox * tile + tile / 2, oy * tile + tile / 2, 'oracle').setOrigin(0.5);

    // Mimbars along right wall
    const rows: Array<{ id: WiseId; y: number; tex: string }> = [
      { id: 'v1', y: 3, tex: 'npc1' },
      { id: 'v2', y: 6, tex: 'npc2' },
      { id: 'v3', y: 9, tex: 'npc3' }
    ];
    rows.forEach(({ id, y, tex }) => {
      this.add.image((gridW - 2) * tile + tile / 2, (y - 1) * tile + tile / 2, 'wall');
      this.add.image((gridW - 3) * tile + tile / 2, y * tile + tile / 2, 'bench');
      this.npcs[id] = this.add.sprite((gridW - 2) * tile + tile / 2, y * tile + tile / 2, tex).setOrigin(0.5);
      this.add.text((gridW - 5) * tile, (y - 1.7) * tile, this.getWiseName(id), {
        fontFamily: 'monospace',
        fontSize: '6px',
        color: '#cbd5e1'
      });
      this.add.text((gridW - 5) * tile, (y - 1.0) * tile, `"${this.getWiseHint(id)}"`, {
        fontFamily: 'monospace',
        fontSize: '6px',
        color: '#94a3b8'
      });
    });

    // Player
    this.player = this.physics.add.sprite(2 * tile + tile / 2, 9 * tile + tile / 2, 'player').setOrigin(0.5);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.walls);
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keyE = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as any;

    // Interaction
    this.input.keyboard!.on('keydown-E', () => this.handleInteract());
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

    const isMoving = vx !== 0 || vy !== 0;
    this.player.setVelocity(vx, vy);

    // Footstep cadence (synthetic)
    if (isMoving) {
      this.footstepTimer += delta;
      if (this.footstepTimer > 220) {
        this.footstepTimer = 0;
        this.playFootstep();
      }
    } else {
      this.footstepTimer = 0;
    }

    // Proximity
    const nearNpc = (['v1', 'v2', 'v3'] as WiseId[]).find(id => this.distTo(this.npcs[id]) < 18);
    const nearOracle = this.distTo(this.oracle) < 18;
    this.cfg.onState({
      notesCount: Object.values(this.notes).filter(n => n.trim().length > 0).length,
      nearNpc,
      nearOracle,
      isMoving
    });
  }

  private handleInteract() {
    const nearNpc = (['v1', 'v2', 'v3'] as WiseId[]).find(id => this.distTo(this.npcs[id]) < 18);
    if (nearNpc) {
      this.cfg.onState({
        notesCount: Object.values(this.notes).filter(n => n.trim().length > 0).length,
        openDialogNpc: nearNpc
      });
      return;
    }
    const nearOracle = this.distTo(this.oracle) < 18;
    if (nearOracle) {
      const filled = Object.values(this.notes).filter(n => n.trim().length > 0).length;
      if (filled === 3) {
        this.cfg.onHandoff({ message: this.message, notes: this.notes });
      } else {
        // Soft prompt via state; no blocking alert
        this.cfg.onState({
          notesCount: filled,
          nearOracle: true
        });
      }
    }
  }

  private distTo(obj: Phaser.GameObjects.Sprite) {
    const dx = obj.x - this.player.x;
    const dy = obj.y - this.player.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getWiseName(id: WiseId) {
    return id === 'v1' ? 'Formal Sentinel' : id === 'v2' ? 'Friendly Oracle' : 'Analytical Sage';
  }
  private getWiseHint(id: WiseId) {
    return id === 'v1' ? 'Structure it clearly.' : id === 'v2' ? 'Make it approachable.' : 'Focus on accuracy.';
  }

  private createRectTexture(key: string, w: number, h: number, color: number) {
    const rt = this.make.renderTexture({ width: w, height: h }, false);
    rt.fill(color, 1, 0, 0, w, h);
    rt.saveTexture(key);
    rt.destroy();
  }

  // Simple synthesized footstep using WebAudio
  private playFootstep() {
    const webCtx = (this.sound as any)?.context as (AudioContext | undefined);
    if (!webCtx) {
      // NoAudio or HTML5Audio: skip synthesized footstep
      return;
    }
    const osc = webCtx.createOscillator();
    const gain = webCtx.createGain();
    osc.type = 'square';
    osc.frequency.value = 220 + Math.random() * 40;
    gain.gain.value = 0.05;
    osc.connect(gain);
    gain.connect(webCtx.destination);
    osc.start();
    setTimeout(() => {
      try { osc.stop(); } catch {}
      try { osc.disconnect(); } catch {}
      try { gain.disconnect(); } catch {}
    }, 60);
  }

  // Public API for React bridge
  public setNote(id: WiseId, text: string) {
    this.notes[id] = text.trim();
    this.cfg.onState({
      notesCount: Object.values(this.notes).filter(n => n.trim().length > 0).length
    });
  }
  public setMessage(text: string) {
    this.message = text;
  }
}


