import { useRef, useMemo } from 'react';
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

  const windowColor = '#a8d8ea';

  const doorWidth = Math.min(0.6, width * 0.25);
  const doorHeight = Math.min(1.0, height * 0.5);
  const windowSize = Math.min(0.5, width * 0.2);

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

      {/* Door (front face, facing positive Z) */}
      <mesh
        castShadow
        position={[0, doorHeight / 2, depth / 2 + 0.02]}
      >
        <boxGeometry args={[doorWidth, doorHeight, 0.05]} />
        <meshStandardMaterial color={doorColor} flatShading roughness={0.8} />
      </mesh>

      {/* Porch / Step in front of door */}
      <mesh
        receiveShadow
        position={[0, 0.05, depth / 2 + 0.25]}
      >
        <boxGeometry args={[doorWidth + 0.4, 0.1, 0.5]} />
        <meshStandardMaterial color="#a0856c" flatShading roughness={0.9} />
      </mesh>

      {/* Windows - left side */}
      <mesh position={[-width / 2 - 0.02, height * 0.6, 0]}>
        <boxGeometry args={[0.05, windowSize, windowSize]} />
        <meshStandardMaterial color={windowColor} flatShading roughness={0.3} />
      </mesh>

      {/* Windows - right side */}
      <mesh position={[width / 2 + 0.02, height * 0.6, 0]}>
        <boxGeometry args={[0.05, windowSize, windowSize]} />
        <meshStandardMaterial color={windowColor} flatShading roughness={0.3} />
      </mesh>

      {/* Window on front face, to the side of the door */}
      {width > 2 && (
        <>
          <mesh position={[-width * 0.3, height * 0.6, depth / 2 + 0.02]}>
            <boxGeometry args={[windowSize, windowSize, 0.05]} />
            <meshStandardMaterial color={windowColor} flatShading roughness={0.3} />
          </mesh>
          <mesh position={[width * 0.3, height * 0.6, depth / 2 + 0.02]}>
            <boxGeometry args={[windowSize, windowSize, 0.05]} />
            <meshStandardMaterial color={windowColor} flatShading roughness={0.3} />
          </mesh>
        </>
      )}

      {/* Floating label above building */}
      <Html
        position={[0, height + 1.8, 0]}
        center
        distanceFactor={15}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '13px',
            fontFamily: '"Press Start 2P", monospace, sans-serif',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            border: '2px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}
