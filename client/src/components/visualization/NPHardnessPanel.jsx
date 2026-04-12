import { motion } from 'framer-motion';

const cards = [
  {
    title: 'Why NP-Hard?',
    icon: '∞',
    color: 'accent',
    content: `Exact duplicate detection with fuzzy matching is NP-hard because determining the 
    optimal deduplication clustering requires solving a graph partitioning problem. 
    Given n records with pairwise similarities, finding the minimum-error clustering 
    is equivalent to the Minimum Multicut problem — NP-complete.`,
  },
  {
    title: 'Graph Clustering Link',
    icon: '◎',
    color: 'accent2',
    content: `Model each record as a node. Draw an edge between two nodes if similarity > threshold. 
    Deduplication = finding connected components (cliques) in this similarity graph. 
    Optimal clustering with noisy similarities = Correlation Clustering = NP-hard.`,
  },
  {
    title: 'Record Linkage Complexity',
    icon: '⟐',
    color: 'accent3',
    content: `Entity resolution (record linkage) is a core NP-hard problem. Even deciding if two 
    sets of records refer to the same entity under all possible transformations is 
    undecidable in general. Approximate solutions use heuristics (blocking, indexing).`,
  },
  {
    title: 'Reduction from 3-SAT',
    icon: '⊗',
    color: 'danger',
    content: `We can reduce the Clique problem to duplicate detection: given a graph G and integer k, 
    encode nodes as records with field similarities = edge weights. Finding all k-cliques 
    = finding all groups of k mutual duplicates. Clique is NP-complete → our problem is too.`,
  },
];

function ComplexityClass({ label, desc, color, example }) {
  return (
    <div className={`border border-${color}/20 bg-${color}/5 rounded-xl p-4`}>
      <div className={`font-display font-bold text-${color} text-lg mb-1`}>{label}</div>
      <p className="text-muted text-xs font-body mb-2">{desc}</p>
      <p className="text-white text-xs font-mono italic">{example}</p>
    </div>
  );
}

export default function NPHardnessPanel() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-surface border border-danger/20 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-danger/20 border border-danger/30 flex items-center justify-center text-danger font-display text-xl">∞</div>
          <div>
            <h2 className="font-display font-bold text-white text-lg">NP-Hardness of Record Deduplication</h2>
            <p className="text-muted text-xs font-mono">Why exact solutions are computationally intractable at scale</p>
          </div>
        </div>
        <p className="text-muted text-sm font-body leading-relaxed">
          While we can find <em className="text-white">approximate</em> duplicates efficiently using heuristics and 
          divide-and-conquer, the problem of finding the <em className="text-white">optimal</em> deduplication (one that 
          minimizes errors) is NP-hard. This section explains why.
        </p>
      </div>

      {/* Complexity hierarchy */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <h3 className="font-display font-semibold text-white text-sm mb-3">Complexity Class Hierarchy</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ComplexityClass
            label="P"
            desc="Solvable in polynomial time"
            color="success"
            example="e.g. Sorting, BFS, Levenshtein distance"
          />
          <ComplexityClass
            label="NP"
            desc="Verifiable in polynomial time"
            color="accent3"
            example="e.g. Subset Sum, Graph Coloring"
          />
          <ComplexityClass
            label="NP-Hard"
            desc="At least as hard as NP-complete"
            color="danger"
            example="e.g. Optimal Record Linkage, Min Multicut"
          />
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 font-mono text-sm">
          <span className="text-success">P</span>
          <span className="text-muted">⊆</span>
          <span className="text-accent3">NP</span>
          <span className="text-muted">⊆</span>
          <span className="text-danger">NP-Hard</span>
          <span className="text-muted ml-2 text-xs">(assuming P ≠ NP)</span>
        </div>
      </div>

      {/* Main cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`bg-surface border border-${card.color}/20 rounded-xl p-4`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-${card.color} text-xl`}>{card.icon}</span>
              <h3 className={`font-display font-semibold text-${card.color} text-sm`}>{card.title}</h3>
            </div>
            <p className="text-muted text-xs font-body leading-relaxed">{card.content}</p>
          </motion.div>
        ))}
      </div>

      {/* Graph visualization of the clustering problem */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <h3 className="font-display font-semibold text-white text-sm mb-3">Similarity Graph → Clustering Problem</h3>
        <div className="flex gap-4 flex-wrap">
          {/* ASCII-art style graph */}
          <div className="bg-black/40 border border-border rounded-lg p-4 font-mono text-xs flex-1" style={{ minWidth: '200px' }}>
            <p className="text-accent mb-2">// Records as nodes, similarity as edges</p>
            <p className="text-muted">Record A ──── 0.92 ──── Record B</p>
            <p className="text-muted pl-4">│                      │</p>
            <p className="text-muted">0.15                   0.87</p>
            <p className="text-muted pl-4">│                      │</p>
            <p className="text-muted">Record C ──── 0.11 ──── Record D</p>
            <p className="text-accent3 mt-2">// Optimal clustering: {'{A,B}'} and {'{C,D}'}</p>
            <p className="text-danger mt-1">// Finding this optimally = NP-hard!</p>
          </div>
          
          <div className="flex-1 space-y-3" style={{ minWidth: '200px' }}>
            <div className="border border-success/20 bg-success/5 rounded-lg p-3">
              <p className="text-success font-mono text-xs font-bold">Our Approach (Approximate)</p>
              <ul className="text-muted text-xs mt-1 space-y-0.5 font-body">
                <li>• Divide & Conquer for scalability</li>
                <li>• Backtracking with early pruning</li>
                <li>• Heuristic blocking to reduce pairs</li>
                <li>• Result: fast, ~90% accurate</li>
              </ul>
            </div>
            <div className="border border-danger/20 bg-danger/5 rounded-lg p-3">
              <p className="text-danger font-mono text-xs font-bold">Exact Solution (Intractable)</p>
              <ul className="text-muted text-xs mt-1 space-y-0.5 font-body">
                <li>• Correlation Clustering: NP-hard</li>
                <li>• All-pairs comparison: O(n²)</li>
                <li>• Optimal grouping: exponential</li>
                <li>• For Aadhaar (1.4B): infeasible</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Real-world implications */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <h3 className="font-display font-semibold text-white text-sm mb-2">Real-World Aadhaar Scale</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center font-mono text-xs">
          {[
            { val: '1.4B', label: 'Records', sub: 'in Aadhaar DB' },
            { val: '~10¹⁸', label: 'Naive pairs', sub: 'O(n²) = impossible' },
            { val: '~10⁹', label: 'After blocking', sub: 'heuristic reduction' },
            { val: '~ms', label: 'Per comparison', sub: 'fuzzy string match' },
          ].map(s => (
            <div key={s.label} className="bg-black/30 border border-border rounded-lg p-3">
              <div className="text-accent font-bold text-lg">{s.val}</div>
              <div className="text-white">{s.label}</div>
              <div className="text-muted text-[10px]">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
