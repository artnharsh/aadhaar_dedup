const express = require('express');
const router = express.Router();
const { divideAndConquer, backtrackingMatch, heuristicDedup, computeSimilarity } = require('../algorithms/dedup');

// Run full deduplication with all algorithms
router.post('/run', async (req, res) => {
  try {
    const { records } = req.body;
    if (!records || records.length < 2) {
      return res.status(400).json({ error: 'Need at least 2 records' });
    }

    const startTime = Date.now();

    // Algorithm 1: Divide & Conquer
    const dcSteps = [];
    const dcStart = Date.now();
    const dcDuplicates = divideAndConquer(records, dcSteps);
    const dcTime = Date.now() - dcStart;

    // Algorithm 2: Backtracking (all pairs)
    const btSteps = [];
    const btStart = Date.now();
    const btDuplicates = [];
    for (let i = 0; i < records.length; i++) {
      for (let j = i + 1; j < records.length; j++) {
        const result = backtrackingMatch(records[i], records[j], btSteps);
        if (result.isDuplicate) {
          btDuplicates.push({
            recordA: records[i],
            recordB: records[j],
            similarity: result.score,
            fields: result.fieldResults
          });
        }
      }
    }
    const btTime = Date.now() - btStart;

    // Algorithm 3: Heuristic
    const heuristicSteps = [];
    const hStart = Date.now();
    const hResult = heuristicDedup(records, heuristicSteps);
    const hTime = Date.now() - hStart;

    const totalTime = Date.now() - startTime;

    res.json({
      totalRecords: records.length,
      totalTime,
      algorithms: {
        divideAndConquer: {
          steps: dcSteps,
          duplicates: dcDuplicates,
          stepCount: dcSteps.length,
          timeMs: dcTime,
          comparisons: dcSteps.filter(s => s.type === 'COMPARE' || s.type === 'CROSS_COMPARE').length
        },
        backtracking: {
          steps: btSteps,
          duplicates: btDuplicates,
          stepCount: btSteps.length,
          timeMs: btTime,
          prunedCount: btSteps.filter(s => s.type === 'BT_PRUNE').length,
          comparisons: btSteps.filter(s => s.type === 'BT_FIELD').length
        },
        heuristic: {
          steps: heuristicSteps,
          duplicates: hResult.duplicates,
          stepCount: heuristicSteps.length,
          timeMs: hTime,
          totalComparisons: hResult.totalComparisons,
          prunedComparisons: hResult.prunedComparisons,
          naiveComparisons: hResult.naiveComparisons,
          improvement: hResult.improvement
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Run only specific algorithm
router.post('/divide-conquer', (req, res) => {
  try {
    const { records } = req.body;
    const steps = [];
    const duplicates = divideAndConquer(records, steps);
    res.json({ steps, duplicates, stepCount: steps.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/backtracking', (req, res) => {
  try {
    const { recordA, recordB } = req.body;
    const steps = [];
    const result = backtrackingMatch(recordA, recordB, steps);
    res.json({ steps, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/heuristic', (req, res) => {
  try {
    const { records } = req.body;
    const steps = [];
    const result = heuristicDedup(records, steps);
    res.json({ steps, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Complexity analysis data
router.get('/complexity', (req, res) => {
  const sizes = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];
  
  const data = sizes.map(n => ({
    n,
    naive: n * (n - 1) / 2,
    divideConquer: n * Math.log2(n) * n, // T(n) = 2T(n/2) + n^2 → O(n² log n) effectively
    heuristic: Math.ceil(n * Math.log2(n)), // After blocking
    logn: Math.ceil(Math.log2(n))
  }));

  res.json({ data, formula: 'T(n) = 2T(n/2) + O(n²)' });
});

module.exports = router;
