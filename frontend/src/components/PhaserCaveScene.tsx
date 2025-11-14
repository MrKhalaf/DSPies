import React, { useCallback, useRef, useState } from 'react';
import { PhaserGame } from '../game/dungeon/PhaserGame';

interface PhaserCaveSceneProps {
  onHandoff: (payload: { message: string; notes: Record<'v1' | 'v2' | 'v3', string> }) => void;
  onExit?: () => void;
}

type WiseId = 'v1' | 'v2' | 'v3';

const PhaserCaveScene: React.FC<PhaserCaveSceneProps> = ({ onHandoff, onExit }) => {
  const [message, setMessage] = useState('');
  const [notesCount, setNotesCount] = useState(0);
  const [nearNpc, setNearNpc] = useState<WiseId | undefined>(undefined);
  const [nearOracle, setNearOracle] = useState<boolean | undefined>(undefined);
  const [isMoving, setIsMoving] = useState(false);
  const [dialogNpc, setDialogNpc] = useState<WiseId | null>(null);
  const [tempNote, setTempNote] = useState('');
  const apiRef = useRef<{ setNote: (id: WiseId, text: string) => void; setMessage: (text: string) => void } | null>(null);

  const onSceneState = useCallback((s: { notesCount: number; nearNpc?: WiseId; nearOracle?: boolean; isMoving?: boolean; }) => {
    setNotesCount(s.notesCount || 0);
    setNearNpc(s.nearNpc);
    setNearOracle(s.nearOracle);
    setIsMoving(!!s.isMoving);
  }, []);

  return (
    <div className="w-full h-full">
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, rgba(8,12,24,0.9) 0%, rgba(8,12,24,0.95) 60%, #060912 100%)'
      }} />

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        <div className="px-3 py-1 rounded-lg border border-cyan-400/30 bg-black/40 text-cyan-100 text-xs font-bold">
          WASD/Arrows: Move • E/Space: Interact • Notes {notesCount}/3
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-cyan-400/30 bg-black/40">
          <div className="text-[11px] text-cyan-200/80">Request</div>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='e.g., "I was double-charged after upgrading my plan."'
            className="w-[360px] max-w-[60vw] rounded-lg border border-cyan-400/30 bg-black/30 text-white placeholder:text-cyan-200/50 text-xs px-2 py-1 focus:outline-none focus:border-pink-400/60"
          />
        </div>
      </div>

      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <div className="relative rounded-2xl border border-cyan-400/30 overflow-hidden shadow-2xl" style={{ width: 320 * 3, height: 192 * 3 }}>
          <PhaserGame
            onHandoff={({ message: msg, notes }) => onHandoff({ message: msg || message, notes })}
            onState={(s) => {
              onSceneState(s);
              if ((s as any).openDialogNpc) {
                const id = (s as any).openDialogNpc as WiseId;
                setDialogNpc(id);
                setTempNote('');
              }
            }}
            onReady={(api) => {
              apiRef.current = api as any;
            }}
          />
          {onExit && (
            <button
              onClick={onExit}
              className="absolute top-2 right-2 z-20 px-3 py-1 rounded-md text-[11px] font-bold bg-gradient-to-r from-pink-500 to-purple-600 text-white border border-white/30 shadow"
            >
              Exit
            </button>
          )}
          <div className="pointer-events-none absolute top-2 left-2 text-[10px] text-cyan-200/70">
            Oracle at the back • Three mimbars along the right wall
          </div>
          {nearNpc && (
            <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] font-bold text-emerald-200 bg-black/60 rounded px-3 py-1 border border-emerald-400/40">
              Press E to speak
            </div>
          )}
          {nearOracle && notesCount === 3 && (
            <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] font-bold text-yellow-200 bg-black/60 rounded px-3 py-1 border border-yellow-400/40">
              Press E to hand notes (3/3)
            </div>
          )}
          {dialogNpc && (
            <div className="absolute inset-0 z-30 grid place-items-center bg-black/50 backdrop-blur">
              <div className="w-[520px] max-w-[90vw] rounded-2xl border border-cyan-400/30 bg-black/80 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-cyan-200/80">
                    Speak to {dialogNpc === 'v1' ? 'Formal Sentinel' : dialogNpc === 'v2' ? 'Friendly Oracle' : 'Analytical Sage'}
                  </div>
                  <button
                    onClick={() => setDialogNpc(null)}
                    className="text-cyan-200/70 hover:text-white text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
                <div className="text-[13px] text-cyan-100/90 mb-3">“Share your take on how to solve this. I will take notes.”</div>
                <textarea
                  value={tempNote}
                  onChange={(e) => setTempNote(e.target.value)}
                  placeholder="Type note…"
                  className="w-full h-28 rounded-xl border border-cyan-400/30 bg-black/40 text-white placeholder:text-cyan-200/50 text-sm p-3 focus:outline-none focus:border-pink-400/60"
                />
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    onClick={() => setDialogNpc(null)}
                    className="px-3 py-2 rounded-lg text-xs font-bold border border-cyan-400/30 text-cyan-100 hover:bg-black/40"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (apiRef.current && dialogNpc && tempNote.trim()) {
                        apiRef.current.setNote(dialogNpc, tempNote.trim());
                        setDialogNpc(null);
                        setTempNote('');
                      }
                    }}
                    disabled={!tempNote.trim()}
                    className={`px-3 py-2 rounded-lg text-xs font-black ${tempNote.trim() ? 'bg-gradient-to-r from-cyan-400 to-blue-400 text-black' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhaserCaveScene;


