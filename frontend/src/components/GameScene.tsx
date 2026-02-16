import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { World } from './World';
import { Player } from './entities/Player';
import { NPC } from './entities/NPC';
import { npcs } from '../data/npcs';
import { useGameStore } from '../store/gameStore';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function CameraController() {
  const { camera } = useThree();
  const playerPosition = useGameStore(s => s.playerPosition);
  const targetRef = useRef(new THREE.Vector3(8, 12, 8));
  const lookAtRef = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    const targetX = playerPosition.x + 8;
    const targetY = 12;
    const targetZ = playerPosition.z + 8;

    targetRef.current.set(targetX, targetY, targetZ);
    lookAtRef.current.set(playerPosition.x, 0, playerPosition.z);

    camera.position.lerp(targetRef.current, 0.05);
    camera.lookAt(lookAtRef.current);
    camera.updateProjectionMatrix();
  });

  return null;
}

export function GameScene() {
  const initCollisionMap = useGameStore(s => s.initCollisionMap);

  useEffect(() => {
    initCollisionMap();
  }, [initCollisionMap]);

  return (
    <Canvas
      shadows
      orthographic
      camera={{
        zoom: 45,
        position: [8, 12, 8],
        near: 0.1,
        far: 100,
      }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true }}
    >
      {/* Sky color */}
      <color attach="background" args={['#87CEEB']} />

      {/* Fog for atmosphere */}
      <fog attach="fog" args={['#87CEEB', 20, 40]} />

      {/* Lighting */}
      <ambientLight intensity={0.6} color="#ffffff" />
      <directionalLight
        position={[10, 15, 5]}
        intensity={1.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      {/* Subtle fill light from opposite side */}
      <directionalLight position={[-5, 8, -5]} intensity={0.3} />

      <CameraController />
      <World />
      <Player />

      {/* Render all NPCs */}
      {npcs.map(npc => (
        <NPC key={npc.id} npc={npc} />
      ))}
    </Canvas>
  );
}
