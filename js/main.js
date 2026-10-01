import { state } from './core/state.js';
import { CASE_DATA } from './core/case_data.js';

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  document.getElementById('btn-reset').addEventListener('click', () => state.reset());
  state.subscribe(renderAll);
  renderAll(state.state);
});

function initNav() {
  document.querySelectorAll('[data-view-target]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.setView(e.target.closest('[data-view-target]').dataset.viewTarget);
    });
  });
}

function renderAll(st) {
  // Update Nav
  document.querySelectorAll('[data-view-target]').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector(`[data-view-target="${st.activeView}"]`);
  if(activeBtn) activeBtn.classList.add('active');

  // Update Metrics
  document.getElementById('metric-ev').innerText = `${st.inventory.length}/${Object.keys(CASE_DATA.evidence).length}`;
  document.getElementById('metric-ld').innerText = `${st.activeLeads.length + st.resolvedLeads.length}/${Object.keys(CASE_DATA.leads).length}`;

  // Update Views
  document.querySelectorAll('.view-layer').forEach(v => v.classList.remove('active'));
  const activeView = document.getElementById(`view-${st.activeView}`);
  if(activeView) activeView.classList.add('active');

  // Render specific content
  if(st.activeView === 'scene') renderScene(st);
  if(st.activeView === 'evidence') renderEvidence(st);
  if(st.activeView === 'leads') renderLeads(st);
  if(st.activeView === 'hypotheses') renderHypotheses(st);
  if(st.activeView === 'board') renderBoard(st);
  if(st.activeView === 'interrogation') renderInterrogation(st);
}

// --- VIEWS ---

window.extractClue = (id) => {
  if (state.collectEvidence(id)) {
    // Flash effect
    document.body.style.backgroundColor = 'var(--surface-highlight)';
    setTimeout(() => document.body.style.backgroundColor = '', 200);
  }
};

function renderScene(st) {
  const c = document.getElementById('scene-content');
  const hasPhoto = st.inventory.includes('ev_scene_photo');
  const hasLogs = st.inventory.includes('ev_power_logs');
  
  c.innerHTML = `
    <h2 class="doc-title">Initial Scene Report</h2>
    <div class="doc-meta">Location: Server Room B | Time: 01:15 AM | Responder: Unit 44</div>
    <div class="doc-body">
      <p>The victim, Ajay Desai (DevOps Lead), was found supine adjacent to Server Rack 4. Paramedics noted no signs of struggle. Visible burn marks were observed on the right index finger and left wrist.</p>
      <p>Photographic documentation was taken before moving the body.</p>
      
      <div style="margin: 24px 0;">
        ${hasPhoto ? 
          `<span class="scene-clue extracted">✓ Scene Photograph (Rack 4) Collected</span>` : 
          `<span class="scene-clue" onclick="window.extractClue('ev_scene_photo')">▶ Extract Scene Photographs</span>`
        }
      </div>

      <p>Initial assessment by facility management indicates accidental electrocution during routine maintenance. The main breaker for Rack 4 is currently engaged in the OFF position (locked out).</p>
      
      <div style="margin: 24px 0;">
        ${hasLogs ? 
          `<span class="scene-clue extracted">✓ Facility Power Logs Collected</span>` : 
          `<span class="scene-clue" onclick="window.extractClue('ev_power_logs')">▶ Request Facility Power Logs</span>`
        }
      </div>
    </div>
  `;
}

window.inspectEv = (id) => {
  state.inspectEvidence(id);
};

function renderEvidence(st) {
  const c = document.getElementById('evidence-grid');
  c.innerHTML = '';
  if (st.inventory.length === 0) {
    c.innerHTML = '<p class="doc-meta">No evidence collected. Inspect the Scene Report.</p>';
    return;
  }
  
  st.inventory.forEach(id => {
    const ev = CASE_DATA.evidence[id];
    const isIns = st.inspected.includes(id);
    c.innerHTML += `
      <div class="ev-card">
        <div class="ev-meta-row">
          <span class="ev-id">${ev.id}</span>
          <span>REL: ${ev.reliability}</span>
        </div>
        <h3>${ev.title}</h3>
        <div class="ev-tags">
          <span class="ev-tag">${ev.type}</span>
          ${ev.tags.map(t => `<span class="ev-tag">${t}</span>`).join('')}
        </div>
        <p class="ev-desc">${ev.desc}</p>
        
        ${isIns ? 
          `<div style="margin-top:auto; background:var(--accent-dim); border-left:2px solid var(--accent); padding:12px; font-size:12px; color:var(--fg);">
            <strong>Forensic Insight:</strong><br>${ev.insight}
           </div>` : 
          `<button class="export-btn" style="margin-top:auto;" onclick="window.inspectEv('${id}')">PERFORM DEEP ANALYSIS</button>`
        }
      </div>
    `;
  });
}

