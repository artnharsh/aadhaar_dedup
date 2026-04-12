import { motion } from 'framer-motion';

export default function Header({ serverAvailable }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start justify-between"
    >
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-mono text-sm">
            ⟁
          </div>
          <span className="font-mono text-xs text-muted uppercase tracking-widest">Algorithm Visualizer</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-white leading-tight">
          Aadhaar <span className="text-accent">Deduplication</span>
        </h1>
        <p className="text-muted text-sm mt-1 font-body">
          Interactive visualization of Divide & Conquer · Backtracking · Heuristic algorithms
        </p>
      </div>

      <div className="flex items-center gap-3">
        {serverAvailable !== null && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-mono ${
            serverAvailable 
              ? 'border-success/30 bg-success/10 text-success' 
              : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${serverAvailable ? 'bg-success' : 'bg-amber-400'} animate-pulse`} />
            {serverAvailable ? 'Server Mode' : 'Client Mode'}
          </div>
        )}
        <div className="px-3 py-1.5 rounded border border-border bg-surface text-xs font-mono text-muted">
          MERN Stack
        </div>
      </div>
    </motion.header>
  );
}
