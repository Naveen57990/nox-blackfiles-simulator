export const CASE_DATA = {
  id: "NOX-1145",
  title: "The Vikhroli Sabotage",
  status: "ACTIVE",
  difficulty: "HARD",
  summary: "Ajay Desai, DevOps Lead, found dead in Server Room B. Initial assessment: Accidental electrocution. Discrepancies in power logs suggest otherwise.",
  
  // Canonical Truth (Hidden from player, used by logic/AI)
  truth: {
    method: "Tampered anti-static wristband + remote power surge",
    motive: "Ajay discovered a micro-embezzlement script in the billing API",
    culprit: "char_neha",
    timeline: [
      { time: "18:30", event: "Neha modifies Ajay's spare wristband in his locker." },
      { time: "22:15", event: "Ajay detects embezzlement script, downloads to encrypted drive." },
      { time: "23:05", event: "Ajay enters Server Room B to manually disconnect compromised rack." },
      { time: "23:14", event: "Neha triggers remote bypass relay from home VPN, surging power." }
    ]
  },

  leads: [
    { id: "lead_01", title: "Investigate Rack 4 Power Logs", status: "OPEN" },
    { id: "lead_02", title: "Examine Victim's Equipment", status: "OPEN" },
    { id: "lead_03", title: "Check Network VPN Access", status: "LOCKED" }
  ],

  evidence: {
    "ev_scene_photo": {
      id: "ev_scene_photo",
      type: "PHOTOGRAPH",
      title: "Scene Photograph - Rack 4",
      source: "First Responders",
      reliability: "HIGH",
      desc: "High-resolution photo of the victim near the server rack. He is wearing an anti-static wristband.",
      inspectable: true,
      insight: "Zooming in on the wristband shows the safety resistor housing looks cracked and glued.",
      unlocks: ["ev_wristband"]
    },
    "ev_wristband": {
      id: "ev_wristband",
      type: "PHYSICAL",
      title: "Anti-static Wristband",
      source: "Victim's body",
      reliability: "HIGH",
      desc: "Standard issue ESD wristband.",
      inspectable: true,
      insight: "The 1-megaohm safety resistor has been replaced with a solid copper wire. It conducts electricity directly to ground.",
      unlocks: []
    },
    "ev_power_logs": {
      id: "ev_power_logs",
      type: "DIGITAL",
      title: "Rack 4 Power Log",
      source: "Facility Management System",
      reliability: "HIGH",
      desc: "Main breaker was physically locked out at 23:08.",
      inspectable: true,
      insight: "A remote bypass relay (Emergency Override) was activated at 23:14:02. Power was surged.",
      unlocks: ["lead_03"]
    },
    "ev_vpn_logs": {
      id: "ev_vpn_logs",
      type: "DIGITAL",
      title: "VPN Access Logs",
      source: "Core Router",
      reliability: "MEDIUM",
      desc: "Logs from 23:00 to 23:30.",
      inspectable: true,
      insight: "IP address 10.0.4.55 (assigned to Neha) sent the override command at 23:14.",
      unlocks: []
    },
    "ev_drive": {
      id: "ev_drive",
      type: "DIGITAL",
      title: "Encrypted Drive",
      source: "Victim's locker",
      reliability: "HIGH",
      desc: "Requires decryption.",
      inspectable: true,
      insight: "Contains a forensic copy of the billing API. A script diverts 0.01% of transactions to an offshore account authorized by Neha.",
      unlocks: []
    }
  },

  characters: {
    "char_neha": {
      id: "char_neha",
      name: "Neha Sharma",
      role: "VP Engineering",
      state: "CALM",
      dialogue_tree: {
        "intro": { text: "This is a tragedy. Ajay was a brilliant engineer. How can I help?", options: ["ask_access", "ask_relationship"] },
        "ask_access": { text: "Only senior staff have VPN access to the bypass relays. But the logs are secure.", options: ["present_vpn"] },
        "ask_relationship": { text: "We had professional disagreements, but I respected him.", options: [] },
        "present_vpn": { req: "ev_vpn_logs", text: "My IP? That's impossible. My network must have been spoofed.", stateChange: "DEFENSIVE", options: ["present_drive"] },
        "present_drive": { req: "ev_drive", text: "I... I want my lawyer. Now.", stateChange: "ANGRY", options: [] }
      }
    }
  }
};
