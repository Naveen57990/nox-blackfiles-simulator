import { state } from '../core/state.js';
import { CASE_DATA } from '../core/case_data.js';

export function renderInterrogation(st) {
  const container = document.getElementById('interrogation-content');
  
  const charId = 'char_neha'; // Hardcoded for this prototype
  const char = CASE_DATA.characters[charId];
  const charState = st.characterStates[charId];
  
  const currentNode = char.dialogue_tree[charState.node];

  let html = `
    <div class="interrogation-header">
      <div class="profile-pic"></div>
      <div class="profile-info">
        <h2>${char.name}</h2>
        <span class="role">${char.role}</span>
        <div class="emotion-indicator state-${charState.emotion.toLowerCase()}">${charState.emotion}</div>
      </div>
    </div>
    
    <div class="transcript">
      ${charState.memory.map(m => `
        <div class="msg ${m.speaker}">
          <div class="text">${m.text}</div>
        </div>
      `).join('')}
      <div class="msg npc current">
        <div class="text">${currentNode.text}</div>
      </div>
    </div>

    <div class="actions">
      <h3>Present Evidence or Ask:</h3>
      <div class="options-grid">
  `;

  // Standard dialogue options
  currentNode.options.forEach(opt => {
    const nextNode = char.dialogue_tree[opt];
    if (nextNode.req && !st.inventory.includes(nextNode.req)) {
      // Hide or lock option if evidence missing
      return;
    }
    
    let btnText = "Continue...";
    if (opt === 'ask_access') btnText = "Ask about server room access";
    if (opt === 'ask_relationship') btnText = "Ask about relationship with Ajay";
    if (opt === 'present_vpn') btnText = "Present VPN Access Logs";
    if (opt === 'present_drive') btnText = "Present Encrypted Drive Contents";

    html += `<button class="btn-interrogate" onclick="window.advanceDialogue('${charId}', '${opt}', '${btnText}')">${btnText}</button>`;
  });

  html += `</div></div>`;
  container.innerHTML = html;
}

window.advanceDialogue = (charId, nextNodeId, playerText) => {
  const st = state.state;
  const charState = st.characterStates[charId];
  const char = CASE_DATA.characters[charId];
  
  // Save current node to memory before advancing
  const currentText = char.dialogue_tree[charState.node].text;
  charState.memory.push({ speaker: 'npc', text: currentText });
  charState.memory.push({ speaker: 'player', text: playerText });

  // Advance node
  charState.node = nextNodeId;
  const nextNode = char.dialogue_tree[nextNodeId];
  
  if (nextNode.stateChange) {
    charState.emotion = nextNode.stateChange;
  }

  state.saveState();
};
