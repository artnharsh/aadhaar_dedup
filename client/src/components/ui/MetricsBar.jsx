import { motion } from 'framer-motion';

export default function MetricsBar({ results, totalDuplicates }) {
  const { algorithms, totalRecords, totalTime } = results;
  const { heuristic } = algorithms;

  const metrics = [
    { label: 'Records', value: totalRecords, unit: '', color: 'text-accent', note: 'active dataset' },
    { label: 'Duplicates', value: totalDuplicates, unit: '', color: 'text-danger', note: 'best detected pairs' },
    { label: 'DC Steps', value: algorithms.divideAndConquer.stepCount, unit: '', color: 'text-accent2', note: 'recursive flow' },
    { label: 'BT Pruned', value: algorithms.backtracking.prunedCount || 0, unit: '', color: 'text-accent3', note: 'branches skipped' },
    { label: 'Pruning Gain', value: heuristic.improvement, unit: '%', color: 'text-success', note: 'heuristic savings' },
    { label: 'Total Time', value: totalTime, unit: 'ms', color: 'text-white', note: 'aggregate runtime' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6"
    >
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="panel-card px-4 py-3"
        >
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-slate-400">
            {m.label}
          </div>
          <div className={`mt-3 font-display text-3xl font-bold leading-none ${m.color}`}>
            {m.value}{m.unit}
          </div>
          <div className="mt-2 text-xs text-slate-400">{m.note}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}
