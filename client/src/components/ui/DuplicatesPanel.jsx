import { motion } from 'framer-motion';

function SimilarityBadge({ value }) {
  const pct = Math.round(value * 100);
  const tone = pct >= 90
    ? 'border-danger/30 bg-danger/10 text-danger'
    : pct >= 75
      ? 'border-accent3/30 bg-accent3/10 text-accent3'
      : 'border-accent/30 bg-accent/10 text-accent';
  return (
    <span className={`rounded-full border px-2.5 py-1 font-mono text-xs font-bold ${tone}`}>
      {pct}%
    </span>
  );
}

function FieldMatch({ field, similarity, matched, valueA, valueB }) {
  return (
    <div className={`rounded-lg px-3 py-2 border text-xs ${matched ? 'border-success/20 bg-success/5' : 'border-border bg-black/10'}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono font-bold text-white capitalize">{field}</span>
        <span className={`font-mono ${matched ? 'text-success' : 'text-muted'}`}>
          {(similarity * 100).toFixed(0)}% {matched ? '✓' : ''}
        </span>
      </div>
      <div className="flex gap-2 font-mono text-[10px]">
        <span className="text-accent truncate flex-1" title={valueA}>{valueA || '—'}</span>
        <span className="text-muted">↔</span>
        <span className="text-accent2 truncate flex-1 text-right" title={valueB}>{valueB || '—'}</span>
      </div>
      {/* Bar */}
      <div className="w-full h-0.5 bg-border rounded-full overflow-hidden mt-1.5">
        <div
          className={`h-full rounded-full ${matched ? 'bg-success' : 'bg-muted'}`}
          style={{ width: `${similarity * 100}%` }}
        />
      </div>
    </div>
  );
}

function DuplicatePair({ dup, index }) {
  const { recordA, recordB, similarity, fields } = dup;
  const fieldList = Array.isArray(fields) ? fields : Object.entries(fields || {}).map(([field, data]) => ({ field, ...data }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="panel-card p-4"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full border border-danger/25 bg-danger/10 px-2.5 py-1 font-mono text-xs font-bold text-danger">Duplicate Pair #{index + 1}</span>
            <SimilarityBadge value={similarity} />
          </div>
          <div className="font-mono text-xs text-slate-400">
            {recordA?.id || recordA} ↔ {recordB?.id || recordB}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Record summaries */}
        <div className="rounded-2xl border border-accent/10 bg-accent/5 p-3">
          <p className="mb-1 text-xs font-mono font-bold text-accent">Record A</p>
          {recordA?.name && <p className="text-white text-xs font-semibold">{recordA.name}</p>}
          {recordA?.dob && <p className="text-slate-400 text-xs font-mono">{recordA.dob}</p>}
          {recordA?.address && <p className="text-slate-400 text-xs truncate" title={recordA.address}>{recordA.address}</p>}
        </div>
        <div className="rounded-2xl border border-accent2/10 bg-accent2/5 p-3">
          <p className="mb-1 text-xs font-mono font-bold text-accent2">Record B</p>
          {recordB?.name && <p className="text-white text-xs font-semibold">{recordB.name}</p>}
          {recordB?.dob && <p className="text-slate-400 text-xs font-mono">{recordB.dob}</p>}
          {recordB?.address && <p className="text-slate-400 text-xs truncate" title={recordB.address}>{recordB.address}</p>}
        </div>
      </div>

      {fieldList.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-xs font-mono text-slate-400">Field similarity breakdown</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {fieldList.map((f) => (
              <FieldMatch key={f.field} {...f} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function DuplicatesPanel({ results, records }) {
  if (!results) {
    return (
      <div className="panel-card p-10 text-center">
        <div className="mb-3 text-5xl opacity-30">◈</div>
        <h3 className="font-display font-semibold text-white mb-1">Deduplication Results</h3>
        <p className="text-sm text-slate-400">Run the algorithms to see detected duplicates, agreement, and match confidence here.</p>
      </div>
    );
  }

  const { algorithms } = results;
  const dc = algorithms.divideAndConquer;
  const bt = algorithms.backtracking;
  const h = algorithms.heuristic;

  // Use backtracking results as they're most complete
  const duplicates = bt.duplicates.length > 0 ? bt.duplicates : dc.duplicates;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid gap-3 md:grid-cols-3">
        {[
          { algo: 'Divide & Conquer', dups: dc.duplicates.length, comparisons: dc.comparisons, time: dc.timeMs, tone: 'border-accent/15 bg-accent/5 text-accent' },
          { algo: 'Backtracking', dups: bt.duplicates.length, comparisons: bt.comparisons || 0, time: bt.timeMs, tone: 'border-accent2/15 bg-accent2/5 text-accent2' },
          { algo: 'Heuristic', dups: h.duplicates.length, comparisons: h.totalComparisons, time: h.timeMs, tone: 'border-accent3/15 bg-accent3/5 text-accent3' },
        ].map(a => (
          <div key={a.algo} className={`panel-card p-4 ${a.tone}`}>
            <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em]">{a.algo}</p>
            <p className="font-display text-3xl font-bold">{a.dups}</p>
            <p className="mt-1 text-xs font-mono text-slate-400">duplicates</p>
            <div className="mt-4 space-y-0.5 font-mono text-[10px] text-slate-400">
              <p>{a.comparisons} comparisons</p>
              <p>{a.time}ms</p>
            </div>
          </div>
        ))}
      </div>

      {/* Algorithm agreement */}
      <div className="panel-card p-4">
        <h3 className="section-title mb-2">Algorithm Consensus</h3>
        <div className="flex items-center gap-3 font-mono text-xs">
          {dc.duplicates.length === bt.duplicates.length && bt.duplicates.length === h.duplicates.length ? (
            <span className="text-success">✓ All 3 algorithms agree: {dc.duplicates.length} duplicate pairs found</span>
          ) : (
            <span className="text-accent3">⚡ Slight variance: D&C={dc.duplicates.length}, BT={bt.duplicates.length}, Heuristic={h.duplicates.length}</span>
          )}
        </div>
        <p className="mt-2 text-xs text-slate-500">{records.length} source records evaluated across all strategies.</p>
      </div>

      {/* Duplicate pairs */}
      <div>
        <h3 className="mb-3 font-display text-sm font-semibold text-white">
          Detected Duplicates 
          <span className="ml-2 font-mono text-danger">({duplicates.length})</span>
        </h3>

        {duplicates.length === 0 ? (
          <div className="panel-card border-success/20 p-6 text-center">
            <div className="mb-2 text-3xl">✓</div>
            <p className="font-display font-semibold text-success">No duplicates detected</p>
            <p className="mt-1 font-mono text-xs text-slate-400">All records appear to be unique</p>
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '600px' }}>
            {duplicates.map((dup, i) => (
              <DuplicatePair key={i} dup={dup} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
