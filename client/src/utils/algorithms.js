/**
 * Client-side algorithm implementations
 * These mirror the server algorithms for standalone/offline use
 */

function levenshteinDistance(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
  return dp[m][n];
}

export function fieldSimilarity(a, b) {
  if (!a || !b) return 0;
  const s1 = String(a).toLowerCase().trim();
  const s2 = String(b).toLowerCase().trim();
  if (s1 === s2) return 1;
  const maxLen = Math.max(s1.length, s2.length);
  return maxLen === 0 ? 1 : 1 - levenshteinDistance(s1, s2) / maxLen;
}

export function computeSimilarity(a, b) {
  return fieldSimilarity(a.name, b.name) * 0.35 +
    fieldSimilarity(a.dob, b.dob) * 0.25 +
    fieldSimilarity(a.address, b.address) * 0.25 +
    fieldSimilarity(a.phone, b.phone) * 0.1 +
    fieldSimilarity(a.email, b.email) * 0.05;
}

export function getMatchedFields(a, b) {
  return ['name', 'dob', 'address', 'phone', 'email'].map(f => ({
    field: f, similarity: fieldSimilarity(a[f], b[f]),
    matched: fieldSimilarity(a[f], b[f]) >= 0.8,
    valueA: a[f], valueB: b[f]
  }));
}

export function runDivideAndConquer(records, steps = [], depth = 0, nodeId = 'root') {
  steps.push({ type: 'SPLIT', nodeId, depth, records: records.map(r => r.id), message: `Partition of ${records.length} records`, timestamp: steps.length });

  if (records.length <= 1) {
    steps.push({ type: 'BASE_CASE', nodeId, depth, records: records.map(r => r.id), message: `Base case: ${records.length} record`, timestamp: steps.length });
    return [];
  }

  if (records.length === 2) {
    const [a, b] = records;
    const similarity = computeSimilarity(a, b);
    steps.push({ type: 'COMPARE', nodeId, depth, recordA: a.id, recordB: b.id, similarity, isDuplicate: similarity >= 0.75, message: `Compare: ${a.name} vs ${b.name} → ${(similarity * 100).toFixed(1)}%`, timestamp: steps.length });
    return similarity >= 0.75 ? [{ recordA: a, recordB: b, similarity, fields: getMatchedFields(a, b) }] : [];
  }

  const mid = Math.floor(records.length / 2);
  const left = records.slice(0, mid);
  const right = records.slice(mid);
  const leftId = `${nodeId}-L`, rightId = `${nodeId}-R`;

  steps.push({ type: 'DIVIDE', nodeId, leftId, rightId, depth, leftCount: left.length, rightCount: right.length, message: `Divide [0..${mid-1}] and [${mid}..${records.length-1}]`, timestamp: steps.length });

  const leftDups = runDivideAndConquer(left, steps, depth + 1, leftId);
  const rightDups = runDivideAndConquer(right, steps, depth + 1, rightId);

  steps.push({ type: 'MERGE_START', nodeId, leftId, rightId, depth, message: `Merge: ${left.length}×${right.length} cross-comparisons`, timestamp: steps.length });

  const crossDups = [];
  for (let i = 0; i < left.length; i++) {
    for (let j = 0; j < right.length; j++) {
      const similarity = computeSimilarity(left[i], right[j]);
      steps.push({ type: 'CROSS_COMPARE', nodeId, depth, recordA: left[i].id, recordB: right[j].id, similarity, isDuplicate: similarity >= 0.75, message: `Cross: ${left[i].name} vs ${right[j].name} → ${(similarity*100).toFixed(1)}%`, timestamp: steps.length });
      if (similarity >= 0.75) crossDups.push({ recordA: left[i], recordB: right[j], similarity, fields: getMatchedFields(left[i], right[j]) });
    }
  }

  steps.push({ type: 'MERGE_COMPLETE', nodeId, depth, duplicatesFound: crossDups.length, message: `Merge done: ${crossDups.length} cross-duplicates found`, timestamp: steps.length });
  return [...leftDups, ...rightDups, ...crossDups];
}

export function runBacktracking(recordA, recordB, steps = []) {
  const fields = ['name', 'dob', 'address', 'phone', 'email'];
  const weights = { name: 0.35, dob: 0.25, address: 0.25, phone: 0.1, email: 0.05 };
  const THRESHOLD = 0.65;
  let totalScore = 0, weightSoFar = 0;
  const fieldResults = [];
  let pruned = false;

  steps.push({ type: 'BT_START', recordA: recordA.id, recordB: recordB.id, message: `Backtrack: ${recordA.name} vs ${recordB.name}`, timestamp: steps.length });

  for (const field of fields) {
    const sim = fieldSimilarity(recordA[field], recordB[field]);
    totalScore += sim * weights[field];
    weightSoFar += weights[field];
    const result = { field, similarity: sim, score: sim * weights[field], matched: sim >= 0.8 };
    fieldResults.push(result);

    steps.push({ type: 'BT_FIELD', field, similarity: sim, matched: sim >= 0.8, totalScore, recordA: recordA.id, recordB: recordB.id, message: `"${field}": "${recordA[field]}" vs "${recordB[field]}" → ${(sim*100).toFixed(1)}%`, timestamp: steps.length });

    const maxPossible = totalScore + (1 - weightSoFar);
    if (maxPossible < THRESHOLD && weightSoFar < 1) {
      steps.push({ type: 'BT_PRUNE', field, totalScore, maxPossibleScore: maxPossible, threshold: THRESHOLD, recordA: recordA.id, recordB: recordB.id, message: `PRUNED: max ${(maxPossible*100).toFixed(1)}% < ${(THRESHOLD*100)}% threshold`, timestamp: steps.length });
      pruned = true; break;
    }
    if (totalScore >= THRESHOLD && weightSoFar >= 0.6) {
      steps.push({ type: 'BT_EARLY_ACCEPT', totalScore, recordA: recordA.id, recordB: recordB.id, message: `Early accept: ${(totalScore*100).toFixed(1)}% ≥ threshold`, timestamp: steps.length });
      break;
    }
  }

  const isDuplicate = totalScore >= THRESHOLD;
  steps.push({ type: 'BT_RESULT', isDuplicate, finalScore: totalScore, pruned, fieldResults, recordA: recordA.id, recordB: recordB.id, message: `${isDuplicate ? '✅ DUPLICATE' : '❌ UNIQUE'} (score: ${(totalScore*100).toFixed(1)}%)`, timestamp: steps.length });
  return { isDuplicate, score: totalScore, fieldResults, pruned };
}

