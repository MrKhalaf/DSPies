import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

interface BuildingProps {
  position: [number, number, number];
  size: [number, number, number]; // width, height, depth
  wallColor: string;
  roofColor: string;
  label: string;
  roofType?: 'peaked' | 'flat';
}

// Smoke particle component for chimney
function SmokeParticle({ offset, chimneyPos }: { offset: number; chimneyPos: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialY = chimneyPos[1] + 0.2;
  const phaseRef = useRef(offset);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    phaseRef.current += delta * 0.4;
    if (phaseRef.current > 1) phaseRef.current -= 1;

    const t = phaseRef.current;
    meshRef.current.position.y = initialY + t * 1.2;
    meshRef.current.position.x = chimneyPos[0] + Math.sin(t * Math.PI * 2 + offset * 5) * 0.12;
    meshRef.current.position.z = chimneyPos[2] + Math.cos(t * Math.PI * 2 + offset * 3) * 0.08;

    const scale = 0.06 + t * 0.08;
    meshRef.current.scale.setScalar(scale);

    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.opacity = Math.max(0, 1 - t);
  });

  return (
    <mesh ref={meshRef} position={[chimneyPos[0], initialY, chimneyPos[2]]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshStandardMaterial
        color="#c8c8c8"
        transparent
        opacity={0.7}
        flatShading
        depthWrite={false}
      />
    </mesh>
  );
}

