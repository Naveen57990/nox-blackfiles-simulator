import { state } from './core/state.js';
import { CASE_DATA } from './core/case_data.js';

document.addEventListener('DOMContentLoaded', () => {
  // Bind notes area to state
  const notesArea = document.getElementById('notes-area');
  notesArea.value = state.state.notes || '';
  notesArea.addEventListener('input', (e) => {
    state.state.notes = e.target.value;
    state.saveState();
  });

  renderAll();
});

// --- NAVIGATION ---
window.showLibrary = () => {
  document.getElementById('view-library').style.display = 'block';
  document.getElementById('view-case').style.display = 'none';
};

window.openCase = (id) => {
  if(id === 'NOX-1145') {
    document.getElementById('view-library').style.display = 'none';
    document.getElementById('view-case').style.display = 'block';
    window.switchTab('brief');
    renderAll();
  }
};

window.switchTab = (tabId) => {
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.remove('active');
    if(b.getAttribute('onclick').includes(tabId)) b.classList.add('active');
  });
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(`tab-${tabId}`).classList.add('active');
};

// --- RENDERING ---
function renderAll() {
  renderScene();
  renderEvidence();
  renderPeople();
  renderTimeline();
}

function renderScene() {
  const c = document.getElementById('scene-container');
  c.innerHTML = `
    <p>Location: Server Room B</p>
    <p>Victim is found lying on the floor. Rigor mortis is absent. There are severe burn marks on his hands.</p>
    <div style="border:1px solid var(--border); padding: 15px; margin: 20px 0;">
      <h4 style="font-family:var(--font-sans); margin:0 0 10px 0;">Discovered Items</h4>
      <ul style="margin:0; padding-left: 20px; font-size: 14px;">
        <li><a href="#" style="color:var(--accent);" onclick="window.openItem('ev_wristband')">Anti-static wristband</a></li>
        <li><a href="#" style="color:var(--accent);" onclick="window.openItem('ev_power_logs')">Rack 4 Power Logs</a></li>
        <li><a href="#" style="color:var(--accent);" onclick="window.openItem('ev_drive')">Encrypted USB Drive</a></li>
      </ul>
    </div>
    <p>The main power breaker for Rack 4 is locked out manually. The facility manager confirms this is standard procedure before touching the rack hardware.</p>
  `;
}

function renderEvidence() {
  const c = document.getElementById('evidence-container');
  c.innerHTML = '';
  
  Object.values(CASE_DATA.evidence).forEach(ev => {
    c.innerHTML += `
      <div class="item-row" onclick="window.openItem('${ev.id}')">
        <div class="item-info">
          <h4>${ev.title}</h4>
          <span class="meta">${ev.type} | SOURCE: ${ev.source}</span>
        </div>
        <div class="item-action">OPEN</div>
      </div>
    `;
  });
}

function renderPeople() {
  const c = document.getElementById('people-container');
  c.innerHTML = '';
  Object.values(CASE_DATA.characters).forEach(char => {
    c.innerHTML += `
      <div class="item-row" onclick="window.openItem('${char.id}')">
        <div class="item-info">
          <h4>${char.name}</h4>
          <span class="meta">${char.role}</span>
        </div>
        <div class="item-action">OPEN</div>
      </div>
    `;
  });
}

function renderTimeline() {
  const c = document.getElementById('timeline-container');
  const events = [
    { time: '18:30', desc: 'Neha Sharma remains late in the building after most staff leave.' },
    { time: '22:15', desc: 'Ajay Desai accesses the billing API repository.' },
    { time: '23:05', desc: 'Ajay enters Server Room B.' },
    { time: '23:08', desc: 'Manual breaker for Rack 4 is locked out by Ajay.' },
    { time: '23:14', desc: 'Emergency Bypass Relay triggered remotely from 10.0.4.55.' },
    { time: '01:15', desc: 'Victim discovered by night security.' }
  ];
  
  c.innerHTML = events.map(ev => `
    <div class="timeline-event">
      <div class="timeline-time">${ev.time}</div>
      <div class="timeline-desc">${ev.desc}</div>
    </div>
  `).join('');
}

// --- MODAL VIEWER ---
window.openItem = (id) => {
  const c = document.getElementById('modal-content-area');
  
  if (id.startsWith('ev_')) {
    const ev = CASE_DATA.evidence[id];
    c.innerHTML = `
      <span class="viewer-meta">EVIDENCE RECORD: ${ev.id}</span>
      <h2 class="viewer-title">${ev.title}</h2>
      <div class="viewer-body">
        <div class="key-value"><span class="key">TYPE</span><span class="val">${ev.type}</span></div>
        <div class="key-value"><span class="key">SOURCE</span><span class="val">${ev.source}</span></div>
        <div class="key-value"><span class="key">RELIABILITY</span><span class="val">${ev.reliability}</span></div>
        <p style="margin-top:30px;"><strong>DESCRIPTION</strong></p>
        <p>${ev.desc}</p>
        <p style="margin-top:20px;"><strong>FORENSIC ANALYSIS / FULL TEXT</strong></p>
        <p style="color:var(--accent);">${ev.insight}</p>
      </div>
    `;
  } else if (id.startsWith('char_')) {
    const char = CASE_DATA.characters[id];
    c.innerHTML = `
      <span class="viewer-meta">PERSON OF INTEREST: ${char.id}</span>
      <h2 class="viewer-title">${char.name}</h2>
      <div class="viewer-body">
        <div class="key-value"><span class="key">ROLE</span><span class="val">${char.role}</span></div>
        <p style="margin-top:30px;"><strong>STATEMENT</strong></p>
        <p style="font-style:italic; padding-left:15px; border-left:2px solid var(--border-light);">"${char.dialogue_tree.intro.text}"</p>
        <p style="margin-top:20px;"><strong>INVESTIGATOR NOTES</strong></p>
        <p>She has authorization for the VPN bypass. Needs to be cross-referenced with the network logs.</p>
      </div>
    `;
  }
  
  document.getElementById('item-modal').classList.add('active');
};

window.closeModal = () => {
  document.getElementById('item-modal').classList.remove('active');
};

window.submitConclusion = () => {
  const who = document.getElementById('conc-who').value.toLowerCase();
  const res = document.getElementById('conclusion-feedback');
  res.style.display = 'block';
  
  if (who.includes('neha')) {
    res.innerHTML = `
      <div style="padding: 20px; border: 1px solid #10b981; background: rgba(16,185,129,0.1);">
        <h4 style="color:#10b981; margin:0 0 10px 0; font-family:var(--font-serif); font-size:24px;">CASE RESOLVED</h4>
        <p><strong>ESTABLISHED:</strong> Neha Sharma orchestrated the sabotage to cover up financial embezzlement.</p>
        <p><strong>SUPPORTED:</strong> The physical tampering of the wristband combined with the remote VPN access logs form an airtight timeline.</p>
      </div>
    `;
  } else {
    res.innerHTML = `
      <div style="padding: 20px; border: 1px solid #ef4444; background: rgba(239,68,68,0.1);">
        <h4 style="color:#ef4444; margin:0 0 10px 0; font-family:var(--font-serif); font-size:24px;">UNRESOLVED</h4>
        <p>The conclusion does not align with the established evidence. Re-examine the VPN logs and the wristband modifications.</p>
      </div>
    `;
  }
};
