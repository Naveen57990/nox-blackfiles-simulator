import { state } from '../core/state.js';
import { CASE_DATA } from '../core/case_data.js';

let draggedNode = null;
let offsetX = 0;
let offsetY = 0;

export function renderBoard(st) {
  const container = document.getElementById('board-canvas');
  const svgLines = document.getElementById('board-lines');
  
  // We need to persist node positions. If not in state, initialize them.
  // For this V0.1, we'll just populate nodes based on inspected evidence.
  
  // Clear existing DOM nodes
  container.querySelectorAll('.board-node').forEach(n => n.remove());
  svgLines.innerHTML = '';

  const activeNodes = [];
  
  // Create nodes from inspected evidence and characters
  st.inspected.forEach(id => {
    const ev = CASE_DATA.evidence[id];
    let n = st.boardNodes.find(x => x.id === id);
    if (!n) {
      n = { id: id, type: 'evidence', title: ev.title, x: Math.random() * 400 + 50, y: Math.random() * 400 + 50 };
      st.boardNodes.push(n);
    }
    activeNodes.push(n);
  });
  
  // Add suspects (hardcoded for now, normally unlocked via leads)
  if (!st.boardNodes.find(x => x.id === 'char_neha')) {
    st.boardNodes.push({ id: 'char_neha', type: 'person', title: 'Neha Sharma', x: 600, y: 100 });
  }
  activeNodes.push(st.boardNodes.find(x => x.id === 'char_neha'));

  activeNodes.forEach(node => {
    const el = document.createElement('div');
    el.className = `board-node node-${node.type}`;
    el.id = `node-${node.id}`;
    el.style.left = `${node.x}px`;
    el.style.top = `${node.y}px`;
    el.innerText = node.title;
    
    // Drag handlers
    el.addEventListener('mousedown', (e) => {
      draggedNode = node;
      offsetX = e.clientX - node.x;
      offsetY = e.clientY - node.y;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    container.appendChild(el);
  });
  
  drawLines(st);
}

function onMouseMove(e) {
  if (!draggedNode) return;
  draggedNode.x = e.clientX - offsetX;
  draggedNode.y = e.clientY - offsetY;
  const el = document.getElementById(`node-${draggedNode.id}`);
  if (el) {
    el.style.left = `${draggedNode.x}px`;
    el.style.top = `${draggedNode.y}px`;
  }
  drawLines(state.state);
}

function onMouseUp() {
  if (draggedNode) {
    state.saveState(); // Save new position
    draggedNode = null;
  }
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
}

function drawLines(st) {
  const svg = document.getElementById('board-lines');
  svg.innerHTML = '';
  // In a full version, we allow user to draw lines. 
  // For now, draw lines between connected evidence (from state.boardConnections).
  st.boardConnections.forEach(conn => {
    const [id1, id2] = conn.split('::');
    const n1 = st.boardNodes.find(x => x.id === id1);
    const n2 = st.boardNodes.find(x => x.id === id2);
    if(n1 && n2) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', n1.x + 75); // approximate center
      line.setAttribute('y1', n1.y + 25);
      line.setAttribute('x2', n2.x + 75);
      line.setAttribute('y2', n2.y + 25);
      line.setAttribute('stroke', 'rgba(255,255,255,0.2)');
      line.setAttribute('stroke-width', '2');
      svg.appendChild(line);
    }
  });
}
