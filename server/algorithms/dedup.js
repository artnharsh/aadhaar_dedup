/**
 * CORE ALGORITHM ENGINE
 * Implements Divide & Conquer, Backtracking, and Heuristic approaches
 * for Aadhaar record deduplication with full step-by-step trace capture
 */

/**
 * Levenshtein distance for fuzzy string matching
 */
function levenshteinDistance(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => 
    Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0)
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] :
        1 + Math.min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]);
    }
  }
  return dp[m][n];
}

/**
 * Field similarity score [0,1]
 */
function fieldSimilarity(a, b) {
  if (!a || !b) return 0;
  const s1 = String(a).toLowerCase().trim();
  const s2 = String(b).toLowerCase().trim();
  if (s1 === s2) return 1;
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(s1, s2) / maxLen;
}

/**
 * ALGORITHM 1: DIVIDE & CONQUER
 * Recursively partitions dataset, finds duplicates within each partition
 * T(n) = 2T(n/2) + O(n²)
 */
function divideAndConquer(records, steps = [], depth = 0, nodeId = 'root') {
  steps.push({
    type: 'SPLIT',
    nodeId,
    depth,
    records: records.map(r => r.id),
    message: `Split into partition of ${records.length} records`,
    timestamp: steps.length
  });

  if (records.length <= 1) {
    steps.push({
      type: 'BASE_CASE',
      nodeId,
      depth,
      records: records.map(r => r.id),
      message: `Base case: single record`,
      timestamp: steps.length
    });
    return [];
  }

  if (records.length === 2) {
    // Direct comparison at base level
    const [a, b] = records;
    const similarity = computeSimilarity(a, b);
    steps.push({
      type: 'COMPARE',
      nodeId,
      depth,
      recordA: a.id,
      recordB: b.id,
      similarity,
      isDuplicate: similarity >= 0.75,
      message: `Compare: similarity = ${(similarity * 100).toFixed(1)}%`,
      timestamp: steps.length
    });
    if (similarity >= 0.75) {
      return [{ recordA: a, recordB: b, similarity, fields: getMatchedFields(a, b) }];
    }
    return [];
  }

  const mid = Math.floor(records.length / 2);
  const left = records.slice(0, mid);
  const right = records.slice(mid);

  const leftId = `${nodeId}-L`;
  const rightId = `${nodeId}-R`;

  steps.push({
    type: 'DIVIDE',
    nodeId,
    leftId,
    rightId,
    depth,
    leftCount: left.length,
    rightCount: right.length,
    message: `Dividing: [0..${mid-1}] and [${mid}..${records.length-1}]`,
    timestamp: steps.length
  });

  const leftDups = divideAndConquer(left, steps, depth + 1, leftId);
  const rightDups = divideAndConquer(right, steps, depth + 1, rightId);

  // MERGE: cross-partition comparison
  steps.push({
    type: 'MERGE_START',
    nodeId,
    leftId,
    rightId,
    depth,
    message: `Merging results from both partitions (${left.length} × ${right.length} cross-comparisons)`,
    timestamp: steps.length
  });

  const crossDups = [];
  for (let i = 0; i < left.length; i++) {
    for (let j = 0; j < right.length; j++) {
      const similarity = computeSimilarity(left[i], right[j]);
      steps.push({
        type: 'CROSS_COMPARE',
        nodeId,
        depth,
        recordA: left[i].id,
        recordB: right[j].id,
        similarity,
        isDuplicate: similarity >= 0.75,
        message: `Cross-compare ${left[i].name} vs ${right[j].name}: ${(similarity*100).toFixed(1)}%`,
        timestamp: steps.length
      });
      if (similarity >= 0.75) {
        crossDups.push({ recordA: left[i], recordB: right[j], similarity, fields: getMatchedFields(left[i], right[j]) });
      }
    }
  }

  steps.push({
    type: 'MERGE_COMPLETE',
    nodeId,
    depth,
    duplicatesFound: crossDups.length,
    message: `Merge complete: found ${crossDups.length} cross-partition duplicates`,
    timestamp: steps.length
  });

  return [...leftDups, ...rightDups, ...crossDups];
}

