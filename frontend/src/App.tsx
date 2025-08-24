import React, { useState } from 'react';

function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input_text: text }),
      });
      const { run_id } = await res.json();
      const runRes = await fetch(`/api/run/${run_id}`);
      const data = await runRes.json();
      setResult(data);
    } catch (err) {
      setResult({ error: 'Unable to complete request' });
    } finally {
      setRunning(false);
    }
  };

  return (
    <main>
      {!result && (
        <section>
          <h1>Interactive Classification Demo</h1>
          <p>
            Enter a short message to see how different approaches evaluate it and
            produce a concise summary.
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
            placeholder="Type your message"
          />
          <button onClick={run} disabled={running || !text}>
            {running ? 'Running…' : 'Run'}
          </button>
        </section>
      )}
      {result && (
        <section>
          <h2>Result</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
          <button onClick={() => setResult(null)}>Run Again</button>
        </section>
      )}
    </main>
  );
}

export default App;
