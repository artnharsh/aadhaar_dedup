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
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-accent2/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 py-6">
        <Header serverAvailable={serverAvailable} />

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
  );
}
