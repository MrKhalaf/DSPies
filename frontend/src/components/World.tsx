import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Building } from './entities/Building';
import { Tree } from './entities/Tree';
import { Fence } from './entities/Fence';
import { Sign } from './entities/Sign';

/**
 * World - The 3D Twinleaf Town environment for DSPyville.
 *
 * Layout (roughly 20x20 tiles, 1 unit = 1 tile):
 *
 * DSPy Lab (Professor's building):  (0, 0, -7),  4x3, blue/dark blue
 * Player's House ("Your LLM App"):  (-5, 0, 3),  3x2.5, cream/brown
 * Prompt Library building:          (5, 0, 3),   3x2.5, light green/dark green
 * Module Shop:                      (6, 0, -2),  2.5x2, purple/dark purple
 *
 * Cross-shaped dirt path:
 *   Vertical: x=0, from z=-9 to z=9, width 2
 *   Horizontal: z=0, from x=-7 to x=7, width 2
 *
 * Trees scattered around the edges and between buildings.
 * Fences along the southern edge (z=9) and sides.
 * Welcome sign at the town entrance.
 */
export function World() {
  return (
    <group>
      {/* ===== GROUND PLANE ===== */}
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
      >
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#4a7c3f" roughness={0.8} />
      </mesh>

      {/* ===== DIRT PATHS ===== */}
      {/* Vertical path (north-south) */}
      <mesh receiveShadow position={[0, 0.01, 0]}>
        <boxGeometry args={[2, 0.02, 18]} />
        <meshStandardMaterial color="#c4a066" roughness={0.9} />
      </mesh>

      {/* Horizontal path (east-west) */}
      <mesh receiveShadow position={[0, 0.01, 0]}>
        <boxGeometry args={[14, 0.02, 2]} />
        <meshStandardMaterial color="#c4a066" roughness={0.9} />
      </mesh>

      {/* Path leading to DSPy Lab door */}
      <mesh receiveShadow position={[0, 0.01, -5.5]}>
        <boxGeometry args={[2, 0.02, 1]} />
        <meshStandardMaterial color="#c4a066" roughness={0.9} />
      </mesh>

      {/* Path branch to Player's House */}
      <mesh receiveShadow position={[-3.5, 0.01, 3]}>
        <boxGeometry args={[3, 0.02, 1.5]} />
        <meshStandardMaterial color="#c4a066" roughness={0.9} />
      </mesh>

      {/* Path branch to Prompt Library */}
      <mesh receiveShadow position={[3.5, 0.01, 3]}>
        <boxGeometry args={[3, 0.02, 1.5]} />
        <meshStandardMaterial color="#c4a066" roughness={0.9} />
      </mesh>

      {/* Path branch to Module Shop */}
      <mesh receiveShadow position={[4.5, 0.01, -2]}>
        <boxGeometry args={[3, 0.02, 1.5]} />
        <meshStandardMaterial color="#c4a066" roughness={0.9} />
      </mesh>

      {/* ===== BUILDINGS ===== */}

      {/* DSPy Lab - Professor's main building (north center) */}
      <Building
        position={[0, 0, -7]}
        size={[4, 3, 3]}
        wallColor="#5b8bd4"
        roofColor="#2c4a7c"
        label="DSPy Lab"
        roofType="peaked"
      />

      {/* Player's House - "Your LLM App" (west side) */}
      <Building
        position={[-5, 0, 3]}
        size={[3, 2.5, 2.5]}
        wallColor="#f5e6c8"
        roofColor="#8b5e3c"
        label="Your LLM App"
        roofType="peaked"
      />

      {/* Prompt Library (east side) */}
      <Building
        position={[5, 0, 3]}
        size={[3, 2.5, 2.5]}
        wallColor="#a8d5a2"
        roofColor="#3d6b35"
        label="Prompt Library"
        roofType="peaked"
      />

      {/* Module Shop (east side, further north) */}
      <Building
        position={[6, 0, -2]}
        size={[2.5, 2, 2]}
        wallColor="#b8a0d4"
        roofColor="#5a3d7a"
        label="Module Shop"
        roofType="flat"
      />

      {/* ===== TREES ===== */}

      {/* Western edge trees */}
      <Tree position={[-8, 0, -5]} variant="pine" scale={1.1} />
      <Tree position={[-8, 0, 0]} variant="round" scale={1.0} />
      <Tree position={[-8, 0, 5]} variant="pine" scale={0.9} />

      {/* Eastern edge trees */}
      <Tree position={[8, 0, -5]} variant="pine" scale={1.0} />
      <Tree position={[8, 0, 5]} variant="round" scale={1.1} />

      {/* Northern trees (flanking the lab) */}
      <Tree position={[-3, 0, -4]} variant="pine" scale={0.8} />
      <Tree position={[3, 0, -4]} variant="pine" scale={0.8} />

      {/* Southern trees */}
      <Tree position={[-6, 0, 7]} variant="round" scale={1.0} />
      <Tree position={[6, 0, 7]} variant="pine" scale={0.9} />

      {/* Additional decoration trees */}
      <Tree position={[-9, 0, -8]} variant="pine" scale={1.2} />
      <Tree position={[9, 0, -8]} variant="pine" scale={1.15} />
      <Tree position={[-9, 0, 8]} variant="round" scale={0.85} />
      <Tree position={[9, 0, 8]} variant="pine" scale={0.95} />
      <Tree position={[-4, 0, -9]} variant="pine" scale={1.0} />
      <Tree position={[4, 0, -9]} variant="round" scale={0.9} />

      {/* ===== FENCES ===== */}

      {/* Southern fence (along z=9), split to leave entrance gap in center */}
      {/* Left section: x from -10 to -2 (8 segments) */}
      <Fence position={[-10, 0, 9]} length={8} rotation={0} />

      {/* Right section: x from 2 to 10 (8 segments) */}
      <Fence position={[2, 0, 9]} length={8} rotation={0} />

      {/* ===== TOWN ENTRANCE SIGN ===== */}
      <Sign position={[1, 0, 8]} text="Welcome to DSPyville!" />

      {/* ===== DECORATIVE ELEMENTS ===== */}

      {/* Small flower patches (colored spots on the ground) */}
      <FlowerPatch position={[-3, 0.02, 6]} color="#e8567f" />
      <FlowerPatch position={[3, 0.02, 6]} color="#f0c040" />
      <FlowerPatch position={[-7, 0.02, -3]} color="#e8567f" />
      <FlowerPatch position={[8, 0.02, 2]} color="#9b59b6" />
      <FlowerPatch position={[-2, 0.02, -3]} color="#f0c040" />
      <FlowerPatch position={[2, 0.02, 5]} color="#e8567f" />

      {/* Small rocks for detail */}
      <Rock position={[-6, 0, -7]} scale={0.3} />
      <Rock position={[7, 0, -6]} scale={0.25} />
      <Rock position={[-4, 0, 8]} scale={0.2} />
      <Rock position={[3, 0, 7.5]} scale={0.35} />

      {/* Pond near the eastern side */}
      <Pond position={[8, 0.01, 0]} />

      {/* ===== AMBIENT LIFE ===== */}

      {/* Floating pollen/dust particles */}
      <AmbientParticles />

      {/* Grass tufts scattered on grassy areas */}
      <GrassTuft position={[-5, 0, -2]} />
      <GrassTuft position={[-7, 0, 2]} />
      <GrassTuft position={[-6, 0, -5]} />
      <GrassTuft position={[-3, 0, 7]} />
      <GrassTuft position={[7, 0, -3]} />
      <GrassTuft position={[9, 0, 2]} />
      <GrassTuft position={[4, 0, 7]} />
      <GrassTuft position={[-9, 0, -3]} />
    </group>
  );
}

