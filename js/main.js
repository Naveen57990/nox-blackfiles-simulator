import { state } from './core/state.js';
import { CASES } from './core/case_data.js';

document.addEventListener('DOMContentLoaded', () => {
  // Bind notes area to state
  const notesArea = document.getElementById('notes-area');
  notesArea.addEventListener('input', (e) => {
    state.updateNotes(e.target.value);
  });

  renderLibrary();
  
  if (state.state.activeCaseId) {
    document.getElementById('view-library').style.display = 'none';
    document.getElementById('view-case').style.display = 'block';
    renderCaseFile();
    window.switchTab(state.state.activeView === 'library' ? 'brief' : state.state.activeView);
  } else {
    document.getElementById('view-library').style.display = 'block';
    document.getElementById('view-case').style.display = 'none';
  }
});

// --- NAVIGATION ---
window.showLibrary = () => {
  state.closeCase();
  document.getElementById('view-library').style.display = 'block';
  document.getElementById('view-case').style.display = 'none';
};

window.openCase = (id) => {
  state.openCase(id);
  document.getElementById('view-library').style.display = 'none';
  document.getElementById('view-case').style.display = 'block';
  
  renderCaseFile();
  window.switchTab('brief');
};

window.switchTab = (tabId) => {
  if(tabId === 'library') return;
  state.setView(tabId);
  
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.remove('active');
    if(b.getAttribute('onclick').includes(tabId)) b.classList.add('active');
  });
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  
  const targetTab = document.getElementById(`tab-${tabId}`);
  if(targetTab) targetTab.classList.add('active');
};

window.openDossier = (caseId) => {
  window.open(`cases/${caseId}_dossier.html`, '_blank');
};

// --- RENDERING LIBRARY ---
function renderLibrary() {
  const c = document.querySelector('.case-list');
  c.innerHTML = '';
  
  Object.values(CASES).forEach(caseData => {
    const meta = caseData.meta;
    const isLocked = meta.status !== 'Available';
    
    const numDocs = Object.keys(caseData.evidence || {}).length;
    const numPeople = Object.keys(caseData.people || {}).length;
    const numTimeline = (caseData.timeline || []).length;
    
    c.innerHTML += `
      <div class="case-card" ${isLocked ? 'style="opacity:0.5; cursor:default;"' : `onclick="window.openCase('${meta.id}')"`}>
        <div class="case-meta">
          <span>${meta.id}</span> 
          <span>${meta.type}</span> 
          <span>${meta.location}</span> 
          <span>Difficulty: ${meta.difficulty}</span>
        </div>
        <h2>${meta.title}</h2>
        <p>${caseData.brief.what.substring(0, 150)}...</p>
        
        <div style="font-family:var(--font-mono); font-size:11px; color:var(--muted); margin-bottom:20px;">
          ${numDocs + 5} pages · ${numDocs} documents · ${numPeople} persons · ${numTimeline} timeline events
        </div>
        
        ${!isLocked ? `<button class="btn-open">OPEN CASE FILE</button>` : `<p style="font-family:var(--font-mono); font-size:11px;">FILE LOCKED</p>`}
      </div>
    `;
  });
}

// --- RENDERING CASE FILE ---
function renderCaseFile() {
  const caseId = state.state.activeCaseId;
  if (!caseId || !CASES[caseId]) return;
  
  const data = CASES[caseId];
  
  // Header
  document.querySelector('.dossier-id').innerText = data.meta.id;
  document.querySelector('.dossier-title').innerText = data.meta.title;
  document.querySelector('.dossier-details').innerHTML = `
    <div><span>LOCATION</span> ${data.meta.location}</div>
    <div><span>DATE</span> ${data.meta.date}</div>
    <div><span>TYPE</span> ${data.meta.type}</div>
    <div><span>DIFFICULTY</span> ${data.meta.difficulty}</div>
  `;
  
  // Notes
  const cs = state.getCaseState();
  document.getElementById('notes-area').value = cs ? cs.notes : '';

  renderBrief(data);
  renderScene(data);
  renderEvidence(data, cs);
  renderPeople(data, cs);
  renderTimeline(data);
}