/**
 * ALGORITHM 2: BACKTRACKING MATCHING
 * Field-by-field comparison with decision tree
 */
function backtrackingMatch(recordA, recordB, steps = []) {
  const fields = ['name', 'dob', 'address', 'phone', 'email'];
  const weights = { name: 0.35, dob: 0.25, address: 0.25, phone: 0.1, email: 0.05 };
  const THRESHOLD = 0.65;

  let totalScore = 0;
  let weightSoFar = 0;
  const fieldResults = [];
  let pruned = false;

  steps.push({
    type: 'BT_START',
    recordA: recordA.id,
    recordB: recordB.id,
    message: `Starting backtracking comparison: ${recordA.name} vs ${recordB.name}`,
    timestamp: steps.length
  });

  for (const field of fields) {
    const sim = fieldSimilarity(recordA[field], recordB[field]);
    const contribution = sim * weights[field];
    totalScore += contribution;
    weightSoFar += weights[field];

    const result = { field, similarity: sim, score: contribution, matched: sim >= 0.8 };
    fieldResults.push(result);

    steps.push({
      type: 'BT_FIELD',
      field,
      similarity: sim,
      matched: sim >= 0.8,
      totalScore,
      recordA: recordA.id,
      recordB: recordB.id,
      message: `Field "${field}": "${recordA[field]}" vs "${recordB[field]}" → ${(sim*100).toFixed(1)}% match`,
      timestamp: steps.length
    });

    // Pruning: if remaining fields cannot push score above threshold, stop
    const remainingWeight = 1 - weightSoFar;
    const maxPossibleScore = totalScore + remainingWeight;

    if (maxPossibleScore < THRESHOLD && weightSoFar < 1) {
      steps.push({
        type: 'BT_PRUNE',
        field,
        totalScore,
        maxPossibleScore,
        threshold: THRESHOLD,
        recordA: recordA.id,
        recordB: recordB.id,
        message: `PRUNED: max possible score ${(maxPossibleScore*100).toFixed(1)}% < threshold ${(THRESHOLD*100)}%`,
        timestamp: steps.length
      });
      pruned = true;
      break;
    }

    // Early accept
    if (totalScore >= THRESHOLD && weightSoFar >= 0.6) {
      steps.push({
        type: 'BT_EARLY_ACCEPT',
        totalScore,
        recordA: recordA.id,
        recordB: recordB.id,
        message: `Early accept: score ${(totalScore*100).toFixed(1)}% exceeds threshold with ${(weightSoFar*100).toFixed(0)}% fields checked`,
        timestamp: steps.length
      });
      break;
    }
  }

  const isDuplicate = totalScore >= THRESHOLD;
  steps.push({
    type: 'BT_RESULT',
    isDuplicate,
    finalScore: totalScore,
    pruned,
    fieldResults,
    recordA: recordA.id,
    recordB: recordB.id,
    message: `Result: ${isDuplicate ? '✅ DUPLICATE' : '❌ UNIQUE'} (score: ${(totalScore*100).toFixed(1)}%)`,
    timestamp: steps.length
  });

  return { isDuplicate, score: totalScore, fieldResults, pruned };
}

/**
 * ALGORITHM 3: HEURISTIC OPTIMIZATION
 * Bloom filter-inspired first-char + sorted block pruning
 */