/**
 * Small decorative flower patch - a few colored dots on the ground.
 * Flowers gently bob up and down.
 */
function FlowerPatch({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) {
  const flower1Ref = useRef<THREE.Mesh>(null);
  const flower2Ref = useRef<THREE.Mesh>(null);
  const flower3Ref = useRef<THREE.Mesh>(null);

  // Deterministic phase offsets based on position
  const phases = useMemo(() => {
    const seed = position[0] * 53.7 + position[2] * 97.3;
    return [seed % (Math.PI * 2), (seed * 1.7) % (Math.PI * 2), (seed * 2.3) % (Math.PI * 2)];
  }, [position]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (flower1Ref.current) {
      flower1Ref.current.position.y = Math.sin(t * 1.2 + phases[0]) * 0.03;
    }
    if (flower2Ref.current) {
      flower2Ref.current.position.y = Math.sin(t * 1.0 + phases[1]) * 0.03;
    }
    if (flower3Ref.current) {
      flower3Ref.current.position.y = Math.sin(t * 1.4 + phases[2]) * 0.03;
    }
  });

  return (
    <group position={position}>
      <mesh ref={flower1Ref} receiveShadow>
        <sphereGeometry args={[0.1, 5, 4]} />
        <meshStandardMaterial color={color} flatShading roughness={0.7} />
      </mesh>
      <mesh ref={flower2Ref} receiveShadow position={[0.2, 0, 0.15]}>
        <sphereGeometry args={[0.08, 5, 4]} />
        <meshStandardMaterial color={color} flatShading roughness={0.7} />
      </mesh>
      <mesh ref={flower3Ref} receiveShadow position={[-0.15, 0, 0.1]}>
        <sphereGeometry args={[0.09, 5, 4]} />
        <meshStandardMaterial color={color} flatShading roughness={0.7} />
      </mesh>
      {/* Green leaf underneath */}
      <mesh receiveShadow position={[0, -0.02, 0.05]}>
        <sphereGeometry args={[0.2, 4, 3]} />
        <meshStandardMaterial color="#3d8a2a" flatShading roughness={0.8} />
      </mesh>
    </group>
  );
}

