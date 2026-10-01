import { state } from '../core/state.js';
import { CASE_DATA } from '../core/case_data.js';

export function renderScene(st) {
  const container = document.getElementById('scene-content');
  
  // Interactive Scene text
  // We use regex or hardcoded HTML to make keywords interactive based on state
  
  const hasPhoto = st.inventory.includes('ev_scene_photo');
  
  let html = `
    <div class="scene-header">
      <h2>Initial Scene Report</h2>
      <div class="meta">Location: Server Room B | Time: 01:15 AM | Responder: Unit 44</div>
    </div>
    <div class="scene-body">
      <p>The victim, Ajay Desai, was found supine adjacent to Rack 4. No signs of struggle. Burn marks on the right index finger and left wrist.</p>
      
      <div class="interactive-block">
        ${hasPhoto ? 
          `<div class="found-evidence">✓ Scene Photograph (Rack 4) collected.</div>` : 
          `<button class="btn-inspect" onclick="window.extractEvidence('ev_scene_photo')">🔍 Examine Scene Photographs</button>`
        }
      </div>

      <p>Initial assessment indicates accidental electrocution. Facility Management confirms routine maintenance was scheduled.</p>
      
      <div class="interactive-block">
        ${st.inventory.includes('ev_power_logs') ? 
          `<div class="found-evidence">✓ Power Logs secured.</div>` : 
          `<button class="btn-inspect" onclick="window.extractEvidence('ev_power_logs')">🔍 Request Facility Power Logs</button>`
        }
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// Attach to window so inline onclick handlers work (hack for quick SPA without complex event delegation)
window.extractEvidence = (id) => {
  if(state.collectEvidence(id)) {
    // Optional UI flourish here
  }
};
