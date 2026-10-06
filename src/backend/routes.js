// NAGAR-BOT: Express REST API & SSE Router
import express from 'express';
import { store } from './store.js';
import { analyzeFrameWithVLM } from './vision_engine.js';
import { findDuplicateCandidates } from './deduplication_engine.js';
import { generateDraftWorkOrder } from './work_order_engine.js';
import { CANONICAL_WAYPOINTS, WARD_METADATA } from './canonical_topology.js';

export const router = express.Router();

// Connected SSE clients for live dashboard streaming
const sseClients = new Set();

export function broadcastEvent(eventType, payload) {
  const data = JSON.stringify({ type: eventType, timestamp: new Date().toISOString(), payload });
  for (const res of sseClients) {
    try {
      res.write(`data: ${data}\n\n`);
    } catch (e) {
      sseClients.delete(res);
    }
  }
}

// 1. SSE Stream
router.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.add(res);
  req.on('close', () => sseClients.delete(res));

  // Send initial connected ping
  res.write(`data: ${JSON.stringify({ type: "CONNECTED", message: "Live NAGAR-BOT Telemetry & Issue stream active" })}\n\n`);
});

// 2. Full State Snapshot
router.get('/snapshot', (req, res) => {
  res.json(store.getSnapshot());
});

// 3. Rover Telemetry Advance (Simulated Waypoint Sweep)
router.post('/telemetry/advance', (req, res) => {
  const currentIdx = store.state.rover_telemetry.current_waypoint_index;
  const nextIdx = (currentIdx + 1) % CANONICAL_WAYPOINTS.length;
  const wp = CANONICAL_WAYPOINTS[nextIdx];

  const patch = {
    status: "SWEEPING",
    current_waypoint_index: nextIdx,
    current_waypoint_id: wp.id,
    distance_covered_m: wp.distance_m,
    speed_kmh: Number((8.5 + Math.random() * 3.5).toFixed(1)),
    battery_pct: Math.max(15, store.state.rover_telemetry.battery_pct - 1)
  };

  const updated = store.updateRoverTelemetry(patch);
  broadcastEvent("TELEMETRY_UPDATED", updated);
  res.json({ success: true, telemetry: updated, waypoint: wp });
});

