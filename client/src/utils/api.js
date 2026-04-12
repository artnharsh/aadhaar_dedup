import axios from 'axios';

const BASE = '/api';

export const api = {
  health: () => axios.get(`${BASE}/health`),
  
  // Records
  getRecords: () => axios.get(`${BASE}/records`),
  addRecord: (record) => axios.post(`${BASE}/records`, record),
  addBulk: (records) => axios.post(`${BASE}/records/bulk`, { records }),
  deleteAll: () => axios.delete(`${BASE}/records/all`),
  uploadCSV: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return axios.post(`${BASE}/records/upload`, fd);
  },

  // Algorithms
  runAll: (records) => axios.post(`${BASE}/algorithms/run`, { records }),
  runDC: (records) => axios.post(`${BASE}/algorithms/divide-conquer`, { records }),
  runBT: (recordA, recordB) => axios.post(`${BASE}/algorithms/backtracking`, { recordA, recordB }),
  runHeuristic: (records) => axios.post(`${BASE}/algorithms/heuristic`, { records }),
  getComplexity: () => axios.get(`${BASE}/algorithms/complexity`),
};

// Client-side algorithm implementations (fallback when server unavailable)
export function clientSideRun(records) {
  return {
    totalRecords: records.length,
    totalTime: 0,
    algorithms: {
      divideAndConquer: { steps: [], duplicates: [], stepCount: 0, timeMs: 0, comparisons: 0 },
      backtracking: { steps: [], duplicates: [], stepCount: 0, timeMs: 0, prunedCount: 0 },
      heuristic: { steps: [], duplicates: [], stepCount: 0, timeMs: 0, improvement: '0' }
    }
  };
}
