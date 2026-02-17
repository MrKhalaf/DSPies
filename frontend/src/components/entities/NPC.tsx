import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useGameStore } from '../../store/gameStore';
import type { NPCDef } from '../../data/npcs';

export function NPC({ npc }: { npc: NPCDef }) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const [isNearby, setIsNearby] = useState(false);

  const playerPosition = useGameStore((s) => s.playerPosition);
  const nearbyNpcId = useGameStore((s) => s.nearbyNpcId);
  const setNearbyNpc = useGameStore((s) => s.setNearbyNpc);
  const learnedConcepts = useGameStore((s) => s.learnedConcepts);

  const isConceptLearned = learnedConcepts.includes(npc.concept.name);

  // Track whether this NPC is the one currently registered as nearby
  const isThisNpcNearby = nearbyNpcId === npc.id;

  // Use NPC position as a seed to offset animation phases so they don't sync
  const phaseOffset = useMemo(
    () => (npc.position.x * 3.17 + npc.position.z * 7.31) % (Math.PI * 2),
    [npc.position.x, npc.position.z]
  );

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();
    const t = time + phaseOffset;

    // --- Idle bob animation (gentle vertical motion) ---
    groupRef.current.position.y = Math.sin(t * 1.5) * 0.015;

    // --- Body sway: gentle rotation on Y axis, back and forth ---
    if (bodyRef.current) {
      bodyRef.current.rotation.z = Math.sin(t * 0.8) * 0.03;
    }

    // --- Head tilt: every 3-5 seconds, tilt head slightly to one side ---
    if (headRef.current) {
      // Create an occasional head tilt using a slow cycle that peaks briefly
      const headCycle = t * 0.25; // slow cycle
      const headTiltPhase = Math.sin(headCycle) * Math.sin(headCycle * 3.7);
      headRef.current.rotation.z = headTiltPhase * 0.08;
      // Slight forward/back nod
      headRef.current.rotation.x = Math.sin(t * 0.6) * 0.02;
    }

    // --- Arm idle sway: gentle pendulum swing ---
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = Math.sin(t * 1.2) * 0.06;
      leftArmRef.current.rotation.z = -0.05 + Math.sin(t * 0.7) * 0.02;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = Math.sin(t * 1.2 + Math.PI) * 0.06;
      rightArmRef.current.rotation.z = 0.05 - Math.sin(t * 0.7) * 0.02;
    }

    // --- Weight-shift animation: shift weight from one leg to the other ---
    const weightShiftCycle = Math.sin(t * 0.4) * 0.5 + 0.5; // 0 to 1
    if (leftLegRef.current) {
      leftLegRef.current.position.y = 0.08 - weightShiftCycle * 0.015;
      leftLegRef.current.rotation.z = weightShiftCycle * 0.03;
    }
    if (rightLegRef.current) {
      rightLegRef.current.position.y = 0.08 - (1 - weightShiftCycle) * 0.015;
      rightLegRef.current.rotation.z = -(1 - weightShiftCycle) * 0.03;
    }
    // Whole body slight tilt from weight shift
    if (bodyRef.current) {
      bodyRef.current.rotation.z += (weightShiftCycle - 0.5) * 0.02;
    }

    // --- Distance check to player (UNCHANGED) ---
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
      <mesh ref={bodyRef} castShadow position={[0, 0.375, 0]}>
        <boxGeometry args={[0.4, 0.55, 0.3]} />
        <meshStandardMaterial color={npc.bodyColor} flatShading roughness={0.7} />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} castShadow position={[0, 0.83, 0]}>
        <sphereGeometry args={[0.18, 8, 6]} />
        <meshStandardMaterial color="#ffd5b4" flatShading roughness={0.6} />
      </mesh>

      {/* Hair (a flat cap on top of head) */}
      <mesh castShadow position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.16, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={npc.accentColor} flatShading roughness={0.7} />
      </mesh>

      {/* Left arm */}
      <mesh ref={leftArmRef} castShadow position={[-0.27, 0.35, 0]}>
        <boxGeometry args={[0.1, 0.35, 0.12]} />
        <meshStandardMaterial color={npc.bodyColor} flatShading roughness={0.7} />
      </mesh>

      {/* Right arm */}
      <mesh ref={rightArmRef} castShadow position={[0.27, 0.35, 0]}>
        <boxGeometry args={[0.1, 0.35, 0.12]} />
        <meshStandardMaterial color={npc.bodyColor} flatShading roughness={0.7} />
      </mesh>

      {/* Legs */}
      <mesh ref={leftLegRef} castShadow position={[-0.09, 0.08, 0]}>
        <boxGeometry args={[0.14, 0.16, 0.16]} />
        <meshStandardMaterial color="#3d3d5c" flatShading roughness={0.8} />
      </mesh>
      <mesh ref={rightLegRef} castShadow position={[0.09, 0.08, 0]}>
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

      {/* 3D Floating indicator */}
      {isNearby && (
        <FloatingIndicator3D isLearned={isConceptLearned} />
      )}

      {/* Sparkle effect for unvisited NPCs */}
      {!isConceptLearned && (
        <SparkleOrbit accentColor={npc.accentColor} phaseOffset={phaseOffset} />
      )}

      {/* NPC name label */}
      <Html
        position={[0, 1.25, 0]}
        center
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

