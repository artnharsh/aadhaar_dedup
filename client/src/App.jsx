import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/ui/Header';
import DatasetPanel from './components/ui/DatasetPanel';
import AlgorithmTabs from './components/ui/AlgorithmTabs';
import DivideConquerViz from './components/visualization/DivideConquerViz';
import BacktrackingViz from './components/visualization/BacktrackingViz';
import HeuristicViz from './components/visualization/HeuristicViz';
import ComplexityGraph from './components/visualization/ComplexityGraph';
import NPHardnessPanel from './components/visualization/NPHardnessPanel';
import DuplicatesPanel from './components/ui/DuplicatesPanel';
import MetricsBar from './components/ui/MetricsBar';
import { SAMPLE_RECORDS } from './data/sampleData';
import { runAllAlgorithms } from './utils/algorithms';

const TABS = [
  { id: 'dc', label: 'Divide & Conquer', icon: '⟁' },
  { id: 'bt', label: 'Backtracking', icon: '↩' },
  { id: 'heuristic', label: 'Heuristics', icon: '⚡' },
  { id: 'complexity', label: 'Recurrence', icon: '∑' },
  { id: 'np', label: 'NP-Hardness', icon: '∞' },
  { id: 'duplicates', label: 'Results', icon: '◈' },
];

export default function App() {
  const [records, setRecords] = useState(SAMPLE_RECORDS.slice(0, 8));
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('dc');
  const [serverAvailable, setServerAvailable] = useState(null);

  const handleRun = async () => {
    if (records.length < 2) return;
    setRunning(true);
    setResults(null);
    
    try {
      // Try server first
      const res = await fetch('/api/algorithms/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records }),
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setServerAvailable(true);
      } else throw new Error('Server error');
    } catch {
      // Fallback to client-side
      setServerAvailable(false);
      const data = runAllAlgorithms(records);
      setResults(data);
    }
    
    setRunning(false);
    setActiveTab('dc');
  };

  const totalDuplicates = results
    ? Math.max(
        results.algorithms.divideAndConquer.duplicates.length,
        results.algorithms.backtracking.duplicates.length,
        results.algorithms.heuristic.duplicates.length
      )
    : 0;

  return (
    <div className="min-h-screen bg-bg grid-bg noise-overlay relative">
      <div className="fixed inset-x-0 top-0 h-40 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
      <div className="fixed top-[-120px] left-[10%] w-[480px] h-[480px] bg-accent/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed top-[20%] right-[-120px] w-[420px] h-[420px] bg-accent2/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 py-5 md:px-6 md:py-8">
        <div className="app-shell px-4 py-5 md:px-6 md:py-6 xl:px-8">
          <Header serverAvailable={serverAvailable} recordsCount={records.length} hasResults={!!results} />

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="panel-card px-5 py-5 md:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <div className="soft-badge mb-3">Visual Analysis Workspace</div>
                  <h2 className="font-display text-2xl font-bold text-white sm:text-[2.1rem]">
                    Cleaner comparisons, calmer motion, and a clearer path through each algorithm.
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                    Load records, run the pipeline, and inspect how each deduplication strategy behaves without the interface competing for attention.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-[320px]">
                  {[
                    { label: 'Loaded', value: records.length, hint: 'records in memory' },
                    { label: 'Engine', value: serverAvailable === false ? 'Local' : 'API', hint: serverAvailable === false ? 'client fallback' : 'preferred execution' },
                    { label: 'State', value: running ? 'Running' : results ? 'Ready' : 'Idle', hint: running ? 'processing dataset' : results ? 'results available' : 'waiting to run' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
                      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
                      <p className="mt-2 font-display text-2xl font-bold text-white">{item.value}</p>
                      <p className="mt-1 text-xs text-slate-400">{item.hint}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6 mt-6">
          {/* LEFT: Dataset Panel */}
            <DatasetPanel
              records={records}
              setRecords={setRecords}
              onRun={handleRun}
              running={running}
              hasResults={!!results}
            />

            {/* RIGHT: Visualization Area */}
            <div className="space-y-4">
              {results && (
                <MetricsBar results={results} totalDuplicates={totalDuplicates} />
              )}

              <AlgorithmTabs tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'dc' && (
                    <DivideConquerViz
                      steps={results?.algorithms.divideAndConquer.steps || []}
                      records={records}
                      hasResults={!!results}
                    />
                  )}
                  {activeTab === 'bt' && (
                    <BacktrackingViz
                      steps={results?.algorithms.backtracking.steps || []}
                      records={records}
                      hasResults={!!results}
                    />
                  )}
                  {activeTab === 'heuristic' && (
                    <HeuristicViz
                      steps={results?.algorithms.heuristic.steps || []}
                      data={results?.algorithms.heuristic}
                      records={records}
                      hasResults={!!results}
                    />
                  )}
                  {activeTab === 'complexity' && (
                    <ComplexityGraph inputSize={records.length} />
                  )}
                  {activeTab === 'np' && <NPHardnessPanel />}
                  {activeTab === 'duplicates' && (
                    <DuplicatesPanel
                      results={results}
                      records={records}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
