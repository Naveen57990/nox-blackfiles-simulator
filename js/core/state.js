class StateManager {
  constructor() {
    this.storageKey = 'nox_v4_cases_state';
    this.listeners = [];
    this.state = this.loadState() || this.getInitialState();
  }

  getInitialState() {
    return {
      activeCaseId: null,
      activeView: 'library', // library, brief, scene, evidence, people, timeline, notes, conclusion
      cases: {} // map of caseId -> { inventory: [], inspected: [], notes: '' }
    };
  }

  loadState() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        return { ...this.getInitialState(), ...parsed };
      }
      return null;
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
  openCase(caseId) {
    this.state.activeCaseId = caseId;
    if (!this.state.cases[caseId]) {
      this.state.cases[caseId] = { inventory: [], inspected: [], notes: '' };
    }
    this.state.activeView = 'brief';
    this.saveState();
  }

  setView(view) {
    this.state.activeView = view;
    this.saveState();
  }
  
  closeCase() {
    this.state.activeCaseId = null;
    this.state.activeView = 'library';
    this.saveState();
  }

  getCaseState() {
    if(!this.state.activeCaseId) return null;
    return this.state.cases[this.state.activeCaseId];
  }

  updateNotes(notes) {
    const cs = this.getCaseState();
    if(cs) {
      cs.notes = notes;
      this.saveState();
    }
  }

  // For evidence/items, we don't necessarily need "inventory" if the user wants all evidence visible in the case file.
  // The user said: "I open a case file and everything I need to investigate that case is inside it."
  // They didn't explicitly ask for an unlocking mechanic anymore. They just want deep reading.
  // We will keep 'inspected' to track what the user has clicked on (for UI fading/read states).
  inspectItem(id) {
    const cs = this.getCaseState();
    if (cs && !cs.inspected.includes(id)) {
      cs.inspected.push(id);
      this.saveState();
    }
  }
}

export const state = new StateManager();
