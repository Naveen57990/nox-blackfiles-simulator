export const CASES = {
  "NOX-1145": {
    meta: {
      id: "NOX-1145",
      title: "The Server Room Sabotage",
      type: "Cybercrime / Sabotage",
      location: "Hyderabad",
      date: "04 October 2026",
      difficulty: "7/10",
      status: "Available"
    },
    truth: {
      what: "Premeditated murder via electrical override.",
      who: "Neha Sharma (VP Engineering)",
      how: "Tampered with the victim's ESD wristband (resistor replaced with copper). Remotely triggered the emergency bypass relay to surge the rack while the manual breaker was locked out.",
      why: "Victim (Ajay) discovered her micro-embezzlement script running in the billing API.",
      red_herrings: ["Rahul Mehta was in the server room area, but only to sleep on a couch.", "A generic phishing email hit the servers earlier that day."],
      unresolved: "Where Neha physically acquired the copper wire for the wristband."
    },
    brief: {
      what: "Ajay Desai, a 34-year-old DevOps Lead, was found dead in Server Room B at approximately 01:15 AM. Cause of death is severe electrocution.",
      assessment: "Facility management has provisionally ruled it an accident. Desai was performing routine late-night maintenance on Rack 4. He was wearing an anti-static (ESD) wristband.",
      objective: "Review the scene, examine the technical and forensic evidence, and determine if this was a genuine industrial accident or premeditated sabotage."
    },
    scene: {
      location: "Server Room B, 4th Floor, Tech Park",
      observations: [
        "Victim is found lying supine adjacent to Server Rack 4.",
        "Rigor mortis is absent. Severe burn marks on right index finger and left wrist.",
        "The main power breaker for Rack 4 is locked out manually (OFF position).",
        "No signs of physical struggle in the room."
      ]
    },
    timeline: [
      { time: "18:30", desc: "Neha Sharma remains late in the building after most staff leave." },
      { time: "19:42", desc: "CCTV shows Rahul Mehta entering the Server Room B hallway." },
      { time: "22:15", desc: "Ajay Desai accesses the billing API repository from his terminal." },
      { time: "23:05", desc: "Ajay enters Server Room B." },
      { time: "23:08", desc: "Manual breaker for Rack 4 is locked out by Ajay." },
      { time: "23:14", desc: "Emergency Bypass Relay triggered remotely from IP 10.0.4.55." },
      { time: "01:15", desc: "Victim discovered by night security." }
    ],
    people: {
      "char_ajay": {
        id: "char_ajay", name: "Ajay Desai", role: "Victim / DevOps Lead",
        statement: "N/A (Deceased). Known for strict adherence to safety protocols.",
        notes: "His terminal logs show he was digging into legacy API code just before death."
      },
      "char_neha": {
        id: "char_neha", name: "Neha Sharma", role: "VP Engineering",
        statement: "I left the office around 20:00. Ajay was a brilliant engineer. Only senior staff have VPN access to the relays, but the logs will prove I wasn't logged in.",
        notes: "Contradiction: She claims she left at 20:00, but her access badge didn't scan out. Her IP matches the relay bypass."
      },
      "char_rahul": {
        id: "char_rahul", name: "Rahul Mehta", role: "Junior Sysadmin",
        statement: "I was in the hallway at 19:42, yeah. But I didn't go into Room B. I went into the storage closet to take a nap. I didn't hear anything over the server fans.",
        notes: "Seems evasive, but CCTV confirms he never entered Room B."
      }
    },
    evidence: {
      "ev_wristband": {
        id: "ev_wristband", type: "PHYSICAL", title: "Anti-static Wristband", source: "Victim's wrist", reliability: "HIGH",
        desc: "Standard issue ESD wristband recovered from victim's left wrist. The plastic housing looks slightly scratched.",
        insight: "FORENSIC ANALYSIS: The 1-megaohm safety resistor has been removed and replaced with a solid copper wire. This bypasses the safety mechanism, turning the wearer into a perfect ground path. Lethal if exposed to current."
      },
      "ev_power_logs": {
        id: "ev_power_logs", type: "DIGITAL", title: "Rack 4 Power Logs", source: "Facility Management System", reliability: "HIGH",
        desc: "Automated logs showing power states for Server Room B.",
        insight: "23:08:00 - Breaker 4 manually set to OFF.\n23:14:02 - EMERGENCY_BYPASS_RELAY_4 triggered remotely.\n23:14:03 - Massive power surge recorded on Rack 4 chassis."
      },
      "ev_vpn_logs": {
        id: "ev_vpn_logs", type: "DIGITAL", title: "VPN Access Logs", source: "Core Router", reliability: "HIGH",
        desc: "Logs showing remote network access between 23:00 and 00:00.",
        insight: "23:13:45 - Connection established from IP 10.0.4.55 (Assigned to Neha Sharma's corporate laptop).\n23:14:02 - Command executed: 'override-relay-4'.\n23:14:10 - Connection terminated."
      },
      "ev_drive": {
        id: "ev_drive", type: "DIGITAL", title: "Encrypted USB Drive", source: "Victim's locker", reliability: "HIGH",
        desc: "A personal USB drive belonging to Ajay. It was heavily encrypted.",
        insight: "DECRYPTED CONTENTS: A text file named 'api_audit.txt'. It details an unauthorized script siphoning fractions of cents from billing transactions. The script's authorization keys belong to Neha Sharma."
      },
      "ev_phishing": {
        id: "ev_phishing", type: "DIGITAL", title: "Phishing Email Alert", source: "IT Security", reliability: "MEDIUM",
        desc: "An alert showing a phishing email was sent to all DevOps staff at 14:00 that day.",
        insight: "None of the staff clicked the link. This appears to be an unrelated background event (Red Herring)."
      }
    }
  },

  "NOX-1146": {
    meta: {
      id: "NOX-1146",
      title: "The Silent Apartment",
      type: "Suspicious Death",
      location: "Mumbai",
      date: "12 November 2026",
      difficulty: "8/10",
      status: "Available"
    },
    truth: {
      what: "Accidental medication overdose mixed with an unrelated burglary.",
      who: "Dr. Aris (overprescribed) / Victim (accidental double dose) / Kiran (unrelated burglar).",
      how: "Victim took twice her sleeping medication due to confusion. An opportunistic burglar entered through the balcony, saw the dead body, panicked, and fled.",
      why: "Tragic accident + Crime of opportunity.",
      red_herrings: ["The burglar's footprints make it look like a break-in murder.", "The victim's ex-husband sent a threatening text the day before."],
      unresolved: "The exact time the burglar realized she was dead."
    },
    brief: {
      what: "Priya Rao (62) was found dead in her locked 8th-floor apartment. The balcony door was forced open. Drawers in the bedroom were ransacked.",
      assessment: "Initial police theory is a home invasion turned violent. However, there is no blood and no apparent signs of struggle on the body.",
      objective: "Determine the exact cause of death and sequence of events. Separate the medical facts from the physical crime scene."
    },
    scene: {
      location: "8th Floor Apartment, Bandra West",
      observations: [
        "Balcony sliding door lock is broken from the outside.",
        "Muddy footprints lead from the balcony to the bedroom.",
        "Victim is in bed, appearing to be peacefully asleep.",
        "Jewelry box on the dresser is emptied. Drawers are pulled out.",
        "Two empty blister packs of Zolpidem (sleeping pills) on the nightstand."
      ]
    },
    timeline: [
      { time: "20:00", desc: "Priya speaks to her daughter on the phone. Sounds slightly confused." },
      { time: "21:30", desc: "Estimated time Priya ingested the first dose of Zolpidem." },
      { time: "22:45", desc: "Estimated time of accidental second dose ingestion (Tox report window)." },
      { time: "23:30", desc: "Estimated time of death due to respiratory depression." },
      { time: "02:15", desc: "CCTV shows an unidentified figure scaling the lower balconies." },
      { time: "02:40", desc: "Burglar enters Priya's apartment." },
      { time: "02:45", desc: "Burglar flees rapidly, dropping a gold chain on the balcony." }
    ],
    people: {
      "char_priya": {
        id: "char_priya", name: "Priya Rao", role: "Victim",
        statement: "N/A (Deceased)",
        notes: "Recently diagnosed with early-stage dementia. Prone to forgetting if she took her medication."
      },
      "char_kiran": {
        id: "char_kiran", name: "Kiran 'Spider' Patil", role: "Known local burglar",
        statement: "I didn't touch her! I broke in, yeah. I opened the drawers. Then I looked at the bed and she wasn't breathing. She was already cold! I panicked and ran.",
        notes: "His statement matches the timeline. He was there at 02:40. She died at 23:30."
      },
      "char_dr_aris": {
        id: "char_dr_aris", name: "Dr. Aris Varghese", role: "Victim's Physician",
        statement: "I prescribed her Zolpidem for her insomnia. Standard dosage. I warned her daughter to monitor it.",
        notes: "Contradiction: Pharmacy records show he authorized a double-strength refill just three days ago without noting it in her chart."
      }
    },
    evidence: {
      "ev_tox_report": {
        id: "ev_tox_report", type: "MEDICAL", title: "Toxicology Report", source: "Coroner", reliability: "HIGH",
        desc: "Blood analysis of the victim.",
        insight: "Cause of death: Respiratory depression secondary to acute Zolpidem toxicity. Blood concentration is 4x the normal therapeutic dose. No defensive wounds. Lividity indicates she died in the exact position she was found."
      },
      "ev_cctv_balcony": {
        id: "ev_cctv_balcony", type: "CCTV", title: "Street CCTV (Balcony View)", source: "Building Security", reliability: "HIGH",
        desc: "Camera pointing at the exterior of the building.",
        insight: "02:15 AM - A person is seen climbing the exterior drain pipe to the 8th floor.\n02:45 AM - The same person climbs down much faster, slipping near the bottom and sprinting away."
      },
      "ev_phone_logs": {
        id: "ev_phone_logs", type: "DIGITAL", title: "Victim's Phone", source: "Scene", reliability: "HIGH",
        desc: "Texts and call history.",
        insight: "20:00 - Call with daughter (15 mins).\n18:00 - Angry text from ex-husband: 'You'll regret cutting me out of the will.' (Red Herring: He was verified to be on a flight to Dubai at 22:00)."
      },
      "ev_footprints": {
        id: "ev_footprints", type: "PHYSICAL", title: "Muddy Footprints", source: "Scene", reliability: "HIGH",
        desc: "Footprints found inside the apartment.",
        insight: "The footprints belong to Kiran. Crucially, the footprints DO NOT approach the bed. They go directly to the dresser, and then turn sharply back to the balcony. This corroborates his story that he didn't touch her."
      }
    }
  },

  "NOX-1147": {
    meta: {
      id: "NOX-1147",
      title: "The Missing Ledger",
      type: "Financial Fraud",
      location: "Bengaluru",
      date: "28 August 2026",
      difficulty: "6/10",
      status: "Available"
    },
    truth: {
      what: "Staged data breach to cover up internal embezzlement.",
      who: "Vikram Singh (CFO)",
      how: "Created a script to wipe the offshore ledger servers, then blamed it on an external ransomware group.",
      why: "He had siphoned 400 million INR over two years and the annual audit was three days away.",
      red_herrings: ["An actual Russian ransomware group scanned their firewall that week.", "The IT Lead's credentials were used (they were stolen by the CFO)."],
      unresolved: "Where the 400 million INR is currently hidden."
    },
    brief: {
      what: "Apex Logistics reported a massive ransomware attack on their offshore accounting servers. The entire Q3 ledger was wiped.",
      assessment: "The company claims a Russian syndicate known as 'DarkByte' breached their systems and destroyed the backups.",
      objective: "Determine if this was a genuine external breach or an internal cover-up. Identify who executed the wipe."
    },
    scene: {
      location: "Apex Logistics Server Infrastructure (Digital Scene)",
      observations: [
        "Primary database: Wiped.",
        "Backup Server A: Wiped.",
        "Backup Server B (Offline tape): Intact, but missing the last 6 months of data.",
        "Ransom note left on the domain controller."
      ]
    },
    timeline: [
      { time: "Aug 25, 09:00", desc: "Annual audit scheduled for Aug 31 is officially announced to the board." },
      { time: "Aug 27, 14:00", desc: "External firewall logs show automated scanning from Russian IPs (DarkByte)." },
      { time: "Aug 27, 23:45", desc: "Internal login to the Backup Server using IT Lead's credentials." },
      { time: "Aug 28, 00:15", desc: "Wipe script executed locally from within the executive subnet." },
      { time: "Aug 28, 00:20", desc: "Ransom note generated." },
      { time: "Aug 28, 06:00", desc: "Breach discovered by morning shift." }
    ],
    people: {
      "char_vikram": {
        id: "char_vikram", name: "Vikram Singh", role: "Chief Financial Officer",
        statement: "This is a disaster. DarkByte has ruined us. I've told the IT department a hundred times to upgrade our security. Now the audit is ruined.",
        notes: "Motive: He is in charge of the missing money. Opportunity: His office is in the executive subnet."
      },
      "char_tara": {
        id: "char_tara", name: "Tara Menon", role: "IT Lead",
        statement: "They used my credentials! I swear I didn't do it. I was at home asleep. The logs say my account logged in, but it wasn't from my machine.",
        notes: "Her credentials were used, but from an internal IP, not external."
      }
    },
    evidence: {
      "ev_firewall": {
        id: "ev_firewall", type: "DIGITAL", title: "Firewall Logs", source: "Edge Router", reliability: "HIGH",
        desc: "External traffic logs.",
        insight: "Shows port scanning from known DarkByte IPs on Aug 27 at 14:00. However, ZERO data was transferred in or out. The attack was repelled by the automated firewall. They never got in."
      },
      "ev_auth_logs": {
        id: "ev_auth_logs", type: "DIGITAL", title: "Internal Auth Logs", source: "Domain Controller", reliability: "HIGH",
        desc: "Active Directory authentication logs.",
        insight: "Tara's admin account logged in at 23:45. The connection originated from IP 192.168.1.15. This IP belongs to the CFO's personal office desktop on the executive floor."
      },
      "ev_ransom_note": {
        id: "ev_ransom_note", type: "DOCUMENT", title: "Ransomware Note", source: "Server", reliability: "HIGH",
        desc: "The text file left by the 'hackers'.",
        insight: "Linguistic analysis: The note uses the phrase 'revert back with the payment'. This is a distinctively Indian corporate idiom, rarely used by Russian ransomware groups. It is poorly faked."
      },
      "ev_audit_memo": {
        id: "ev_audit_memo", type: "DOCUMENT", title: "Audit Announcement Memo", source: "HR Email", reliability: "MEDIUM",
        desc: "Email sent to all executives on Aug 25.",
        insight: "Announces a surprise deep forensic audit of the offshore ledgers. Gives Vikram exactly 3 days' notice before his embezzlement would be discovered."
      }
    }
  }
};
