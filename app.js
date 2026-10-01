const STATE = {
  view: 'scene', // 'scene', 'evidence', 'board'
  inventory: new Set(),
  inspected: new Set(),
  connections: [],
  solved: false
};

const DATA = {
  clues: {
    'c_wristband': { id: 'c_wristband', title: 'Anti-static Wristband', desc: 'Standard issue ESD wristband worn by victim.', inspect: 'The 1-megaohm safety resistor inside the band has been replaced with a solid copper wire. It no longer protects; it conducts.' },
    'c_logs': { id: 'c_logs', title: 'Server Room Logs', desc: 'Entry log shows Ajay entered at 23:05. Smartwatch data shows heart stopped at 23:14.', inspect: 'The main breaker was manually locked out by Ajay. However, rack power logs show a remote bypass relay was activated at exactly 23:14.' },
    'c_vpn': { id: 'c_vpn', title: 'VPN Cache', desc: 'Router cache from the time of the incident.', inspect: 'The remote bypass relay was triggered from an internal IP address assigned to the credentials of Neha (VP Engineering).' },
    'c_drive': { id: 'c_drive', title: 'Ajay\'s Encrypted Drive', desc: 'Found in Ajay\'s locker.', inspect: 'Contains a dossier on automated micro-embezzlement in the billing code. The authorization signatures match Neha\'s account.' }
  },
  nodes: {
    'n_suspect': { id: 'n_suspect', title: 'Neha (VP Eng)', type: 'suspect', x: 100, y: 100 },
    'n_method': { id: 'n_method', title: 'Tampered Wristband + Remote Surge', type: 'method', x: 300, y: 200 },
    'n_motive': { id: 'n_motive', title: 'Embezzlement Discovery', type: 'motive', x: 500, y: 100 }
  }
};

function render() {
  document.querySelectorAll('.view').forEach(el => el.style.display = 'none');
  document.getElementById(`view-${STATE.view}`).style.display = 'block';
  
  // Update Navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === STATE.view);
  });

  if (STATE.view === 'scene') renderScene();
  if (STATE.view === 'evidence') renderEvidence();
  if (STATE.view === 'board') renderBoard();
}

function setView(view) {
  STATE.view = view;
  render();
}

function extractClue(clueId) {
  if (!STATE.inventory.has(clueId)) {
    STATE.inventory.add(clueId);
    alert(`New Evidence Collected: ${DATA.clues[clueId].title}`);
    render();
  }
}

function inspectClue(clueId) {
  STATE.inspected.add(clueId);
  const clue = DATA.clues[clueId];
  alert(`INSPECTION RESULT:\n\n${clue.inspect}`);
  render();
}

function renderScene() {
  const sceneText = `
    <h2>Incident Report: Server Room B</h2>
    <p>Victim: Ajay Desai (DevOps Lead). Found deceased near Rack 4.</p>
    <p>Initial assessment points to accidental electrocution. The victim was wearing an <a href="#" onclick="extractClue('c_wristband')">[Anti-static Wristband]</a>.</p>
    <p>System <a href="#" onclick="extractClue('c_logs')">[Server Room Logs]</a> indicate he was performing routine maintenance.</p>
    <p>Network forensics recovered a fragmented <a href="#" onclick="extractClue('c_vpn')">[VPN Cache]</a> from the switch.</p>
    <p>Personal effects include <a href="#" onclick="extractClue('c_drive')">[Ajay's Encrypted Drive]</a>.</p>
  `;
  document.getElementById('view-scene').innerHTML = sceneText;
}

function renderEvidence() {
  const container = document.getElementById('evidence-container');
  container.innerHTML = '';
  
  if (STATE.inventory.size === 0) {
    container.innerHTML = '<p class="faint">No evidence collected yet. Inspect the scene.</p>';
    return;
  }

  STATE.inventory.forEach(id => {
    const clue = DATA.clues[id];
    const isInspected = STATE.inspected.has(id);
    const div = document.createElement('div');
    div.className = 'evidence-item';
    div.innerHTML = `
      <h3>${clue.title}</h3>
      <p>${clue.desc}</p>
      ${isInspected ? `<div class="insight"><strong>Insight:</strong> ${clue.inspect}</div>` : ''}
      <button class="btn btn-sm" onclick="inspectClue('${id}')">Deep Inspect</button>
    `;
    container.appendChild(div);
  });
}

// Simple logic for the board
let dragSource = null;
function handleDragStart(e, id) {
  dragSource = id;
  e.dataTransfer.setData('text/plain', id);
}

function handleDrop(e, targetId) {
  e.preventDefault();
  if (dragSource && dragSource !== targetId) {
    // Check if they need to be connected to solve
    const conn = [dragSource, targetId].sort().join('-');
    if (!STATE.connections.includes(conn)) {
      STATE.connections.push(conn);
      renderBoard();
      checkSolution();
    }
  }
}

function handleDragOver(e) {
  e.preventDefault();
}

function renderBoard() {
  const board = document.getElementById('deduction-board');
  board.innerHTML = '';
  
  // Draw nodes based on what is inspected/unlocked
  // For simplicity, nodes appear once their corresponding clue is inspected
  const visibleNodes = [];
  if (STATE.inspected.has('c_wristband') && STATE.inspected.has('c_logs')) visibleNodes.push(DATA.nodes.n_method);
  if (STATE.inspected.has('c_drive')) visibleNodes.push(DATA.nodes.n_motive);
  if (STATE.inspected.has('c_vpn')) visibleNodes.push(DATA.nodes.n_suspect);
  
  if (visibleNodes.length === 0) {
    board.innerHTML = '<p style="padding:20px; color:var(--muted)">Deep inspect evidence to generate deduction nodes.</p>';
    return;
  }

  visibleNodes.forEach(node => {
    const div = document.createElement('div');
    div.className = `board-node type-${node.type}`;
    div.style.left = node.x + 'px';
    div.style.top = node.y + 'px';
    div.draggable = true;
    div.innerText = node.title;
    
    div.ondragstart = (e) => handleDragStart(e, node.id);
    div.ondragover = handleDragOver;
    div.ondrop = (e) => handleDrop(e, node.id);
    
    board.appendChild(div);
  });

  // Draw connections (simplified as text log for now, full SVG requires more boilerplate)
  const connList = document.getElementById('board-connections');
  connList.innerHTML = STATE.connections.map(c => `<li>Connected: ${c}</li>`).join('');
}

function checkSolution() {
  const req1 = 'n_method-n_suspect';
  const req2 = 'n_motive-n_suspect';
  
  if (STATE.connections.includes(req1) && STATE.connections.includes(req2)) {
    STATE.solved = true;
    alert("CASE SOLVED!\n\nNeha orchestrated the remote power surge after replacing the safety resistor in Ajay's wristband, silencing him before he could expose her embezzlement.");
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  render();
});
