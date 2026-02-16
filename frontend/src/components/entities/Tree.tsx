import { useRef, useMemo } from 'react';
import * as THREE from 'three';

interface TreeProps {
  position: [number, number, number];
  scale?: number;
  variant?: 'pine' | 'round';
}

export function Tree({
  position,
  scale = 1,
  variant = 'pine',
}: TreeProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Slight random rotation for variety, based on position for determinism
  const yRotation = useMemo(() => {
    const seed = position[0] * 137.5 + position[2] * 73.1;
    return (seed % 6.28) - 3.14;
  }, [position]);

  if (variant === 'round') {
    return (
      <group ref={groupRef} position={position} scale={scale} rotation={[0, yRotation, 0]}>
        {/* Trunk */}
        <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.12, 0.18, 1, 6]} />
          <meshStandardMaterial color="#6b4226" flatShading roughness={0.9} />
        </mesh>

        {/* Round foliage - slightly squashed sphere */}
        <mesh castShadow receiveShadow position={[0, 1.4, 0]} scale={[1, 0.8, 1]}>
          <sphereGeometry args={[0.9, 6, 5]} />
          <meshStandardMaterial color="#2d7a1b" flatShading roughness={0.8} />
        </mesh>
      </group>
    );
  }

  // Pine variant
  return (
    <group ref={groupRef} position={position} scale={scale} rotation={[0, yRotation, 0]}>
      {/* Trunk */}
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.18, 1, 6]} />
        <meshStandardMaterial color="#6b4226" flatShading roughness={0.9} />
      </mesh>

      {/* Bottom cone - largest */}
      <mesh castShadow receiveShadow position={[0, 1.2, 0]}>
        <coneGeometry args={[0.8, 1.2, 6]} />
        <meshStandardMaterial color="#2d5a1b" flatShading roughness={0.8} />
      </mesh>

      {/* Middle cone */}
      <mesh castShadow receiveShadow position={[0, 1.9, 0]}>
        <coneGeometry args={[0.6, 1.0, 6]} />
        <meshStandardMaterial color="#357a22" flatShading roughness={0.8} />
      </mesh>

      {/* Top cone - smallest */}
      <mesh castShadow receiveShadow position={[0, 2.5, 0]}>
        <coneGeometry args={[0.4, 0.8, 6]} />
        <meshStandardMaterial color="#3d8a2a" flatShading roughness={0.8} />
      </mesh>
    </group>
  );
}
