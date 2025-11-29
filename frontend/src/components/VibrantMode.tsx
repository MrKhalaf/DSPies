/**
 * VibrantMode - Pokemon-style DSPy Quest Game
 * A full-screen immersive experience teaching DSPy through gameplay
 */

import React from 'react';
import PokemonGame from './PokemonGame';

interface VibrantModeProps {
  onExitVibrantMode: () => void;
}

const VibrantMode: React.FC<VibrantModeProps> = ({ onExitVibrantMode }) => {
  return <PokemonGame onExit={onExitVibrantMode} />;
};

export default VibrantMode;