export function runHeuristic(records, steps = []) {
  let totalComparisons = 0, prunedComparisons = 0;
  const duplicates = [];
  const naiveTotal = (records.length * (records.length - 1)) / 2;

  steps.push({ type: 'HEURISTIC_START', totalRecords: records.length, naiveComparisons: naiveTotal, message: `Start: ${records.length} records, naive = ${naiveTotal} comparisons`, timestamp: steps.length });

  const sorted = [...records].sort((a, b) => (a.name || '').charAt(0).toLowerCase().localeCompare((b.name || '').charAt(0).toLowerCase()));
  steps.push({ type: 'HEURISTIC_SORT', sortedIds: sorted.map(r => r.id), message: `Sorted by first-char of name`, timestamp: steps.length });

  const blocks = {};
  for (const r of sorted) {
    const k = (r.name || '?').charAt(0).toLowerCase();
    if (!blocks[k]) blocks[k] = [];
    blocks[k].push(r);
  }

  steps.push({ type: 'HEURISTIC_BLOCKS', blocks: Object.entries(blocks).map(([k, v]) => ({ key: k, count: v.length, ids: v.map(r => r.id) })), message: `${Object.keys(blocks).length} blocks created`, timestamp: steps.length });

  for (const [blockKey, blockRecords] of Object.entries(blocks)) {
    const skipped = blockRecords.length * (records.length - blockRecords.length);
    prunedComparisons += skipped;
    steps.push({ type: 'HEURISTIC_BLOCK_ENTER', blockKey, blockSize: blockRecords.length, skippedComparisons: skipped, message: `Block "${blockKey}": ${blockRecords.length} records, skip ${skipped}`, timestamp: steps.length });

    for (let i = 0; i < blockRecords.length; i++) {
      for (let j = i + 1; j < blockRecords.length; j++) {
        totalComparisons++;
        const sim = computeSimilarity(blockRecords[i], blockRecords[j]);
        steps.push({ type: 'HEURISTIC_COMPARE', blockKey, recordA: blockRecords[i].id, recordB: blockRecords[j].id, similarity: sim, isDuplicate: sim >= 0.75, message: `${blockRecords[i].name} vs ${blockRecords[j].name} → ${(sim*100).toFixed(1)}%`, timestamp: steps.length });
        if (sim >= 0.75) duplicates.push({ recordA: blockRecords[i], recordB: blockRecords[j], similarity: sim, fields: getMatchedFields(blockRecords[i], blockRecords[j]) });
      }
    }
  }

  const improvement = ((prunedComparisons / naiveTotal) * 100).toFixed(1);
  steps.push({ type: 'HEURISTIC_SUMMARY', totalComparisons, prunedComparisons, naiveComparisons: naiveTotal, improvement, duplicatesFound: duplicates.length, message: `Done: ${totalComparisons} actual, ${prunedComparisons} pruned (${improvement}% saved)`, timestamp: steps.length });
  return { duplicates, steps, totalComparisons, prunedComparisons, naiveComparisons: naiveTotal, improvement };
}

export function runAllAlgorithms(records) {
  const startTime = performance.now();

  const dcSteps = [];
  const dcStart = performance.now();
  const dcDuplicates = runDivideAndConquer(records, dcSteps);
  const dcTime = Math.round(performance.now() - dcStart);

  const btSteps = [];
  const btStart = performance.now();
  const btDuplicates = [];
  for (let i = 0; i < records.length; i++) {
    for (let j = i + 1; j < records.length; j++) {
      const result = runBacktracking(records[i], records[j], btSteps);
      if (result.isDuplicate) btDuplicates.push({ recordA: records[i], recordB: records[j], similarity: result.score, fields: result.fieldResults });
    }
  }
  const btTime = Math.round(performance.now() - btStart);

  const hSteps = [];
  const hStart = performance.now();
  const hResult = runHeuristic(records, hSteps);
  const hTime = Math.round(performance.now() - hStart);

  return {
    totalRecords: records.length,
    totalTime: Math.round(performance.now() - startTime),
    algorithms: {
      divideAndConquer: { steps: dcSteps, duplicates: dcDuplicates, stepCount: dcSteps.length, timeMs: dcTime, comparisons: dcSteps.filter(s => s.type === 'COMPARE' || s.type === 'CROSS_COMPARE').length },
      backtracking: { steps: btSteps, duplicates: btDuplicates, stepCount: btSteps.length, timeMs: btTime, prunedCount: btSteps.filter(s => s.type === 'BT_PRUNE').length, comparisons: btSteps.filter(s => s.type === 'BT_FIELD').length },
      heuristic: { steps: hSteps, duplicates: hResult.duplicates, stepCount: hSteps.length, timeMs: hTime, totalComparisons: hResult.totalComparisons, prunedComparisons: hResult.prunedComparisons, naiveComparisons: hResult.naiveComparisons, improvement: hResult.improvement }
    }
  };
}
