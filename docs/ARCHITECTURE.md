# NAGAR-BOT: System Architecture & Design Specification
**Hack for Social Cause (VBYLD 2027) | Knowledge Partner: IIT Bombay**  
**Version:** 1.0.0 (Stage-1 Build)

---

## 1. Architectural Overview

NAGAR-BOT is structured as a modular, local-first civic intelligence and municipal accountability system. It bridges real-time camera observation with human-governed municipal workflow.

```
+-----------------------------------------------------------------------------------+
|                           OBSERVATION & INGESTION LAYER                           |
|  [Mobile Phone Camera (Rover POV)]  OR  [Synchronized Route Video]  OR  [Webcam]   |
+------------------------------------------+----------------------------------------+
                                           | Video Frames / Snapshot
                                           v
+-----------------------------------------------------------------------------------+
|                            LOCAL VISION AI ENGINE                                 |
|  - Local VLM (Qwen2.5-VL via Ollama) / Fallback Deterministic Vision Engine      |
|  - Multi-hazard detection: Potholes, Garbage/Litter Heaps, Waterlogging           |
|  - Structured JSON classification: { detected, category, severity, confidence }  |
+------------------------------------------+----------------------------------------+
                                           | Validated Observation Payload
                                           v
+-----------------------------------------------------------------------------------+
|                        CORE BACKEND (Node.js / Express)                           |
|  - RESTful API & WebSocket/SSE Live Event Hub                                    |
|  - Spatial & Temporal Deduplication Engine (Candidate clustering)                 |
|  - Work-Order Draft Generator (Department routing: PWD / SWM / Stormwater)        |
|  - Repair Claim & Follow-up Reinspection Manager                                  |
|  - Immutable Audit Trail & Verification State Machine                             |
+------------------------------------------+----------------------------------------+
                                           | Real-Time Event Sync
                                           v
+-----------------------------------------------------------------------------------+
|                          MUNICIPAL DASHBOARD & DIGITAL TWIN                       |
|  - Synchronized 2D GIS Map (Leaflet) + 3D Spatial Twin (Three.js WebGL)          |
|  - Live Rover Telemetry & Waypoint Timeline                                       |
|  - Work-Order Review, Department Dispatch & Contractor Reinspection Portal        |
|  - Human Reviewer Decision Hub (VERIFIED / UNRESOLVED / INCONCLUSIVE)             |
|  - PDF / JSON Audit Export Engine                                                 |
+-----------------------------------------------------------------------------------+
```

---

## 2. Canonical Spatial Topology (Ward 42 Sample Environment)

To guarantee absolute alignment between the **2D GIS Map**, **3D WebGL Visualization**, **Route Simulation**, and **Work-Order Waypoints**, the system defines a single source of truth for spatial coordinates:

* **Ward Identifier:** Ward 42 (East Zone, Demonstration Ward)
* **Canonical Route Path:** MG Road Corridor $\rightarrow$ 80ft Road Junction $\rightarrow$ Market Link $\rightarrow$ Metro Pillar Sector
* **Waypoints (WP-01 to WP-08):**
  * `WP-01` (0m): Depot Exit / Commercial North
  * `WP-02` (120m): 80ft Road Cross - Pavement Segment A
  * `WP-03` (250m): Main Market Corner (Historical Litter Hotspot)
  * `WP-04` (380m): Hospital Flyover Base (Severe Pothole Cluster)
  * `WP-05` (510m): Storm-Drain Culvert Junction (Waterlogging Risk)
  * `WP-06` (640m): Residential Lane 4 Cross
  * `WP-07` (780m): Community Park Periphery
  * `WP-08` (920m): Metro Station East Terminal

---

## 3. The 6-Stage Issue Lifecycle State Machine

```
   [1. DETECTED]
         |
         v
   [2. TRIAGED & DRAFTED] ------> Shows Duplicate Candidates (Spatial radius < 25m)
         |
         v
   [3. ASSIGNED / WORK ORDER] --> Dispatched to PWD / SWM Contractor
         |
         v
   [4. REPAIR CLAIMED] ---------> Contractor uploads after-fix photo + claim note
         |
         v
   [5. RE-INSPECTION] ----------> Rover / Inspector captures verification frame
         |
         v
   [6. HUMAN AUDIT VERDICT] ----> Reviewer examines Before/After comparison
         |
         +----> [VERIFIED]     (Closed - Defect rectificated)
         +----> [UNRESOLVED]   (Rejected - Defect persists, Work Order reopened)
         +----> [INCONCLUSIVE] (Escalated - Photo unclear / poor lighting / needs physical audit)
```

---

## 4. Privacy, Security & Provenance Model

1. **Zero GPS Leakage:** No exact user coordinates or location headers are transmitted over external networks. All coordinates are indexed to simulated municipal ward waypoints.
2. **Local Edge Inference:** Camera frames are evaluated inside the local Ollama instance on `localhost:11434`. No images are sent to third-party cloud APIs.
3. **Data Provenance Labels:** Every issue record stores:
   * `source`: `ROVER_CAM_01` / `MOBILE_UPLOADER` / `SIMULATED_FEED`
   * `model_used`: e.g. `Qwen2.5-VL 3B (Local Ollama)` or `Fallback Heuristic Engine`
   * `demo_flag`: `TRUE (Demonstration Data - Simulated Ward 42)`
   * `timestamp`: ISO-8601 UTC timestamp
4. **Immutable Audit History:** Every status change records the actor, timestamp, previous state, new state, and review comments.

---

## 5. Vision AI Prompt Engineering & Safety Rules

The local VLM is invoked with a strict JSON-enforcing system prompt:
```json
{
  "detected": true | false,
  "hazard_type": "POTHOLE" | "GARBAGE_HEAP" | "WATERLOGGING" | "CLEAN_ROAD" | "UNKNOWN",
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "confidence_score": 0.0 - 1.0,
  "visual_description": "Concise description of defect",
  "is_uncertain": true | false
}
```

* **Conservative Rule:** If glare, camera blur, or obstruction is detected, `is_uncertain` is set to `true`, confidence is down-weighted, and the issue is tagged as `PENDING_HUMAN_CONFIRMATION`.