// 4. Ingest & Analyze Camera Frame (Live Phone Cam / Video / File)
router.post('/detect/frame', async (req, res) => {
  try {
    const { image_base64, waypoint_id, source = "ROVER_CAM_01", hint_hazard } = req.body;
    
    if (!image_base64) {
      return res.status(400).json({ error: "Missing image_base64 in request body" });
    }

    // Resolve waypoint metadata
    const activeWaypointId = waypoint_id || store.state.rover_telemetry.current_waypoint_id || "WP-01";
    const wp = CANONICAL_WAYPOINTS.find(w => w.id === activeWaypointId) || CANONICAL_WAYPOINTS[0];

    // 1. Run local VLM inference
    const aiResult = await analyzeFrameWithVLM(image_base64, { hint_hazard, waypoint_id: wp.id });

    // 2. Record raw observation
    const observation = store.addObservation({
      waypoint_id: wp.id,
      waypoint_name: wp.name,
      coords: wp.coords,
      source,
      ai_result: aiResult,
      image_snapshot: image_base64.length > 500000 ? image_base64.substring(0, 500000) : image_base64 // safeguard size
    });

    broadcastEvent("OBSERVATION_LOGGED", observation);

    // 3. If defect detected, evaluate duplicates and create Issue Record
    let createdIssue = null;
    let draftWorkOrder = null;

    if (aiResult.detected && aiResult.hazard_type !== "CLEAN_ROAD") {
      // Find candidate duplicates within 35m
      const duplicates = findDuplicateCandidates({
        coords: wp.coords,
        hazard_type: aiResult.hazard_type
      }, store.state.issues);

      createdIssue = store.addIssue({
        hazard_type: aiResult.hazard_type,
        severity: aiResult.severity,
        confidence_score: aiResult.confidence_score,
        visual_description: aiResult.visual_description,
        is_uncertain: aiResult.is_uncertain,
        waypoint_id: wp.id,
        waypoint_name: wp.name,
        coords: wp.coords,
        pos3d: wp.pos3d,
        primary_evidence_image: image_base64,
        source_device: source,
        ai_model: aiResult.model_used,
        duplicate_candidates: duplicates,
        ward_id: WARD_METADATA.ward_id,
        demo_provenance: WARD_METADATA.demo_label
      });

      // Auto-draft work order for human officer review
      const draftWOData = generateDraftWorkOrder(createdIssue);
      draftWorkOrder = store.addWorkOrder(draftWOData);
      store.updateIssue(createdIssue.id, { 
        work_order_id: draftWorkOrder.id,
        status: "DRAFTED" 
      }, "SYSTEM", "DRAFT_WORK_ORDER_CREATED", `Draft Work Order ${draftWorkOrder.id} attached.`);

      broadcastEvent("ISSUE_CREATED", { issue: store.getIssue(createdIssue.id), work_order: draftWorkOrder });
    }

    res.json({
      success: true,
      observation_id: observation.id,
      ai_result: aiResult,
      issue: createdIssue ? store.getIssue(createdIssue.id) : null,
      work_order: draftWorkOrder
    });

  } catch (err) {
    console.error("[Route /detect/frame] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Work Order Approval & Contractor Dispatch
router.post('/issues/:id/assign-workorder', (req, res) => {
  const { id } = req.params;
  const { contractor_name, reviewer_officer = "Executive Engineer (Ward 42)" } = req.body;
  const issue = store.getIssue(id);

  if (!issue) return res.status(404).json({ error: "Issue not found" });

  const updatedIssue = store.updateIssue(id, {
    status: "WORK_ORDER_ISSUED"
  }, reviewer_officer, "WORK_ORDER_DISPATCHED", `Work order assigned to ${contractor_name || 'Contractor'}`);

  if (issue.work_order_id) {
    store.updateWorkOrder(issue.work_order_id, {
      status: "ISSUED",
      dispatched_at: new Date().toISOString(),
      dispatched_by: reviewer_officer
    }, reviewer_officer, "Dispatched for field repair");
  }

  broadcastEvent("WORK_ORDER_UPDATED", { issue_id: id, status: "WORK_ORDER_ISSUED" });
  res.json({ success: true, issue: updatedIssue });
});

// 6. Contractor Claims Repair Done (Uploads After-Fix Photo)
router.post('/issues/:id/claim-repair', (req, res) => {
  const { id } = req.params;
  const { repair_image_base64, claim_notes = "Road defect filled with cold-mix asphalt and compacted.", contractor_rep = "Shri Balaji Roadworks" } = req.body;
  const issue = store.getIssue(id);

  if (!issue) return res.status(404).json({ error: "Issue not found" });

  const updatedIssue = store.updateIssue(id, {
    status: "REPAIR_CLAIMED",
    repair_claim_image: repair_image_base64 || issue.primary_evidence_image,
    repair_claim_notes: claim_notes,
    repair_claimed_at: new Date().toISOString(),
    claimed_by_contractor: contractor_rep
  }, contractor_rep, "REPAIR_CLAIM_SUBMITTED", claim_notes);

  if (issue.work_order_id) {
    store.updateWorkOrder(issue.work_order_id, {
      status: "CLAIMED_DONE",
      completion_claim_at: new Date().toISOString()
    }, contractor_rep, "Contractor submitted completion claim");
  }

  broadcastEvent("REPAIR_CLAIMED", { issue_id: id });
  res.json({ success: true, issue: updatedIssue });
});

// 7. Rover Re-Inspection Capture (Independent Follow-up Sweep)
router.post('/issues/:id/reinspect', (req, res) => {
  const { id } = req.params;
  const { reinspection_image_base64, inspector_source = "NAGAR-ROVER-01 (Re-Sweep)", notes = "Follow-up verification sweep captured at waypoint." } = req.body;
  const issue = store.getIssue(id);

  if (!issue) return res.status(404).json({ error: "Issue not found" });

  const updatedIssue = store.updateIssue(id, {
    status: "RE_INSPECTED",
    reinspection_evidence: reinspection_image_base64 || issue.repair_claim_image,
    reinspected_at: new Date().toISOString(),
    reinspected_by: inspector_source,
    reinspection_notes: notes
  }, inspector_source, "REINSPECTION_FRAME_CAPTURED", notes);

  broadcastEvent("REINSPECTED", { issue_id: id });
  res.json({ success: true, issue: updatedIssue });
});

// 8. Human Reviewer Final Audit Decision (VERIFIED / UNRESOLVED / INCONCLUSIVE)
router.post('/issues/:id/review', (req, res) => {
  const { id } = req.params;
  const { verdict, justification, reviewer_name = "Chief Quality Auditor" } = req.body;

  if (!["VERIFIED", "UNRESOLVED", "INCONCLUSIVE"].includes(verdict)) {
    return res.status(400).json({ error: "Verdict must be VERIFIED, UNRESOLVED, or INCONCLUSIVE" });
  }

  if (!justification || justification.trim().length < 5) {
    return res.status(400).json({ error: "Mandatory justification note required for audit accountability" });
  }

  const issue = store.getIssue(id);
  if (!issue) return res.status(404).json({ error: "Issue not found" });

  let newStatus = verdict === "VERIFIED" ? "VERIFIED" : (verdict === "UNRESOLVED" ? "UNRESOLVED" : "INCONCLUSIVE");

  const updatedIssue = store.updateIssue(id, {
    status: newStatus,
    verification_verdict: verdict,
    verification_notes: justification,
    verification_timestamp: new Date().toISOString(),
    verified_by_officer: reviewer_name
  }, reviewer_name, `AUDIT_VERDICT_${verdict}`, justification);

  if (issue.work_order_id) {
    store.updateWorkOrder(issue.work_order_id, {
      status: verdict === "VERIFIED" ? "CLOSED" : (verdict === "UNRESOLVED" ? "REJECTED_REOPENED" : "HELD_FOR_INSPECTION"),
      audit_verdict: verdict,
      closed_at: verdict === "VERIFIED" ? new Date().toISOString() : null
    }, reviewer_name, `Audit verdict rendered: ${verdict}. Reason: ${justification}`);
  }

  broadcastEvent("AUDIT_COMPLETED", { issue_id: id, verdict, justification });
  res.json({ success: true, issue: updatedIssue });
});

// 9. Reset and Re-seed
router.post('/state/reset', (req, res) => {
  const reset = store.resetState();
  broadcastEvent("STATE_RESET", {});
  res.json({ success: true, message: "State reset to clean demonstration baseline." });
});
