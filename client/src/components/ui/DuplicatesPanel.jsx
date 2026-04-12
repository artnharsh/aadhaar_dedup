import { motion } from 'framer-motion';

function SimilarityBadge({ value }) {
  const pct = Math.round(value * 100);
  const color = pct >= 90 ? 'danger' : pct >= 75 ? 'accent3' : 'accent';
  return (
    <span className={`font-mono text-xs px-2 py-0.5 rounded border border-${color}/30 bg-${color}/10 text-${color} font-bold`}>
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
      className="bg-black/20 border border-danger/20 rounded-xl p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-danger font-mono text-xs font-bold">⚠ DUPLICATE PAIR #{index + 1}</span>
            <SimilarityBadge value={similarity} />
          </div>
          <div className="font-mono text-xs text-muted">
            {recordA?.id || recordA} ↔ {recordB?.id || recordB}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Record summaries */}
        <div className="bg-accent/5 border border-accent/10 rounded-lg p-2">
          <p className="text-accent text-xs font-mono font-bold mb-1">Record A</p>
          {recordA?.name && <p className="text-white text-xs font-semibold">{recordA.name}</p>}
          {recordA?.dob && <p className="text-muted text-xs font-mono">{recordA.dob}</p>}
          {recordA?.address && <p className="text-muted text-xs truncate" title={recordA.address}>{recordA.address}</p>}
        </div>
        <div className="bg-accent2/5 border border-accent2/10 rounded-lg p-2">
          <p className="text-accent2 text-xs font-mono font-bold mb-1">Record B</p>
          {recordB?.name && <p className="text-white text-xs font-semibold">{recordB.name}</p>}
          {recordB?.dob && <p className="text-muted text-xs font-mono">{recordB.dob}</p>}
          {recordB?.address && <p className="text-muted text-xs truncate" title={recordB.address}>{recordB.address}</p>}
        </div>
      </div>

      {fieldList.length > 0 && (
        <div className="mt-3">
          <p className="text-muted text-xs font-mono mb-2">Field similarity breakdown:</p>
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
      <div className="bg-surface border border-border rounded-xl p-8 text-center">
        <div className="text-5xl mb-3 opacity-30">◈</div>
        <h3 className="font-display text-white font-semibold mb-1">Deduplication Results</h3>
        <p className="text-muted text-sm">Run the algorithms to see detected duplicates here.</p>
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
      <div className="grid grid-cols-3 gap-3">
        {[
          { algo: 'Divide & Conquer', dups: dc.duplicates.length, comparisons: dc.comparisons, time: dc.timeMs, color: 'accent' },
          { algo: 'Backtracking', dups: bt.duplicates.length, comparisons: bt.comparisons || 0, time: bt.timeMs, color: 'accent2' },
          { algo: 'Heuristic', dups: h.duplicates.length, comparisons: h.totalComparisons, time: h.timeMs, color: 'accent3' },
        ].map(a => (
          <div key={a.algo} className={`bg-surface border border-${a.color}/20 rounded-xl p-4 text-center`}>
            <p className={`text-${a.color} font-mono text-xs font-bold mb-2`}>{a.algo}</p>
            <p className={`text-${a.color} font-display font-bold text-2xl`}>{a.dups}</p>
            <p className="text-muted text-xs font-mono">duplicates</p>
            <div className="mt-2 text-muted text-[10px] font-mono space-y-0.5">
              <p>{a.comparisons} comparisons</p>
              <p>{a.time}ms</p>
            </div>
          </div>
        ))}
      </div>

      {/* Algorithm agreement */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <h3 className="font-display font-semibold text-white text-sm mb-2">Algorithm Consensus</h3>
        <div className="flex items-center gap-3 font-mono text-xs">
          {dc.duplicates.length === bt.duplicates.length && bt.duplicates.length === h.duplicates.length ? (
            <span className="text-success">✓ All 3 algorithms agree: {dc.duplicates.length} duplicate pairs found</span>
          ) : (
            <span className="text-accent3">⚡ Slight variance: D&C={dc.duplicates.length}, BT={bt.duplicates.length}, Heuristic={h.duplicates.length}</span>
          )}
        </div>
      </div>

      {/* Duplicate pairs */}
      <div>
        <h3 className="font-display font-semibold text-white text-sm mb-3">
          Detected Duplicates 
          <span className="text-danger ml-2 font-mono">({duplicates.length})</span>
        </h3>

        {duplicates.length === 0 ? (
          <div className="bg-surface border border-success/20 rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">✓</div>
            <p className="text-success font-semibold font-display">No duplicates detected</p>
            <p className="text-muted text-xs font-mono mt-1">All records appear to be unique</p>
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
