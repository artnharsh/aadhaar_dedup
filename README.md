# Aadhaar Deduplication — Algorithm Visualizer

An interactive MERN stack educational platform visualizing deduplication algorithms on Aadhaar-like records.

---

## 🔥 Features

| Feature | Description |
|---|---|
| **Divide & Conquer** | Recursive partitioning with animated tree visualization |
| **Backtracking Matching** | Field-by-field comparison with live pruning decisions |
| **Heuristics Optimization** | Blocking-based pruning with performance metrics |
| **Recurrence Relation** | Interactive T(n) = 2T(n/2) + O(n²) graph explorer |
| **NP-Hardness** | Explanation of computational intractability with diagrams |
| **Duplicate Results** | Side-by-side field comparison with similarity scores |
| **Step-by-Step Playback** | Play/Pause/Rewind with speed control |
| **CSV Upload** | Upload your own dataset or use the built-in sample |

---

## 🏗️ Project Structure

```
aadhaar-dedup/
├── server/                     # Node.js + Express backend
│   ├── index.js                # Server entry point
│   ├── models/
│   │   └── Record.js           # MongoDB schema
│   ├── routes/
│   │   ├── records.js          # CRUD endpoints
│   │   └── algorithms.js       # Algorithm execution endpoints
│   └── algorithms/
│       └── dedup.js            # Core algorithm engine
│
└── client/                     # React + Vite frontend
    ├── src/
    │   ├── App.jsx             # Root component
    │   ├── components/
    │   │   ├── ui/
    │   │   │   ├── Header.jsx
    │   │   │   ├── DatasetPanel.jsx
    │   │   │   ├── AlgorithmTabs.jsx
    │   │   │   ├── MetricsBar.jsx
    │   │   │   └── DuplicatesPanel.jsx
    │   │   └── visualization/
    │   │       ├── DivideConquerViz.jsx
    │   │       ├── BacktrackingViz.jsx
    │   │       ├── HeuristicViz.jsx
    │   │       ├── ComplexityGraph.jsx
    │   │       ├── NPHardnessPanel.jsx
    │   │       ├── PlaybackControls.jsx
    │   │       └── usePlayback.js
    │   ├── data/
    │   │   └── sampleData.js   # 18 sample records with intentional duplicates
    │   └── utils/
    │       ├── api.js          # Axios API helpers
    │       └── algorithms.js   # Client-side algorithm mirrors (offline fallback)
    └── public/
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (optional — app works without it using in-memory storage)

### 1. Clone / Extract
```bash
cd aadhaar-dedup
```

### 2. Start Backend
```bash
cd server
npm install
npm run dev   # runs on http://localhost:5000
```

> **Without MongoDB?** The server auto-detects and falls back to in-memory storage. You'll see a warning but everything works.

### 3. Start Frontend
```bash
cd client
npm install
npm run dev   # runs on http://localhost:3000
```

### 4. Open
Visit **http://localhost:3000**

---

## 🧪 Using the App

### Load Data
- Click **"8"** in the Dataset panel to load 8 sample records (includes 4 duplicate pairs)
- Or click **"18"** for the full sample dataset with 7 duplicate pairs
- Or **Add** records manually / upload a CSV

### Run Algorithms
- Click **▶ Run All Algorithms**
- Watch the metrics bar update

### Visualize
Navigate the 6 tabs:

| Tab | What to Watch |
|---|---|
| **Divide & Conquer** | The recursive tree splitting and merging |
| **Backtracking** | Field bars filling up, red PRUNE events |
| **Heuristics** | Blocks lighting up, comparison count vs naive |
| **Recurrence** | Drag the slider to see T(n) growth |
| **NP-Hardness** | Educational cards explaining complexity |
| **Results** | Detected duplicates with field breakdown |

### Playback Controls
- **▶ Play** — auto-advance through steps
- **⏸ Pause** — freeze at any step
- **◀ / ▶** — step backward/forward
- **⟲** — reset to step 1
- **0.5× / 1× / 2× / 4×** — speed control
- **Drag slider** — jump to any step

---

## 🔌 API Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Server health + MongoDB status |
| GET | `/api/records` | Get all records |
| POST | `/api/records` | Add single record |
| POST | `/api/records/bulk` | Add multiple records |
| DELETE | `/api/records/all` | Clear all records |
| POST | `/api/records/upload` | Upload CSV file |
| POST | `/api/algorithms/run` | Run all 3 algorithms |
| POST | `/api/algorithms/divide-conquer` | Run D&C only |
| POST | `/api/algorithms/backtracking` | Compare two records |
| POST | `/api/algorithms/heuristic` | Run heuristic dedup |
| GET | `/api/algorithms/complexity` | Complexity chart data |

---

## 🧠 Algorithm Details

### Similarity Scoring
Each pair of records gets a weighted similarity score:
```
score = name(0.35) + dob(0.25) + address(0.25) + phone(0.10) + email(0.05)
```
Each field uses normalized Levenshtein distance. Score ≥ 0.65 → DUPLICATE.

### Divide & Conquer
```
T(n) = 2T(n/2) + O(n²)
```
1. Split dataset at midpoint
2. Recursively find duplicates in each half
3. Cross-compare records across the boundary

### Backtracking
- Compare fields one by one (weighted order)
- **Prune**: if `current_score + remaining_weight < 0.65`, stop early
- **Early accept**: if `score >= 0.65 && checked >= 60% weight`, accept

### Heuristic (Blocking)
1. Sort all records by first character of name
2. Group into blocks (same first char)
3. Skip all cross-block comparisons
4. Compare only within blocks

---

## 📁 CSV Format

```csv
name,dob,address,phone,email
Rajesh Kumar,1985-03-15,"42 Gandhi Nagar, Pune",9876543210,raj@email.com
```

Download the template from the Dataset panel.

---

## 🎨 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Charts | Recharts |
| Backend | Node.js + Express |
| Database | MongoDB (optional) |
| HTTP | Axios |

---

## 🔒 Offline Mode

The app runs entirely in the browser without a server. If the backend isn't reachable, all algorithms execute in the frontend (same logic, mirrored in `client/src/utils/algorithms.js`). A yellow "Client Mode" badge appears in the header.

---

## 📖 Educational Notes

This visualizer is designed for learning algorithms in the context of a real government-scale problem (India's Aadhaar has 1.4 billion records). The NP-Hardness section explains why exact deduplication is impossible at that scale and why heuristic approximations are the only practical solution.
