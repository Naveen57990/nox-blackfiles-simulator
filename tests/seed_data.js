// NAGAR-BOT: Baseline Seed Generator
// Generates realistic sample civic defects, work orders, and re-inspection frames for judge demonstration.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CANONICAL_WAYPOINTS, WARD_METADATA } from '../src/backend/canonical_topology.js';
import { generateDraftWorkOrder } from '../src/backend/work_order_engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/store.json');

// High-fidelity SVG-based data-URI sample images for road defects and repairs
export function createSvgPotholeDataUri(statusText = "BEFORE: Pothole Defect") {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
    <rect width="640" height="480" fill="#2b2d30"/>
    <!-- Asphalt road texture -->
    <path d="M0,0 L640,0 L640,480 L0,480 Z" fill="#383a3d"/>
    <line x1="320" y1="0" x2="320" y2="480" stroke="#d4af37" stroke-dasharray="25,25" stroke-width="6"/>
    <!-- Pothole crater -->
    <ellipse cx="360" cy="270" rx="140" ry="90" fill="#141517" stroke="#0a0a0b" stroke-width="8"/>
    <ellipse cx="370" cy="280" rx="90" ry="50" fill="#000000"/>
    <!-- Cracks -->
    <path d="M220,270 L170,260 L140,280 M490,250 L540,240 L570,270 M360,180 L350,130" stroke="#1c1d1f" stroke-width="4"/>
    <!-- Water / aggregate reflection -->
    <ellipse cx="350" cy="285" rx="40" ry="15" fill="#3a404a" opacity="0.6"/>
    <!-- HUD Overlay -->
    <rect x="20" y="20" width="600" height="45" fill="rgba(0,0,0,0.75)" rx="6"/>
    <text x="35" y="48" font-family="monospace" font-size="16" fill="#00ffcc" font-weight="bold">NAGAR-ROVER POV // CAM-01 [WARD-42 WP-04]</text>
    <rect x="20" y="415" width="600" height="45" fill="rgba(0,0,0,0.75)" rx="6"/>
    <text x="35" y="443" font-family="monospace" font-size="14" fill="#ff5555">${statusText} | IRC:SP:98</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

export function createSvgRepairedDataUri() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
    <rect width="640" height="480" fill="#2b2d30"/>
    <!-- Asphalt road texture -->
    <path d="M0,0 L640,0 L640,480 L0,480 Z" fill="#383a3d"/>
    <line x1="320" y1="0" x2="320" y2="480" stroke="#d4af37" stroke-dasharray="25,25" stroke-width="6"/>
    <!-- Fresh Bituminous Patch -->
    <ellipse cx="360" cy="270" rx="150" ry="100" fill="#1f2022" stroke="#2c2d30" stroke-width="6"/>
    <!-- Compactor Roller Roller Marks -->
    <line x1="230" y1="240" x2="490" y2="240" stroke="#111214" stroke-width="3" opacity="0.7"/>
    <line x1="220" y1="280" x2="500" y2="280" stroke="#111214" stroke-width="3" opacity="0.7"/>
    <line x1="240" y1="310" x2="480" y2="310" stroke="#111214" stroke-width="3" opacity="0.7"/>
    <!-- HUD Overlay -->
    <rect x="20" y="20" width="600" height="45" fill="rgba(0,0,0,0.75)" rx="6"/>
    <text x="35" y="48" font-family="monospace" font-size="16" fill="#00ffcc" font-weight="bold">CONTRACTOR REPAIR EVIDENCE // CONT-PWD-01</text>
    <rect x="20" y="415" width="600" height="45" fill="rgba(0,0,0,0.75)" rx="6"/>
    <text x="35" y="443" font-family="monospace" font-size="14" fill="#55ff55">COMPLETED: Cold-Mix Poly-Asphalt Compaction [WP-04]</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

export function createSvgGarbageDataUri() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
    <rect width="640" height="480" fill="#303236"/>
    <!-- Curb / Pavement -->
    <rect x="0" y="240" width="640" height="240" fill="#42454a"/>
    <rect x="0" y="220" width="640" height="20" fill="#686c75"/>
    <!-- Garbage Pile -->
    <ellipse cx="380" cy="310" rx="160" ry="80" fill="#3d372e"/>
    <!-- Plastic / Waste Bins / bags -->
    <circle cx="340" cy="280" r="35" fill="#4a7c59"/>
    <circle cx="410" cy="290" r="40" fill="#2d5d7b"/>
    <rect x="360" y="300" width="60" height="50" fill="#9e6240" rx="4"/>
    <circle cx="300" cy="320" r="25" fill="#d48c46"/>
    <circle cx="450" cy="310" r="30" fill="#e5e5e5"/>
    <!-- HUD Overlay -->
    <rect x="20" y="20" width="600" height="45" fill="rgba(0,0,0,0.75)" rx="6"/>
    <text x="35" y="48" font-family="monospace" font-size="16" fill="#00ffcc" font-weight="bold">NAGAR-ROVER POV // CAM-01 [WARD-42 WP-03]</text>
    <rect x="20" y="415" width="600" height="45" fill="rgba(0,0,0,0.75)" rx="6"/>
    <text x="35" y="443" font-family="monospace" font-size="14" fill="#ffaa00">HAZARD: Solid Waste Heap (>150kg) | SWM Div</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

export function seedBaselineData() {
  const wpHospital = CANONICAL_WAYPOINTS[3]; // WP-04
  const wpMarket = CANONICAL_WAYPOINTS[2];   // WP-03

  const issue1 = {
    id: "ISS-0001",
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: "RE_INSPECTED", // Ready for Judge / Reviewer verdict
    hazard_type: "POTHOLE",
    severity: "CRITICAL",
    confidence_score: 0.94,
    visual_description: "Severe crater (~60cm diameter, 8cm depth) on emergency hospital approach lane.",
    is_uncertain: false,
    waypoint_id: wpHospital.id,
    waypoint_name: wpHospital.name,
    coords: wpHospital.coords,
    pos3d: wpHospital.pos3d,
    primary_evidence_image: createSvgPotholeDataUri("BEFORE: Deep Pothole (Pre-Repair)"),
    source_device: "NAGAR-ROVER-01 (Sweep Session A)",
    ai_model: "Qwen2.5-VL 3B (Local Edge Ollama)",
    duplicate_candidates: [],
    ward_id: WARD_METADATA.ward_id,
    demo_provenance: WARD_METADATA.demo_label,
    work_order_id: "WO-984201",
    claimed_by_contractor: "Shri Balaji Roadworks Ltd.",
    repair_claimed_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    repair_claim_notes: "Filled with IRC-compliant polymer cold mix, vibratory compacted, tack coat applied.",
    repair_claim_image: createSvgRepairedDataUri(),
    reinspected_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    reinspected_by: "NAGAR-ROVER-01 (Verification Sweep)",
    reinspection_evidence: createSvgRepairedDataUri(),
    reinspection_notes: "Automated verification pass confirmed level pavement profile."
  };

  const wo1 = {
    id: "WO-984201",
    issue_id: "ISS-0001",
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: "CLAIMED_DONE",
    ...generateDraftWorkOrder(issue1),
    dispatched_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    dispatched_by: "Er. K. S. Murthy (AEE Road Maintenance)"
  };

  const issue2 = {
    id: "ISS-0002",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "WORK_ORDER_ISSUED",
    hazard_type: "GARBAGE_HEAP",
    severity: "HIGH",
    confidence_score: 0.88,
    visual_description: "Uncollected vegetable waste and plastics spilling across pedestrian corridor.",
    is_uncertain: false,
    waypoint_id: wpMarket.id,
    waypoint_name: wpMarket.name,
    coords: wpMarket.coords,
    pos3d: wpMarket.pos3d,
    primary_evidence_image: createSvgGarbageDataUri(),
    source_device: "NAGAR-ROVER-01 (Sweep Session A)",
    ai_model: "Qwen2.5-VL 3B (Local Edge Ollama)",
    duplicate_candidates: [],
    ward_id: WARD_METADATA.ward_id,
    demo_provenance: WARD_METADATA.demo_label,
    work_order_id: "WO-984202"
  };

  const wo2 = {
    id: "WO-984202",
    issue_id: "ISS-0002",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "ISSUED",
    ...generateDraftWorkOrder(issue2),
    dispatched_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    dispatched_by: "Smt. R. Anitha (Health Inspector)"
  };

  const seededState = {
    version: "1.0.0",
    last_updated: new Date().toISOString(),
    rover_telemetry: {
      rover_id: "NAGAR-ROVER-01",
      status: "STANDBY",
      battery_pct: 88,
      speed_kmh: 0.0,
      current_waypoint_index: 3, // Paused at WP-04 for demonstration
      current_waypoint_id: "WP-04",
      distance_covered_m: 440,
      total_detections_session: 2,
      camera_active: true,
      ai_mode: "LOCAL_VLM"
    },
    observations: [
      {
        id: "OBS-001",
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        waypoint_id: "WP-04",
        waypoint_name: wpHospital.name,
        coords: wpHospital.coords,
        source: "ROVER_CAM_01",
        ai_result: {
          model_used: "Qwen2.5-VL 3B (Local Edge Ollama)",
          detected: true,
          hazard_type: "POTHOLE",
          severity: "CRITICAL",
          confidence_score: 0.94
        }
      },
      {
        id: "OBS-002",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        waypoint_id: "WP-03",
        waypoint_name: wpMarket.name,
        coords: wpMarket.coords,
        source: "ROVER_CAM_01",
        ai_result: {
          model_used: "Qwen2.5-VL 3B (Local Edge Ollama)",
          detected: true,
          hazard_type: "GARBAGE_HEAP",
          severity: "HIGH",
          confidence_score: 0.88
        }
      }
    ],
    issues: [issue1, issue2],
    work_orders: [wo1, wo2],
    audit_logs: [
      {
        audit_id: "AUD-1001",
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        entity_id: "ISS-0001",
        action: "ISSUE_DETECTED",
        actor: "NAGAR-ROVER-01",
        details: "Vision AI logged CRITICAL pothole at WP-04.",
        immutable_hash: "SHA256:7f9a2b1c4e8d3f5a"
      },
      {
        audit_id: "AUD-1002",
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        entity_id: "ISS-0001",
        action: "WORK_ORDER_DISPATCHED",
        actor: "Er. K. S. Murthy",
        details: "Work Order WO-984201 assigned to Shri Balaji Roadworks.",
        immutable_hash: "SHA256:8e1b3c5a7f9d2e4b"
      },
      {
        audit_id: "AUD-1003",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        entity_id: "ISS-0001",
        action: "REPAIR_CLAIM_SUBMITTED",
        actor: "Shri Balaji Roadworks Ltd.",
        details: "Contractor uploaded completion photo and polymer cold mix log.",
        immutable_hash: "SHA256:1a2b3c4d5e6f7a8b"
      },
      {
        audit_id: "AUD-1004",
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        entity_id: "ISS-0001",
        action: "REINSPECTION_FRAME_CAPTURED",
        actor: "NAGAR-ROVER-01",
        details: "Independent follow-up sweep captured verification frame.",
        immutable_hash: "SHA256:9f8e7d6c5b4a3a2b"
      }
    ]
  };

  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(seededState, null, 2), 'utf8');
  console.log("[Seed] Successfully seeded baseline demonstration data to data/store.json");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedBaselineData();
}