function renderLeads(st) {
  const c = document.getElementById('leads-container');
  c.innerHTML = '';
  if (st.activeLeads.length === 0) {
    c.innerHTML = '<p class="doc-meta">No active leads. Perform Deep Analysis on evidence to uncover leads.</p>';
    return;
  }
  st.activeLeads.forEach(id => {
    const ld = CASE_DATA.leads[id];
    c.innerHTML += `
      <div class="lead-card">
        <h4 style="margin:0 0 8px 0; font-family:var(--font-sans); font-size:14px;">${ld.title}</h4>
        <p style="margin:0; font-size:13px; color:var(--fg-dim);">${ld.desc}</p>
      </div>
    `;
  });
}

window.addHyp = () => {
  const val = prompt("Enter new hypothesis:");
  if(val) state.addHypothesis(val);
};

function renderHypotheses(st) {
  const c = document.getElementById('hypotheses-container');
  c.innerHTML = `<button class="export-btn" style="margin-bottom:24px;" onclick="window.addHyp()">+ NEW HYPOTHESIS</button>`;
  
  st.hypotheses.forEach(h => {
    c.innerHTML += `
      <div class="hypothesis-builder">
        <h3 style="margin:0 0 16px 0; font-family:var(--font-serif); font-size:24px; color:var(--accent);">${h.text}</h3>
        <div style="display:flex; gap:24px;">
          <div style="flex:1; border:1px solid var(--border); padding:16px;">
            <h4 style="margin:0 0 8px 0; color:#10b981; font-size:11px; font-family:var(--font-mono);">SUPPORTING EVIDENCE</h4>
            <p style="font-size:12px; color:var(--muted);">Drag evidence here (Coming soon)</p>
          </div>
          <div style="flex:1; border:1px solid var(--border); padding:16px;">
            <h4 style="margin:0 0 8px 0; color:#ef4444; font-size:11px; font-family:var(--font-mono);">CONTRADICTING EVIDENCE</h4>
            <p style="font-size:12px; color:var(--muted);">Drag evidence here (Coming soon)</p>
          </div>
        </div>
      </div>
    `;
  });
}

// --- BOARD DRAG & PAN LOGIC ---
let dragNode = null;
let bOffX = 0, bOffY = 0;
let panX = 0, panY = 0;
let isPanning = false;