/**
 * 3D floating indicator that replaces the old HTML-based one.
 * - Not learned: yellow "!" (box bar + sphere dot) with bounce + pulse + halo ring
 * - Learned: green glowing sphere with halo ring
 */
function FloatingIndicator3D({ isLearned }: { isLearned: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    // Bobbing with a bounce feel (abs of sin for bounce)
    const bounce = Math.abs(Math.sin(time * 3.5)) * 0.1;
    groupRef.current.position.y = 1.4 + bounce;

    // Pulse in scale
    const pulse = 1 + Math.sin(time * 4) * 0.1;
    groupRef.current.scale.setScalar(pulse);

    // Ring pulsing
    if (ringRef.current) {
      const ringPulse = 1 + Math.sin(time * 3) * 0.15;
      ringRef.current.scale.set(ringPulse, ringPulse, 1);
      (ringRef.current.material as THREE.MeshStandardMaterial).opacity =
        0.3 + Math.sin(time * 3) * 0.15;
    }
  });

  if (isLearned) {
    return (
      <group ref={groupRef} position={[0, 1.4, 0]}>
        {/* Green glowing sphere (checkmark stand-in) */}
        <mesh>
          <sphereGeometry args={[0.08, 8, 6]} />
          <meshStandardMaterial
            color="#22c55e"
            emissive="#22c55e"
            emissiveIntensity={0.6}
            flatShading
            roughness={0.4}
          />
        </mesh>
        {/* Inner bright core */}
        <mesh>
          <sphereGeometry args={[0.04, 6, 4]} />
          <meshStandardMaterial
            color="#bbf7d0"
            emissive="#bbf7d0"
            emissiveIntensity={1.0}
          />
        </mesh>
        {/* Halo ring */}
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
          <torusGeometry args={[0.12, 0.015, 6, 12]} />
          <meshStandardMaterial
            color="#22c55e"
            emissive="#22c55e"
            emissiveIntensity={0.4}
            transparent
            opacity={0.4}
            flatShading
          />
        </mesh>
      </group>
    );
  }

  // Not learned: yellow "!" indicator
  return (
    <group ref={groupRef} position={[0, 1.4, 0]}>
      {/* Exclamation bar (tall narrow box) */}
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[0.05, 0.14, 0.05]} />
        <meshStandardMaterial
          color="#ffd700"
          emissive="#ffd700"
          emissiveIntensity={0.3}
          flatShading
          roughness={0.5}
        />
      </mesh>
      {/* Exclamation dot (small sphere) */}
      <mesh position={[0, -0.06, 0]}>
        <sphereGeometry args={[0.03, 6, 4]} />
        <meshStandardMaterial
          color="#ffd700"
          emissive="#ffd700"
          emissiveIntensity={0.3}
          flatShading
          roughness={0.5}
        />
      </mesh>
      {/* Halo ring underneath */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <torusGeometry args={[0.1, 0.012, 6, 12]} />
        <meshStandardMaterial
          color="#ffb800"
          emissive="#ffb800"
          emissiveIntensity={0.3}
          transparent
          opacity={0.4}
          flatShading
        />
      </mesh>
    </group>
  );
}

/**
 * Sparkle orbit effect for unvisited NPCs.
 * 3-4 small diamond shapes (octahedrons) that orbit slowly around the NPC.
 */
function SparkleOrbit({
  accentColor,
  phaseOffset,
}: {
  accentColor: string;
  phaseOffset: number;
}) {
  const sparkleCount = 2;
  const sparkleRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Pre-compute per-sparkle offsets
  const sparkleOffsets = useMemo(
    () =>
      Array.from({ length: sparkleCount }, (_, i) => ({
        angleOffset: (i / sparkleCount) * Math.PI * 2,
        heightOffset: i * 0.12,
        speed: 0.6 + i * 0.15,
        radius: 0.35 + (i % 2) * 0.08,
      })),
    []
  );

  useFrame((state) => {
    const time = state.clock.getElapsedTime() + phaseOffset;

    for (let i = 0; i < sparkleCount; i++) {
      const mesh = sparkleRefs.current[i];
      if (!mesh) continue;

      const { angleOffset, heightOffset, speed, radius } = sparkleOffsets[i];
      const angle = time * speed + angleOffset;

      mesh.position.x = Math.cos(angle) * radius;
      mesh.position.z = Math.sin(angle) * radius;
      mesh.position.y = 0.5 + heightOffset + Math.sin(time * 2 + angleOffset) * 0.05;

      // Spin the diamond on its own axis
      mesh.rotation.x = time * 2.5 + angleOffset;
      mesh.rotation.y = time * 1.8 + angleOffset;

      // Pulse scale
      const s = 0.8 + Math.sin(time * 3 + angleOffset) * 0.3;
      mesh.scale.setScalar(s);
    }
  });

  return (
    <group>
      {sparkleOffsets.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            sparkleRefs.current[i] = el;
          }}
        >
          <octahedronGeometry args={[0.03, 0]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.5}
            flatShading
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}
