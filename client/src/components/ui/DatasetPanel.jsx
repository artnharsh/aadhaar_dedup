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
      className="panel-card overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="panel-header px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-slate-400">Input Workspace</p>
            <h2 className="section-title mt-2 text-base">Dataset</h2>
            <p className="mt-1 text-xs text-slate-400">{records.length} records loaded and ready for comparison</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <button
              onClick={() => fileRef.current.click()}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-mono text-slate-300 transition-colors hover:border-accent/35 hover:text-white"
            >
              Import CSV
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-mono text-slate-300 transition-colors hover:border-accent/35 hover:text-white"
            >
              {showAddForm ? 'Close Form' : '+ Add Record'}
            </button>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSV} />
          </div>
        </div>
      </div>

      {/* Sample dataset buttons */}
      <div className="border-b border-white/10 px-5 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 self-center font-mono uppercase tracking-[0.18em]">Quick Sample</span>
        {[4, 8, 12, 18].map(n => (
          <button
            key={n}
            onClick={() => loadSample(n)}
            className={`rounded-full px-3 py-1.5 text-xs font-mono border transition-colors ${
              records.length === n
                ? 'border-accent/40 bg-accent/10 text-accent'
                : 'border-white/10 bg-white/[0.02] text-slate-300 hover:border-accent/25 hover:text-white'
            }`}
          >
            {n} records
          </button>
        ))}
        <button
          onClick={() => setRecords([])}
          className="ml-auto rounded-full px-3 py-1.5 text-xs font-mono border border-white/10 bg-white/[0.02] text-slate-300 transition-colors hover:border-danger/35 hover:text-danger"
        >
          Clear
        </button>
        </div>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/10"
          >
            <div className="bg-white/[0.03] p-4 space-y-3">
              {['name', 'dob', 'address', 'phone', 'email'].map(field => (
                <input
                  key={field}
                  placeholder={field === 'dob' ? 'DOB (YYYY-MM-DD)' : field.charAt(0).toUpperCase() + field.slice(1)}
                  value={form[field]}
                  onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                  className="soft-input"
                />
              ))}
              <div className="flex gap-2">
                <button onClick={addRecord} className="flex-1 rounded-xl border border-accent/35 bg-accent/10 py-2 text-xs font-mono text-accent transition-colors hover:bg-accent/20">
                  Add Record
                </button>
                <button onClick={() => setShowAddForm(false)} className="rounded-xl border border-white/10 px-4 py-2 text-xs font-mono text-slate-300 transition-colors hover:text-white">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Records List */}
      <div className="overflow-y-auto flex-1 px-2 py-2" style={{ maxHeight: '440px' }}>
        {records.length === 0 ? (
          <div className="m-3 rounded-2xl border border-dashed border-white/10 bg-black/10 p-8 text-center text-sm font-body text-slate-400">
            <div className="text-3xl mb-2">◌</div>
            No records loaded. Load a sample or add manually.
          </div>
        ) : (
          <div className="space-y-2">
            {records.map((record, idx) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="group mx-2 flex items-start gap-3 rounded-2xl border border-transparent bg-black/10 px-4 py-3 transition-all hover:border-white/10 hover:bg-white/[0.03]"
              >
                <span className="mt-0.5 w-12 shrink-0 rounded-full border border-accent/15 bg-accent/10 px-2 py-1 text-center font-mono text-[10px] text-accent/80">{record.id}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-white">{record.name}</p>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">{record.dob || 'Unknown DOB'}</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-400">{record.address}</p>
                  <p className="mt-1 truncate font-mono text-[11px] text-slate-500">{record.phone || 'No phone'} {record.email ? `• ${record.email}` : ''}</p>
                </div>
                <button
                  onClick={() => removeRecord(record.id)}
                  className="shrink-0 rounded-full border border-transparent px-2 py-1 text-xs font-mono text-slate-500 opacity-0 transition-all hover:border-danger/25 hover:text-danger group-hover:opacity-100"
                >
                  ✕
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Run Button */}
      <div className="border-t border-white/10 p-5">
        <button
          onClick={onRun}
          disabled={records.length < 2 || running}
          className={`w-full rounded-2xl py-3.5 font-display text-sm font-semibold transition-all relative overflow-hidden ${
            records.length < 2 || running
              ? 'cursor-not-allowed border border-white/10 bg-white/[0.04] text-slate-500'
              : 'bg-gradient-to-r from-accent to-[#a7def5] text-bg hover:brightness-105 glow-cyan'
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
          <p className="mt-2 text-center font-mono text-xs text-slate-500">Need at least 2 records</p>
        )}
        <button
          onClick={downloadTemplate}
          className="mt-3 w-full rounded-xl border border-transparent py-2 text-xs font-mono text-slate-400 transition-colors hover:border-white/10 hover:text-white"
        >
          Download CSV template
        </button>
        {hasResults && (
          <p className="mt-3 text-center text-xs text-slate-500">Re-run anytime after editing the dataset to refresh all visualizations.</p>
        )}
      </div>
    </motion.div>
  );
}
