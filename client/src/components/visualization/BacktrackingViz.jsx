import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PlaybackControls from './PlaybackControls';
import { usePlayback } from './usePlayback';

const FIELD_COLORS = {
  name: '#00d9ff',
  dob: '#7c3aed',
  address: '#f59e0b',
  phone: '#10b981',
  email: '#64748b',
};

const FIELD_WEIGHTS = { name: 35, dob: 25, address: 25, phone: 10, email: 5 };

function FieldBar({ field, similarity, matched, isActive, isPruned }) {
  return (
    <motion.div
      animate={{
        opacity: isPruned ? 0.4 : 1,
        scale: isActive ? 1.02 : 1,
      }}
      className={`border rounded-lg p-3 ${
        isActive ? 'border-accent/60 bg-accent/10' :
        isPruned ? 'border-border/30 bg-black/10' :
        matched ? 'border-success/30 bg-success/5' :
        'border-border bg-black/20'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-xs font-bold" style={{ color: FIELD_COLORS[field] || '#fff' }}>
          {field} <span className="text-muted font-normal">({FIELD_WEIGHTS[field]}%)</span>
        </span>
        {similarity !== undefined && (
          <span className={`text-xs font-mono font-bold ${
            matched ? 'text-success' : similarity > 0.5 ? 'text-accent3' : 'text-muted'
          }`}>
            {(similarity * 100).toFixed(0)}%
          </span>
        )}
      </div>
      {similarity !== undefined && (
        <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${similarity * 100}%` }}
            className="h-full rounded-full"
            style={{ backgroundColor: FIELD_COLORS[field] || '#00d9ff' }}
          />
        </div>
      )}
      {isPruned && (
        <div className="text-xs text-muted font-mono mt-1">⛔ skipped</div>
      )}
    </motion.div>
  );
}

