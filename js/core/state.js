import { CASE_DATA } from './case_data.js';

class StateManager {
  constructor() {
    this.storageKey = 'nox_v1_state';
    this.listeners = [];
    this.state = this.loadState() || this.getInitialState();
  }

  getInitialState() {
    return {
      activeView: 'scene',
      inventory: [], // IDs of collected evidence
      inspected: [], // IDs of deeply inspected evidence
      activeLeads: [],
      resolvedLeads: [],
      hypotheses: [
        { id: 'hyp_1', text: 'Accidental Electrocution', support: [], contradict: [] }
      ],
      boardNodes: [], // {id, type, x, y}
      boardConnections: [], // "id1::id2"
      characters: {
        'char_neha': { node: 'intro', emotion: 'CALM', memory: [] }
      }
    };
  }

  loadState() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  saveState() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    this.notify();
  }

  reset() {
    this.state = this.getInitialState();
    this.saveState();
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.state));
  }

  // --- Actions ---
  setView(view) {
    this.state.activeView = view;
    this.saveState();
  }

  collectEvidence(id) {
    if (!this.state.inventory.includes(id)) {
      this.state.inventory.push(id);
      
      // Auto-add to board
      this.state.boardNodes.push({
        id, type: 'evidence', 
        x: window.innerWidth / 2 + (Math.random()*100-50), 
        y: window.innerHeight / 2 + (Math.random()*100-50)
      });
      
      this.saveState();
      return true;
    }
    return false;
  }

  inspectEvidence(id) {
    if (!this.state.inspected.includes(id)) {
      this.state.inspected.push(id);
      
      const ev = CASE_DATA.evidence[id];
      if (ev) {
        if (ev.unlocks_ev) ev.unlocks_ev.forEach(u => this.collectEvidence(u));
        if (ev.unlocks_lead) ev.unlocks_lead.forEach(u => {
          if (!this.state.activeLeads.includes(u) && !this.state.resolvedLeads.includes(u)) {
            this.state.activeLeads.push(u);
          }
        });
      }
      this.saveState();
    }
  }

  addHypothesis(text) {
    this.state.hypotheses.push({
      id: 'hyp_' + Date.now(),
      text, support: [], contradict: []
    });
    this.saveState();
  }
}

export const state = new StateManager();
