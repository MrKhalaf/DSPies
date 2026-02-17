import { useRef, useEffect, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { npcs } from '../../data/npcs';

const LERP_FACTOR = 0.15;
const SNAP_THRESHOLD = 0.05;
const BOB_SPEED = 12;
const BOB_AMPLITUDE = 0.05;

// Walking animation constants
const WALK_SWING_SPEED = 14;
const LEG_SWING_AMPLITUDE = 0.4;
const ARM_SWING_AMPLITUDE = 0.35;

// Idle breathing constants
const BREATH_SPEED = 2.0;
const BREATH_SCALE_MIN = 0.98;
const BREATH_SCALE_MAX = 1.02;
const HEAD_TILT_SPEED = 1.2;
const HEAD_TILT_AMPLITUDE = 0.03;

// Squash & stretch constants
const SQUASH_DURATION = 0.12;
const SQUASH_SCALE_X = 1.12;
const SQUASH_SCALE_Y = 0.88;
const STRETCH_SCALE_X = 0.94;
const STRETCH_SCALE_Y = 1.08;

// Dust particle constants
const DUST_COUNT = 3;
const DUST_LIFETIME = 0.4;
const DUST_RISE_SPEED = 0.8;
const DUST_SPREAD = 0.2;

const DIRECTION_ROTATIONS: Record<string, number> = {
  up: Math.PI,
  down: 0,
  left: Math.PI / 2,
  right: -Math.PI / 2,
};

interface DustParticle {
  active: boolean;
  life: number;
  offsetX: number;
  offsetZ: number;
  velocityY: number;
}

export function Player() {
  const groupRef = useRef<THREE.Group>(null);
  const moveTimeRef = useRef(0);
  const keysDownRef = useRef<Set<string>>(new Set());

  // Animation refs for body parts
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const shadowRef = useRef<THREE.Mesh>(null);

  // Dust particle refs
  const dustRefs = useRef<(THREE.Mesh | null)[]>([]);
  const dustMaterialRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);

  // Animation state refs
  const idleTimeRef = useRef(0);
  const squashTimeRef = useRef(-1); // -1 means not squashing
  const wasMovingRef = useRef(false);
  const dustParticlesRef = useRef<DustParticle[]>(
    Array.from({ length: DUST_COUNT }, () => ({
      active: false,
      life: 0,
      offsetX: 0,
      offsetZ: 0,
      velocityY: DUST_RISE_SPEED,
    }))
  );

  // Pre-create random dust offsets for deterministic spread
  const dustOffsets = useMemo(
    () =>
      Array.from({ length: DUST_COUNT }, (_, i) => ({
        x: (i - 1) * DUST_SPREAD + (Math.random() - 0.5) * 0.05,
        z: (Math.random() - 0.5) * DUST_SPREAD,
      })),
    []
  );

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

    // -- Detect step start for squash & dust --
    const justStartedMoving = isMoving && !wasMovingRef.current;
    if (justStartedMoving) {
      // Trigger squash & stretch
      squashTimeRef.current = 0;

      // Spawn dust particles
      const particles = dustParticlesRef.current;
      for (let i = 0; i < DUST_COUNT; i++) {
        particles[i].active = true;
        particles[i].life = 0;
        particles[i].offsetX = dustOffsets[i].x;
        particles[i].offsetZ = dustOffsets[i].z;
        particles[i].velocityY = DUST_RISE_SPEED + Math.random() * 0.3;
      }
    }
    wasMovingRef.current = isMoving;

    // -- Smooth movement interpolation --
    if (isMoving) {
      moveTimeRef.current += delta;
      idleTimeRef.current = 0;

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
      idleTimeRef.current += delta;
    }

    // -- Face direction --
    const targetRotY = DIRECTION_ROTATIONS[playerDirection] ?? 0;
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetRotY, 0.25);

    // ==========================================
    // ENHANCED ANIMATIONS
    // ==========================================

    const t = moveTimeRef.current;

    // -- 1. Walking animation: leg and arm swing --
    if (isMoving) {
      const legSwing = Math.sin(t * WALK_SWING_SPEED) * LEG_SWING_AMPLITUDE;
      const armSwing = Math.sin(t * WALK_SWING_SPEED) * ARM_SWING_AMPLITUDE;

      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = legSwing;
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = -legSwing;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -armSwing;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = armSwing;
      }
    } else {
      // Smoothly return limbs to rest
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(
          leftLegRef.current.rotation.x, 0, 0.15
        );
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(
          rightLegRef.current.rotation.x, 0, 0.15
        );
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(
          leftArmRef.current.rotation.x, 0, 0.15
        );
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(
          rightArmRef.current.rotation.x, 0, 0.15
        );
      }
    }

    // -- 2. Idle breathing animation --
    if (!isMoving && bodyRef.current && headRef.current) {
      const breathCycle = Math.sin(idleTimeRef.current * BREATH_SPEED);
      const breathScale = THREE.MathUtils.mapLinear(
        breathCycle, -1, 1, BREATH_SCALE_MIN, BREATH_SCALE_MAX
      );
      bodyRef.current.scale.y = breathScale;

      // Gentle head tilt
      const headTilt = Math.sin(idleTimeRef.current * HEAD_TILT_SPEED) * HEAD_TILT_AMPLITUDE;
      headRef.current.rotation.z = headTilt;
    } else if (bodyRef.current) {
      // Reset body scale smoothly when moving
      bodyRef.current.scale.y = THREE.MathUtils.lerp(bodyRef.current.scale.y, 1, 0.15);
    }

    // -- 3. Squash & stretch on step start --
    if (squashTimeRef.current >= 0 && bodyRef.current) {
      squashTimeRef.current += delta;
      const st = squashTimeRef.current;

      if (st < SQUASH_DURATION) {
        // Squash phase: wider, shorter
        const progress = st / SQUASH_DURATION;
        const ease = Math.sin(progress * Math.PI); // smooth in-out
        bodyRef.current.scale.x = 1 + (SQUASH_SCALE_X - 1) * ease;
        bodyRef.current.scale.y = 1 + (SQUASH_SCALE_Y - 1) * ease;
        bodyRef.current.scale.z = 1 + (SQUASH_SCALE_X - 1) * ease;
      } else if (st < SQUASH_DURATION * 2) {
        // Stretch phase: taller, narrower
        const progress = (st - SQUASH_DURATION) / SQUASH_DURATION;
        const ease = Math.sin(progress * Math.PI);
        bodyRef.current.scale.x = 1 + (STRETCH_SCALE_X - 1) * ease;
        bodyRef.current.scale.y = 1 + (STRETCH_SCALE_Y - 1) * ease;
        bodyRef.current.scale.z = 1 + (STRETCH_SCALE_X - 1) * ease;
      } else {
        // Return to normal
        bodyRef.current.scale.set(1, 1, 1);
        squashTimeRef.current = -1;
      }
    }

    // -- 4. Dust particles --
    const particles = dustParticlesRef.current;
    for (let i = 0; i < DUST_COUNT; i++) {
      const p = particles[i];
      const mesh = dustRefs.current[i];
      const mat = dustMaterialRefs.current[i];

      if (!mesh || !mat) continue;

      if (p.active) {
        p.life += delta;

        if (p.life >= DUST_LIFETIME) {
          p.active = false;
          mat.opacity = 0;
          mesh.visible = false;
        } else {
          mesh.visible = true;
          const lifeRatio = p.life / DUST_LIFETIME;

          // Rise up and spread out
          mesh.position.set(
            p.offsetX * (1 + lifeRatio),
            0.05 + p.life * p.velocityY,
            p.offsetZ * (1 + lifeRatio)
          );

          // Fade out and shrink
          mat.opacity = 0.4 * (1 - lifeRatio);
          const scale = 0.6 + 0.4 * (1 - lifeRatio);
          mesh.scale.setScalar(scale);
        }
      } else {
        mesh.visible = false;
      }
    }

    // -- 5. Direction-aware shadow elongation --
    // The group rotates to face playerDirection, so in local space "forward" is always +Z.
    // The shadow mesh is rotated [-PI/2, 0, 0], mapping its local Y to the group's local Z.
    // Stretching the shadow's local Y elongates it in the facing direction.
    if (shadowRef.current) {
      const elongation = 1.3;
      shadowRef.current.scale.set(1.0, elongation, 1.0);
      // Shift shadow slightly forward in the facing direction
      shadowRef.current.position.set(0, 0.01, 0.05);
    }
  });

  return (
    <group
      ref={groupRef}
      position={[playerPosition.x, 0, playerPosition.z]}
    >
      {/* Left Leg */}
      <mesh ref={leftLegRef} castShadow position={[-0.1, 0.2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.35, 6]} />
        <meshStandardMaterial color="#2a4580" flatShading roughness={0.8} />
      </mesh>
      {/* Right Leg */}
      <mesh ref={rightLegRef} castShadow position={[0.1, 0.2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.35, 6]} />
        <meshStandardMaterial color="#2a4580" flatShading roughness={0.8} />
      </mesh>

      {/* Body */}
      <mesh ref={bodyRef} castShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[0.4, 0.6, 0.3]} />
        <meshStandardMaterial color="#3b5998" flatShading roughness={0.7} />
      </mesh>

      {/* Left Arm */}
      <mesh ref={leftArmRef} castShadow position={[-0.28, 0.55, 0]}>
        <boxGeometry args={[0.12, 0.45, 0.15]} />
        <meshStandardMaterial color="#3b5998" flatShading roughness={0.7} />
      </mesh>
      {/* Right Arm */}
      <mesh ref={rightArmRef} castShadow position={[0.28, 0.55, 0]}>
        <boxGeometry args={[0.12, 0.45, 0.15]} />
        <meshStandardMaterial color="#3b5998" flatShading roughness={0.7} />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} castShadow position={[0, 1.0, 0]}>
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

      {/* Direction-aware shadow blob on ground */}
      <mesh
        ref={shadowRef}
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
      >
        <circleGeometry args={[0.25, 8]} />
        <meshStandardMaterial
          color="#000000"
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>

      {/* Dust particles */}
      {Array.from({ length: DUST_COUNT }, (_, i) => (
        <mesh
          key={`dust-${i}`}
          ref={(el) => { dustRefs.current[i] = el; }}
          visible={false}
          position={[0, 0, 0]}
        >
          <sphereGeometry args={[0.04, 4, 4]} />
          <meshStandardMaterial
            ref={(el) => { dustMaterialRefs.current[i] = el; }}
            color="#c4a882"
            transparent
            opacity={0}
            depthWrite={false}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}
