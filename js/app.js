// NAGAR-BOT: Master UI Coordinator & Application Entry
import { api } from './api.js';
import { Map2DController } from './map2d.js';
import { Map3DController } from './map3d.js';
import { RoverCameraController } from './rover_camera.js';
import { WorkOrderUI } from './work_orders.js';

class NagarBotApp {
  constructor() {
    this.map2d = new Map2DController('map-2d-container');
    this.map3d = new Map3DController('canvas-3d-target');
    this.camera = new RoverCameraController();
    this.workOrderUI = new WorkOrderUI(api);

    this.state = null;
    this.autoSweepInterval = null;
    this.currentWaypointId = 'WP-04';
  }

  async init() {
    console.log("[NAGAR-BOT] Initializing command center...");
    
    // 1. Fetch initial state snapshot
    this.state = await api.getSnapshot();
    this.currentWaypointId = this.state.telemetry.current_waypoint_id || 'WP-01';
    window.currentWaypointId = this.currentWaypointId;

    // 2. Initialize Subsystems
    this.camera.init();
    this.map2d.init(this.state.waypoints, this.currentWaypointId);
    this.map3d.init(this.state.waypoints, this.currentWaypointId);

    // 3. Render initial views
    this.renderTelemetryHUD();
    this.renderWaypointStepper();
    this.refreshAllLists();

    // 4. Initialize Real-Time SSE Listener
    api.initEventStream((evt) => this.handleServerEvent(evt));

    // Expose global window helpers
    this.bindWindowGlobals();
    console.log("[NAGAR-BOT] Ready for live demonstration.");
  }

  renderTelemetryHUD() {
    const t = this.state.telemetry;
    const wp = this.state.waypoints.find(w => w.id === t.current_waypoint_id) || this.state.waypoints[0];
    
    document.getElementById('hud-ward-name').innerText = this.state.ward.ward_name;
    document.getElementById('hud-waypoint').innerText = `${wp.id} (${wp.name.split('-')[0].trim()})`;
    document.getElementById('hud-battery').innerText = `${t.battery_pct}%`;
    
    // Stat counters
    const activeCount = this.state.issues.filter(i => !["VERIFIED", "CLOSED"].includes(i.status)).length;
    const verifiedCount = this.state.issues.filter(i => i.status === "VERIFIED").length;
    
    document.getElementById('stat-active-defects').innerText = `${activeCount} Defects`;
    document.getElementById('stat-verified').innerText = `${verifiedCount} Closed`;
  }

  renderWaypointStepper() {
    const track = document.getElementById('waypoint-stepper-track');
    if (!track) return;

    track.innerHTML = this.state.waypoints.map(wp => {
      const isActive = wp.id === this.currentWaypointId;
      const hasDefect = this.state.issues.some(i => i.waypoint_id === wp.id && !["VERIFIED", "CLOSED"].includes(i.status));

      return `
        <div class="wp-chip ${isActive ? 'active' : ''} ${hasDefect ? 'has-defect' : ''}" 
             onclick="window.selectWaypoint('${wp.id}')">
          <b>${wp.id}</b>
        </div>
      `;
    }).join('');
  }

  refreshAllLists() {
    this.map2d.renderIssues(this.state.issues);
    this.map3d.renderIssueBeacons(this.state.issues);
    this.workOrderUI.renderIssuesList(this.state.issues);
    this.workOrderUI.renderWorkOrdersList(this.state.work_orders);
    this.workOrderUI.renderAuditStream(this.state.audit_logs);
    this.renderTelemetryHUD();
    this.renderWaypointStepper();
  }

  async handleServerEvent(evt) {
    console.log("[SSE Event]", evt.type);
    
    if (["ISSUE_CREATED", "WORK_ORDER_UPDATED", "REPAIR_CLAIMED", "REINSPECTED", "AUDIT_COMPLETED", "STATE_RESET"].includes(evt.type)) {
      this.state = await api.getSnapshot();
      this.refreshAllLists();
      this.showToast(`Notification: ${evt.type.replace(/_/g, ' ')}`, "success");
    } else if (evt.type === "TELEMETRY_UPDATED") {
      this.state.telemetry = evt.payload;
      this.currentWaypointId = evt.payload.current_waypoint_id;
      window.currentWaypointId = this.currentWaypointId;
      this.map2d.updateRoverPosition(this.currentWaypointId, this.state.waypoints);
      this.map3d.updateRoverPosition(this.currentWaypointId, this.state.waypoints);
      this.renderTelemetryHUD();
      this.renderWaypointStepper();
    }
  }

