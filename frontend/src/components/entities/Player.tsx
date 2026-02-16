import { useRef, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { npcs } from '../../data/npcs';

const LERP_FACTOR = 0.15;
const SNAP_THRESHOLD = 0.05;
const BOB_SPEED = 12;
const BOB_AMPLITUDE = 0.05;

const DIRECTION_ROTATIONS: Record<string, number> = {
  up: Math.PI,
  down: 0,
  left: Math.PI / 2,
  right: -Math.PI / 2,
};

export function Player() {
  const groupRef = useRef<THREE.Group>(null);
  const moveTimeRef = useRef(0);
  const keysDownRef = useRef<Set<string>>(new Set());

  const playerPosition = useGameStore((s) => s.playerPosition);
  const playerDirection = useGameStore((s) => s.playerDirection);
  const isMoving = useGameStore((s) => s.isMoving);
  const targetPosition = useGameStore((s) => s.targetPosition);
  const movePlayer = useGameStore((s) => s.movePlayer);
  const setPlayerPosition = useGameStore((s) => s.setPlayerPosition);
  const setIsMoving = useGameStore((s) => s.setIsMoving);
  const dialogueIsOpen = useGameStore((s) => s.dialogue.isOpen);
  const nearbyNpcId = useGameStore((s) => s.nearbyNpcId);
  const advanceDialogue = useGameStore((s) => s.advanceDialogue);
  const openDialogue = useGameStore((s) => s.openDialogue);

  // Map key to direction
  const keyToDirection = useCallback((key: string): string | null => {
    switch (key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        return 'up';
      case 's':
      case 'arrowdown':
        return 'down';
      case 'a':
      case 'arrowleft':
        return 'left';
      case 'd':
      case 'arrowright':
        return 'right';
      default:
        return null;
    }
  }, []);

  // Handle interaction keys (Space / E)
  const handleInteraction = useCallback(() => {
    if (dialogueIsOpen) {
      advanceDialogue();
      return;
    }
    // If near an NPC and no dialogue open, open their dialogue
    if (nearbyNpcId) {
      const npcDef = npcs.find((n) => n.id === nearbyNpcId);
      if (npcDef) {
        openDialogue(npcDef.id, npcDef.name, npcDef.dialogue);
      }
    }
  }, [dialogueIsOpen, advanceDialogue, nearbyNpcId, openDialogue]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default browser scrolling for arrow keys and space
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(
          e.key
        )
      ) {
        e.preventDefault();
      }

      const key = e.key;

      // Interaction keys
      if (key === ' ' || key.toLowerCase() === 'e') {
        handleInteraction();
        return;
      }

      // Track pressed keys
      keysDownRef.current.add(key.toLowerCase());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDownRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleInteraction]);

  // Animation frame: handle smooth movement and input polling
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const group = groupRef.current;

    // -- Process held keys when not currently moving --
    if (!isMoving && !dialogueIsOpen) {
      // Check which direction keys are currently held
      // Use Array.from to avoid downlevelIteration issue with Set
      const heldKeys = Array.from(keysDownRef.current);
      for (let i = 0; i < heldKeys.length; i++) {
        const dir = keyToDirection(heldKeys[i]);
        if (dir) {
          movePlayer(dir as 'up' | 'down' | 'left' | 'right');
          break; // Only process one direction per frame
        }
      }
    }

    // -- Smooth movement interpolation --
    if (isMoving) {
      moveTimeRef.current += delta;

      const currentX = group.position.x;
      const currentZ = group.position.z;
      const goalX = targetPosition.x;
      const goalZ = targetPosition.z;

      const newX = THREE.MathUtils.lerp(currentX, goalX, LERP_FACTOR);
      const newZ = THREE.MathUtils.lerp(currentZ, goalZ, LERP_FACTOR);

      group.position.x = newX;
      group.position.z = newZ;

      // Bobbing animation while moving
      group.position.y = Math.sin(moveTimeRef.current * BOB_SPEED) * BOB_AMPLITUDE;

      // Check if close enough to snap
      const dx = Math.abs(newX - goalX);
      const dz = Math.abs(newZ - goalZ);

      if (dx < SNAP_THRESHOLD && dz < SNAP_THRESHOLD) {
        group.position.x = goalX;
        group.position.z = goalZ;
        group.position.y = 0;
        setPlayerPosition({ x: goalX, z: goalZ });
        setIsMoving(false);
        moveTimeRef.current = 0;
      }
    } else {
      // Snap position when idle (in case of desync)
      group.position.x = THREE.MathUtils.lerp(
        group.position.x,
        playerPosition.x,
        0.3
      );
      group.position.z = THREE.MathUtils.lerp(
        group.position.z,
        playerPosition.z,
        0.3
      );
      group.position.y = 0;
    }

    // -- Face direction --
    const targetRotY = DIRECTION_ROTATIONS[playerDirection] ?? 0;
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetRotY, 0.25);
  });

  return (
    <group
      ref={groupRef}
      position={[playerPosition.x, 0, playerPosition.z]}
    >
      {/* Legs */}
      <mesh castShadow position={[-0.1, 0.2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.35, 6]} />
        <meshStandardMaterial color="#2a4580" flatShading roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0.1, 0.2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.35, 6]} />
        <meshStandardMaterial color="#2a4580" flatShading roughness={0.8} />
      </mesh>

      {/* Body */}
      <mesh castShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[0.4, 0.6, 0.3]} />
        <meshStandardMaterial color="#3b5998" flatShading roughness={0.7} />
      </mesh>

      {/* Arms */}
      <mesh castShadow position={[-0.28, 0.55, 0]}>
        <boxGeometry args={[0.12, 0.45, 0.15]} />
        <meshStandardMaterial color="#3b5998" flatShading roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0.28, 0.55, 0]}>
        <boxGeometry args={[0.12, 0.45, 0.15]} />
        <meshStandardMaterial color="#3b5998" flatShading roughness={0.7} />
      </mesh>

      {/* Head */}
      <mesh castShadow position={[0, 1.0, 0]}>
        <sphereGeometry args={[0.2, 8, 6]} />
        <meshStandardMaterial color="#ffd5b4" flatShading roughness={0.6} />
      </mesh>

      {/* Cap */}
      <mesh castShadow position={[0, 1.18, 0]} rotation={[0.15, 0, 0]}>
        <coneGeometry args={[0.22, 0.2, 8]} />
        <meshStandardMaterial color="#cc3333" flatShading roughness={0.6} />
      </mesh>
      {/* Cap brim */}
      <mesh castShadow position={[0, 1.1, 0.1]}>
        <boxGeometry args={[0.25, 0.04, 0.2]} />
        <meshStandardMaterial color="#cc3333" flatShading roughness={0.6} />
      </mesh>

      {/* Shadow blob on ground */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.25, 12]} />
        <meshStandardMaterial
          color="#000000"
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
