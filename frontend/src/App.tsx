import { useGameStore } from './store/gameStore';
import { TitleScreen } from './components/ui/TitleScreen';
import { GameScene } from './components/GameScene';
import { DialogueBox } from './components/ui/DialogueBox';
import { HUD } from './components/ui/HUD';
import { ConceptCard } from './components/ui/ConceptCard';

export default function App() {
  const gameStarted = useGameStore(s => s.gameStarted);

  if (!gameStarted) {
    return <TitleScreen />;
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <GameScene />
      <HUD />
      <DialogueBox />
      <ConceptCard />
    </div>
  );
}
