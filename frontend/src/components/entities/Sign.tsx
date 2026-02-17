import { useRef } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

interface SignProps {
  position: [number, number, number];
  text: string;
}

export function Sign({ position, text }: SignProps) {
  const groupRef = useRef<THREE.Group>(null);

  const postHeight = 1.2;
  const boardWidth = 2.0;
  const boardHeight = 0.6;

  return (
    <group ref={groupRef} position={position}>
      {/* Vertical post */}
      <mesh castShadow receiveShadow position={[0, postHeight / 2, 0]}>
        <cylinderGeometry args={[0.06, 0.08, postHeight, 6]} />
        <meshStandardMaterial color="#6b4226" flatShading roughness={0.9} />
      </mesh>

      {/* Sign board */}
      <mesh
        castShadow
        receiveShadow
        position={[0, postHeight - 0.1, 0.03]}
      >
        <boxGeometry args={[boardWidth, boardHeight, 0.08]} />
        <meshStandardMaterial color="#deb887" flatShading roughness={0.7} />
      </mesh>

      {/* Sign board border */}
      <mesh position={[0, postHeight - 0.1, 0.08]}>
        <boxGeometry args={[boardWidth + 0.08, boardHeight + 0.08, 0.02]} />
        <meshStandardMaterial color="#8b6914" flatShading roughness={0.8} />
      </mesh>

      {/* Text on the sign (facing positive Z / toward camera) */}
      <Html
        position={[0, postHeight - 0.1, 0.15]}
        center
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            color: '#3b2206',
            fontSize: '11px',
            fontFamily: '"Press Start 2P", monospace, sans-serif',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            textShadow: '0 0 2px rgba(255,255,255,0.3)',
          }}
        >
          {text}
        </div>
      </Html>
    </group>
  );
}
