import { useRef } from 'react';
import * as THREE from 'three';

interface FenceProps {
  position: [number, number, number];
  length: number; // number of segments
  rotation?: number; // y-axis rotation in radians
}

export function Fence({
  position,
  length,
  rotation = 0,
}: FenceProps) {
  const groupRef = useRef<THREE.Group>(null);

  const segments = [];
  for (let i = 0; i < length; i++) {
    segments.push(
      <FenceSegment key={i} offset={i} isLast={i === length - 1} />
    );
  }

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]}>
      {segments}
    </group>
  );
}

interface FenceSegmentProps {
  offset: number;
  isLast: boolean;
}

function FenceSegment({ offset, isLast }: FenceSegmentProps) {
  const postRadius = 0.05;
  const postHeight = 0.6;
  const railThickness = 0.04;
  const segmentWidth = 1.0;
  const woodColor = '#b8860b';
  const railColor = '#a07808';

  return (
    <group position={[offset * segmentWidth, 0, 0]}>
      {/* Left post */}
      <mesh castShadow receiveShadow position={[0, postHeight / 2, 0]}>
        <cylinderGeometry args={[postRadius, postRadius, postHeight, 5]} />
        <meshStandardMaterial color={woodColor} flatShading roughness={0.9} />
      </mesh>

      {/* Right post (only render on last segment to avoid duplicates) */}
      {isLast && (
        <mesh castShadow receiveShadow position={[segmentWidth, postHeight / 2, 0]}>
          <cylinderGeometry args={[postRadius, postRadius, postHeight, 5]} />
          <meshStandardMaterial color={woodColor} flatShading roughness={0.9} />
        </mesh>
      )}

      {/* Top rail */}
      <mesh
        castShadow
        receiveShadow
        position={[segmentWidth / 2, postHeight * 0.8, 0]}
      >
        <boxGeometry args={[segmentWidth, railThickness, railThickness]} />
        <meshStandardMaterial color={railColor} flatShading roughness={0.85} />
      </mesh>

      {/* Bottom rail */}
      <mesh
        castShadow
        receiveShadow
        position={[segmentWidth / 2, postHeight * 0.35, 0]}
      >
        <boxGeometry args={[segmentWidth, railThickness, railThickness]} />
        <meshStandardMaterial color={railColor} flatShading roughness={0.85} />
      </mesh>
    </group>
  );
}
