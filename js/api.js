// NAGAR-BOT: API Client & Real-Time SSE Listener

export class ApiClient {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
    this.eventListeners = new Map();
  }

  async getSnapshot() {
    const res = await fetch(`${this.baseUrl}/api/snapshot`);
    if (!res.ok) throw new Error("Failed to fetch state snapshot");
    return res.json();
  }

  async advanceTelemetry() {
    const res = await fetch(`${this.baseUrl}/api/telemetry/advance`, { method: "POST" });
    return res.json();
  }

  async detectFrame(imageBase64, waypointId, source = "ROVER_CAM_01", hintHazard = null) {
    const res = await fetch(`${this.baseUrl}/api/detect/frame`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_base64: imageBase64,
        waypoint_id: waypointId,
        source: source,
        hint_hazard: hintHazard
      })
    });
    return res.json();
  }

  async assignWorkOrder(issueId, contractorName, reviewerOfficer) {
    const res = await fetch(`${this.baseUrl}/api/issues/${issueId}/assign-workorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contractor_name: contractorName, reviewer_officer: reviewerOfficer })
    });
    return res.json();
  }

  async claimRepair(issueId, repairImageBase64, claimNotes, contractorRep) {
    const res = await fetch(`${this.baseUrl}/api/issues/${issueId}/claim-repair`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repair_image_base64: repairImageBase64,
        claim_notes: claimNotes,
        contractor_rep: contractorRep
      })
    });
    return res.json();
  }

  async captureReinspection(issueId, reinspectionImageBase64, notes) {
    const res = await fetch(`${this.baseUrl}/api/issues/${issueId}/reinspect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reinspection_image_base64: reinspectionImageBase64,
        notes: notes
      })
    });
    return res.json();
  }

  async submitReview(issueId, verdict, justification, reviewerName) {
    const res = await fetch(`${this.baseUrl}/api/issues/${issueId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        verdict,
        justification,
        reviewer_name: reviewerName
      })
    });
    return res.json();
  }

  async resetState() {
    const res = await fetch(`${this.baseUrl}/api/state/reset`, { method: "POST" });
    return res.json();
  }

  // Server-Sent Events (SSE) Listener
  initEventStream(onEventCallback) {
    try {
      const evtSource = new EventSource(`${this.baseUrl}/api/events`);
      evtSource.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data);
          onEventCallback(parsed);
        } catch (err) {
          console.warn("[SSE] Parse error:", err);
        }
      };
      evtSource.onerror = (e) => {
        console.warn("[SSE] Connection issue, reconnecting in background...");
      };
    } catch (err) {
      console.warn("[SSE] EventSource init failed:", err);
    }
  }
}

export const api = new ApiClient();
