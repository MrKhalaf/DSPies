import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface VibrantCaveSceneProps {
  onHandoff: (payload: { message: string; notes: Record<'v1' | 'v2' | 'v3', string> }) => void;
}

type WiseId = 'v1' | 'v2' | 'v3';

interface Entity {
  x: number;
  y: number;
}

const GRID_WIDTH = 18;
const GRID_HEIGHT = 12;
const TILE_PX = 48;

const WISE_INFO: Record<WiseId, { name: string; hint: string }> = {
  v1: { name: 'Formal Sentinel', hint: 'Structure it clearly.' },
  v2: { name: 'Friendly Oracle', hint: 'Make it approachable.' },
  v3: { name: 'Analytical Sage', hint: 'Focus on accuracy.' }
};

function isAdjacent(a: Entity, b: Entity): boolean {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  return (dx + dy) === 1;
}

const VibrantCaveScene: React.FC<VibrantCaveSceneProps> = ({ onHandoff }) => {
  const [player, setPlayer] = useState<Entity>({ x: 2, y: 8 });
  const [message, setMessage] = useState('');
  const [notes, setNotes] = useState<Record<WiseId, string>>({ v1: '', v2: '', v3: '' });
  const [talkingTo, setTalkingTo] = useState<WiseId | null>(null);
  const [tempNote, setTempNote] = useState('');

  const wizards: Record<WiseId, Entity> = useMemo(() => ({
    v1: { x: GRID_WIDTH - 3, y: 3 },
    v2: { x: GRID_WIDTH - 3, y: 6 },
    v3: { x: GRID_WIDTH - 3, y: 9 }
  }), []);

  const oracle: Entity = useMemo(() => ({ x: Math.floor(GRID_WIDTH / 2), y: 2 }), []);

  const filled = Object.values(notes).filter(n => n.trim().length > 0).length;
  const canHandoff = filled === 3;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  type Tile = 'F' | 'W' | 'B' | 'D'; // Floor, Wall, Bench (mimbar), Dais (oracle area)

  const map: Tile[][] = useMemo(() => {
    const m: Tile[][] = Array.from({ length: GRID_HEIGHT }, () =>
      Array.from({ length: GRID_WIDTH }, () => 'F')
    );
    // Outer walls
    for (let x = 0; x < GRID_WIDTH; x++) {
      m[0][x] = 'W';
      m[GRID_HEIGHT - 1][x] = 'W';
    }
    for (let y = 0; y < GRID_HEIGHT; y++) {
      m[y][0] = 'W';
      m[y][GRID_WIDTH - 1] = 'W';
    }
    // Oracle dais (platform near the back)
    for (let y = 1; y <= 2; y++) {
      for (let x = Math.floor(GRID_WIDTH / 2) - 2; x <= Math.floor(GRID_WIDTH / 2) + 2; x++) {
        m[y][x] = 'D';
      }
    }
    // Three mimbars along right wall: a wall block behind and a bench in front
    const alcoveXs = GRID_WIDTH - 2;
    const rows = [3, 6, 9] as const;
    rows.forEach((row) => {
      m[row - 1][alcoveXs] = 'W';      // back wall
      m[row][alcoveXs - 1] = 'B';      // bench
    });
    return m;
  }, []);

  const isWalkable = useCallback((x: number, y: number) => {
    if (x < 0 || y < 0 || x >= GRID_WIDTH || y >= GRID_HEIGHT) return false;
    const t = map[y][x];
    return t === 'F' || t === 'D';
  }, [map]);

  const move = useCallback((dx: number, dy: number) => {
    setPlayer(prev => {
      const nx = Math.min(Math.max(prev.x + dx, 0), GRID_WIDTH - 1);
      const ny = Math.min(Math.max(prev.y + dy, 0), GRID_HEIGHT - 1);
      if (!isWalkable(nx, ny)) return prev;
      return { x: nx, y: ny };
    });
  }, [isWalkable]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (talkingTo) {
        // In dialog; allow Esc to close
        if (e.key === 'Escape') {
          setTalkingTo(null);
        }
        return;
      }
      if (['ArrowUp', 'w', 'W'].includes(e.key)) {
        e.preventDefault();
        move(0, -1);
      } else if (['ArrowDown', 's', 'S'].includes(e.key)) {
        e.preventDefault();
        move(0, 1);
      } else if (['ArrowLeft', 'a', 'A'].includes(e.key)) {
        e.preventDefault();
        move(-1, 0);
      } else if (['ArrowRight', 'd', 'D'].includes(e.key)) {
        e.preventDefault();
        move(1, 0);
      } else if (e.key === 'e' || e.key === 'E' || e.key === ' ') {
        e.preventDefault();
        // Interact with nearest
        const nearWise = (Object.keys(wizards) as WiseId[]).find(id => isAdjacent(player, wizards[id]));
        if (nearWise) {
          setTalkingTo(nearWise);
          setTempNote(notes[nearWise]);
          return;
        }
        if (canHandoff && isAdjacent(player, oracle)) {
          onHandoff({ message, notes });
        }
      }
    };
    window.addEventListener('keydown', onKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', onKeyDown as any);
  }, [move, player, wizards, oracle, canHandoff, message, notes, talkingTo, onHandoff]);

  const saveNote = () => {
    if (!talkingTo) return;
    const note = tempNote.trim();
    if (!note) return;
    setNotes(prev => ({ ...prev, [talkingTo]: note }));
    setTalkingTo(null);
  };

  // Canvas renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = GRID_WIDTH * TILE_PX;
    canvas.height = GRID_HEIGHT * TILE_PX;

    const drawTile = (x: number, y: number, type: Tile) => {
      const px = x * TILE_PX;
      const py = y * TILE_PX;
      if (type === 'F') {
        ctx.fillStyle = (x + y) % 2 === 0 ? '#0b1020' : '#0d1326';
        ctx.fillRect(px, py, TILE_PX, TILE_PX);
        ctx.strokeStyle = 'rgba(59,130,246,0.12)';
        ctx.strokeRect(px + 0.5, py + 0.5, TILE_PX - 1, TILE_PX - 1);
      } else if (type === 'W') {
        const grad = ctx.createLinearGradient(px, py, px, py + TILE_PX);
        grad.addColorStop(0, '#0a0f1e');
        grad.addColorStop(1, '#0a0c18');
        ctx.fillStyle = grad;
        ctx.fillRect(px, py, TILE_PX, TILE_PX);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
        ctx.strokeRect(px + 0.5, py + 0.5, TILE_PX - 1, TILE_PX - 1);
      } else if (type === 'B') {
        ctx.fillStyle = '#1c2a40';
        ctx.fillRect(px, py, TILE_PX, TILE_PX);
        ctx.fillStyle = '#243b63';
        ctx.fillRect(px + 6, py + 8, TILE_PX - 12, TILE_PX - 16);
      } else if (type === 'D') {
        const grad = ctx.createRadialGradient(px + TILE_PX / 2, py + TILE_PX / 2, 6, px + TILE_PX / 2, py + TILE_PX / 2, TILE_PX / 1.2);
        grad.addColorStop(0, '#14233d');
        grad.addColorStop(1, '#0d1426');
        ctx.fillStyle = grad;
        ctx.fillRect(px, py, TILE_PX, TILE_PX);
        ctx.strokeStyle = 'rgba(250,204,21,0.25)';
        ctx.strokeRect(px + 0.5, py + 0.5, TILE_PX - 1, TILE_PX - 1);
      }
    };

    // Clear and background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const vignette = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 1.1);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Tiles
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        drawTile(x, y, map[y][x]);
      }
    }

    // Oracle sprite
    const drawOracle = () => {
      const px = oracle.x * TILE_PX + TILE_PX / 2;
      const py = oracle.y * TILE_PX + TILE_PX / 2;
      ctx.fillStyle = '#0b1530';
      ctx.beginPath();
      ctx.arc(px, py, 10, 0, Math.PI * 2);
      ctx.fill();
      const glow = ctx.createRadialGradient(px, py, 0, px, py, 34);
      glow.addColorStop(0, 'rgba(34,211,238,0.5)');
      glow.addColorStop(1, 'rgba(34,211,238,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.moveTo(px, py - 12);
      ctx.lineTo(px + 8, py);
      ctx.lineTo(px, py + 12);
      ctx.lineTo(px - 8, py);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(34,211,238,0.6)';
      ctx.stroke();
    };

    // NPC sprite
    const drawNPC = (pos: Entity, colorA: string, colorB: string) => {
      const px = pos.x * TILE_PX + TILE_PX / 2;
      const py = pos.y * TILE_PX + TILE_PX / 2;
      ctx.fillStyle = colorB;
      ctx.fillRect(px - 12, py - 8, 24, 16);
      const robe = ctx.createLinearGradient(px, py - 12, px, py + 10);
      robe.addColorStop(0, colorA);
      robe.addColorStop(1, colorB);
      ctx.fillStyle = robe;
      ctx.beginPath();
      ctx.moveTo(px, py - 16);
      ctx.lineTo(px + 10, py + 8);
      ctx.lineTo(px - 10, py + 8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#e5e7eb';
      ctx.beginPath();
      ctx.arc(px, py - 18, 5, 0, Math.PI * 2);
      ctx.fill();
    };

    // Player sprite
    const drawPlayer = () => {
      const px = player.x * TILE_PX + TILE_PX / 2;
      const py = player.y * TILE_PX + TILE_PX / 2;
      const body = ctx.createLinearGradient(px, py - 12, px, py + 10);
      body.addColorStop(0, '#60a5fa');
      body.addColorStop(1, '#06b6d4');
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.moveTo(px, py - 14);
      ctx.lineTo(px + 10, py + 10);
      ctx.lineTo(px - 10, py + 10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.arc(px, py - 16, 5, 0, Math.PI * 2);
      ctx.fill();
    };

    drawOracle();
    drawNPC(wizards.v1, '#60a5fa', '#1e3a8a');
    drawNPC(wizards.v2, '#f472b6', '#6d28d9');
    drawNPC(wizards.v3, '#f59e0b', '#92400e');
    drawPlayer();
  }, [player, map, oracle, wizards]);
  return (
    <div className="w-full h-full">
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, rgba(8,12,24,0.9) 0%, rgba(8,12,24,0.95) 60%, #060912 100%)'
      }} />

      {/* HUD */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        <div className="px-3 py-1 rounded-lg border border-cyan-400/30 bg-black/40 text-cyan-100 text-xs font-bold">
          WASD/Arrows: Move • E/Space: Interact • Notes {filled}/3
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-cyan-400/30 bg-black/40">
          <div className="text-[11px] text-cyan-200/80">Request</div>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='e.g., "I was double-charged after upgrading my plan."'
            className="w-[360px] max-w-[60vw] rounded-lg border border-cyan-400/30 bg-black/30 text-white placeholder:text-cyan-200/50 text-xs px-2 py-1 focus:outline-none focus:border-pink-400/60"
          />
        </div>
        </div>

      {/* Dungeon board */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <div
          ref={containerRef}
          className="relative rounded-2xl border border-cyan-400/30 overflow-hidden shadow-2xl"
          style={{
            width: GRID_WIDTH * TILE_PX,
            height: GRID_HEIGHT * TILE_PX,
            background:
              'radial-gradient(circle at 25% 25%, rgba(30,58,138,0.10) 0%, transparent 40%), radial-gradient(circle at 75% 75%, rgba(124,58,237,0.10) 0%, transparent 40%), rgba(0,0,0,0.25)'
          }}
        >
          <canvas ref={canvasRef} style={{ display: 'block' }} />
          {/* Inline labels and hints */}
          <div className="pointer-events-none absolute top-2 left-2 text-[10px] text-cyan-200/70">
            Oracle dais at the back • Three mimbars along the right wall
          </div>
          {(Object.keys(wizards) as WiseId[]).map((id) => {
            const pos = wizards[id];
            const info = WISE_INFO[id];
            const collected = !!notes[id];
            const isNear = isAdjacent(player, pos);
            return (
              <div
                key={id}
                className="absolute"
                style={{
                  left: pos.x * TILE_PX - TILE_PX / 2,
                  top: pos.y * TILE_PX - TILE_PX,
                  width: TILE_PX * 2,
                  height: TILE_PX
                }}
              >
                <div className="text-[10px] text-cyan-200/80 text-right pr-1">{info.name}</div>
                <div className="text-[10px] text-cyan-200/70 text-right pr-1">“{info.hint}”</div>
                {isNear && (
                  <div className="absolute -bottom-4 right-0 text-[10px] font-bold text-emerald-200 bg-black/50 rounded px-2 py-0.5 border border-emerald-400/40">
                    Press E to speak
                  </div>
                )}
                {collected && (
                  <div className="absolute -right-2 -top-2 w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-green-400 border border-emerald-300/70 shadow" />
                )}
              </div>
            );
          })}
          {canHandoff && isAdjacent(player, oracle) && (
            <div
              className="absolute text-[10px] font-bold text-yellow-200 bg-black/50 rounded px-2 py-0.5 border border-yellow-400/40"
              style={{
                left: oracle.x * TILE_PX - 24,
                top: oracle.y * TILE_PX + 18
              }}
            >
              Press E to hand notes ({filled}/3)
            </div>
          )}
        </div>
      </div>

      {/* Dialog */}
      {talkingTo && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-black/50 backdrop-blur">
          <div className="w-[520px] max-w-[90vw] rounded-2xl border border-cyan-400/30 bg-black/80 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-cyan-200/80">
                Speak to {WISE_INFO[talkingTo].name}
              </div>
              <button
                onClick={() => setTalkingTo(null)}
                className="text-cyan-200/70 hover:text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
            <div className="text-[13px] text-cyan-100/90 mb-3">“Share your take on how to solve this. I will take notes.”</div>
            <textarea
              value={tempNote}
              onChange={(e) => setTempNote(e.target.value)}
              placeholder={`Notes from ${WISE_INFO[talkingTo].name}...`}
              className="w-full h-28 rounded-xl border border-cyan-400/30 bg-black/40 text-white placeholder:text-cyan-200/50 text-sm p-3 focus:outline-none focus:border-pink-400/60"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => setTalkingTo(null)}
                className="px-3 py-2 rounded-lg text-xs font-bold border border-cyan-400/30 text-cyan-100 hover:bg-black/40"
              >
                Cancel
              </button>
              <button
                onClick={saveNote}
                disabled={!tempNote.trim()}
                className={`px-3 py-2 rounded-lg text-xs font-black ${tempNote.trim() ? 'bg-gradient-to-r from-cyan-400 to-blue-400 text-black' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
              >
                Save Note
              </button>
          </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VibrantCaveScene;

