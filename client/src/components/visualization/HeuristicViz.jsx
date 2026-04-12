import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import PlaybackControls from './PlaybackControls';
import { usePlayback } from './usePlayback';

export default function HeuristicViz({ steps, data, records, hasResults }) {
  const playback = usePlayback(steps);
  const { currentStep } = playback;
  const currentStepData = steps[currentStep];

  // Build block state up to current step
  const blockState = useMemo(() => {
    const blocks = {};
    let currentBlock = null;
    let totalDone = 0;
    let totalPruned = 0;

    for (let i = 0; i <= currentStep; i++) {
      const s = steps[i];
      if (!s) continue;

      if (s.type === 'HEURISTIC_BLOCKS') {
        for (const b of s.blocks) {
          blocks[b.key] = { key: b.key, count: b.count, ids: b.ids, comparisons: [], status: 'pending' };
        }
      }
      if (s.type === 'HEURISTIC_BLOCK_ENTER') {
        currentBlock = s.blockKey;
        if (blocks[s.blockKey]) blocks[s.blockKey].status = 'active';
        totalPruned += s.skippedComparisons || 0;
      }
      if (s.type === 'HEURISTIC_COMPARE') {
        if (blocks[s.blockKey]) {
          blocks[s.blockKey].comparisons.push({ a: s.recordA, b: s.recordB, sim: s.similarity, dup: s.isDuplicate });
          blocks[s.blockKey].status = 'active';
        }
        totalDone++;
      }
    }

    // Mark completed blocks (not the current one)
    for (const [k, b] of Object.entries(blocks)) {
      if (b.status === 'active' && k !== currentBlock) b.status = 'done';
    }

    return { blocks, totalDone, totalPruned };
  }, [steps, currentStep]);

  const { blocks, totalDone, totalPruned } = blockState;
  const blockEntries = Object.entries(blocks);

  const summaryStep = steps.find(s => s?.type === 'HEURISTIC_SUMMARY');

  // Chart data for blocks
  const chartData = blockEntries.map(([k, b]) => ({
    name: `"${k.toUpperCase()}"`,
    comparisons: b.comparisons.length,
    skipped: b.count * (records.length - b.count),
    duplicates: b.comparisons.filter(c => c.dup).length,
  }));

  if (!hasResults) {
    return (
      <div className="bg-surface border border-border rounded-xl p-8 text-center">
        <div className="text-5xl mb-3 opacity-30">⚡</div>
        <h3 className="font-display text-white font-semibold mb-1">Heuristics Optimization</h3>
        <p className="text-muted text-sm font-body">
          Uses blocking (first-char sorting) to prune cross-block comparisons. 
          Dramatically reduces the number of comparisons from O(n²) to near O(k·m²) 
          where k = blocks and m = avg block size.
        </p>
        <p className="text-muted text-xs mt-4">Load records and click ▶ Run to visualize</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {currentStepData && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border rounded-lg px-4 py-2.5 font-mono text-xs flex items-center gap-3 ${
              currentStepData.type === 'HEURISTIC_SUMMARY' ? 'border-success/40 bg-success/10 text-success' :
              currentStepData.type === 'HEURISTIC_BLOCK_ENTER' ? 'border-accent3/40 bg-accent3/10 text-accent3' :
              currentStepData.type === 'HEURISTIC_COMPARE' && currentStepData.isDuplicate ? 'border-danger/40 bg-danger/10 text-danger' :
              'border-border bg-surface text-white'
            }`}
          >
            <span className="opacity-60 shrink-0">{currentStepData.type}</span>
            <span>{currentStepData.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <PlaybackControls playback={playback} />

      {/* Metrics row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Naive O(n²)', value: summaryStep?.naiveComparisons || data?.naiveComparisons || 0, color: 'text-danger' },
          { label: 'Actual', value: totalDone, color: 'text-accent' },
          { label: 'Pruned', value: totalPruned, color: 'text-accent3' },
          { label: 'Saved', value: `${summaryStep?.improvement || data?.improvement || 0}%`, color: 'text-success' },
        ].map(m => (
          <div key={m.label} className="bg-surface border border-border rounded-lg p-3 text-center">
            <div className={`font-display font-bold text-xl ${m.color}`}>{m.value}</div>
            <div className="text-muted text-xs font-mono">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Block visualization */}
        <div className="bg-surface border border-border rounded-xl p-4">
          <h3 className="font-display font-semibold text-white text-sm mb-3">Blocking by First Character</h3>
          <div className="flex flex-wrap gap-2">
            {blockEntries.map(([key, block]) => {
              const isActive = currentStepData?.blockKey === key;
              const isDone = block.status === 'done' || (!isActive && block.comparisons.length > 0);
              const dupCount = block.comparisons.filter(c => c.dup).length;

              return (
                <motion.div
                  key={key}
                  animate={{
                    borderColor: isActive ? '#f59e0b' : isDone ? '#10b981' : '#1e293b',
                    backgroundColor: isActive ? 'rgba(245,158,11,0.1)' : isDone ? 'rgba(16,185,129,0.05)' : 'rgba(0,0,0,0.2)',
                    scale: isActive ? 1.05 : 1,
                  }}
                  className="border-2 rounded-xl p-3 min-w-[80px] text-center"
                >
                  <div className={`font-display font-bold text-lg ${isActive ? 'text-accent3' : isDone ? 'text-success' : 'text-muted'}`}>
                    {key.toUpperCase()}
                  </div>
                  <div className="text-xs font-mono text-muted">{block.count} records</div>
                  <div className="text-xs font-mono text-muted">{block.comparisons.length} cmp</div>
                  {dupCount > 0 && (
                    <div className="text-xs font-mono text-danger font-bold">{dupCount} dup</div>
                  )}
                  {isActive && (
                    <div className="w-1.5 h-1.5 bg-accent3 rounded-full mx-auto mt-1 animate-pulse" />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Comparison progress bar */}
          {summaryStep && (
            <div className="mt-4">
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-muted">Comparisons</span>
                <span className="text-white">{totalDone} / {summaryStep.naiveComparisons}</span>
              </div>
              <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${(totalDone / Math.max(summaryStep.naiveComparisons, 1)) * 100}%` }}
                  className="h-full bg-accent rounded-full"
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-muted mt-0.5">
                <span>0 (naive skipped)</span>
                <span className="text-accent3">{totalPruned} pruned so far</span>
              </div>
            </div>
          )}
        </div>

        {/* Bar chart */}
        <div className="bg-surface border border-border rounded-xl p-4">
          <h3 className="font-display font-semibold text-white text-sm mb-3">Comparisons per Block</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#00d9ff' }}
                />
                <Bar dataKey="comparisons" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.duplicates > 0 ? '#ef4444' : '#00d9ff'}
                      opacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted text-xs font-mono text-center py-8">Waiting for block data...</p>
          )}
          <div className="flex gap-4 justify-center text-[10px] font-mono text-muted mt-1">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-accent inline-block" /> Normal</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-danger inline-block" /> Has duplicates</span>
          </div>
        </div>
      </div>

      {/* Pruning explanation */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <h3 className="font-display font-semibold text-white text-sm mb-3">How Heuristic Pruning Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="border border-accent3/20 bg-accent3/5 rounded-lg p-3 text-center">
            <p className="text-accent3 font-bold text-lg">1</p>
            <p className="text-white font-semibold">Sort</p>
            <p className="text-muted">Sort all records by first character of name</p>
          </div>
          <div className="border border-accent/20 bg-accent/5 rounded-lg p-3 text-center">
            <p className="text-accent font-bold text-lg">2</p>
            <p className="text-white font-semibold">Block</p>
            <p className="text-muted">Group records with same first-char into blocks</p>
          </div>
          <div className="border border-success/20 bg-success/5 rounded-lg p-3 text-center">
            <p className="text-success font-bold text-lg">3</p>
            <p className="text-white font-semibold">Prune</p>
            <p className="text-muted">Skip all cross-block comparisons automatically</p>
          </div>
          <div className="border border-accent2/20 bg-accent2/5 rounded-lg p-3 text-center">
            <p className="text-accent2 font-bold text-lg">4</p>
            <p className="text-white font-semibold">Compare</p>
            <p className="text-muted">Only compare within blocks (much fewer pairs)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
