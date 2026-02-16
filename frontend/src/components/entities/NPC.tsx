import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useGameStore } from '../../store/gameStore';
import type { NPCDef } from '../../data/npcs';

export function NPC({ npc }: { npc: NPCDef }) {
  const groupRef = useRef<THREE.Group>(null);
  const [isNearby, setIsNearby] = useState(false);

  const playerPosition = useGameStore((s) => s.playerPosition);
  const nearbyNpcId = useGameStore((s) => s.nearbyNpcId);
  const setNearbyNpc = useGameStore((s) => s.setNearbyNpc);
  const learnedConcepts = useGameStore((s) => s.learnedConcepts);

  const isConceptLearned = learnedConcepts.includes(npc.concept.name);

  // Track whether this NPC is the one currently registered as nearby
  const isThisNpcNearby = nearbyNpcId === npc.id;

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // Idle bob animation
    groupRef.current.position.y = Math.sin(time * 2) * 0.02;

    // Distance check to player
    const dx = playerPosition.x - npc.position.x;
    const dz = playerPosition.z - npc.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    const withinRange = dist < 1.8;

    if (withinRange && !isNearby) {
      setIsNearby(true);
      setNearbyNpc(npc.id);
    } else if (!withinRange && isNearby) {
      setIsNearby(false);
      // Only clear if we are the current nearby NPC
      if (isThisNpcNearby) {
        setNearbyNpc(null);
      }
    }

    // Face toward player when nearby
    if (withinRange && dist > 0.01) {
      const angle = Math.atan2(dx, dz);
      groupRef.current.rotation.y = angle;
    }
  });

  // Clean up on unmount
  useEffect(() => {
    return () => {
      const currentNearby = useGameStore.getState().nearbyNpcId;
      if (currentNearby === npc.id) {
        useGameStore.getState().setNearbyNpc(null);
      }
    };
  }, [npc.id]);

  return (
    <group
      ref={groupRef}
      position={[npc.position.x, 0, npc.position.z]}
    >
      {/* Shadow on ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.25, 8]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.2} />
      </mesh>

      {/* Body */}
      <mesh castShadow position={[0, 0.375, 0]}>
        <boxGeometry args={[0.4, 0.55, 0.3]} />
        <meshStandardMaterial color={npc.bodyColor} flatShading roughness={0.7} />
      </mesh>

      {/* Head */}
      <mesh castShadow position={[0, 0.83, 0]}>
        <sphereGeometry args={[0.18, 8, 6]} />
        <meshStandardMaterial color="#ffd5b4" flatShading roughness={0.6} />
      </mesh>

      {/* Hair (a flat cap on top of head) */}
      <mesh castShadow position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.16, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={npc.accentColor} flatShading roughness={0.7} />
      </mesh>

      {/* Left arm */}
      <mesh castShadow position={[-0.27, 0.35, 0]}>
        <boxGeometry args={[0.1, 0.35, 0.12]} />
        <meshStandardMaterial color={npc.bodyColor} flatShading roughness={0.7} />
      </mesh>

      {/* Right arm */}
      <mesh castShadow position={[0.27, 0.35, 0]}>
        <boxGeometry args={[0.1, 0.35, 0.12]} />
        <meshStandardMaterial color={npc.bodyColor} flatShading roughness={0.7} />
      </mesh>

      {/* Legs */}
      <mesh castShadow position={[-0.09, 0.08, 0]}>
        <boxGeometry args={[0.14, 0.16, 0.16]} />
        <meshStandardMaterial color="#3d3d5c" flatShading roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0.09, 0.08, 0]}>
        <boxGeometry args={[0.14, 0.16, 0.16]} />
        <meshStandardMaterial color="#3d3d5c" flatShading roughness={0.8} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.06, 0.84, 0.16]}>
        <sphereGeometry args={[0.025, 4, 4]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0.06, 0.84, 0.16]}>
        <sphereGeometry args={[0.025, 4, 4]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Accessory */}
      <Accessory type={npc.accessory} accentColor={npc.accentColor} />

      {/* Floating indicator */}
      {isNearby && (
        <FloatingIndicator isLearned={isConceptLearned} />
      )}

      {/* NPC name label */}
      <Html
        position={[0, 1.25, 0]}
        center
        distanceFactor={12}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.75)',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontFamily: '"Press Start 2P", monospace, sans-serif',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            border: `2px solid ${npc.accentColor}`,
          }}
        >
          {npc.name}
        </div>
      </Html>
    </group>
  );
}

