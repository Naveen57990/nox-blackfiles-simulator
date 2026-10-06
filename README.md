# NAGAR-BOT 🤖🏛️
### Low-Cost Civic Issue Observation, Work-Order Automation & Verification System
**MY Bharat Hack for Social Cause (VBYLD 2027)**  
*Organized by Ministry of Youth Affairs & Sports (MoYAS), Govt. of India | Knowledge Partner: IIT Bombay (GISE Hub & SJMSOM)*

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Local Edge VLM](https://img.shields.io/badge/AI-Local%20Edge%20VLM%20(Qwen2.5--VL)-teal.svg)](#local-vision-ai)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green.svg)](#quickstart)
[![Spatial Twin](https://img.shields.io/badge/GIS-2D%20Leaflet%20%2B%203D%20Three.js-orange.svg)](#system-architecture)

---

## 1. Problem Statement & Civic Context

In Indian municipalities (Urban Local Bodies - ULBs), civic defect management suffers from a structural breakdown across the lifecycle:
* **The Detection Gap:** Potholes, open solid waste heaps, and drainage chokes are often detected only after citizen outrage or accidents.
* **The Verification & Fraud Gap:** Municipal contractors frequently upload irrelevant, blurry, or generic photos to falsely claim work-order completion, leading to public funds leakage without actual road restoration.
* **The Cost Barrier:** Commercial survey vans (LiDAR / high-end sensor rigs costing ₹15L–₹50L) are completely unaffordable for routine daily ward sweeps in Tier-2/Tier-3 cities.

### NAGAR-BOT Solution
NAGAR-BOT transforms any standard smartphone camera or low-cost municipal rover into an edge-vision civic observer, coupled with an auditable closed-loop verification pipeline:
$$\text{Detect} \longrightarrow \text{Deduplicate} \longrightarrow \text{Draft Work Order} \longrightarrow \text{Contractor Claim} \longrightarrow \text{Re-Inspect} \longrightarrow \text{Human Review Verdict}$$

---

## 2. Key Features

1. **Edge Multimodal Vision AI:**
   * Runs **Qwen2.5-VL (3B)** locally via Ollama.
   * Classifies potholes, uncollected garbage heaps, and waterlogging with structured confidence scoring.
   * **Zero Cloud Leakage:** All inference runs on-device on `localhost:11434`.
2. **Dual Synchronized Spatial Digital Twin:**
   * **2D GIS Map (Leaflet.js):** Displays Ward 42 boundaries, 8 corridor waypoints (WP-01 to WP-08), live rover telemetry, and defect pins.
   * **3D Spatial Twin (Three.js WebGL):** Real-time isometric 3D city block with 3D buildings, road corridor, and synchronized floating defect laser beacons.
3. **Spatial & Temporal Deduplication:**
   * Automatically clusters new observations within a 35m radius against active and historical tickets without silent auto-merging.
4. **Automated Municipal Work Orders:**
   * Auto-routes to PWD, SWM, or Stormwater divisions with itemized IRC:SP:98 cold-patching material budgets and SLA deadlines.
5. **Three-State Human Reviewer Decision Hub:**
   * Interactive Before vs. After re-inspection split-screen.
   * Supervisors choose: 🟢 **VERIFIED**, 🔴 **UNRESOLVED**, or 🟡 **INCONCLUSIVE** with mandatory justification logged to a cryptographic audit ledger.

---

## 3. Quickstart & Installation

### Prerequisites
* **Node.js**: v18+ (tested on Node v20/v26)
* **Ollama (Optional for Live VLM)**: [Ollama](https://ollama.com) running `qwen2.5vl:3b` on `localhost:11434`. *(A built-in deterministic heuristic fallback is automatically used if Ollama is not running).*

### Step 1: Clone & Install Dependencies
```bash
git clone https://github.com/<your-username>/nagar-bot.git
cd nagar-bot
npm install
```

### Step 2: Seed Baseline Demonstration Data
```bash
npm run seed
```

### Step 3: Run Automated Test Suite
```bash
npm test
```

### Step 4: Start the Command Center
```bash
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 4. Live Demonstration Workflow (Judge Guide)

1. **Rover POV Ingestion:**
   * Select `Route Sim` or click `Upload Frame` to test sample road images (Severe Pothole, Market Garbage, Clean Asphalt).
   * Click **`⚡ Inspect Current Frame (AI)`** to run on-device vision inference.
2. **Spatial Twin Observation:**
   * Switch between **2D GIS Map** and **3D Rover Twin** (or Dual Split view) to observe the live rover waypoint and spatial beacon.
3. **Work Order & Verification:**
   * Click **`ISS-0001`** (Pothole at Hospital Approach Lane) to open the Issue Dossier.
   * Inspect the side-by-side **BEFORE (Detection)** vs **AFTER (Reinspection)** comparison.
   * Under *Human Supervisor Audit Decision*, select **`🟢 VERIFIED`**, type an audit justification note, and click **`✍️ Commit Authoritative Audit Verdict`**.
   * Observe the real-time update in the **Audit Log** tab with cryptographic hash!

---

## 5. System Architecture

```
[Mobile Phone / Rover POV] ──> [Local VLM (Qwen2.5-VL 3B via Ollama)]
                                            │
                                            ▼
[Dual 2D/3D Spatial Twin] <── [Express Core & Deduplication Engine] ──> [Draft Work Orders]
                                            │
                                            ▼
                               [Human Supervisor Audit Hub]
                        (VERIFIED / UNRESOLVED / INCONCLUSIVE)
```

---

## 6. Project Directory Structure

```
nagar-bot/
├── docs/
│   ├── ARCHITECTURE.md          # Complete technical & security specification
│   ├── PRIOR_ART.md             # Survey of JMC, Swachhata App, RoadMetrics
│   ├── SLIDE_DECK_CONTENT.md    # Official 7-Slide IIT Bombay presentation deck
│   ├── DEMO_SCRIPT.md           # 3-5 minute video demonstration script
│   └── ANNEXURE_1_GUIDE.md      # Self-Declaration & ID proof submission checklist
├── src/
│   ├── backend/
│   │   ├── canonical_topology.js# Ward 42 spatial coordinates & waypoints
│   │   ├── deduplication_engine.js # Spatial clustering (<35m radius)
│   │   ├── routes.js            # REST API & SSE event broadcaster
│   │   ├── server.js            # Express server entry point
│   │   ├── store.js             # Atomic persistent JSON state store
│   │   ├── vision_engine.js     # Ollama Qwen2.5-VL inference handler
│   │   └── work_order_engine.js # Municipal work order generator
│   └── frontend/
│       ├── css/style.css        # Command center dark-mode stylesheet
│       ├── js/
│       │   ├── api.js           # REST client & SSE listener
│       │   ├── app.js           # Master UI coordinator
│       │   ├── map2d.js         # Leaflet 2D GIS map controller
│       │   ├── map3d.js         # Three.js 3D WebGL Digital Twin
│       │   ├── rover_camera.js  # Camera / Video ingestion
│       │   └── work_orders.js   # Work order & audit modal controller
│       └── index.html           # Main command center layout
├── tests/
│   ├── seed_data.js             # Baseline demonstration data generator
│   └── test_workflow.js         # Automated 14-point test suite
├── package.json
└── LICENSE
```

---

## 7. AI Disclosure & Ethical Compliance
* **AI Models Used:** `qwen2.5vl:3b` (Alibaba / Ollama) for edge vision inference; coding assistance for boilerplate and unit test scaffolding.
* **Proportion of AI Assistance:** Estimated at ~30% for code assistance and testing automation; 100% of domain architecture, spatial deduplication algorithms, closed-loop verification logic, and UI design were architected by the team.
* **Privacy & Safety:** Zero personal identifiable information (PII) or real-time GPS coordinates are exfiltrated. All coordinates are mapped to the canonical Ward 42 simulation geometry.

---

## 8. License
This project is licensed under the **Apache License 2.0** - see the [LICENSE](LICENSE) file for details.
