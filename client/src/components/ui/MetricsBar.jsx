import { motion } from 'framer-motion';

export default function MetricsBar({ results, totalDuplicates }) {
  const { algorithms, totalRecords, totalTime } = results;
  const { heuristic } = algorithms;

  const metrics = [
    { label: 'Records', value: totalRecords, unit: '', color: 'text-accent' },
    { label: 'Duplicates', value: totalDuplicates, unit: '', color: 'text-danger' },
    { label: 'DC Steps', value: algorithms.divideAndConquer.stepCount, unit: '', color: 'text-accent2' },
    { label: 'BT Pruned', value: algorithms.backtracking.prunedCount || 0, unit: '', color: 'text-accent3' },
    { label: 'Pruning Gain', value: heuristic.improvement, unit: '%', color: 'text-success' },
    { label: 'Total Time', value: totalTime, unit: 'ms', color: 'text-white' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-3 md:grid-cols-6 gap-2"
    >
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-center"
        >
          <div className={`font-display font-bold text-lg ${m.color}`}>
            {m.value}{m.unit}
          </div>
          <div className="text-muted text-xs font-mono">{m.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}
