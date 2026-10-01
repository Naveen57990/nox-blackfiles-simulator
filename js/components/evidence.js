import { state } from '../core/state.js';
import { CASE_DATA } from '../core/case_data.js';

export function renderEvidence(st) {
  const container = document.getElementById('evidence-grid');
  container.innerHTML = '';

  if (st.inventory.length === 0) {
    container.innerHTML = '<div class="empty-state">No evidence logged yet. Return to the Scene Report.</div>';
    return;
  }

  st.inventory.forEach(id => {
    const ev = CASE_DATA.evidence[id];
    const isInspected = st.inspected.includes(id);

    const card = document.createElement('div');
    card.className = 'evidence-card';
    
    card.innerHTML = `
      <div class="ev-header">
        <span class="badge ${ev.type.toLowerCase()}">${ev.type}</span>
        <span class="rel">REL: ${ev.reliability}</span>
      </div>
      <h3>${ev.title}</h3>
      <p class="source">Source: ${ev.source}</p>
      <div class="ev-desc">${ev.desc}</div>
      
      ${isInspected ? 
        `<div class="ev-insight">
           <strong>Forensic Insight:</strong>
           <p>${ev.insight}</p>
         </div>` : 
        `<button class="btn-inspect-deep" onclick="window.inspectEvidenceDeep('${id}')">Perform Deep Analysis</button>`
      }
    `;
    
    container.appendChild(card);
  });
}

window.inspectEvidenceDeep = (id) => {
  state.inspectEvidence(id);
};
