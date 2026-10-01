import { CASE_DATA } from './case_data.js';

class StateManager {
  constructor() {
    this.storageKey = 'nox_state_v2';
    this.listeners = [];
    this.state = this.loadState() || this.getInitialState();
  }

  getInitialState() {
    return {
      activeView: 'scene',
      inventory: [],
      inspected: [],
      resolvedLeads: [],
      unlockedLeads: ['lead_01', 'lead_02'],
      boardNodes: [],
      boardConnections: [],
      hypotheses: [],
      characterStates: {
        'char_neha': { emotion: 'CALM', node: 'intro', memory: [] }
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

  // Actions
  setView(view) {
    this.state.activeView = view;
    this.saveState();
  }

  collectEvidence(id) {
    if (!this.state.inventory.includes(id)) {
      this.state.inventory.push(id);
      this.saveState();
      return true;
    }
    return false;
  }

  inspectEvidence(id) {
    if (!this.state.inspected.includes(id)) {
      this.state.inspected.push(id);
      // Unlock new evidence or leads based on inspection
      const ev = CASE_DATA.evidence[id];
      if (ev && ev.unlocks) {
        ev.unlocks.forEach(unlockId => {
          if (unlockId.startsWith('lead_') && !this.state.unlockedLeads.includes(unlockId)) {
            this.state.unlockedLeads.push(unlockId);
          } else if (unlockId.startsWith('ev_') && !this.state.inventory.includes(unlockId)) {
            this.state.inventory.push(unlockId);
          }
        });
      }
      this.saveState();
    }
  }
}

export const state = new StateManager();