export default function BacktrackingViz({ steps, records, hasResults }) {
  const playback = usePlayback(steps);
  const { currentStep } = playback;

  const currentStepData = steps[currentStep];

  // Build state from steps up to currentStep
  const state = useMemo(() => {
    const pairs = {}; // keyed by `${aId}-${bId}`
    for (let i = 0; i <= currentStep; i++) {
      const s = steps[i];
      if (!s) continue;
      const key = s.recordA && s.recordB ? `${s.recordA}-${s.recordB}` : null;
      if (!key) continue;
      if (!pairs[key]) pairs[key] = { recordA: s.recordA, recordB: s.recordB, fields: {}, pruned: false, result: null, totalScore: 0 };

      if (s.type === 'BT_FIELD') {
        pairs[key].fields[s.field] = { similarity: s.similarity, matched: s.matched, active: i === currentStep };
        pairs[key].totalScore = s.totalScore;
      }
      if (s.type === 'BT_PRUNE') { pairs[key].pruned = true; pairs[key].prunedAt = s.field; }
      if (s.type === 'BT_RESULT') { pairs[key].result = s; }
      if (s.type === 'BT_EARLY_ACCEPT') { pairs[key].earlyAccept = true; }
    }
    return pairs;
  }, [steps, currentStep]);

  const pairs = Object.values(state);
  const currentPairKey = currentStepData?.recordA && currentStepData?.recordB 
    ? `${currentStepData.recordA}-${currentStepData.recordB}` : null;
  const activePair = currentPairKey ? state[currentPairKey] : null;

  const completedPairs = pairs.filter(p => p.result);
  const duplicatePairs = completedPairs.filter(p => p.result?.isDuplicate);
  const prunedPairs = pairs.filter(p => p.pruned);

  if (!hasResults) {
    return (
      <div className="bg-surface border border-border rounded-xl p-8 text-center">
        <div className="text-5xl mb-3 opacity-30">↩</div>
        <h3 className="font-display text-white font-semibold mb-1">Backtracking Matching</h3>
        <p className="text-muted text-sm font-body">
          Compares records field-by-field with intelligent pruning. If the maximum possible 
          similarity score can't reach the threshold, comparison is abandoned early.
        </p>
        <p className="text-muted text-xs mt-4">Load records and click ▶ Run to visualize</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current step */}
      <AnimatePresence mode="wait">
        {currentStepData && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border rounded-lg px-4 py-2.5 font-mono text-xs flex items-center gap-3 ${
              currentStepData.type === 'BT_PRUNE' ? 'border-danger/40 bg-danger/10 text-danger' :
              currentStepData.type === 'BT_RESULT' && currentStepData.isDuplicate ? 'border-danger/40 bg-danger/10 text-danger' :
              currentStepData.type === 'BT_RESULT' ? 'border-success/40 bg-success/10 text-success' :
              currentStepData.type === 'BT_EARLY_ACCEPT' ? 'border-accent3/40 bg-accent3/10 text-accent3' :
              'border-border bg-surface text-white'
            }`}
          >
            <span className="opacity-60 shrink-0">{currentStepData.type}</span>
            <span>{currentStepData.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <PlaybackControls playback={playback} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active comparison */}
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-white text-sm">Field-by-Field Analysis</h3>
            {activePair && (
              <span className="font-mono text-xs text-muted">
                {activePair.recordA} ↔ {activePair.recordB}
              </span>
            )}
          </div>

          {activePair ? (
            <div className="space-y-2">
              {['name', 'dob', 'address', 'phone', 'email'].map(field => {
                const fieldData = activePair.fields[field];
                const isCurrentField = currentStepData?.type === 'BT_FIELD' && currentStepData?.field === field 
                  && currentStepData?.recordA === activePair.recordA;
                const isPruned = activePair.pruned && !activePair.fields[field];
                
                return (
                  <FieldBar
                    key={field}
                    field={field}
                    similarity={fieldData?.similarity}
                    matched={fieldData?.matched}
                    isActive={isCurrentField}
                    isPruned={isPruned}
                  />
                );
              })}

              {/* Score meter */}
              {activePair.totalScore > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-muted">Cumulative Score</span>
                    <span className={activePair.totalScore >= 0.65 ? 'text-danger' : 'text-white'}>
                      {(activePair.totalScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-border rounded-full overflow-hidden relative">
                    <motion.div
                      animate={{ width: `${activePair.totalScore * 100}%` }}
                      className="h-full bg-gradient-to-r from-accent to-danger rounded-full"
                    />
                    {/* Threshold marker at 65% */}
                    <div className="absolute top-0 bottom-0 w-0.5 bg-accent3" style={{ left: '65%' }} />
                  </div>
                  <div className="flex justify-end">
                    <span className="text-accent3 text-[10px] font-mono">threshold: 65%</span>
                  </div>
                  {activePair.pruned && (
                    <div className="mt-1 text-danger text-xs font-mono">⛔ Pruned — cannot reach threshold</div>
                  )}
                  {activePair.earlyAccept && (
                    <div className="mt-1 text-accent3 text-xs font-mono">⚡ Early accept — threshold already exceeded</div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted text-sm font-mono text-center py-8">Waiting for comparison...</p>
          )}
        </div>

        {/* Decision tree / results */}
        <div className="bg-surface border border-border rounded-xl p-4">
          <h3 className="font-display font-semibold text-white text-sm mb-3">
            Comparison Results
          </h3>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-black/30 border border-border rounded-lg p-2 text-center">
              <div className="text-white font-bold font-display">{completedPairs.length}</div>
              <div className="text-muted text-[10px] font-mono">Completed</div>
            </div>
            <div className="bg-danger/10 border border-danger/20 rounded-lg p-2 text-center">
              <div className="text-danger font-bold font-display">{duplicatePairs.length}</div>
              <div className="text-muted text-[10px] font-mono">Duplicates</div>
            </div>
            <div className="bg-accent3/10 border border-accent3/20 rounded-lg p-2 text-center">
              <div className="text-accent3 font-bold font-display">{prunedPairs.length}</div>
              <div className="text-muted text-[10px] font-mono">Pruned</div>
            </div>
          </div>

          <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: '280px' }}>
            {completedPairs.length === 0 ? (
              <p className="text-muted text-xs font-mono text-center py-4">No comparisons completed yet...</p>
            ) : (
              completedPairs.slice().reverse().map((pair, i) => (
                <motion.div
                  key={`${pair.recordA}-${pair.recordB}`}
                  initial={i === 0 ? { opacity: 0, x: 10 } : {}}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono ${
                    pair.result.isDuplicate 
                      ? 'border-danger/30 bg-danger/10' 
                      : 'border-border bg-black/20'
                  }`}
                >
                  <span className={`text-sm ${pair.result.isDuplicate ? 'text-danger' : 'text-success'}`}>
                    {pair.result.isDuplicate ? '⚠' : '✓'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-white">{pair.recordA} ↔ {pair.recordB}</span>
                    {pair.pruned && <span className="text-accent3 ml-2">[pruned]</span>}
                  </div>
                  <span className={pair.result.isDuplicate ? 'text-danger' : 'text-muted'}>
                    {(pair.result.finalScore * 100).toFixed(0)}%
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* How pruning works */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <h3 className="font-display font-semibold text-white text-sm mb-3">Backtracking Pruning Logic</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="border border-accent/20 bg-accent/5 rounded-lg p-3">
            <p className="text-accent font-bold mb-1">Condition to Prune</p>
            <p className="text-muted">If current_score + remaining_weight {'<'} threshold (0.65), stop early</p>
          </div>
          <div className="border border-accent3/20 bg-accent3/5 rounded-lg p-3">
            <p className="text-accent3 font-bold mb-1">Early Accept</p>
            <p className="text-muted">If score ≥ threshold AND 60%+ of weight checked, accept immediately</p>
          </div>
          <div className="border border-accent2/20 bg-accent2/5 rounded-lg p-3">
            <p className="text-accent2 font-bold mb-1">Field Weights</p>
            <p className="text-muted">name:35% · dob:25% · addr:25% · phone:10% · email:5%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
