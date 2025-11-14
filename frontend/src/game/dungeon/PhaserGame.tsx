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

  useEffect(() => {
    if (!containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 320,
      height: 192,
      zoom: 3,
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 0 }, debug: false }
      },
      render: { pixelArt: true, antialias: false },
      backgroundColor: '#0a0f1e',
      scene: []
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    const scene = new DungeonScene({
      onHandoff,
      onState
    });
    game.scene.add('DungeonScene', scene, true);
    sceneRef.current = scene;

    // Improve canvas focus and crispness
    const focusCanvas = () => {
      const canvas = game.canvas as HTMLCanvasElement | null;
      if (canvas) {
        canvas.tabIndex = 1;
        try {
          canvas.style.imageRendering = 'pixelated';
        } catch {}
        canvas.focus();
      }
    };
    focusCanvas();
    containerRef.current?.addEventListener('mousedown', focusCanvas);

    if (onReady) {
      onReady({
        setNote: (id, text) => sceneRef.current?.setNote(id, text),
        setMessage: (text) => sceneRef.current?.setMessage(text)
      });
    }

    return () => {
      containerRef.current?.removeEventListener('mousedown', focusCanvas);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        sceneRef.current = null;
      }
    };
  }, [onHandoff, onState]);

  return <div ref={containerRef} id="dungeon-root" />;
};


