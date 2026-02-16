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

      {/* Western fence (along x=-10), from z=-10 to z=10 */}
      <Fence position={[-10, 0, -10]} length={20} rotation={Math.PI / 2} />

      {/* Eastern fence (along x=10), from z=-10 to z=10 */}
      <Fence position={[10, 0, -10]} length={20} rotation={Math.PI / 2} />

      {/* Northern fence (along z=-10) */}
      <Fence position={[-10, 0, -10]} length={20} rotation={0} />

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
    </group>
  );
}

/**
 * Small decorative flower patch - a few colored dots on the ground.
 */
function FlowerPatch({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) {
  return (
    <group position={position}>
      <mesh receiveShadow>
        <sphereGeometry args={[0.1, 5, 4]} />
        <meshStandardMaterial color={color} flatShading roughness={0.7} />
      </mesh>
      <mesh receiveShadow position={[0.2, 0, 0.15]}>
        <sphereGeometry args={[0.08, 5, 4]} />
        <meshStandardMaterial color={color} flatShading roughness={0.7} />
      </mesh>
      <mesh receiveShadow position={[-0.15, 0, 0.1]}>
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
 * Small decorative pond.
 */
function Pond({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Water surface */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 8]} />
        <meshStandardMaterial
          color="#4a90b8"
          roughness={0.2}
          metalness={0.1}
          transparent
          opacity={0.85}
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
