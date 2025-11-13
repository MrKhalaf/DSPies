import React from 'react';

interface NotebookPanelProps {
  message: string;
  setMessage: (m: string) => void;
  notes: Record<'v1' | 'v2' | 'v3', string>;
}

const NotebookPanel: React.FC<NotebookPanelProps> = ({ message, setMessage, notes }) => {
  const filled = Object.values(notes).filter(n => n.trim().length > 0).length;
  return (
    <div className="rounded-2xl border border-cyan-400/30 bg-black/40 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-bold text-cyan-200/80">Notebook</div>
        <div className="text-[11px] text-cyan-200/80">Notes {filled}/3</div>
      </div>
      <div className="text-[11px] text-cyan-200/70 mb-2">Customer Message</div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder='Type a customer message… e.g., "I was double-charged after upgrading my plan."'
        className="w-full h-24 rounded-xl border border-cyan-400/30 bg-black/30 text-white placeholder:text-cyan-200/50 text-sm p-3 focus:outline-none focus:border-pink-400/60"
      />
      <div className="grid grid-cols-3 gap-2 mt-3">
        {(['v1', 'v2', 'v3'] as const).map(id => (
          <div key={id} className="rounded-lg border border-cyan-400/20 bg-black/30 p-2">
            <div className="text-[10px] text-cyan-200/70 mb-1">Note {id.toUpperCase()}</div>
            <div className="text-xs text-white line-clamp-3 min-h-[2.25rem]">
              {notes[id] ? notes[id] : <span className="text-cyan-200/50">No note yet</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotebookPanel;

