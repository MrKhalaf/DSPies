export interface Position {
  x: number;
  z: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface NPCData {
  id: string;
  name: string;
  position: Position;
  color: string;
  accentColor: string;
  dialogue: string[];
  concept: {
    name: string;
    description: string;
  };
}

export interface BuildingData {
  position: [number, number, number];
  size: [number, number, number];
  wallColor: string;
  roofColor: string;
  label: string;
}
