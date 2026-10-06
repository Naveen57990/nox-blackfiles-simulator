// NAGAR-BOT: End-to-End Workflow Verification Suite
// Tests complete 6-stage lifecycle from detection to human audit verdict.

import { store } from '../src/backend/store.js';
import { analyzeFrameWithVLM } from '../src/backend/vision_engine.js';
import { findDuplicateCandidates } from '../src/backend/deduplication_engine.js';
import { generateDraftWorkOrder } from '../src/backend/work_order_engine.js';
import { createSvgPotholeDataUri, createSvgRepairedDataUri } from './seed_data.js';

async function runTests() {
  console.log("=================================================");
  console.log("  NAGAR-BOT Automated Lifecycle Verification");
  console.log("=================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
    }
  }

  // Test 1: Store Initialization
  const snapshot = store.getSnapshot();
  assert(snapshot.ward.ward_id === "WARD-42", "Store initializes canonical Ward 42 metadata");
  assert(snapshot.waypoints.length === 8, "Canonical topology has 8 defined waypoints");

  // Test 2: Vision AI Inference (Local VLM / Heuristic Fallback)
  const testSampleImg = createSvgPotholeDataUri("Test Pothole");
  console.log("\n  -> Testing Edge Vision Inference...");
  const aiResult = await analyzeFrameWithVLM(testSampleImg, { hint_hazard: "POTHOLE" });
  assert(aiResult.success === true, `Vision inference succeeded (${aiResult.model_used})`);
  assert(aiResult.detected === true, "Civic defect correctly classified as detected");
  assert(aiResult.hazard_type === "POTHOLE", `Hazard type identified as ${aiResult.hazard_type}`);

  // Test 3: Spatial Deduplication
  const hospitalCoords = [12.9745, 77.6438]; // WP-04
  const nearbyCoords = [12.9746, 77.6439];   // ~15m away
  const dupes = findDuplicateCandidates({ coords: nearbyCoords, hazard_type: "POTHOLE" }, store.state.issues, 35);
  assert(dupes.length > 0, "Deduplication engine correctly identified candidate defect within 35m");
  assert(dupes[0].candidate_issue_id === "ISS-0001", "Correctly linked candidate to ISS-0001");

  // Test 4: Work Order Generation
  const testIssue = store.getIssue("ISS-0001");
  const draftWO = generateDraftWorkOrder(testIssue);
  assert(draftWO.department_code === "PWD", "Pothole routed to PWD Department");
  assert(draftWO.sla_resolution_hours === 24, "Critical pothole assigned 24-hour SLA");
  assert(draftWO.itemized_budget.length > 0, "Work order generated itemized IRC:SP:98 materials");

  // Test 5: Human Reviewer Audit Loop
  const reviewVerdict = "VERIFIED";
  const justification = "High-quality polymer cold mix asphalt verified with level compactor finish.";
  const reviewed = store.updateIssue(testIssue.id, {
    status: "VERIFIED",
    verification_verdict: reviewVerdict,
    verification_notes: justification,
    verification_timestamp: new Date().toISOString(),
    verified_by_officer: "Chief Quality Auditor (Test)"
  }, "Chief Quality Auditor (Test)", `AUDIT_VERDICT_${reviewVerdict}`, justification);

  assert(reviewed.status === "VERIFIED", "Issue transitioned to VERIFIED status");
  assert(reviewed.verification_notes === justification, "Justification note preserved in issue record");

  // Test 6: Immutable Audit Trail
  const latestAudit = store.state.audit_logs[0];
  assert(latestAudit.entity_id === "ISS-0001", "Audit trail logged entity ISS-0001");
  assert(latestAudit.immutable_hash.startsWith("SHA256:"), "Audit record generated cryptographic hash");

  console.log(`\n=================================================`);
  console.log(`  Tests Completed: ${passed}/${total} Passed`);
  console.log(`=================================================\n`);
}

runTests();
