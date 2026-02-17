import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { World } from './World';
import { Player } from './entities/Player';
import { NPC } from './entities/NPC';
import { npcs } from '../data/npcs';
import { useGameStore } from '../store/gameStore';

const CAMERA_OFFSET_X = 8;
const CAMERA_OFFSET_Y = 12;
const CAMERA_OFFSET_Z = 8;
const CAMERA_POS_LERP = 0.14;
const CAMERA_LOOKAT_LERP = 0.2;

const ORTHO_BASE_ZOOM = 52;
const ORTHO_BASE_SHORT_EDGE = 900;
const ORTHO_BASE_ASPECT = 1.6;
const ORTHO_MAX_ASPECT_BOOST = 3;
const ORTHO_MIN_ZOOM = 20;
const ORTHO_MAX_ZOOM = 260;

const MIN_DPR = 0.25;
const MAX_DPR = 1.75;
const MAX_DRAWBUFFER_DIMENSION = 8192;

function getResponsiveOrthoZoom(width: number, height: number): number {
  const shortestEdge = Math.max(320, Math.min(width, height));
  const aspect = width / Math.max(1, height);
  const aspectBoost = THREE.MathUtils.clamp(
    aspect / ORTHO_BASE_ASPECT,
    1,
    ORTHO_MAX_ASPECT_BOOST
  );

  const scaledZoom =
    ORTHO_BASE_ZOOM *
    (shortestEdge / ORTHO_BASE_SHORT_EDGE) *
    aspectBoost;

  return THREE.MathUtils.clamp(scaledZoom, ORTHO_MIN_ZOOM, ORTHO_MAX_ZOOM);
}

function getSafeDpr(width: number, height: number, deviceDpr: number): number {
  const maxViewportDimension = Math.max(1, width, height);
  const maxByDimension = MAX_DRAWBUFFER_DIMENSION / maxViewportDimension;
  const upperBound = Math.min(MAX_DPR, maxByDimension);
  return THREE.MathUtils.clamp(deviceDpr, MIN_DPR, Math.max(MIN_DPR, upperBound));
}

function CameraController() {
  const { camera, size } = useThree();
  const playerPosition = useGameStore(s => s.playerPosition);
  const targetPosition = useGameStore(s => s.targetPosition);
  const isMoving = useGameStore(s => s.isMoving);

  const cameraTargetRef = useRef(
    new THREE.Vector3(CAMERA_OFFSET_X, CAMERA_OFFSET_Y, CAMERA_OFFSET_Z)
  );
  const desiredLookAtRef = useRef(
    new THREE.Vector3(playerPosition.x, 0, playerPosition.z)
  );
  const smoothLookAtRef = useRef(
    new THREE.Vector3(playerPosition.x, 0, playerPosition.z)
  );

  useFrame(() => {
    const focusX = isMoving ? targetPosition.x : playerPosition.x;
    const focusZ = isMoving ? targetPosition.z : playerPosition.z;

    desiredLookAtRef.current.set(focusX, 0, focusZ);
    smoothLookAtRef.current.lerp(desiredLookAtRef.current, CAMERA_LOOKAT_LERP);

    cameraTargetRef.current.set(
      smoothLookAtRef.current.x + CAMERA_OFFSET_X,
      CAMERA_OFFSET_Y,
      smoothLookAtRef.current.z + CAMERA_OFFSET_Z
    );

    camera.position.lerp(cameraTargetRef.current, CAMERA_POS_LERP);
    camera.lookAt(smoothLookAtRef.current);

    if ((camera as THREE.OrthographicCamera).isOrthographicCamera) {
      const ortho = camera as THREE.OrthographicCamera;
      const targetZoom = getResponsiveOrthoZoom(size.width, size.height);
      if (Math.abs(ortho.zoom - targetZoom) > 0.05) {
        ortho.zoom = THREE.MathUtils.lerp(ortho.zoom, targetZoom, 0.18);
        ortho.updateProjectionMatrix();
      }
    }
  });

  return null;
}

export function GameScene() {
  const initCollisionMap = useGameStore(s => s.initCollisionMap);

  const [safeDpr, setSafeDpr] = useState(() => {
    if (typeof window === 'undefined') return 1;
    return getSafeDpr(
      window.innerWidth,
      window.innerHeight,
      window.devicePixelRatio || 1
    );
  });

  const initialZoom =
    typeof window === 'undefined'
      ? ORTHO_BASE_ZOOM
      : getResponsiveOrthoZoom(window.innerWidth, window.innerHeight);

  useEffect(() => {
    initCollisionMap();
  }, [initCollisionMap]);

  useEffect(() => {
    const updateDpr = () => {
      setSafeDpr(
        getSafeDpr(
          window.innerWidth,
          window.innerHeight,
          window.devicePixelRatio || 1
        )
      );
    };

    updateDpr();
    window.addEventListener('resize', updateDpr);
    return () => window.removeEventListener('resize', updateDpr);
  }, []);

  return (
    <Canvas
      shadows
      orthographic
      camera={{
        zoom: initialZoom,
        position: [CAMERA_OFFSET_X, CAMERA_OFFSET_Y, CAMERA_OFFSET_Z],
        near: 0.1,
        far: 100,
      }}
      dpr={safeDpr}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#87CEEB']} />
      <fog attach="fog" args={['#87CEEB', 18, 42]} />

      <ambientLight intensity={0.72} color="#ffffff" />
      <directionalLight
        position={[10, 15, 5]}
        intensity={1.0}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <directionalLight position={[-6, 7, -4]} intensity={0.25} />

      <CameraController />
      <World />
      <Player />

      {npcs.map(npc => (
        <NPC key={npc.id} npc={npc} />
      ))}
    </Canvas>
  );
}