/**
 * Small decorative rock.
 */
function Rock({
  position,
  scale = 0.3,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <mesh
      castShadow
      receiveShadow
      position={[position[0], position[1] + scale * 0.3, position[2]]}
      scale={[scale, scale * 0.6, scale]}
    >
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#8a8a7a" flatShading roughness={0.9} />
    </mesh>
  );
}

/**
 * Small decorative pond with animated water surface.
 */
function Pond({ position }: { position: [number, number, number] }) {
  const innerWaterRef = useRef<THREE.Mesh>(null);
  const waterMatRef = useRef<THREE.MeshStandardMaterial>(null);

  // Two blue colors to lerp between
  const colorA = useMemo(() => new THREE.Color('#4a90b8'), []);
  const colorB = useMemo(() => new THREE.Color('#3a78a8'), []);
  const lerpColor = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (innerWaterRef.current) {
      // Gentle bob up and down
      innerWaterRef.current.position.y = Math.sin(t * 0.8) * 0.02 + 0.01;
      // Slow rotation for ripple illusion
      innerWaterRef.current.rotation.z = t * 0.15;
    }

    if (waterMatRef.current) {
      // Subtle color shift between two blues
      const blend = (Math.sin(t * 0.5) + 1) * 0.5;
      lerpColor.copy(colorA).lerp(colorB, blend);
      waterMatRef.current.color.copy(lerpColor);
    }
  });

  return (
    <group position={position}>
      {/* Water surface */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 8]} />
        <meshStandardMaterial
          ref={waterMatRef}
          color="#4a90b8"
          roughness={0.2}
          metalness={0.1}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Inner water circle for ripple effect */}
      <mesh ref={innerWaterRef} receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.85, 6]} />
        <meshStandardMaterial
          color="#5ca8d0"
          roughness={0.15}
          metalness={0.15}
          transparent
          opacity={0.5}
        />
      </mesh>
      {/* Pond border (dirt rim) */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
        <ringGeometry args={[1.1, 1.4, 8]} />
        <meshStandardMaterial color="#7a6840" roughness={0.9} />
      </mesh>
    </group>
  );
}

