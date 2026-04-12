import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SAMPLE_RECORDS, CSV_TEMPLATE } from '../../data/sampleData';

export default function DatasetPanel({ records, setRecords, onRun, running, hasResults }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ name: '', dob: '', address: '', phone: '', email: '' });
  const fileRef = useRef();

  const loadSample = (count) => {
    setRecords(SAMPLE_RECORDS.slice(0, count));
  };

  const addRecord = () => {
    if (!form.name || !form.dob || !form.address) return;
    const id = 'R' + String(Date.now()).slice(-6);
    setRecords(prev => [...prev, { id, ...form }]);
    setForm({ name: '', dob: '', address: '', phone: '', email: '' });
    setShowAddForm(false);
  };

  const removeRecord = (id) => setRecords(prev => prev.filter(r => r.id !== id));

  const handleCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.split('\n').filter(Boolean);
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const parsed = lines.slice(1).map((line, i) => {
        const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const record = { id: 'CSV' + i };
        headers.forEach((h, idx) => { record[h] = vals[idx] || ''; });
        return record;
      });
      setRecords(prev => [...prev, ...parsed]);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'aadhaar_template.csv';
    a.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-black/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-semibold text-white text-sm">Dataset</h2>
            <p className="text-muted text-xs font-mono">{records.length} records loaded</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fileRef.current.click()}
              className="px-2 py-1 text-xs border border-border hover:border-accent/50 rounded text-muted hover:text-accent transition-colors font-mono"
            >
              CSV
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-2 py-1 text-xs border border-border hover:border-accent/50 rounded text-muted hover:text-accent transition-colors font-mono"
            >
              + Add
            </button>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSV} />
          </div>
        </div>
      </div>

      {/* Sample dataset buttons */}
      <div className="px-4 py-2 border-b border-border/50 flex flex-wrap gap-2">
        <span className="text-xs text-muted self-center font-mono">Load sample:</span>
        {[4, 8, 12, 18].map(n => (
          <button
            key={n}
            onClick={() => loadSample(n)}
            className={`px-2 py-0.5 text-xs rounded font-mono border transition-colors ${
              records.length === n
                ? 'border-accent/50 bg-accent/10 text-accent'
                : 'border-border text-muted hover:border-accent/30 hover:text-white'
            }`}
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => setRecords([])}
          className="px-2 py-0.5 text-xs rounded font-mono border border-border text-muted hover:border-danger/50 hover:text-danger transition-colors ml-auto"
        >
          Clear
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-border overflow-hidden"
          >
            <div className="p-3 space-y-2 bg-black/10">
              {['name', 'dob', 'address', 'phone', 'email'].map(field => (
                <input
                  key={field}
                  placeholder={field === 'dob' ? 'DOB (YYYY-MM-DD)' : field.charAt(0).toUpperCase() + field.slice(1)}
                  value={form[field]}
                  onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                  className="w-full bg-black/30 border border-border rounded px-2 py-1.5 text-xs font-mono text-white placeholder-muted focus:outline-none focus:border-accent/50"
                />
              ))}
              <div className="flex gap-2">
                <button onClick={addRecord} className="flex-1 py-1.5 bg-accent/20 border border-accent/40 text-accent text-xs rounded font-mono hover:bg-accent/30 transition-colors">
                  Add Record
                </button>
                <button onClick={() => setShowAddForm(false)} className="px-3 py-1.5 border border-border text-muted text-xs rounded font-mono hover:text-white transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Records List */}
      <div className="overflow-y-auto flex-1" style={{ maxHeight: '400px' }}>
        {records.length === 0 ? (
          <div className="p-8 text-center text-muted text-sm font-body">
            <div className="text-3xl mb-2">◌</div>
            No records loaded. Load a sample or add manually.
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {records.map((record, idx) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="px-4 py-2.5 hover:bg-white/2 group flex items-start gap-2"
              >
                <span className="font-mono text-xs text-accent/60 mt-0.5 shrink-0 w-10">{record.id}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{record.name}</p>
                  <p className="text-xs text-muted font-mono truncate">{record.dob} · {record.address}</p>
                </div>
                <button
                  onClick={() => removeRecord(record.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted hover:text-danger transition-all text-xs font-mono shrink-0"
                >
                  ✕
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Run Button */}
      <div className="p-4 border-t border-border">
        <button
          onClick={onRun}
          disabled={records.length < 2 || running}
          className={`w-full py-3 rounded-lg font-display font-semibold text-sm transition-all relative overflow-hidden ${
            records.length < 2 || running
              ? 'bg-surface border border-border text-muted cursor-not-allowed'
              : 'bg-accent text-bg hover:bg-accent/90 glow-cyan'
          }`}
        >
          {running ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
              Analyzing...
            </span>
          ) : (
            `▶ Run All Algorithms (${records.length} records)`
          )}
        </button>
        {records.length < 2 && (
          <p className="text-xs text-muted text-center mt-2 font-mono">Need at least 2 records</p>
        )}
        <button
          onClick={downloadTemplate}
          className="w-full mt-2 py-1.5 text-xs text-muted hover:text-white border border-transparent hover:border-border rounded transition-colors font-mono"
        >
          ↓ Download CSV template
        </button>
      </div>
    </motion.div>
  );
}
