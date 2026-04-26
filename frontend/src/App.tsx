import React, { useCallback, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Grid, KeyboardControls, KeyboardControlsEntry, Text } from '@react-three/drei';
import * as THREE from 'three';

type ElementType = 'fire' | 'water' | 'grass' | 'electric' | 'normal';

type Move = {
  name: string;
  power: number;
  accuracy: number;
  type: ElementType;
};

type Creature = {
  name: string;
  level: number;
  type: ElementType;
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  moves: Move[];
};

type BattleMessage = { text: string; tone?: 'normal' | 'good' | 'bad' };
type BattleAction = 'fight' | 'bag' | 'switch' | 'run';
type BattleMode = 'overworld' | 'battle' | 'victory' | 'defeat';

type Keys = 'forward' | 'backward' | 'left' | 'right';

const keyMap: KeyboardControlsEntry<Keys>[] = [
  { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
  { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
  { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
  { name: 'right', keys: ['ArrowRight', 'd', 'D'] }
];

const typeChart: Record<ElementType, Partial<Record<ElementType, number>>> = {
  fire: { grass: 2, water: 0.5, fire: 0.5 },
  water: { fire: 2, grass: 0.5, water: 0.5 },
  grass: { water: 2, fire: 0.5, grass: 0.5 },
  electric: { water: 2, grass: 0.5, electric: 0.5 },
  normal: {}
};

const movePool: Move[] = [
  { name: 'Ember Burst', power: 40, accuracy: 1, type: 'fire' },
  { name: 'Leaf Slice', power: 45, accuracy: 0.95, type: 'grass' },
  { name: 'Splash Bolt', power: 42, accuracy: 1, type: 'water' },
  { name: 'Volt Peck', power: 48, accuracy: 0.9, type: 'electric' },
  { name: 'Quick Jab', power: 38, accuracy: 1, type: 'normal' }
];

function randomCreature(name: string, level: number, preferred?: ElementType): Creature {
  const types: ElementType[] = ['fire', 'water', 'grass', 'electric', 'normal'];
  const type = preferred ?? types[Math.floor(Math.random() * types.length)];
  const hp = 52 + level * 4 + Math.floor(Math.random() * 8);

  const shuffledMoves = [...movePool].sort(() => Math.random() - 0.5).slice(0, 4);

  return {
    name,
    level,
    type,
    maxHp: hp,
    hp,
    attack: 14 + level * 2 + Math.floor(Math.random() * 4),
    defense: 10 + level * 2 + Math.floor(Math.random() * 4),
    speed: 10 + level * 2 + Math.floor(Math.random() * 4),
    moves: shuffledMoves
  };
}

function effectiveness(moveType: ElementType, targetType: ElementType): number {
  return typeChart[moveType][targetType] ?? 1;
}

function damage(attacker: Creature, defender: Creature, move: Move): number {
  const stab = attacker.type === move.type ? 1.2 : 1;
  const typeMod = effectiveness(move.type, defender.type);
  const variance = 0.85 + Math.random() * 0.15;
  const base = ((2 * attacker.level) / 5 + 2) * move.power * (attacker.attack / defender.defense);
  return Math.max(1, Math.floor((base / 50 + 2) * stab * typeMod * variance));
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const PlayerCube: React.FC<{ position: THREE.Vector3Tuple }> = ({ position }) => (
  <mesh position={position} castShadow>
    <boxGeometry args={[0.7, 0.7, 0.7]} />
    <meshStandardMaterial color="#4fc3f7" />
  </mesh>
);

const CreatureToken: React.FC<{ position: THREE.Vector3Tuple; color: string; name: string }> = ({
  position,
  color,
  name
}) => (
  <group position={position}>
    <mesh castShadow>
      <sphereGeometry args={[0.5, 24, 24]} />
      <meshStandardMaterial color={color} metalness={0.05} roughness={0.2} />
    </mesh>
    <Text position={[0, 0.95, 0]} color="white" fontSize={0.18} anchorX="center">
      {name}
    </Text>
  </group>
);

function App() {
  const [mode, setMode] = useState<BattleMode>('overworld');
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([0, 0.35, 0]);
  const [stepCount, setStepCount] = useState(0);

  const [starter, setStarter] = useState<Creature>(() => randomCreature('Mentormon', 7, 'electric'));
  const [wild, setWild] = useState<Creature>(() => randomCreature('Patchwild', 5));

  const [messages, setMessages] = useState<BattleMessage[]>([
    { text: 'Walk in the grass (green squares). A wild encounter can happen any step.' }
  ]);

  const [selectedAction, setSelectedAction] = useState<BattleAction>('fight');
  const [selectedMove, setSelectedMove] = useState(0);
  const [potions, setPotions] = useState(2);

  const inBattle = mode === 'battle' || mode === 'victory' || mode === 'defeat';

  const movePlayer: (dx: number, dz: number) => void = useCallback((dx: number, dz: number) => {
    if (inBattle) return;

    setPlayerPos((prev) => {
      const nx = clamp(prev[0] + dx, -8, 8);
      const nz = clamp(prev[2] + dz, -8, 8);
      return [nx, prev[1], nz];
    });

    setStepCount((s) => s + 1);
  }, [inBattle]);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') movePlayer(0, -1);
      if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') movePlayer(0, 1);
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') movePlayer(-1, 0);
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') movePlayer(1, 0);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [movePlayer]);

  React.useEffect(() => {
    if (inBattle || stepCount === 0) return;

    const [x, , z] = playerPos;
    const inGrass = Math.abs(x) > 2 && Math.abs(z) > 2;
    const chance = inGrass ? 0.35 : 0.08;

    if (Math.random() < chance) {
      const foe = randomCreature('Wild Bytechu', 4 + Math.floor(Math.random() * 4));
      setWild(foe);
      setMode('battle');
      setMessages([
        { text: `A wild ${foe.name} appeared!`, tone: 'bad' },
        { text: 'Battle loop: Observe → select action → damage resolves.' }
      ]);
    }
  }, [playerPos, stepCount, inBattle]);

  const pushMessage = (msg: BattleMessage) => setMessages((m) => [msg, ...m].slice(0, 5));

  const resolveTurn = (move: Move) => {
    if (mode !== 'battle') return;
    let playerHp = starter.hp;
    let wildHp = wild.hp;
    const firstPlayer = starter.speed >= wild.speed;
    const enemyMove = wild.moves[Math.floor(Math.random() * wild.moves.length)];

    if (Math.random() > move.accuracy) {
      pushMessage({ text: `${starter.name}'s ${move.name} missed!`, tone: 'bad' });
    } else {
      const hit = damage(starter, wild, move);
      const mult = effectiveness(move.type, wild.type);
      wildHp = Math.max(0, wildHp - hit);

      pushMessage({ text: `${starter.name} used ${move.name} for ${hit} dmg.` });
      if (mult > 1) pushMessage({ text: 'It was super effective!', tone: 'good' });
      if (mult < 1) pushMessage({ text: 'It was not very effective...', tone: 'bad' });
    }

    if (wildHp <= 0) {
      setWild((w) => ({ ...w, hp: 0 }));
      setMode('victory');
      pushMessage({ text: `${wild.name} fainted. You won!`, tone: 'good' });
      return;
    }

    if (!firstPlayer) {
      if (Math.random() <= enemyMove.accuracy) {
        const hit = damage(wild, starter, enemyMove);
        playerHp = Math.max(0, playerHp - hit);
        pushMessage({ text: `${wild.name} used ${enemyMove.name} for ${hit} dmg.`, tone: 'bad' });
      } else {
        pushMessage({ text: `${wild.name} missed.`, tone: 'good' });
      }
    }

    if (playerHp <= 0) {
      setWild((w) => ({ ...w, hp: wildHp }));
      setStarter((p) => ({ ...p, hp: 0 }));
      setMode('defeat');
      pushMessage({ text: `${starter.name} fainted. Training needed!`, tone: 'bad' });
      return;
    }

    if (firstPlayer) {
      if (Math.random() <= enemyMove.accuracy) {
        const hit = damage(wild, starter, enemyMove);
        playerHp = Math.max(0, playerHp - hit);
        pushMessage({ text: `${wild.name} answered with ${enemyMove.name} (${hit} dmg).`, tone: 'bad' });
      } else {
        pushMessage({ text: `${wild.name} failed to land a hit.`, tone: 'good' });
      }

      if (playerHp <= 0) {
        setWild((w) => ({ ...w, hp: wildHp }));
        setStarter((p) => ({ ...p, hp: 0 }));
        setMode('defeat');
        pushMessage({ text: `${starter.name} fainted. Training needed!`, tone: 'bad' });
        return;
      }
    }

    setWild((w) => ({ ...w, hp: wildHp }));
    setStarter((p) => ({ ...p, hp: playerHp }));
  };

  const usePotion = () => {
    if (potions < 1) {
      pushMessage({ text: 'No potions left.', tone: 'bad' });
      return;
    }

    setPotions((n) => n - 1);
    const heal = 28;
    setStarter((p) => ({ ...p, hp: Math.min(p.maxHp, p.hp + heal) }));
    pushMessage({ text: `${starter.name} recovered ${heal} HP.`, tone: 'good' });
  };

  const attemptRun = () => {
    const odds = clamp((starter.speed - wild.speed + 15) / 30, 0.25, 0.9);
    if (Math.random() <= odds) {
      setMode('overworld');
      pushMessage({ text: 'Got away safely.' });
      return;
    }

    pushMessage({ text: 'Could not escape!', tone: 'bad' });
    const enemyMove = wild.moves[Math.floor(Math.random() * wild.moves.length)];
    if (Math.random() <= enemyMove.accuracy) {
      const hit = damage(wild, starter, enemyMove);
      setStarter((p) => ({ ...p, hp: Math.max(0, p.hp - hit) }));
      pushMessage({ text: `${wild.name} punished the run (${hit} dmg).`, tone: 'bad' });
    }
  };

  const restartBattle = () => {
    setStarter(randomCreature('Mentormon', 7, 'electric'));
    setWild(randomCreature('Patchwild', 5));
    setMessages([{ text: 'Back to exploration. Move with WASD/Arrow keys.' }]);
    setMode('overworld');
  };

  const battleHint = useMemo(
    () => [
      'DSPy intuition:',
      '• Signature = battle contract (input state → action).',
      '• Module = policy that picks best move.',
      '• Optimizer = tune policy from battle traces.'
    ],
    []
  );

  return (
    <KeyboardControls map={keyMap}>
      <div className="app-shell">
        <header className="topbar">
          <h1>DSPyMon: Three.js Micro Adventure</h1>
          <p>Short Pokémon-like loop to intuit DSPy: observe state, pick an action, optimize over outcomes.</p>
        </header>

        <div className="game-wrap">
          <Canvas shadows camera={{ position: [8, 10, 8], fov: 50 }}>
            <color attach="background" args={['#121426']} />
            <ambientLight intensity={0.5} />
            <directionalLight intensity={1.1} position={[6, 12, 4]} castShadow />

            <Grid position={[0, 0, 0]} args={[20, 20]} cellSize={1} cellThickness={1} sectionSize={4} />

            <mesh position={[0, -0.03, 0]} receiveShadow>
              <boxGeometry args={[18, 0.06, 18]} />
              <meshStandardMaterial color="#3a5f3b" />
            </mesh>

            {[-6, 6].map((x) =>
              [-6, 6].map((z) => (
                <mesh key={`${x}-${z}`} position={[x, 0.01, z]}>
                  <boxGeometry args={[4.5, 0.02, 4.5]} />
                  <meshStandardMaterial color="#5d9d4d" />
                </mesh>
              ))
            )}

            <PlayerCube position={playerPos} />

            {inBattle && (
              <>
                <CreatureToken position={[-2.5, 0.55, -1]} color="#ffc107" name={wild.name} />
                <CreatureToken position={[2.5, 0.55, 1.8]} color="#7dd3fc" name={starter.name} />
              </>
            )}
          </Canvas>

          <div className="controls" role="group" aria-label="movement">
            <button onClick={() => movePlayer(0, -1)}>↑</button>
            <div>
              <button onClick={() => movePlayer(-1, 0)}>←</button>
              <button onClick={() => movePlayer(1, 0)}>→</button>
            </div>
            <button onClick={() => movePlayer(0, 1)}>↓</button>
          </div>
        </div>

        <div className="panels">
          <section className="panel stats">
            <h2>Your Creature</h2>
            <p>
              {starter.name} Lv.{starter.level} ({starter.type})
            </p>
            <div className="hp-track">
              <div style={{ width: `${(starter.hp / starter.maxHp) * 100}%` }} />
            </div>
            <small>
              HP {starter.hp}/{starter.maxHp} | Speed {starter.speed} | Potions {potions}
            </small>

            <h3>Wild Opponent</h3>
            <p>
              {wild.name} Lv.{wild.level} ({wild.type})
            </p>
            <div className="hp-track enemy">
              <div style={{ width: `${(wild.hp / wild.maxHp) * 100}%` }} />
            </div>
            <small>
              HP {wild.hp}/{wild.maxHp} | Speed {wild.speed}
            </small>
          </section>

          <section className="panel actions">
            <h2>Battle Actions</h2>
            <div className="action-row">
              {(['fight', 'bag', 'switch', 'run'] as BattleAction[]).map((action) => (
                <button
                  key={action}
                  className={selectedAction === action ? 'active' : ''}
                  onClick={() => setSelectedAction(action)}
                  disabled={mode !== 'battle'}
                >
                  {action}
                </button>
              ))}
            </div>

            {selectedAction === 'fight' && (
              <div className="moves-grid">
                {starter.moves.map((move, idx) => (
                  <button
                    key={move.name}
                    className={selectedMove === idx ? 'active' : ''}
                    onClick={() => {
                      setSelectedMove(idx);
                      resolveTurn(move);
                    }}
                    disabled={mode !== 'battle'}
                  >
                    {move.name} ({move.type})
                  </button>
                ))}
              </div>
            )}

            {selectedAction === 'bag' && (
              <button onClick={usePotion} disabled={mode !== 'battle'}>
                Use Potion (+28 HP)
              </button>
            )}

            {selectedAction === 'switch' && (
              <p className="hint">In this short demo, switch maps to model swap in DSPy terms (single active module).</p>
            )}

            {selectedAction === 'run' && (
              <button onClick={attemptRun} disabled={mode !== 'battle'}>
                Attempt Escape
              </button>
            )}

            {(mode === 'victory' || mode === 'defeat') && (
              <button onClick={restartBattle}>{mode === 'victory' ? 'Keep Exploring' : 'Retry Battle'}</button>
            )}
          </section>

          <section className="panel log">
            <h2>Battle Log</h2>
            <ul>
              {messages.map((m, i) => (
                <li key={`${m.text}-${i}`} className={m.tone ?? 'normal'}>
                  {m.text}
                </li>
              ))}
            </ul>
          </section>

          <section className="panel dspy">
            <h2>Why this helps with DSPy</h2>
            {battleHint.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </section>
        </div>
      </div>
    </KeyboardControls>
  );
}

export default App;
