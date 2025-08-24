import React, { useState } from 'react';

function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const resp = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input_text: text }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.detail || 'Request failed');
      }
      setResult(`Run started with id ${data.run_id}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="container max-w-7xl">
        <h1 className="text-2xl font-bold text-center mb-4">Interactive Prompt Runner</h1>
        <p className="text-center text-gray-600 mb-6">
          Enter a short message below and start a run. The system tries different strategies and highlights the best response.
        </p>
        <textarea
          className="w-full p-4 border border-gray-300 rounded-lg mb-4"
          rows={4}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type your message here..."
        />
        <div className="text-center">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={run}
            disabled={loading}
          >
            {loading ? 'Running...' : 'Run'}
          </button>
        </div>
        {error && <div className="text-center text-red-600 mt-4">{error}</div>}
        {result && <div className="text-center text-gray-900 mt-4">{result}</div>}
      </div>
    </div>
  );
}

export default App;
