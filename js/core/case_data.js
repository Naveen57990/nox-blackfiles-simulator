export const CASE_DATA = {
  id: "NOX-1145",
  title: "The Server Room Sabotage",
  
  truth: {
    method: "Tampered anti-static wristband + remote power surge",
    motive: "Ajay discovered a micro-embezzlement script",
    culprit: "char_neha"
  },

  evidence: {
    "ev_scene_photo": {
      id: "ev_scene_photo", type: "PHOTOGRAPH", title: "Scene Photo - Rack 4", source: "First Responders", reliability: "HIGH",
      desc: "Victim is deceased near Rack 4. He is wearing a standard ESD wristband.",
      insight: "Forensic enhancement of the wristband shows the safety resistor housing is cracked and glued. It has been tampered with.",
      tags: ["Scene", "Physical"], unlocks_ev: ["ev_wristband"], unlocks_lead: []
    },
    "ev_wristband": {
      id: "ev_wristband", type: "PHYSICAL", title: "Anti-static Wristband", source: "Victim", reliability: "HIGH",
      desc: "Standard issue ESD wristband recovered from victim's left wrist.",
      insight: "The 1-megaohm safety resistor has been replaced with a solid copper wire. This turns the wearer into a perfect ground path. Lethal if exposed to current.",
      tags: ["Forensics", "Weapon"], unlocks_ev: [], unlocks_lead: ["lead_method"]
    },
    "ev_power_logs": {
      id: "ev_power_logs", type: "DIGITAL", title: "Rack 4 Power Log", source: "Facility Management", reliability: "HIGH",
      desc: "Shows main breaker locked out manually at 23:08.",
      insight: "An Emergency Bypass Relay was triggered remotely at 23:14:02, surging the rack with 240V while the manual breaker was still locked.",
      tags: ["Logs", "Timeline"], unlocks_ev: [], unlocks_lead: ["lead_vpn"]
    },
    "ev_vpn_logs": {
      id: "ev_vpn_logs", type: "DIGITAL", title: "VPN Access Logs", source: "Core Router", reliability: "MEDIUM",
      desc: "Logs from 23:00 to 23:30. Many active connections.",
      insight: "IP 10.0.4.55 (assigned to Neha Sharma) executed the 'override-relay-4' command at exactly 23:14:02.",
      tags: ["Network", "Suspect Link"], unlocks_ev: [], unlocks_lead: []
    },
    "ev_drive": {
      id: "ev_drive", type: "DIGITAL", title: "Encrypted Drive", source: "Victim's locker", reliability: "HIGH",
      desc: "Heavily encrypted personal drive.",
      insight: "Decrypted contents reveal a dossier on an embezzlement script running in the billing API. The script's authorization keys belong to Neha.",
      tags: ["Motive", "Financial"], unlocks_ev: [], unlocks_lead: ["lead_motive"]
    }
  },

  leads: {
    "lead_method": { id: "lead_method", title: "Determine mechanism of electrocution", desc: "The wristband was modified to conduct. How was the power delivered if the breaker was off?" },
    "lead_vpn": { id: "lead_vpn", title: "Investigate Remote Bypass", desc: "Someone triggered the relay remotely. We need VPN logs." },
    "lead_motive": { id: "lead_motive", title: "Investigate Embezzlement Script", desc: "Ajay found financial fraud. Who is benefiting?" }
  },

  characters: {
    "char_neha": {
      id: "char_neha", name: "Neha Sharma", role: "VP Engineering",
      dialogue_tree: {
        "intro": { text: "This is a tragedy. Ajay was a brilliant engineer.", options: ["ask_access", "ask_relationship"], emotion: "CALM" },
        "ask_access": { text: "Only senior staff have VPN access to the relays. The logs will prove I wasn't logged in.", options: ["present_vpn"], emotion: "CALM" },
        "ask_relationship": { text: "We had disagreements, but I respected him.", options: [], emotion: "CALM" },
        "present_vpn": { req: "ev_vpn_logs", text: "My IP? That's impossible. My network must have been spoofed.", options: ["present_drive"], emotion: "DEFENSIVE" },
        "present_drive": { req: "ev_drive", text: "I... I want my lawyer. Now. You can't prove I wrote that script.", options: [], emotion: "ANGRY" }
      }
    }
  }
};