function renderBrief(data) {
  const formatText = (text) => text ? text.replace(/\n/g, '<br>') : '';
  document.getElementById('tab-brief').innerHTML = `
    <h3>Case Overview</h3>
    <div class="brief-text">
      <p style="font-size:18px; margin-bottom: 20px;">The core investigation material for this case is contained within a secure digital dossier.</p>
      
      <div style="font-family:var(--font-mono); font-size:12px; color:var(--muted); margin-bottom: 30px;">
        <div>DOCUMENT REF: DOSSIER-${data.meta.id}</div>
        <div>PAGES: ${Object.keys(data.evidence || {}).length + 5}</div>
        <div>ATTACHMENTS: Included in document</div>
      </div>
      
      <p><strong>Initial Summary:</strong><br>${formatText(data.brief.what)}</p>
      
      <button class="btn-open" onclick="window.openDossier('${data.meta.id}')" style="background:var(--fg); color:var(--bg); padding: 15px 30px; font-size: 16px; margin-top: 40px; font-weight: bold; border: none; letter-spacing: 2px;">OPEN FULL CASE DOSSIER</button>
    </div>
  `;
}

function renderScene(data) {
  const c = document.getElementById('scene-container');
  let obsHtml = data.scene.observations.map(o => `<li>${o}</li>`).join('');
  
  c.innerHTML = `
    <p><strong>Location:</strong> ${data.scene.location}</p>
    <div style="border:1px solid var(--border); padding: 15px; margin: 20px 0;">
      <h4 style="font-family:var(--font-sans); margin:0 0 10px 0;">Investigator Observations</h4>
      <ul style="margin:0; padding-left: 20px; font-size: 14px;">
        ${obsHtml}
      </ul>
    </div>
  `;
}

function renderEvidence(data, cs) {
  const c = document.getElementById('evidence-container');
  c.innerHTML = '';
  Object.values(data.evidence).forEach(ev => {
    const isRead = cs && cs.inspected.includes(ev.id);
    c.innerHTML += `
      <div class="item-row" onclick="window.openItem('${ev.id}')" style="${isRead ? 'opacity:0.7;' : ''}">
        <div class="item-info">
          <h4>${ev.title}</h4>
          <span class="meta">${ev.type} | SOURCE: ${ev.source}</span>
        </div>
        <div class="item-action">OPEN</div>
      </div>
    `;
  });
}

function renderPeople(data, cs) {
  const c = document.getElementById('people-container');
  c.innerHTML = '';
  Object.values(data.people).forEach(char => {
    const isRead = cs && cs.inspected.includes(char.id);
    c.innerHTML += `
      <div class="item-row" onclick="window.openItem('${char.id}')" style="${isRead ? 'opacity:0.7;' : ''}">
        <div class="item-info">
          <h4>${char.name}</h4>
          <span class="meta">${char.role}</span>
        </div>
        <div class="item-action">OPEN</div>
      </div>
    `;
  });
}

function renderTimeline(data) {
  const c = document.getElementById('timeline-container');
  c.innerHTML = data.timeline.map(ev => `
    <div class="timeline-event">
      <div class="timeline-time">${ev.time}</div>
      <div class="timeline-desc">${ev.desc}</div>
    </div>
  `).join('');
}

// --- MODAL VIEWER ---
window.openItem = (id) => {
  const caseId = state.state.activeCaseId;
  const data = CASES[caseId];
  const c = document.getElementById('modal-content-area');
  
  state.inspectItem(id);
  
  const formatText = (text) => text ? text.replace(/\n/g, '<br>') : '';
  
  if (id.startsWith('ev_')) {
    const ev = data.evidence[id];
    c.innerHTML = `
      <span class="viewer-meta">EVIDENCE RECORD: ${ev.id}</span>
      <h2 class="viewer-title">${ev.title}</h2>
      <div class="viewer-body">
        <div class="key-value"><span class="key">TYPE</span><span class="val">${ev.type}</span></div>
        <div class="key-value"><span class="key">SOURCE</span><span class="val">${ev.source}</span></div>
        <div class="key-value"><span class="key">RELIABILITY</span><span class="val">${ev.reliability}</span></div>
        <p style="margin-top:30px;"><strong>DESCRIPTION</strong></p>
        <p>${formatText(ev.desc)}</p>
        <p style="margin-top:20px;"><strong>FORENSIC ANALYSIS / FULL TEXT</strong></p>
        <p style="color:var(--accent);">${formatText(ev.insight)}</p>
      </div>
    `;
  } else if (id.startsWith('char_')) {
    const char = data.people[id];
    c.innerHTML = `
      <span class="viewer-meta">PERSON OF INTEREST: ${char.id}</span>
      <h2 class="viewer-title">${char.name}</h2>
      <div class="viewer-body">
        <div class="key-value"><span class="key">ROLE</span><span class="val">${char.role}</span></div>
        <p style="margin-top:30px;"><strong>STATEMENT</strong></p>
        <p style="font-style:italic; padding-left:15px; border-left:2px solid var(--border-light);">${formatText(char.statement)}</p>
        <p style="margin-top:20px;"><strong>INVESTIGATOR NOTES</strong></p>
        <p>${formatText(char.notes)}</p>
      </div>
    `;
  }
  
  document.getElementById('item-modal').classList.add('active');
  renderCaseFile(); // re-render to fade out read items
};

