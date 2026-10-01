import { state } from './core/state.js';
import { CASE_DATA } from './core/case_data.js';

// Import Views (We'll implement these as simple functions for now to avoid module complexity)
import { renderScene } from './components/scene.js';
import { renderEvidence } from './components/evidence.js';
import { renderBoard } from './components/board.js';
import { renderInterrogation } from './components/interrogation.js';

document.addEventListener('DOMContentLoaded', () => {
  initUI();
  state.subscribe(updateUI);
  updateUI(state.state);
});

function initUI() {
  document.querySelectorAll('[data-view-target]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.setView(e.target.closest('[data-view-target]').dataset.viewTarget);
    });
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    if(confirm('Wipe case data?')) state.reset();
  });
}

function updateUI(st) {
  // Update Navigation
  document.querySelectorAll('[data-view-target]').forEach(btn => {
    if (btn.dataset.viewTarget === st.activeView) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Hide all views
  document.querySelectorAll('.view-pane').forEach(pane => pane.style.display = 'none');
  
  // Show active view
  const activePane = document.getElementById(`view-${st.activeView}`);
  if (activePane) activePane.style.display = 'flex';

  // Render specific view content
  if (st.activeView === 'scene') renderScene(st);
  if (st.activeView === 'evidence') renderEvidence(st);
  if (st.activeView === 'board') renderBoard(st);
  if (st.activeView === 'interrogation') renderInterrogation(st);

  // Update Global Status
  document.getElementById('status-progress').innerText = `${st.inventory.length} / ${Object.keys(CASE_DATA.evidence).length} Evidence Found`;
}