function Accessory({
  type,
  accentColor,
}: {
  type: NPCDef['accessory'];
  accentColor: string;
}) {
  switch (type) {
    case 'glasses':
      return (
        <group position={[0, 0.84, 0.18]}>
          {/* Left lens */}
          <mesh>
            <boxGeometry args={[0.07, 0.04, 0.02]} />
            <meshStandardMaterial color={accentColor} transparent opacity={0.6} />
          </mesh>
          {/* Right lens */}
          <mesh position={[0.1, 0, 0]}>
            <boxGeometry args={[0.07, 0.04, 0.02]} />
            <meshStandardMaterial color={accentColor} transparent opacity={0.6} />
          </mesh>
          {/* Bridge */}
          <mesh position={[0.05, 0, 0]}>
            <boxGeometry args={[0.03, 0.015, 0.02]} />
            <meshStandardMaterial color={accentColor} />
          </mesh>
        </group>
      );

    case 'notebook':
      return (
        <mesh castShadow position={[0.32, 0.3, 0.05]}>
          <boxGeometry args={[0.08, 0.14, 0.1]} />
          <meshStandardMaterial color="#f5f5f0" flatShading roughness={0.5} />
        </mesh>
      );

    case 'toolbelt':
      return (
        <mesh castShadow position={[0, 0.18, 0]}>
          <boxGeometry args={[0.44, 0.06, 0.34]} />
          <meshStandardMaterial color="#8b5e3c" flatShading roughness={0.8} />
        </mesh>
      );

    case 'magnifier':
      return (
        <group position={[0.32, 0.35, 0.08]}>
          {/* Glass */}
          <mesh>
            <sphereGeometry args={[0.06, 8, 6]} />
            <meshStandardMaterial
              color={accentColor}
              transparent
              opacity={0.4}
              metalness={0.3}
            />
          </mesh>
          {/* Handle */}
          <mesh position={[0, -0.08, 0]}>
            <boxGeometry args={[0.025, 0.1, 0.025]} />
            <meshStandardMaterial color="#8b5e3c" flatShading roughness={0.8} />
          </mesh>
        </group>
      );

    case 'clipboard':
      return (
        <group position={[0.32, 0.32, 0.05]}>
          {/* Board */}
          <mesh castShadow>
            <boxGeometry args={[0.09, 0.16, 0.02]} />
            <meshStandardMaterial color="#d4a574" flatShading roughness={0.7} />
          </mesh>
          {/* Paper */}
          <mesh position={[0, -0.01, 0.012]}>
            <boxGeometry args={[0.07, 0.13, 0.005]} />
            <meshStandardMaterial color="#f5f5f0" flatShading roughness={0.4} />
          </mesh>
          {/* Clip */}
          <mesh position={[0, 0.07, 0.015]}>
            <boxGeometry args={[0.04, 0.025, 0.015]} />
            <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.3} />
          </mesh>
        </group>
      );

    case 'none':
    default:
      return null;
  }
}

function FloatingIndicator({ isLearned }: { isLearned: boolean }) {
  const indicatorRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!indicatorRef.current) return;
    const time = state.clock.getElapsedTime();
    // Bobbing animation
    indicatorRef.current.position.y = 1.45 + Math.sin(time * 4) * 0.08;
  });

  return (
    <group ref={indicatorRef}>
      <Html
        center
        distanceFactor={10}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            color: isLearned ? '#ffffff' : '#333333',
            background: isLearned
              ? 'linear-gradient(135deg, #22c55e, #16a34a)'
              : 'linear-gradient(135deg, #ffd700, #ffb800)',
            boxShadow: isLearned
              ? '0 0 10px rgba(34, 197, 94, 0.6)'
              : '0 0 10px rgba(255, 215, 0, 0.6)',
            border: isLearned
              ? '2px solid rgba(255,255,255,0.5)'
              : '2px solid rgba(255,255,255,0.5)',
          }}
        >
          {isLearned ? '\u2713' : '!'}
        </div>
      </Html>
    </group>
  );
}