window.closeModal = () => {
  document.getElementById('item-modal').classList.remove('active');
};

window.submitConclusion = () => {
  const who = document.getElementById('conc-who').value.toLowerCase();
  const how = document.getElementById('conc-how').value.toLowerCase();
  const why = document.getElementById('conc-why').value.toLowerCase();
  const res = document.getElementById('conclusion-feedback');
  
  const caseId = state.state.activeCaseId;
  const truth = CASES[caseId].truth;
  
  res.style.display = 'block';
  
  const culpritStr = truth.who.toLowerCase();
  const isCorrect = culpritStr.includes(who) && who.length > 2;
  
  const statusHtml = isCorrect 
    ? `<h4 style="color:#10b981; margin:0 0 10px 0; font-family:var(--font-serif); font-size:24px;">INVESTIGATION CONCLUDED - FINDINGS VALIDATED</h4>`
    : `<h4 style="color:#ef4444; margin:0 0 10px 0; font-family:var(--font-serif); font-size:24px;">INVESTIGATION CONCLUDED - CRITICAL ERRORS IN FINDINGS</h4>`;

  res.innerHTML = `
    <div style="padding: 30px; border: 1px solid var(--border-light); background: var(--surface-hover); margin-top: 20px;">
      ${statusHtml}
      <p style="margin-bottom: 30px; color: var(--fg-dim);">The submitted dossier has been reviewed against canonical case facts.</p>
      
      <div style="margin-bottom: 20px;">
        <h5 style="color:var(--accent); font-family:var(--font-mono); font-size:11px; margin:0 0 5px 0;">ESTABLISHED FACTS (WHAT ACTUALLY HAPPENED)</h5>
        <p style="font-size: 14px;">${truth.what}</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h5 style="color:var(--accent); font-family:var(--font-mono); font-size:11px; margin:0 0 5px 0;">RESPONSIBLE PARTY</h5>
        <p style="font-size: 14px;">${truth.who}</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h5 style="color:var(--accent); font-family:var(--font-mono); font-size:11px; margin:0 0 5px 0;">METHOD & MOTIVE</h5>
        <p style="font-size: 14px;"><strong>How:</strong> ${truth.how}</p>
        <p style="font-size: 14px;"><strong>Why:</strong> ${truth.why}</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h5 style="color:var(--accent); font-family:var(--font-mono); font-size:11px; margin:0 0 5px 0;">EVIDENCE STATUS</h5>
        <p style="font-size: 14px;"><strong>Proven by Evidence:</strong> ${truth.proven || 'Internal evidence establishes the facts as presented.'}</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h5 style="color:var(--accent); font-family:var(--font-mono); font-size:11px; margin:0 0 5px 0;">DEAD ENDS & RED HERRINGS</h5>
        <ul style="font-size: 14px; margin:0; padding-left: 20px;">
          ${truth.red_herrings.map(rh => `<li>${rh}</li>`).join('')}
        </ul>
      </div>

      <div>
        <h5 style="color:var(--accent); font-family:var(--font-mono); font-size:11px; margin:0 0 5px 0;">UNRESOLVED ELEMENTS</h5>
        <p style="font-size: 14px; color: var(--muted);">${truth.unresolved}</p>
      </div>
    </div>
  `;
};