  showToast(message, type = "info") {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type === 'alert' ? 'alert' : 'success'}`;
    toast.innerText = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  bindWindowGlobals() {
    window.setVideoSource = (src) => this.camera.setSource(src);
    
    window.loadPresetSample = (type) => this.camera.loadPreset(type);

    window.selectWaypoint = (wpId) => {
      this.currentWaypointId = wpId;
      window.currentWaypointId = wpId;
      this.map2d.updateRoverPosition(wpId, this.state.waypoints);
      this.map3d.updateRoverPosition(wpId, this.state.waypoints);
      this.renderTelemetryHUD();
      this.renderWaypointStepper();
    };

    window.advanceRoverWaypoint = async () => {
      const res = await api.advanceTelemetry();
      if (res.success) {
        this.currentWaypointId = res.telemetry.current_waypoint_id;
        window.currentWaypointId = this.currentWaypointId;
        this.renderTelemetryHUD();
        this.renderWaypointStepper();
        this.showToast(`Rover arrived at ${res.waypoint.id}: ${res.waypoint.name}`);
      }
    };

    window.triggerFrameInspection = async () => {
      const banner = document.getElementById('hud-detection-banner');
      banner.className = 'hud-alert';
      banner.innerText = 'INSPECTING VIA LOCAL VLM...';

      const frameBase64 = this.camera.captureFrameBase64();
      const hint = this.currentWaypointId === 'WP-03' ? 'GARBAGE_HEAP' : (this.currentWaypointId === 'WP-04' ? 'POTHOLE' : 'CLEAN_ROAD');
      
      const res = await api.detectFrame(frameBase64, this.currentWaypointId, "ROVER_CAM_01", hint);
      
      if (res.success) {
        document.getElementById('hud-latency').innerText = `LATENCY: ${res.ai_result.latency_ms}ms`;
        document.getElementById('hud-model-tag').innerText = `MODEL: ${res.ai_result.model_used.split(' ')[0]}`;

        if (res.ai_result.detected) {
          banner.className = 'hud-alert hud-alert-detected';
          banner.innerText = `🚨 ${res.ai_result.hazard_type} DETECTED (${(res.ai_result.confidence_score * 100).toFixed(0)}%) -> TICKET DRAFTED`;
          this.showToast(`Defect Logged: ${res.ai_result.hazard_type} at ${this.currentWaypointId}`, "alert");
        } else {
          banner.className = 'hud-alert';
          banner.innerText = '✅ ROAD SURFACE NORMAL (NO HAZARDS)';
          this.showToast(`Normal Pavement Verified at ${this.currentWaypointId}`);
        }

        this.state = await api.getSnapshot();
        this.refreshAllLists();
      }
    };

    window.toggleAutoSweep = () => {
      const btn = document.getElementById('btn-auto-sweep');
      if (this.autoSweepInterval) {
        clearInterval(this.autoSweepInterval);
        this.autoSweepInterval = null;
        btn.innerText = '▶️ Start Auto-Sweep';
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
        this.showToast("Rover Autonomous Sweep Paused");
      } else {
        btn.innerText = '⏸️ Pause Auto-Sweep';
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
        this.showToast("Rover Autonomous Sweep Started");

        this.autoSweepInterval = setInterval(async () => {
          await window.advanceRoverWaypoint();
          setTimeout(() => window.triggerFrameInspection(), 1000);
        }, 6000);
      }
    };

    window.switchMapView = (mode) => {
      const map2dEl = document.getElementById('map-2d-container');
      const map3dEl = document.getElementById('map-3d-container');
      
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));

      if (mode === '2D') {
        document.getElementById('btn-view-2d').classList.add('active');
        map2dEl.style.display = 'block';
        map3dEl.style.display = 'none';
        this.map2d.invalidateSize();
      } else if (mode === '3D') {
        document.getElementById('btn-view-3d').classList.add('active');
        map2dEl.style.display = 'none';
        map3dEl.style.display = 'block';
        this.map3d.onResize();
      } else {
        // SPLIT
        document.getElementById('btn-view-split').classList.add('active');
        map2dEl.style.display = 'block';
        map3dEl.style.display = 'block';
        map2dEl.style.height = '50%';
        map3dEl.style.height = '50%';
        this.map2d.invalidateSize();
        this.map3d.onResize();
      }
    };

    window.switchTriageTab = (tab) => {
      document.querySelectorAll('.triage-tab').forEach(t => t.classList.toggle('active', t.getAttribute('data-tab') === tab));
      document.getElementById('tab-content-issues').style.display = tab === 'issues' ? 'block' : 'none';
      document.getElementById('tab-content-workorders').style.display = tab === 'workorders' ? 'block' : 'none';
      document.getElementById('tab-content-audit').style.display = tab === 'audit' ? 'block' : 'none';
    };

    window.openIssueModal = (issueId) => this.workOrderUI.openModal(issueId, this.state.issues, this.state.work_orders);
    window.closeModal = () => this.workOrderUI.closeModal();

    window.simulateDispatchFromModal = async () => {
      const id = this.workOrderUI.currentModalIssueId;
      if (!id) return;
      await api.assignWorkOrder(id, "Shri Balaji Roadworks Ltd.", "Er. K.S. Murthy (AEE Ward 42)");
      this.state = await api.getSnapshot();
      this.refreshAllLists();
      this.workOrderUI.openModal(id, this.state.issues, this.state.work_orders);
      this.showToast(`Work Order Dispatched for ${id}`);
    };

    window.simulateClaimFromModal = async () => {
      const id = this.workOrderUI.currentModalIssueId;
      if (!id) return;
      await api.claimRepair(id, null, "Cold-mix asphalt compacted with tack coat. Ready for reinspection.", "Shri Balaji Roadworks Ltd.");
      this.state = await api.getSnapshot();
      this.refreshAllLists();
      this.workOrderUI.openModal(id, this.state.issues, this.state.work_orders);
      this.showToast(`Contractor Completion Claim Logged for ${id}`);
    };

    window.simulateReinspectFromModal = async () => {
      const id = this.workOrderUI.currentModalIssueId;
      if (!id) return;
      await api.captureReinspection(id, null, "Rover follow-up sweep frame captured.");
      this.state = await api.getSnapshot();
      this.refreshAllLists();
      this.workOrderUI.openModal(id, this.state.issues, this.state.work_orders);
      this.showToast(`Re-Inspection Captured for ${id}`);
    };

    window.submitAuditReview = async () => {
      const id = this.workOrderUI.currentModalIssueId;
      const verdictEl = document.querySelector('input[name="audit_verdict"]:checked');
      const justification = document.getElementById('modal-justification').value;
      const reviewer = document.getElementById('modal-reviewer-name').value;

      if (!verdictEl) {
        alert("Please select a review verdict (VERIFIED, UNRESOLVED, or INCONCLUSIVE).");
        return;
      }
      if (!justification || justification.trim().length < 5) {
        alert("Mandatory justification note is required to write to the audit ledger.");
        return;
      }

      const res = await api.submitReview(id, verdictEl.value, justification, reviewer);
      if (res.success) {
        this.showToast(`Audit Verdict Committed: ${verdictEl.value}`, "success");
        this.state = await api.getSnapshot();
        this.refreshAllLists();
        this.workOrderUI.closeModal();
      } else {
        alert(`Error: ${res.error}`);
      }
    };

    window.seedDemoData = async () => {
      await api.resetState();
      this.state = await api.getSnapshot();
      this.refreshAllLists();
      this.showToast("Baseline Demonstration Data Loaded");
    };

    window.printAuditReport = () => {
      window.print();
    };

    window.handleManualFileUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        this.camera.currentPresetBase64 = evt.target.result;
        this.camera.staticImgEl.src = evt.target.result;
        this.showToast("Custom Image Frame Loaded. Click 'Inspect Current Frame' to analyze.");
      };
      reader.readAsDataURL(file);
    };
  }
}

// Start Application on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  const app = new NagarBotApp();
  app.init();
});
