import { motion } from 'framer-motion';

export default function Header({ serverAvailable, recordsCount, hasResults }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-5 border-b border-white/10 pb-5 lg:flex-row lg:items-start lg:justify-between"
    >
      <div className="max-w-3xl">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent shadow-[0_10px_30px_rgba(99,210,231,0.14)]">
            ⟁
          </div>
          <span className="soft-badge">Algorithm Visualizer</span>
        </div>
        <h1 className="font-display text-3xl font-bold leading-tight text-white md:text-5xl">
          Aadhaar <span className="text-accent">Deduplication</span> Explorer
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-[15px]">
          Interactive views for divide and conquer, backtracking, heuristics, and complexity tradeoffs across a shared deduplication workflow.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 lg:justify-end">
        <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400">Dataset</p>
          <p className="mt-1 font-display text-xl font-bold text-white">{recordsCount}</p>
          <p className="text-xs text-slate-400">records loaded</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400">Session</p>
          <p className="mt-1 font-display text-xl font-bold text-white">{hasResults ? 'Analyzed' : 'Prepared'}</p>
          <p className="text-xs text-slate-400">{hasResults ? 'results visible' : 'ready to run'}</p>
        </div>

        {serverAvailable !== null && (
          <div className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-mono ${
            serverAvailable 
              ? 'border-success/30 bg-success/10 text-success' 
              : 'border-accent3/30 bg-accent3/10 text-accent3'
          }`}>
            <span className={`h-2 w-2 rounded-full ${serverAvailable ? 'bg-success' : 'bg-accent3'} animate-pulse`} />
            {serverAvailable ? 'Server Mode' : 'Client Mode'}
          </div>
        )}

        <div className="soft-badge">
          MERN Stack
        </div>
      </div>
    </motion.header>
  );
}