function renderBoard(st) {
  const layer = document.getElementById('board-nodes-layer');
  const viewport = document.getElementById('board-viewport');
  const canvas = document.getElementById('board-canvas-layer');
  layer.innerHTML = '';
  
  // Apply current pan
  canvas.style.transform = \`translate(\${panX}px, \${panY}px)\`;
  
  // Viewport panning
  viewport.onmousedown = (e) => {
    if (e.target !== viewport) return;
    isPanning = true;
    const startX = e.clientX - panX;
    const startY = e.clientY - panY;
    document.onmousemove = (me) => {
      if (!isPanning) return;
      panX = me.clientX - startX;
      panY = me.clientY - startY;
      canvas.style.transform = \`translate(\${panX}px, \${panY}px)\`;
    };
    document.onmouseup = () => { isPanning = false; document.onmousemove = null; document.onmouseup = null; };
  };

  // Always ensure Neha is on the board
  if(!st.boardNodes.find(n => n.id === 'char_neha')) {
    st.boardNodes.push({id: 'char_neha', type: 'person', x: 800, y: 300});
  }

  st.boardNodes.forEach(node => {
    let title = node.id;
    if(node.type === 'evidence' && CASE_DATA.evidence[node.id]) title = CASE_DATA.evidence[node.id].title;
    if(node.type === 'person' && CASE_DATA.characters[node.id]) title = CASE_DATA.characters[node.id].name;
    
    const el = document.createElement('div');
    el.className = \`board-node type-\${node.type}\`;
    el.style.left = node.x + 'px';
    el.style.top = node.y + 'px';
    el.innerHTML = \`
      <div class="node-meta">\${node.type.toUpperCase()}</div>
      <div class="node-title">\${title}</div>
      <div class="conn-point"></div>
    \`;
    
    el.onmousedown = (e) => {
      e.stopPropagation();
      dragNode = node;
      bOffX = e.clientX - node.x;
      bOffY = e.clientY - node.y;
      document.onmousemove = (me) => {
        dragNode.x = me.clientX - bOffX;
        dragNode.y = me.clientY - bOffY;
        el.style.left = dragNode.x + 'px';
        el.style.top = dragNode.y + 'px';
      };
      document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
        state.saveState();
        dragNode = null;
      };
    };
    layer.appendChild(el);
  });
}

// --- INTERROGATION ---
window.advanceDialogue = (charId, optId) => {
  const st = state.state;
  const charState = st.characters[charId];
  const charDef = CASE_DATA.characters[charId];
  
  const currentText = charDef.dialogue_tree[charState.node].text;
  charState.memory.push({ speaker: 'npc', text: currentText });
  
  // Find player option text
  let pText = "Continue...";
  if(optId === 'ask_access') pText = "Ask about server room access.";
  if(optId === 'ask_relationship') pText = "Ask about relationship with Ajay.";
  if(optId === 'present_vpn') pText = "[PRESENT EVIDENCE] VPN Access Logs.";
  if(optId === 'present_drive') pText = "[PRESENT EVIDENCE] Encrypted Drive.";
  
  charState.memory.push({ speaker: 'player', text: pText });
  
  const nextNode = charDef.dialogue_tree[optId];
  charState.node = optId;
  if (nextNode.emotion) charState.emotion = nextNode.emotion;
  
  state.saveState();
};

function renderInterrogation(st) {
  const c = document.getElementById('interrogation-content');
  const charId = 'char_neha';
  const charDef = CASE_DATA.characters[charId];
  const charState = st.characters[charId];
  const currentNode = charDef.dialogue_tree[charState.node];
  
  let html = `
    <div class="chat-history">
      ${charState.memory.map(m => `
        <div class="dialogue-bubble dialogue-${m.speaker}">
          ${m.text}
        </div>
      `).join('')}
      <div class="dialogue-bubble dialogue-npc" style="border-color:var(--accent);">
        ${currentNode.text}
      </div>
    </div>
    
    <div class="interrogation-panel">
      <div class="char-profile">
        <div style="width:100px; height:100px; background:var(--surface-lifted); border:2px solid var(--border); border-radius:50%; margin:0 auto 16px auto;"></div>
        <h3 style="margin:0; font-family:var(--font-serif); font-size:24px;">${charDef.name}</h3>
        <p style="margin:4px 0 0 0; color:var(--muted); font-family:var(--font-mono); font-size:11px;">${charDef.role}</p>
        <div class="emotion-badge state-${charState.emotion.toLowerCase()}">${charState.emotion}</div>
      </div>
      
      <div class="action-list">
        <div class="nav-group-title" style="padding:0; margin: 16px 0 8px 0;">Actions</div>
  `;
  
  currentNode.options.forEach(opt => {
    const nextNode = charDef.dialogue_tree[opt];
    if (nextNode.req && !st.inventory.includes(nextNode.req)) return; // Hide locked options
    
    let btnText = "Continue...";
    if(opt === 'ask_access') btnText = "Ask about access.";
    if(opt === 'ask_relationship') btnText = "Ask about Ajay.";
    if(opt === 'present_vpn') btnText = "[EVIDENCE] VPN Logs";
    if(opt === 'present_drive') btnText = "[EVIDENCE] Encrypted Drive";
    
    html += `<button class="action-btn" onclick="window.advanceDialogue('${charId}', '${opt}')">${btnText}</button>`;
  });
  
  html += `</div></div>`;
  c.innerHTML = html;
  
  // Scroll to bottom
  const hist = c.querySelector('.chat-history');
  if(hist) hist.scrollTop = hist.scrollHeight;
}