function heuristicDedup(records, steps = []) {
  let totalComparisons = 0;
  let prunedComparisons = 0;
  const duplicates = [];

  steps.push({
    type: 'HEURISTIC_START',
    totalRecords: records.length,
    naiveComparisons: (records.length * (records.length - 1)) / 2,
    message: `Heuristic start: ${records.length} records, naive O(n²) = ${(records.length*(records.length-1)/2)} comparisons`,
    timestamp: steps.length
  });

  // Step 1: Sort by first char of name (blocking key)
  const sortedRecords = [...records].sort((a, b) => 
    (a.name || '').charAt(0).toLowerCase().localeCompare((b.name || '').charAt(0).toLowerCase())
  );

  steps.push({
    type: 'HEURISTIC_SORT',
    sortedIds: sortedRecords.map(r => r.id),
    message: `Sorted by first character of name (blocking key)`,
    timestamp: steps.length
  });

  // Step 2: Create blocks by first char
  const blocks = {};
  for (const record of sortedRecords) {
    const key = (record.name || '?').charAt(0).toLowerCase();
    if (!blocks[key]) blocks[key] = [];
    blocks[key].push(record);
  }

  steps.push({
    type: 'HEURISTIC_BLOCKS',
    blocks: Object.entries(blocks).map(([k, v]) => ({ key: k, count: v.length, ids: v.map(r => r.id) })),
    message: `Created ${Object.keys(blocks).length} blocks by first character`,
    timestamp: steps.length
  });

  // Step 3: Compare only within blocks
  for (const [blockKey, blockRecords] of Object.entries(blocks)) {
    const skipped = blockRecords.length * (records.length - blockRecords.length);
    prunedComparisons += skipped;

    steps.push({
      type: 'HEURISTIC_BLOCK_ENTER',
      blockKey,
      blockSize: blockRecords.length,
      skippedComparisons: skipped,
      message: `Block "${blockKey}": ${blockRecords.length} records. Skipped ${skipped} cross-block comparisons`,
      timestamp: steps.length
    });

    for (let i = 0; i < blockRecords.length; i++) {
      for (let j = i + 1; j < blockRecords.length; j++) {
        totalComparisons++;
        const sim = computeSimilarity(blockRecords[i], blockRecords[j]);

        steps.push({
          type: 'HEURISTIC_COMPARE',
          blockKey,
          recordA: blockRecords[i].id,
          recordB: blockRecords[j].id,
          similarity: sim,
          isDuplicate: sim >= 0.75,
          message: `Within-block compare: ${blockRecords[i].name} vs ${blockRecords[j].name} = ${(sim*100).toFixed(1)}%`,
          timestamp: steps.length
        });

        if (sim >= 0.75) {
          duplicates.push({ 
            recordA: blockRecords[i], 
            recordB: blockRecords[j], 
            similarity: sim,
            fields: getMatchedFields(blockRecords[i], blockRecords[j])
          });
        }
      }
    }
  }

  const naiveTotal = (records.length * (records.length - 1)) / 2;
  const improvement = ((prunedComparisons / naiveTotal) * 100).toFixed(1);

  steps.push({
    type: 'HEURISTIC_SUMMARY',
    totalComparisons,
    prunedComparisons,
    naiveComparisons: naiveTotal,
    improvement,
    duplicatesFound: duplicates.length,
    message: `Done! Performed ${totalComparisons} comparisons. Pruned ${prunedComparisons} (${improvement}% reduction)`,
    timestamp: steps.length
  });

  return { duplicates, totalComparisons, prunedComparisons, naiveComparisons: naiveTotal, improvement };
}

/**
 * Helpers
 */
function computeSimilarity(a, b) {
  const nameSim = fieldSimilarity(a.name, b.name);
  const dobSim = fieldSimilarity(a.dob, b.dob);
  const addrSim = fieldSimilarity(a.address, b.address);
  const phoneSim = fieldSimilarity(a.phone, b.phone);
  const emailSim = fieldSimilarity(a.email, b.email);
  return nameSim * 0.35 + dobSim * 0.25 + addrSim * 0.25 + phoneSim * 0.1 + emailSim * 0.05;
}

function getMatchedFields(a, b) {
  const fields = ['name', 'dob', 'address', 'phone', 'email'];
  return fields.map(f => ({
    field: f,
    similarity: fieldSimilarity(a[f], b[f]),
    matched: fieldSimilarity(a[f], b[f]) >= 0.8,
    valueA: a[f],
    valueB: b[f]
  }));
}

module.exports = { divideAndConquer, backtrackingMatch, heuristicDedup, computeSimilarity };
