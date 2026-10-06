# NAGAR-BOT: Official 7-Slide Presentation Deck
**Competition:** Hack for Social Cause (VBYLD 2027) | **Organizers:** MoYAS & IIT Bombay  
*Format: Strictly conforms to the standard 7-slide IIT Bombay template.*

---

## Slide 1 — Cover Page
* **Problem Statement / Concept Title:** NAGAR-BOT: Low-Cost Civic Issue Observation, Work-Order Automation & Verification System
* **Thematic Area:** Governance & Civic Technology / AI, GIS & Emerging Technologies
* **Team Name:** Team Civix (Registered on MY Bharat Portal)
* **Team ID:** `HSC-2027-TN-0482`
* **State / UT:** Karnataka / Maharashtra
* **Institution:** Registered Higher Education Institution (AISHE / AICTE compliant)
* **Visual Cue:** High-contrast logo of NAGAR-BOT showing camera frame capturing pothole connected to 2D GIS map and municipal work order stamp.

---

## Slide 2 — Problem – Proposed Solution
* **The Civic Bottleneck:**
  * In Indian Urban Local Bodies (ULBs), road defects and uncollected garbage cause fatal accidents and health hazards.
  * *Current Failure Modes:* Citizen grievance apps suffer from reporting fatigue and vague descriptions; municipal contractor work-orders suffer from "fake photo closures" with zero independent verification; commercial survey vans cost ₹15L–₹50L and are unaffordable for daily ward sweeps.
* **Our Proposed Solution (NAGAR-BOT):**
  * A low-cost, software-first civic monitoring platform converting standard mobile cameras/rovers into edge vision observers.
  * Automates spatial deduplication ($<35\text{m}$ radius), auto-drafts IRC-compliant work orders, and enforces an auditable 3-state human verification loop (**VERIFIED / UNRESOLVED / INCONCLUSIVE**).
* **Innovation & Uniqueness:**
  * Closes the loop from automated edge detection to post-repair re-inspection with side-by-side visual audit and cryptographic logging.

---

## Slide 3 — Technical Approach & Architecture
* **Core Technology Stack:**
  * *Edge Vision AI:* Local Multimodal VLM (`Qwen2.5-VL 3B` via Ollama) running zero-cloud on-device inference for multi-hazard classification.
  * *Backend & Spatial Engine:* Node.js / Express event hub with spatial deduplication clustering and automated IRC:SP:98 work-order generator.
  * *Digital Twin Frontend:* Synchronized 2D GIS Map (Leaflet) + 3D WebGL Spatial Twin (Three.js) sharing canonical ward topology.
* **Extent of AI Tool Usage Disclosure:**
  * *AI Models Used:* `Qwen2.5-VL 3B` (Alibaba / Ollama) for vision inference; AI coding assistance used for boilerplate unit tests and scaffolding (~30% of codebase). Core architecture, spatial algorithms, and UI designed 100% by team.
* **Public Repository & Demo:**
  * GitHub Repo: `https://github.com/<username>/nagar-bot`
  * Live Prototype / Demo Video: `[Link attached in portal]`

---

## Slide 4 — Impact Potential & Beneficiaries
* **Primary Target Beneficiaries:**
  1. *Citizens & Commuters:* Faster resolution of hazardous potholes on emergency and school corridors (SLA cut from 14 days to $<48$ hours).
  2. *Municipal Engineers & Ward Officers:* Automated triage, itemized budget drafts, and elimination of manual paperwork.
  3. *Public Finance & ULB Administration:* Prevention of contractor fraud and duplicate billing via side-by-side re-inspection audits.
* **Measurable Pilot Metrics:**
  * 100% elimination of unverified work-order closures.
  * 85% reduction in cost per inspected road kilometer compared to specialized survey vans.
  * 0% privacy leakage (zero personal GPS data transmitted).

---

## Slide 5 — Feasibility and Risk Analysis
| Operational Challenge / Risk | Mitigation Strategy in NAGAR-BOT |
| :--- | :--- |
| **Low / Intermittent Connectivity** | Local on-device VLM inference (`localhost:11434`) + offline-first sync. |
| **Camera Glare, Blur & Weather** | Conservative confidence thresholding; flags unclear frames as `IS_UNCERTAIN: TRUE` for human review. |
| **Contractor Pushback / False Claims** | Mandatory side-by-side Before/After comparison + `INCONCLUSIVE` verdict triggering physical audit. |
| **Hardware Affordability** | Runs on standard Android smartphones or ₹5,000 motorized rover chassis. |

---

## Slide 6 — Team Composition & Roles
* **Member 1 (Team Lead):** Full-Stack Systems Architect & Backend Engineer (Node.js, Express, Spatial Deduplication, Persistent Store).
* **Member 2:** AI / Edge Vision Engineer (Ollama VLM Integration, Prompt Engineering, Evaluation Benchmarks).
* **Member 3:** Frontend & GIS Specialist (Leaflet 2D GIS, Three.js 3D WebGL Digital Twin, UI/UX).
* **Team Synergy & Journey:** Cross-disciplinary collaboration combining municipal governance domain research with computer vision and spatial computing.

---

## Slide 7 — References & Citations
1. **Jammu Municipal Corporation (JMC):** AI-Equipped Municipal Inspection Vehicle Initiative (2023–2026).
2. **Ministry of Housing & Urban Affairs (MoHUA):** Swachhata Grievance Portal & CPGRAMS Guidelines.
3. **Indian Roads Congress (IRC):** *IRC:SP:98-2020: Guidelines for Maintenance of Bituminous Roads using Cold-Mix Asphalt*.
4. **Arya, S. et al. (RDD2022):** *Crowdsourced Road Damage Dataset for Global Pavement Defect Benchmarking*, IIT Roorkee / Univ. of Tokyo.
5. **Alibaba Cloud Research:** *Qwen2.5-VL: Technical Report on Edge Multimodal Vision-Language Models* (2025).
