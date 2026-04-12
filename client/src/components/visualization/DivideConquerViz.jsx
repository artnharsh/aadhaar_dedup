import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PlaybackControls from './PlaybackControls';
import { usePlayback } from './usePlayback';

function buildTree(steps) {
  // Build a node map from DIVIDE/SPLIT steps
  const nodes = {};
  const edges = [];

  for (const step of steps) {
    if (step.type === 'SPLIT' || step.type === 'BASE_CASE') {
      nodes[step.nodeId] = nodes[step.nodeId] || { 
        id: step.nodeId, depth: step.depth, records: step.records, children: [], status: 'idle' 
      };
    }
    if (step.type === 'DIVIDE') {
      nodes[step.nodeId] = nodes[step.nodeId] || { id: step.nodeId, depth: step.depth, children: [] };
      nodes[step.leftId] = { id: step.leftId, depth: step.depth + 1, records: [], children: [] };
      nodes[step.rightId] = { id: step.rightId, depth: step.depth + 1, records: [], children: [] };
      nodes[step.nodeId].children = [step.leftId, step.rightId];
      edges.push({ from: step.nodeId, to: step.leftId });
      edges.push({ from: step.nodeId, to: step.rightId });
    }
  }
  return { nodes, edges };
}

function TreeNode({ node, allNodes, activeNodeId, mergeNodeId, step }) {
  const isActive = node.id === activeNodeId;
  const isMerging = node.id === mergeNodeId;
  const isBase = node.children.length === 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        animate={{
          borderColor: isActive ? '#00d9ff' : isMerging ? '#7c3aed' : isBase ? '#10b981' : '#1e293b',
          backgroundColor: isActive ? 'rgba(0,217,255,0.15)' : isMerging ? 'rgba(124,58,237,0.15)' : 'rgba(17,24,39,0.8)',
          scale: isActive ? 1.05 : 1,
        }}
        className="border-2 rounded-lg px-3 py-2 text-xs font-mono text-center min-w-[80px] cursor-default"
      >
        <div className={`font-bold text-xs mb-0.5 ${isActive ? 'text-accent' : isMerging ? 'text-accent2' : 'text-white'}`}>
          {node.id.replace('root', 'Root').replace(/-/g, '/')}
        </div>
        <div className="text-muted text-[10px]">
          {node.records?.length ?? '?'} rec
        </div>
        {isActive && (
          <div className="w-1.5 h-1.5 bg-accent rounded-full mx-auto mt-1 animate-pulse" />
        )}
        {isMerging && (
          <div className="w-1.5 h-1.5 bg-accent2 rounded-full mx-auto mt-1 animate-pulse" />
        )}
      </motion.div>

      {node.children.length > 0 && (
        <div className="flex gap-6 items-start">
          {node.children.map(childId => {
            const child = allNodes[childId];
            if (!child) return null;
            return (
              <div key={childId} className="flex flex-col items-center gap-2">
                {/* Connector line */}
                <div className={`w-0.5 h-4 ${isActive ? 'bg-accent/50' : 'bg-border'}`} />
                <TreeNode
                  node={child}
                  allNodes={allNodes}
                  activeNodeId={activeNodeId}
                  mergeNodeId={mergeNodeId}
                  step={step}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function DivideConquerViz({ steps, records, hasResults }) {
  const playback = usePlayback(steps);
  const { currentStep } = playback;

  const currentStepData = steps[currentStep];
  const { nodes } = useMemo(() => buildTree(steps), [steps]);

  // Determine active nodes from current step
  const activeNodeId = currentStepData?.nodeId || null;
  const mergeNodeId = (currentStepData?.type === 'MERGE_START' || currentStepData?.type === 'MERGE_COMPLETE') 
    ? currentStepData.nodeId : null;

  // Update node records from steps up to current
  const populatedNodes = useMemo(() => {
    const n = JSON.parse(JSON.stringify(nodes));
    for (let i = 0; i <= currentStep; i++) {
      const s = steps[i];
      if ((s?.type === 'SPLIT' || s?.type === 'BASE_CASE') && s.nodeId && n[s.nodeId]) {
        n[s.nodeId].records = s.records;
      }
    }
    return n;
  }, [nodes, currentStep, steps]);

  const rootNode = populatedNodes['root'];

  // Comparisons up to this step
  const comparisons = steps.slice(0, currentStep + 1).filter(
    s => s?.type === 'COMPARE' || s?.type === 'CROSS_COMPARE'
  );
  const duplicatesFound = comparisons.filter(s => s?.isDuplicate);

  if (!hasResults) {
    return (
      <div className="bg-surface border border-border rounded-xl p-8 text-center">
        <div className="text-5xl mb-3 opacity-30">⟁</div>
        <h3 className="font-display text-white font-semibold mb-1">Divide & Conquer</h3>
        <p className="text-muted text-sm font-body">
          Recursively partitions the dataset into halves, finds duplicates within each partition, 
          then merges results with cross-partition comparisons.
        </p>
        <p className="text-muted text-xs font-mono mt-3 opacity-60">T(n) = 2T(n/2) + O(n²)</p>
        <p className="text-muted text-xs mt-4">Load records and click ▶ Run to visualize</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Step info */}
      <AnimatePresence mode="wait">
        {currentStepData && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`border rounded-lg px-4 py-2.5 font-mono text-sm flex items-center gap-3 ${
              currentStepData.type === 'COMPARE' || currentStepData.type === 'CROSS_COMPARE'
                ? currentStepData.isDuplicate 
                  ? 'border-danger/40 bg-danger/10 text-danger'
                  : 'border-accent/40 bg-accent/10 text-accent'
                : currentStepData.type.includes('MERGE')
                ? 'border-accent2/40 bg-accent2/10 text-accent2'
                : 'border-border bg-surface text-white'
            }`}
          >
            <span className="text-xs opacity-60 shrink-0">
              {currentStepData.type}
            </span>
            <span className="text-xs">{currentStepData.message}</span>
            {(currentStepData.type === 'COMPARE' || currentStepData.type === 'CROSS_COMPARE') && (
              <span className={`ml-auto text-xs px-2 py-0.5 rounded font-bold shrink-0 ${
                currentStepData.isDuplicate ? 'bg-danger/20' : 'bg-border'
              }`}>
                {(currentStepData.similarity * 100).toFixed(1)}%
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <PlaybackControls playback={playback} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tree visualization */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-white text-sm">Recursion Tree</h3>
            <div className="flex gap-3 text-xs font-mono">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded border-2 border-accent inline-block"></span> Active</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded border-2 border-accent2 inline-block"></span> Merging</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded border-2 border-success inline-block"></span> Base</span>
            </div>
          </div>
          <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '320px' }}>
            <div className="flex justify-center pt-2">
              {rootNode ? (
                <TreeNode
                  node={rootNode}
                  allNodes={populatedNodes}
                  activeNodeId={activeNodeId}
                  mergeNodeId={mergeNodeId}
                  step={currentStepData}
                />
              ) : (
                <p className="text-muted text-sm font-mono">Tree not yet built</p>
              )}
            </div>
          </div>
        </div>

        {/* Comparisons log */}
        <div className="bg-surface border border-border rounded-xl p-4">
          <h3 className="font-display font-semibold text-white text-sm mb-3">
            Comparisons <span className="text-muted font-mono text-xs">({comparisons.length})</span>
          </h3>
          <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: '290px' }}>
            {comparisons.length === 0 ? (
              <p className="text-muted text-xs font-mono">No comparisons yet...</p>
            ) : (
              comparisons.slice().reverse().map((c, i) => (
                <motion.div
                  key={i}
                  initial={i === 0 ? { opacity: 0, x: 10 } : {}}
                  animate={{ opacity: 1, x: 0 }}
                  className={`text-xs font-mono p-2 rounded border ${
                    c.isDuplicate ? 'border-danger/30 bg-danger/10' : 'border-border bg-black/20'
                  }`}
                >
                  <div className={`font-bold ${c.isDuplicate ? 'text-danger' : 'text-white'}`}>
                    {c.isDuplicate ? '⚠ DUP' : 'OK'} · {(c.similarity * 100).toFixed(1)}%
                  </div>
                  <div className="text-muted text-[10px]">{c.recordA} vs {c.recordB}</div>
                </motion.div>
              ))
            )}
          </div>
          {duplicatesFound.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs font-mono text-danger font-bold">{duplicatesFound.length} duplicate(s) found</p>
            </div>
          )}
        </div>
      </div>

      {/* Algorithm explanation */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <h3 className="font-display font-semibold text-white text-sm mb-2">Algorithm Logic</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { phase: '1. Divide', desc: 'Split array at midpoint recursively until base case (n≤2)', color: 'accent' },
            { phase: '2. Conquer', desc: 'Compare pairs at base level with similarity scoring', color: 'accent3' },
            { phase: '3. Merge', desc: 'Cross-compare left/right partition records on the way up', color: 'accent2' },
          ].map(p => (
            <div key={p.phase} className={`border border-${p.color}/20 bg-${p.color}/5 rounded-lg px-3 py-2`}>
              <p className={`text-${p.color} font-mono text-xs font-bold`}>{p.phase}</p>
              <p className="text-muted text-xs mt-1">{p.desc}</p>
            </div>
          ))}
        </div>
        <p className="font-mono text-xs text-accent3 mt-3 text-center">T(n) = 2T(n/2) + O(n²) → Overall O(n² log n)</p>
      </div>
    </div>
  );
}