/**
 * Floating pollen/dust mote particles drifting around the town.
 * Uses a single instanced mesh for performance.
 */
function AmbientParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 10;

  // Generate deterministic initial positions and velocities
  const particleData = useMemo(() => {
    const data: Array<{ x: number; y: number; z: number; speedY: number; speedX: number; phase: number }> = [];
    for (let i = 0; i < count; i++) {
      // Deterministic pseudo-random using index as seed
      const seed1 = ((i * 127 + 53) % 100) / 100;
      const seed2 = ((i * 89 + 17) % 100) / 100;
      const seed3 = ((i * 61 + 37) % 100) / 100;
      const seed4 = ((i * 43 + 71) % 100) / 100;
      data.push({
        x: (seed1 - 0.5) * 18,
        y: seed2 * 3 + 0.5,
        z: (seed3 - 0.5) * 18,
        speedY: 0.15 + seed4 * 0.2,
        speedX: (seed1 - 0.5) * 0.3,
        phase: seed2 * Math.PI * 2,
      });
    }
    return data;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const p = particleData[i];

      // Drift upward and sideways
      let y = ((p.y + t * p.speedY) % 5) + 0.3;
      let x = p.x + Math.sin(t * 0.3 + p.phase) * 1.5;
      let z = p.z + Math.cos(t * 0.2 + p.phase) * 1.0;

      dummy.position.set(x, y, z);
      // Slight scale pulse
      const s = 0.04 + Math.sin(t * 0.8 + p.phase) * 0.015;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 3]} />
      <meshStandardMaterial
        color="#f5f0d0"
        transparent
        opacity={0.4}
        roughness={1}
        flatShading
      />
    </instancedMesh>
  );
}

/**
 * Small grass tuft that sways gently in the wind.
 * Made of small wedge/blade shapes at ground level.
 */
function GrassTuft({ position }: { position: [number, number, number] }) {
  const blade1Ref = useRef<THREE.Mesh>(null);
  const blade2Ref = useRef<THREE.Mesh>(null);
  const blade3Ref = useRef<THREE.Mesh>(null);

  // Deterministic phase offset and slight rotation variety
  const params = useMemo(() => {
    const seed = position[0] * 41.3 + position[2] * 67.9;
    return {
      phase: seed % (Math.PI * 2),
      baseRotY: (seed * 1.3) % (Math.PI * 2),
    };
  }, [position]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const sway = Math.sin(t * 1.0 + params.phase) * 0.15;
    const sway2 = Math.sin(t * 1.2 + params.phase + 1.5) * 0.12;
    const sway3 = Math.sin(t * 0.9 + params.phase + 3.0) * 0.18;

    if (blade1Ref.current) {
      blade1Ref.current.rotation.z = sway;
    }
    if (blade2Ref.current) {
      blade2Ref.current.rotation.z = sway2;
    }
    if (blade3Ref.current) {
      blade3Ref.current.rotation.z = sway3;
    }
  });

  return (
    <group position={position} rotation={[0, params.baseRotY, 0]}>
      {/* Blade 1 - center tall */}
      <mesh ref={blade1Ref} position={[0, 0.15, 0]}>
        <coneGeometry args={[0.04, 0.3, 3]} />
        <meshStandardMaterial color="#5a9a3a" flatShading roughness={0.9} />
      </mesh>
      {/* Blade 2 - left short */}
      <mesh ref={blade2Ref} position={[-0.06, 0.1, 0.03]} rotation={[0, 0.5, -0.2]}>
        <coneGeometry args={[0.03, 0.22, 3]} />
        <meshStandardMaterial color="#4a8a2e" flatShading roughness={0.9} />
      </mesh>
      {/* Blade 3 - right medium */}
      <mesh ref={blade3Ref} position={[0.05, 0.12, -0.02]} rotation={[0, -0.4, 0.15]}>
        <coneGeometry args={[0.035, 0.26, 3]} />
        <meshStandardMaterial color="#6aaa44" flatShading roughness={0.9} />
      </mesh>
    </group>
  );
}
