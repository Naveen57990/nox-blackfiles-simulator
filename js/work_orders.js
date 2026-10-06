// NAGAR-BOT: Work Order & Verification UI Controller

export class WorkOrderUI {
  constructor(api) {
    this.api = api;
    this.currentModalIssueId = null;
  }

  renderIssuesList(issues) {
    const container = document.getElementById('issues-list-container');
    const countEl = document.getElementById('count-issues');
    if (!container) return;

    if (countEl) countEl.innerText = issues.length;

    if (issues.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted);">No active civic issues recorded in this sweep.</div>`;
      return;
    }

    container.innerHTML = issues.map(issue => {
      const isCritical = issue.severity === "CRITICAL" || issue.severity === "HIGH";
      const hasDupes = issue.duplicate_candidates && issue.duplicate_candidates.length > 0;

      return `
        <div class="issue-card" onclick="window.openIssueModal('${issue.id}')">
          <div class="card-top">
            <span class="card-id">${issue.id}</span>
            <span class="badge-hazard badge-${issue.hazard_type}">${issue.hazard_type}</span>
          </div>
          <div class="card-title">${issue.visual_description || 'Civic defect observed.'}</div>
          <div class="card-meta-row">
            <span>📍 ${issue.waypoint_id} (${issue.waypoint_name.split('-')[0]})</span>
            <span class="status-tag status-${issue.status}">${issue.status}</span>
          </div>
          ${hasDupes ? `<div style="margin-top:6px; font-size:10px; color:var(--accent-amber); font-family:var(--font-mono);">⚠️ ${issue.duplicate_candidates.length} Candidate Duplicate(s) within 35m</div>` : ''}
        </div>
      `;
    }).join('');
  }

  renderWorkOrdersList(workOrders) {
    const container = document.getElementById('workorders-list-container');
    const countEl = document.getElementById('count-wo');
    if (!container) return;

    if (countEl) countEl.innerText = workOrders.length;

    if (workOrders.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted);">No draft or issued municipal work orders.</div>`;
      return;
    }

    container.innerHTML = workOrders.map(wo => {
      return `
        <div class="wo-card" onclick="window.openIssueModal('${wo.issue_id}')">
          <div class="card-top">
            <span class="card-id">${wo.id}</span>
            <span class="badge-hazard badge-${wo.department_code}">${wo.department_code}</span>
          </div>
          <div class="card-title">${wo.department}</div>
          <div class="card-meta-row">
            <span>👷 ${wo.assigned_contractor_name}</span>
            <span class="status-tag status-${wo.status}">${wo.status}</span>
          </div>
          <div style="margin-top:6px; font-size:10px; color:var(--text-dim); display:flex; justify-content:space-between;">
            <span>SLA: ${wo.sla_resolution_hours}h</span>
            <span>Est. Budget: ₹${wo.estimated_total_cost_inr.toLocaleString('en-IN')}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  renderAuditStream(auditLogs) {
    const container = document.getElementById('audit-stream-container');
    if (!container) return;

    container.innerHTML = auditLogs.map(log => {
      const timeStr = new Date(log.timestamp).toLocaleTimeString();
      return `
        <div class="audit-entry">
          <div class="audit-meta">
            <span>${log.action} // ${log.entity_id}</span>
            <span>${timeStr}</span>
          </div>
          <div>${log.details} (${log.actor})</div>
          <span class="audit-hash">${log.immutable_hash}</span>
        </div>
      `;
    }).join('');
  }

  openModal(issueId, issues, workOrders) {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;

    this.currentModalIssueId = issueId;
    const modal = document.getElementById('modal-issue-detail');
    if (!modal) return;

    const wo = workOrders.find(w => w.id === issue.work_order_id) || {};

    document.getElementById('modal-kicker').innerText = `ISSUE DOSSIER // ${issue.id} [${issue.waypoint_id}]`;
    document.getElementById('modal-title').innerText = `${issue.hazard_type}: ${issue.visual_description}`;

    // Images
    document.getElementById('modal-img-before').src = issue.primary_evidence_image || '';
    document.getElementById('modal-img-after').src = issue.reinspection_evidence || issue.repair_claim_image || issue.primary_evidence_image || '';

    // Metadata
    document.getElementById('modal-meta-model').innerText = `Model: ${issue.ai_model || 'Local Edge VLM'}`;
    document.getElementById('modal-meta-conf').innerText = `Confidence: ${(issue.confidence_score * 100).toFixed(0)}%`;
    document.getElementById('modal-meta-src').innerText = `Source: ${issue.source_device || 'ROVER_CAM_01'}`;

    document.getElementById('modal-meta-contractor').innerText = `Claim: ${issue.claimed_by_contractor || 'Pending Assignment'}`;
    document.getElementById('modal-meta-reinspect').innerText = `Inspector: ${issue.reinspected_by || 'Awaiting Re-sweep'}`;

    // Work order details
    document.getElementById('modal-wo-id').innerText = wo.id || 'N/A';
    document.getElementById('modal-wo-dept').innerText = wo.department || 'Road Infrastructure (PWD)';
    document.getElementById('modal-wo-officer').innerText = wo.lead_officer || 'AEE Ward 42';
    document.getElementById('modal-wo-sla').innerText = `${wo.sla_resolution_hours || 48} Hours (${issue.severity})`;
    document.getElementById('modal-wo-budget').innerText = `₹${(wo.estimated_total_cost_inr || 5000).toLocaleString('en-IN')} (IRC:SP:98)`;

    document.getElementById('modal-claim-note').innerText = issue.repair_claim_notes || "No contractor claim submitted yet.";

    // Duplicate Banner
    const dupeBanner = document.getElementById('modal-duplicate-banner');
    if (issue.duplicate_candidates && issue.duplicate_candidates.length > 0) {
      dupeBanner.style.display = 'block';
      const d = issue.duplicate_candidates[0];
      dupeBanner.innerHTML = `⚠️ <b>Spatial Candidate Match:</b> Located ${d.distance_meters}m from ticket <b>${d.candidate_issue_id}</b> (${d.current_status}). <span style="font-size:10px;">Review carefully before duplicate merge.</span>`;
    } else {
      dupeBanner.style.display = 'none';
    }

    // Pre-fill existing review if already verified
    const justEl = document.getElementById('modal-justification');
    if (justEl) {
      justEl.value = issue.verification_notes || '';
    }

    modal.style.display = 'flex';
  }

  closeModal() {
    const modal = document.getElementById('modal-issue-detail');
    if (modal) modal.style.display = 'none';
    this.currentModalIssueId = null;
  }
}
