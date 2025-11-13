import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VariantCardState } from '../types';

interface VibrantCompactResultsProps {
  variants: VariantCardState[];
  leader?: string;
  status: 'idle' | 'compiling' | 'running' | 'complete' | 'error';
}

const Badge: React.FC<{ label: string; ok?: boolean }> = ({ label, ok }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
        ok ? 'text-emerald-200 border-emerald-400/40 bg-emerald-900/30' : 'text-rose-200 border-rose-400/40 bg-rose-900/30'
      }`}
    >
      {ok ? '✓' : '✕'} {label}
    </span>
  );
};

const VibrantCompactResults: React.FC<VibrantCompactResultsProps> = ({ variants, leader, status }) => {
  const sorted = useMemo(() => {
    const withScores = variants.filter(v => v.score?.total !== undefined);
    const withOutputs = variants.filter(v => !!v.variant.output);
    const base = withScores.length > 0 ? withScores : withOutputs;
    return [...base].sort((a, b) => (b.score?.total || 0) - (a.score?.total || 0));
  }, [variants]);

  const winner = useMemo(() => {
    if (leader) return variants.find(v => v.variant.variant_id === leader);
    return sorted[0];
  }, [leader, sorted, variants]);

  const baseline = useMemo(() => {
    // Treat the first scored variant as "baseline"
    return variants.find(v => v.score?.total !== undefined);
  }, [variants]);

  const delta = useMemo(() => {
    if (!winner?.score?.total || !baseline?.score?.total) return undefined;
    return winner.score.total - baseline.score.total;
  }, [winner, baseline]);

  const metrics = useMemo(() => {
    const total = variants.length || 0;
    const completed = variants.filter(v => v.state === 'scored' || v.state === 'error').length;
    const withOutput = variants.filter(v => !!v.variant.output).length;
    return { total, completed, withOutput };
  }, [variants]);

  return (
    <div className="h-full flex flex-col">
      {/* Status / Winner Header */}
      <div className="px-4 pt-2 pb-3 border-b border-cyan-400/20">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="text-xs font-bold text-cyan-200/80">
              {status === 'running' || status === 'compiling' ? 'Optimizing...' : status === 'complete' ? 'Optimization complete' : 'Ready'}
            </div>
            <div className="hidden md:flex items-center gap-1 text-[10px] text-cyan-200/70">
              <span className="px-1.5 py-0.5 rounded border border-cyan-400/30 bg-black/20">Done {metrics.completed}</span>
              <span className="px-1.5 py-0.5 rounded border border-cyan-400/30 bg-black/20">Outputs {metrics.withOutput}</span>
              <span className="px-1.5 py-0.5 rounded border border-cyan-400/30 bg-black/20">Total {metrics.total}</span>
            </div>
          </div>
          <AnimatePresence>
            {winner?.score?.total !== undefined && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-[11px] font-black text-yellow-200 bg-yellow-900/20 border border-yellow-400/40 px-2 py-0.5 rounded-md"
              >
                Top {winner.score.total.toFixed(1)}
                {delta !== undefined && delta >= 0.05 && (
                  <span className="ml-1 text-emerald-200">(+{delta.toFixed(1)} vs baseline)</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Winner Card */}
      <div className="p-4">
        <div className="relative rounded-xl border border-cyan-400/30 bg-black/30 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-cyan-300/90 mb-1">Winner</div>
              <div className="text-base font-black text-white leading-tight">
                {winner?.variant.output?.category || '—'}
              </div>
              <div className="mt-1 text-xs text-cyan-100/90 line-clamp-2">
                {winner?.variant.output?.summary || (status !== 'idle' ? 'Awaiting output...' : 'Run to see results')}
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <div className="text-lg font-black bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                {winner?.score?.total !== undefined ? winner.score.total.toFixed(1) : '—'}
              </div>
              {winner?.variant.latency_ms !== undefined && (
                <div className="mt-1 text-[10px] font-mono text-cyan-200/70">
                  {winner.variant.latency_ms < 1000
                    ? `${winner.variant.latency_ms}ms`
                    : `${(winner.variant.latency_ms / 1000).toFixed(1)}s`}
                </div>
              )}
            </div>
          </div>

          {/* Components */}
          {winner?.score?.components && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge label="Valid Label" ok={winner.score.components.label_valid === 1} />
              <Badge label="Intent Match" ok={winner.score.components.label_match === 1} />
              <Badge label="Summary Length" ok={winner.score.components.summary_len_ok === 1} />
              <Badge label="No Hedging" ok={winner.score.components.no_hedging === 1} />
              <Badge label="Format OK" ok={winner.score.components.format_ok === 1} />
            </div>
          )}
        </div>
      </div>

      {/* Baseline compare */}
      {baseline && winner && baseline.variant.variant_id !== winner.variant.variant_id && (
        <div className="px-4 -mt-2">
          <div className="rounded-lg border border-cyan-400/20 bg-black/20 p-3">
            <div className="flex items-center justify-between">
              <div className="text-[11px] text-cyan-200/80">
                Baseline: <span className="font-bold text-white">{baseline.variant.variant_id.toUpperCase()}</span>
              </div>
              <div className="text-[11px] font-black text-cyan-100">
                {baseline.score?.total?.toFixed(1) ?? '—'}
              </div>
            </div>
            {baseline.score && winner.score && (
              <div className="mt-2 flex items-center gap-2 text-[10px]">
                <span className="text-cyan-200/70">Improved:</span>
                {Object.entries(winner.score.components).map(([k, v]) => {
                  const baseOk = (baseline.score as any).components[k] === 1;
                  const winOk = v === 1;
                  if (winOk && !baseOk) {
                    return <span key={k} className="px-1.5 py-0.5 rounded bg-emerald-900/30 text-emerald-200 border border-emerald-400/30">{k.replace(/_/g, ' ')}</span>;
                  }
                  return null;
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Competitors List */}
      <div className="px-4 pb-4 overflow-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
        <div className="text-[10px] font-bold text-cyan-200/70 mb-2">Competitors</div>
        <div className="space-y-2">
          {sorted.map(v => {
            const isWinner = winner && v.variant.variant_id === winner.variant.variant_id;
            return (
              <div
                key={v.variant.variant_id}
                className={`rounded-lg border p-3 bg-black/20 ${
                  isWinner ? 'border-yellow-400/50' : 'border-cyan-400/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-white">
                      {v.variant.variant_id.toUpperCase()}
                    </div>
                    <div className="text-[11px] text-cyan-100/90 line-clamp-1">
                      {v.variant.output?.summary || (v.state === 'querying' ? 'Querying...' : '—')}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-black text-cyan-100">
                      {v.score?.total !== undefined ? v.score.total.toFixed(1) : '—'}
                    </div>
                    {v.variant.latency_ms !== undefined && (
                      <div className="text-[10px] font-mono text-cyan-200/70">
                        {v.variant.latency_ms < 1000
                          ? `${v.variant.latency_ms}ms`
                          : `${(v.variant.latency_ms / 1000).toFixed(1)}s`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {sorted.length === 0 && (
            <div className="text-xs text-cyan-200/70">
              {status === 'idle' ? 'No variants yet' : 'Waiting for competitors...'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VibrantCompactResults;