export function Building({
  position,
  size,
  wallColor,
  roofColor,
  label,
  roofType = 'peaked',
}: BuildingProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [width, height, depth] = size;

  const doorColor = useMemo(() => {
    const c = new THREE.Color(wallColor);
    c.multiplyScalar(0.6);
    return '#' + c.getHexString();
  }, [wallColor]);

  const doorFrameColor = useMemo(() => {
    const c = new THREE.Color(wallColor);
    c.multiplyScalar(0.45);
    return '#' + c.getHexString();
  }, [wallColor]);

  const windowColor = '#a8d8ea';

  const doorWidth = Math.min(0.6, width * 0.25);
  const doorHeight = Math.min(1.0, height * 0.5);
  const windowSize = Math.min(0.5, width * 0.2);

  // Chimney position (right side of roof, for peaked roofs)
  const chimneyX = width * 0.25;
  const chimneyY = height + 0.55;
  const chimneyZ = -depth * 0.15;

  // Lamp post position (right side of the door, front)
  const lampX = doorWidth / 2 + 0.5;
  const lampZ = depth / 2 + 0.3;

  return (
    <group ref={groupRef} position={position}>
      {/* Walls */}
      <mesh castShadow receiveShadow position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={wallColor} flatShading roughness={0.7} />
      </mesh>

      {/* Roof */}
      {roofType === 'peaked' ? (
        <mesh
          castShadow
          receiveShadow
          position={[0, height + 0.4, 0]}
          rotation={[0, Math.PI / 4, 0]}
        >
          <coneGeometry args={[Math.max(width, depth) * 0.75, 0.9, 4]} />
          <meshStandardMaterial color={roofColor} flatShading roughness={0.6} />
        </mesh>
      ) : (
        <mesh
          castShadow
          receiveShadow
          position={[0, height + 0.15, 0]}
        >
          <boxGeometry args={[width + 0.3, 0.3, depth + 0.3]} />
          <meshStandardMaterial color={roofColor} flatShading roughness={0.6} />
        </mesh>
      )}

      {/* === CHIMNEY + SMOKE (peaked roofs only) === */}
      {roofType === 'peaked' && (
        <>
          {/* Chimney block */}
          <mesh
            castShadow
            position={[chimneyX, chimneyY, chimneyZ]}
          >
            <boxGeometry args={[0.3, 0.5, 0.3]} />
            <meshStandardMaterial color="#8b4513" flatShading roughness={0.8} />
          </mesh>
          {/* Chimney cap */}
          <mesh position={[chimneyX, chimneyY + 0.3, chimneyZ]}>
            <boxGeometry args={[0.38, 0.08, 0.38]} />
            <meshStandardMaterial color="#6b3410" flatShading roughness={0.8} />
          </mesh>
          {/* Smoke particles */}
          {[0, 0.5].map((offset, i) => (
            <SmokeParticle
              key={i}
              offset={offset}
              chimneyPos={[chimneyX, chimneyY + 0.35, chimneyZ]}
            />
          ))}
        </>
      )}

      {/* Door (front face, facing positive Z) */}
      <mesh
        castShadow
        position={[0, doorHeight / 2, depth / 2 + 0.02]}
      >
        <boxGeometry args={[doorWidth, doorHeight, 0.05]} />
        <meshStandardMaterial color={doorColor} flatShading roughness={0.8} />
      </mesh>

      {/* === DOOR FRAME === */}
      {/* Top frame */}
      <mesh position={[0, doorHeight + 0.04, depth / 2 + 0.03]}>
        <boxGeometry args={[doorWidth + 0.14, 0.08, 0.07]} />
        <meshStandardMaterial color={doorFrameColor} flatShading roughness={0.8} />
      </mesh>
      {/* Left frame */}
      <mesh position={[-doorWidth / 2 - 0.04, doorHeight / 2, depth / 2 + 0.03]}>
        <boxGeometry args={[0.08, doorHeight, 0.07]} />
        <meshStandardMaterial color={doorFrameColor} flatShading roughness={0.8} />
      </mesh>
      {/* Right frame */}
      <mesh position={[doorWidth / 2 + 0.04, doorHeight / 2, depth / 2 + 0.03]}>
        <boxGeometry args={[0.08, doorHeight, 0.07]} />
        <meshStandardMaterial color={doorFrameColor} flatShading roughness={0.8} />
      </mesh>
      {/* Doorknob */}
      <mesh position={[doorWidth / 2 - 0.08, doorHeight * 0.45, depth / 2 + 0.08]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#d4a940" flatShading roughness={0.4} metalness={0.6} />
      </mesh>

      {/* === AWNING / OVERHANG above door === */}
      <mesh
        castShadow
        position={[0, doorHeight + 0.2, depth / 2 + 0.2]}
        rotation={[0.3, 0, 0]}
      >
        <boxGeometry args={[doorWidth + 0.5, 0.06, 0.45]} />
        <meshStandardMaterial color={roofColor} flatShading roughness={0.6} />
      </mesh>

      {/* Porch / Step in front of door */}
      <mesh
        receiveShadow
        position={[0, 0.05, depth / 2 + 0.25]}
      >
        <boxGeometry args={[doorWidth + 0.4, 0.1, 0.5]} />
        <meshStandardMaterial color="#a0856c" flatShading roughness={0.9} />
      </mesh>

      {/* === WELCOME MAT === */}
      <mesh
        receiveShadow
        position={[0, 0.11, depth / 2 + 0.35]}
      >
        <boxGeometry args={[doorWidth + 0.1, 0.02, 0.3]} />
        <meshStandardMaterial color="#8b4232" flatShading roughness={1.0} />
      </mesh>

      {/* === LAMP POST (right side of door) === */}
      <group position={[lampX, 0, lampZ]}>
        {/* Post */}
        <mesh castShadow position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 1.2, 6]} />
          <meshStandardMaterial color="#3d3d3d" flatShading roughness={0.7} />
        </mesh>
        {/* Lamp arm */}
        <mesh position={[0, 1.18, 0]}>
          <boxGeometry args={[0.2, 0.04, 0.04]} />
          <meshStandardMaterial color="#3d3d3d" flatShading roughness={0.7} />
        </mesh>
        {/* Lamp globe */}
        <mesh position={[0, 1.28, 0]}>
          <sphereGeometry args={[0.1, 6, 6]} />
          <meshStandardMaterial
            color="#fff5cc"
            emissive="#ffcc44"
            emissiveIntensity={0.6}
            flatShading
            roughness={0.3}
          />
        </mesh>
        {/* Post base */}
        <mesh receiveShadow position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.06, 6]} />
          <meshStandardMaterial color="#3d3d3d" flatShading roughness={0.7} />
        </mesh>
      </group>

      {/* Windows - left side (with glow) */}
      <mesh position={[-width / 2 - 0.02, height * 0.6, 0]}>
        <boxGeometry args={[0.05, windowSize, windowSize]} />
        <meshStandardMaterial
          color={windowColor}
          emissive="#ffcc66"
          emissiveIntensity={0.3}
          flatShading
          roughness={0.3}
        />
      </mesh>

      {/* Windows - right side (with glow) */}
      <mesh position={[width / 2 + 0.02, height * 0.6, 0]}>
        <boxGeometry args={[0.05, windowSize, windowSize]} />
        <meshStandardMaterial
          color={windowColor}
          emissive="#ffcc66"
          emissiveIntensity={0.3}
          flatShading
          roughness={0.3}
        />
      </mesh>

      {/* Window on front face, to the side of the door (with glow) */}
      {width > 2 && (
        <>
          <mesh position={[-width * 0.3, height * 0.6, depth / 2 + 0.02]}>
            <boxGeometry args={[windowSize, windowSize, 0.05]} />
            <meshStandardMaterial
              color={windowColor}
              emissive="#ffcc66"
              emissiveIntensity={0.3}
              flatShading
              roughness={0.3}
            />
          </mesh>
          <mesh position={[width * 0.3, height * 0.6, depth / 2 + 0.02]}>
            <boxGeometry args={[windowSize, windowSize, 0.05]} />
            <meshStandardMaterial
              color={windowColor}
              emissive="#ffcc66"
              emissiveIntensity={0.3}
              flatShading
              roughness={0.3}
            />
          </mesh>
        </>
      )}

      {/* === BUILDING SIGN (3D wooden plank with text) === */}
      <group position={[0, doorHeight + 0.55, depth / 2 + 0.12]} rotation={[0.05, 0, 0]}>
        {/* Wooden plank background */}
        <mesh castShadow>
          <boxGeometry args={[Math.min(width * 0.7, 2.2), 0.35, 0.06]} />
          <meshStandardMaterial color="#8b6914" flatShading roughness={0.9} />
        </mesh>
        {/* Plank border / trim */}
        <mesh position={[0, 0, 0.01]}>
          <boxGeometry args={[Math.min(width * 0.7, 2.2) + 0.08, 0.35 + 0.06, 0.02]} />
          <meshStandardMaterial color="#6b4f10" flatShading roughness={0.9} />
        </mesh>
        {/* Text label via Html */}
        <Html
          position={[0, 0, 0.06]}
          center
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              color: '#fff5e0',
              padding: '2px 8px',
              fontSize: '12px',
              fontFamily: '"Press Start 2P", monospace, sans-serif',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              textAlign: 'center',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
            }}
          >
            {label}
          </div>
        </Html>
      </group>
    </group>
  );
}
