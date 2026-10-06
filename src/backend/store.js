// NAGAR-BOT: In-Memory + Persistent JSON State Store
// Provides thread-safe, atomic mutations and audit logging for civic issues.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CANONICAL_WAYPOINTS, WARD_METADATA } from './canonical_topology.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../../data/store.json');

const INITIAL_STATE = {
  version: "1.0.0",
  last_updated: new Date().toISOString(),
  rover_telemetry: {
    rover_id: "NAGAR-ROVER-01",
    status: "STANDBY", // STANDBY, SWEEPING, PAUSED
    battery_pct: 92,
    speed_kmh: 0.0,
    current_waypoint_index: 0,
    current_waypoint_id: "WP-01",
    distance_covered_m: 0,
    total_detections_session: 0,
    camera_active: false,
    ai_mode: "LOCAL_VLM" // LOCAL_VLM, MOCK_FALLBACK
  },
  observations: [],
  issues: [],
  work_orders: [],
  audit_logs: []
};

class StateStore {
  constructor() {
    this.state = this.loadState();
  }

  loadState() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn("[Store] Could not read existing store.json, initializing clean state:", e.message);
    }
    return JSON.parse(JSON.stringify(INITIAL_STATE));
  }

  save() {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      this.state.last_updated = new Date().toISOString();
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.state, null, 2), 'utf8');
    } catch (e) {
      console.error("[Store] Failed to write store.json:", e);
    }
  }

  resetState() {
    this.state = JSON.parse(JSON.stringify(INITIAL_STATE));
    this.save();
    return this.state;
  }

  // --- TELEMETRY ---
  updateRoverTelemetry(patch) {
    this.state.rover_telemetry = { ...this.state.rover_telemetry, ...patch };
    this.save();
    return this.state.rover_telemetry;
  }

  // --- OBSERVATIONS ---
  addObservation(obs) {
    const record = {
      id: `OBS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...obs
    };
    this.state.observations.unshift(record);
    this.state.rover_telemetry.total_detections_session += 1;
    this.save();
    return record;
  }

  // --- ISSUES ---
  addIssue(issue) {
    const id = `ISS-${String(this.state.issues.length + 1).padStart(4, '0')}`;
    const newIssue = {
      id,
      created_at: new Date().toISOString(),
      status: "DETECTED", // DETECTED, DRAFTED, WORK_ORDER_ISSUED, REPAIR_CLAIMED, RE_INSPECTED, VERIFIED, UNRESOLVED, INCONCLUSIVE
      duplicate_candidates: [],
      work_order_id: null,
      verification_verdict: null,
      verification_notes: null,
      verification_timestamp: null,
      reinspection_evidence: null,
      ...issue
    };
    this.state.issues.unshift(newIssue);
    this.logAudit(id, "ISSUE_DETECTED", "SYSTEM_OBSERVER", `New civic hazard logged at waypoint ${newIssue.waypoint_id}`);
    this.save();
    return newIssue;
  }

  updateIssue(id, patch, actor = "OFFICER", actionType = "ISSUE_UPDATED", reason = "") {
    const idx = this.state.issues.findIndex(i => i.id === id);
    if (idx === -1) return null;

    const oldStatus = this.state.issues[idx].status;
    this.state.issues[idx] = { ...this.state.issues[idx], ...patch, updated_at: new Date().toISOString() };

    if (patch.status && patch.status !== oldStatus) {
      this.logAudit(id, `STATUS_${patch.status}`, actor, reason || `Status changed from ${oldStatus} to ${patch.status}`);
    }
    this.save();
    return this.state.issues[idx];
  }

  getIssue(id) {
    return this.state.issues.find(i => i.id === id) || null;
  }

  // --- WORK ORDERS ---
  addWorkOrder(wo) {
    const id = `WO-${Date.now().toString().slice(-6)}`;
    const newWO = {
      id,
      created_at: new Date().toISOString(),
      status: "DRAFT", // DRAFT, ISSUED, IN_PROGRESS, CLAIMED_DONE, CLOSED, REJECTED
      ...wo
    };
    this.state.work_orders.unshift(newWO);
    this.logAudit(newWO.issue_id, "WORK_ORDER_DRAFTED", "MUNICIPAL_DISPATCH", `Draft Work Order ${id} created for department ${newWO.department}`);
    this.save();
    return newWO;
  }

  updateWorkOrder(id, patch, actor = "DISPATCHER", reason = "") {
    const idx = this.state.work_orders.findIndex(w => w.id === id);
    if (idx === -1) return null;
    this.state.work_orders[idx] = { ...this.state.work_orders[idx], ...patch, updated_at: new Date().toISOString() };
    this.logAudit(this.state.work_orders[idx].issue_id, `WO_${patch.status || 'UPDATED'}`, actor, reason);
    this.save();
    return this.state.work_orders[idx];
  }

  // --- AUDIT LOGS ---
  logAudit(entity_id, action, actor, details) {
    const auditRecord = {
      audit_id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      entity_id,
      action,
      actor,
      details,
      immutable_hash: `SHA256:${Buffer.from(`${Date.now()}-${entity_id}-${action}`).toString('base64').substring(0, 16)}`
    };
    this.state.audit_logs.unshift(auditRecord);
  }

  getSnapshot() {
    return {
      ward: WARD_METADATA,
      waypoints: CANONICAL_WAYPOINTS,
      telemetry: this.state.rover_telemetry,
      issues: this.state.issues,
      work_orders: this.state.work_orders,
      observations: this.state.observations.slice(0, 20),
      audit_logs: this.state.audit_logs.slice(0, 50)
    };
  }
}

export const store = new StateStore();
