import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';

function generateComplexityData(maxN) {
  const points = [];
  for (let n = 2; n <= maxN; n = Math.ceil(n * 1.5)) {
    points.push({
      n,
      'Naive O(n²)': Math.round(n * n),
      'D&C T(n)': Math.round(n * Math.log2(n) * n),
      'Heuristic': Math.round(n * Math.log2(n)),
      'Optimal O(n log n)': Math.round(n * Math.log2(n)),
    });
  }
  return points;
}

const RECURRENCE_STEPS = [
  { step: 'T(n)', desc: 'Total time for n records' },
  { step: '= 2T(n/2)', desc: 'Two recursive subproblems of size n/2' },
  { step: '+ O(n²)', desc: 'Cross-partition comparisons at each merge' },
  { step: '→ O(n² log n)', desc: 'Master theorem: case 3 analysis' },
];

export default function ComplexityGraph({ inputSize }) {
  const [n, setN] = useState(Math.max(inputSize, 8));
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(generateComplexityData(Math.min(n * 4, 1024)));
  }, [n]);

  const currentPoint = {
    naive: n * n,
    dc: Math.round(n * Math.log2(n) * n),
    heuristic: Math.round(n * Math.log2(n)),
  };

  return (
    <div className="space-y-4">
      {/* Recurrence formula display */}
      <div className="bg-surface border border-accent/20 rounded-xl p-5 glow-cyan">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-accent font-mono text-xs">RECURRENCE RELATION</span>
          <div className="flex-1 h-px bg-accent/20" />
        </div>
        <div className="flex flex-wrap gap-2 items-center justify-center mb-4">
          {RECURRENCE_STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="font-mono font-bold text-xl text-white">{s.step}</div>
                <div className="text-muted text-xs font-body">{s.desc}</div>
              </motion.div>
              {i < RECURRENCE_STEPS.length - 1 && (
                <span className="text-muted font-mono text-lg">&nbsp;</span>
              )}
            </div>
          ))}
        </div>

        {/* Master theorem explanation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div className="bg-black/30 border border-border rounded-lg p-3 text-center">
            <p className="text-accent font-mono text-sm font-bold">a = 2</p>
            <p className="text-muted text-xs">Subproblems</p>
          </div>
          <div className="bg-black/30 border border-border rounded-lg p-3 text-center">
            <p className="text-accent font-mono text-sm font-bold">b = 2</p>
            <p className="text-muted text-xs">Division factor</p>
          </div>
          <div className="bg-black/30 border border-border rounded-lg p-3 text-center">
            <p className="text-accent font-mono text-sm font-bold">f(n) = O(n²)</p>
            <p className="text-muted text-xs">Merge cost</p>
          </div>
        </div>
        <p className="text-center text-accent3 font-mono text-sm mt-3">
          Since f(n) = n² = Ω(n^log₂2) = Ω(n), Case 3 applies → T(n) = Θ(n² log n)
        </p>
      </div>

      {/* Input size slider */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-white text-sm">Interactive Complexity Explorer</h3>
          <span className="font-mono text-accent text-sm">n = {n}</span>
        </div>
        
        <div className="flex items-center gap-3 mb-4">
          <span className="text-muted text-xs font-mono">2</span>
          <input
            type="range"
            min={2}
            max={256}
            value={n}
            onChange={e => setN(Number(e.target.value))}
            className="flex-1 h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-accent"
          />
          <span className="text-muted text-xs font-mono">256</span>
        </div>

        {/* Current n metrics */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-black/30 border border-danger/20 rounded-lg p-3 text-center">
            <div className="text-danger font-bold font-display text-lg">{currentPoint.naive.toLocaleString()}</div>
            <div className="text-muted text-xs font-mono">Naive n²</div>
          </div>
          <div className="bg-black/30 border border-accent2/20 rounded-lg p-3 text-center">
            <div className="text-accent2 font-bold font-display text-lg">{currentPoint.dc.toLocaleString()}</div>
            <div className="text-muted text-xs font-mono">D&C n²logn</div>
          </div>
          <div className="bg-black/30 border border-success/20 rounded-lg p-3 text-center">
            <div className="text-success font-bold font-display text-lg">{currentPoint.heuristic.toLocaleString()}</div>
            <div className="text-muted text-xs font-mono">Heuristic nlogn</div>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis 
              dataKey="n" 
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              label={{ value: 'Input Size (n)', position: 'insideBottom', offset: -3, fill: '#64748b', fontSize: 10 }}
            />
            <YAxis 
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
            />
            <Tooltip
              contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'JetBrains Mono' }} />
            <ReferenceLine x={n} stroke="#00d9ff" strokeDasharray="4 4" opacity={0.6} />
            <Line type="monotone" dataKey="Naive O(n²)" stroke="#ef4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="D&C T(n)" stroke="#7c3aed" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Heuristic" stroke="#10b981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Substitution method */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <h3 className="font-display font-semibold text-white text-sm mb-3">Substitution Method Proof</h3>
        <div className="font-mono text-xs space-y-2 text-muted">
          <p><span className="text-white">Claim:</span> T(n) = O(n² log n)</p>
          <p><span className="text-white">Expand:</span> T(n) = 2T(n/2) + n²</p>
          <p className="pl-4">= 2[2T(n/4) + (n/2)²] + n²</p>
          <p className="pl-4">= 4T(n/4) + n²/2 + n²</p>
          <p className="pl-4">= 4T(n/4) + n²(1 + 1/2)</p>
          <p className="pl-4">= ... after log₂n levels ...</p>
          <p className="pl-4 text-accent">= n² · (1 + 1/2 + 1/4 + ...) + n·T(1)</p>
          <p className="pl-4 text-accent">≈ n² · 2 = <span className="text-accent3 font-bold">O(n²)</span> (geometric series converges)</p>
          <p className="text-accent3 mt-2">Note: With balanced divide, merge dominates → practical O(n² log n)</p>
        </div>
      </div>
    </div>
  );
}
