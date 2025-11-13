import React, { useState } from 'react';
import WizardCharacter from './WizardCharacter';
import NotebookPanel from './NotebookPanel';
import OraclePedestal from './OraclePedestal';

interface VibrantCaveSceneProps {
  onHandoff: (payload: { message: string; notes: Record<'v1' | 'v2' | 'v3', string> }) => void;
}

const VibrantCaveScene: React.FC<VibrantCaveSceneProps> = ({ onHandoff }) => {
  const [message, setMessage] = useState('');
  const [notes, setNotes] = useState<Record<'v1' | 'v2' | 'v3', string>>({
    v1: '',
    v2: '',
    v3: '',
  });

  const filled = Object.values(notes).filter(n => n.trim().length > 0).length;
  const canHandoff = filled === 3;

  const handleSaveNote = (id: string, note: string) => {
    setNotes(prev => ({ ...prev, [id]: note }));
  };

  return (
    <div className="w-full h-full">
      {/* Cave background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, rgba(8,12,24,0.9) 0%, rgba(8,12,24,0.95) 60%, #060912 100%)'
      }} />
      <div className="relative z-10 h-full flex flex-col">
        {/* Top row: oracle */}
        <div className="flex items-center justify-center pt-6">
          <OraclePedestal
            enabled={canHandoff}
            notesCount={filled}
            onSummon={() => onHandoff({ message, notes })}
          />
        </div>

        {/* Middle row: wizards */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 px-6 py-6 items-end">
          <div className="flex flex-col items-center gap-3">
            <WizardCharacter
              id="v1"
              name="Formal Sentinel"
              emoji="🧙‍♂️"
              gradient="from-blue-500 to-cyan-500"
              initialNote={notes.v1}
              onSaveNote={handleSaveNote}
            />
            <div className="text-center text-[11px] text-cyan-200/70">“Structure it clearly.”</div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <WizardCharacter
              id="v2"
              name="Friendly Oracle"
              emoji="🧙‍♀️"
              gradient="from-pink-500 to-purple-500"
              initialNote={notes.v2}
              onSaveNote={handleSaveNote}
            />
            <div className="text-center text-[11px] text-cyan-200/70">“Make it approachable.”</div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <WizardCharacter
              id="v3"
              name="Analytical Sage"
              emoji="🧙"
              gradient="from-amber-500 to-orange-500"
              initialNote={notes.v3}
              onSaveNote={handleSaveNote}
            />
            <div className="text-center text-[11px] text-cyan-200/70">“Focus on accuracy.”</div>
          </div>
        </div>

        {/* Bottom row: notebook */}
        <div className="px-6 pb-6">
          <NotebookPanel message={message} setMessage={setMessage} notes={notes} />
        </div>
      </div>
    </div>
  );
};

export default VibrantCaveScene;

