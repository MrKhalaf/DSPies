import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { DungeonScene } from './scenes/DungeonScene';

interface PhaserGameProps {
  onHandoff: (payload: { message: string; notes: Record<'v1' | 'v2' | 'v3', string> }) => void;
  onState: (state: {
    notesCount: number;
    nearNpc?: 'v1' | 'v2' | 'v3';
    nearOracle?: boolean;
    isMoving?: boolean;
    openDialogNpc?: 'v1' | 'v2' | 'v3';
    playerPos?: { x: number; y: number };
    currentRoom?: string;
  }) => void;
  onReady?: (api: {
    setNote: (id: 'v1' | 'v2' | 'v3', text: string) => void;
    setMessage: (text: string) => void;
  }) => void;
}

export const PhaserGame: React.FC<PhaserGameProps> = ({ onHandoff, onState, onReady }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<DungeonScene | null>(null);
  
  // Store callbacks in refs to avoid stale closures
  const callbacksRef = useRef({ onHandoff, onState, onReady });
  useEffect(() => {
    callbacksRef.current = { onHandoff, onState, onReady };
  });

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Destroy any existing game first
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 448,
      height: 288,
      zoom: 2.1,
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 0 }, debug: false }
      },
      render: { 
        pixelArt: true, 
        antialias: false,
        roundPixels: true
      },
      backgroundColor: '#030712',
      scene: []
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    const scene = new DungeonScene({
      onHandoff: (payload) => callbacksRef.current.onHandoff(payload),
      onState: (state) => callbacksRef.current.onState(state)
    });
    game.scene.add('DungeonScene', scene, true);
    sceneRef.current = scene;

    const container = containerRef.current;
    const focusCanvas = () => {
      const canvas = game.canvas;
      if (canvas) {
        canvas.tabIndex = 1;
        canvas.style.imageRendering = 'pixelated';
        canvas.focus();
      }
    };
    
    setTimeout(focusCanvas, 200);
    container.addEventListener('mousedown', focusCanvas);
    container.addEventListener('click', focusCanvas);

    if (callbacksRef.current.onReady) {
      callbacksRef.current.onReady({
        setNote: (id, text) => sceneRef.current?.setNote(id, text),
        setMessage: (text) => sceneRef.current?.setMessage(text)
      });
    }

    return () => {
      container.removeEventListener('mousedown', focusCanvas);
      container.removeEventListener('click', focusCanvas);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        sceneRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div 
      ref={containerRef} 
      id="dungeon-root" 
      style={{ 
        width: '940px',
        height: '605px',
        imageRendering: 'pixelated'
      }}
    />
  );
};
