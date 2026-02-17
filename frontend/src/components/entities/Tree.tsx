import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
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

  // Refs for foliage layers (pine has 3 cones, round has 1 sphere)
  const foliageRef1 = useRef<THREE.Mesh>(null);
  const foliageRef2 = useRef<THREE.Mesh>(null);
  const foliageRef3 = useRef<THREE.Mesh>(null);

  // Slight random rotation for variety, based on position for determinism
  const yRotation = useMemo(() => {
    const seed = position[0] * 137.5 + position[2] * 73.1;
    return (seed % 6.28) - 3.14;
  }, [position]);

  // Deterministic phase offset based on position so each tree sways differently
  const phase = useMemo(() => {
    return (position[0] * 31.7 + position[2] * 47.3) % (Math.PI * 2);
  }, [position]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (variant === 'round') {
      // Round tree: gentle sway on the sphere foliage
      if (foliageRef1.current) {
        foliageRef1.current.rotation.z = Math.sin(t * 0.8 + phase) * 0.04;
        foliageRef1.current.rotation.x = Math.sin(t * 0.6 + phase + 1.0) * 0.02;
      }
    } else {
      // Pine tree: three cone layers sway with increasing amplitude
      const baseAmp = 0.02;
      if (foliageRef1.current) {
        // Bottom cone - least sway
        foliageRef1.current.rotation.z = Math.sin(t * 0.8 + phase) * baseAmp;
      }
      if (foliageRef2.current) {
        // Middle cone - medium sway
        foliageRef2.current.rotation.z = Math.sin(t * 0.8 + phase + 0.3) * baseAmp * 1.8;
      }
      if (foliageRef3.current) {
        // Top cone - most sway
        foliageRef3.current.rotation.z = Math.sin(t * 0.8 + phase + 0.6) * baseAmp * 3.0;
        foliageRef3.current.rotation.x = Math.sin(t * 0.6 + phase + 2.0) * baseAmp * 1.5;
      }
    }
  });

  if (variant === 'round') {
    return (
      <group ref={groupRef} position={position} scale={scale} rotation={[0, yRotation, 0]}>
        {/* Trunk */}
        <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.12, 0.18, 1, 6]} />
          <meshStandardMaterial color="#6b4226" flatShading roughness={0.9} />
        </mesh>

        {/* Round foliage - slightly squashed sphere */}
        <mesh ref={foliageRef1} castShadow receiveShadow position={[0, 1.4, 0]} scale={[1, 0.8, 1]}>
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
      <mesh ref={foliageRef1} castShadow receiveShadow position={[0, 1.2, 0]}>
        <coneGeometry args={[0.8, 1.2, 6]} />
        <meshStandardMaterial color="#2d5a1b" flatShading roughness={0.8} />
      </mesh>

      {/* Middle cone */}
      <mesh ref={foliageRef2} castShadow receiveShadow position={[0, 1.9, 0]}>
        <coneGeometry args={[0.6, 1.0, 6]} />
        <meshStandardMaterial color="#357a22" flatShading roughness={0.8} />
      </mesh>

      {/* Top cone - smallest */}
      <mesh ref={foliageRef3} castShadow receiveShadow position={[0, 2.5, 0]}>
        <coneGeometry args={[0.4, 0.8, 6]} />
        <meshStandardMaterial color="#3d8a2a" flatShading roughness={0.8} />
      </mesh>
    </group>
  );
}
