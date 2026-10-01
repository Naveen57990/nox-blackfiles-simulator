export const CASES = {
  "NOX-1145": {
    meta: {
      id: "NOX-1145",
      title: "The Server Room Sabotage",
      type: "Cybercrime / Corporate Sabotage",
      location: "Hyderabad, Telangana",
      date: "04 October 2026",
      difficulty: "8/10",
      status: "Available"
    },
    truth: {
      what: "Premeditated murder via electrical override.",
      who: "Neha Sharma (VP Engineering)",
      how: "Neha physically tampered with Ajay's ESD wristband earlier in the day, replacing the 1-megaohm safety resistor with solid copper. Later that night, while Ajay was working on Rack 4 (with the manual breaker off), she used her executive VPN access from her home to trigger the emergency bypass relay, surging 240V directly through the rack and into Ajay's grounded wristband.",
      why: "Ajay had discovered a micro-embezzlement script embedded in the legacy billing API. Neha was siphoning funds and Ajay's upcoming audit would expose her.",
      red_herrings: ["Rahul Mehta sleeping in the adjacent closet.", "A generic phishing email hitting the server."],
      unresolved: "The physical location where Neha acquired the copper wire, and whether any accomplices helped write the embezzlement script.",
      proven: "The VPN IP matches Neha's home network; the script's auth keys belong to Neha; the physical tampering of the wristband is forensically confirmed."
    },
    brief: {
      what: "CASE BACKGROUND\n\nOn the morning of 05 October 2026, Cyberabad Police received an emergency call from Apex Datacenters located in Hitec City, Hyderabad. The facility manager reported finding an employee deceased inside Server Room B.\n\nThe victim was identified as Ajay Desai (34), the Lead DevOps Engineer for Apex. Initial assessment by first responders suggested a catastrophic industrial accident—electrocution during routine hardware maintenance.\n\nHowever, preliminary reviews of the facility's power logs showed an anomaly regarding the emergency relay systems. The Cybercrime division was called in to investigate potential corporate sabotage.",
      assessment: "INITIAL REPORT\n\nDate of Report: 05 October 2026, 06:30 HRS\nReporting Officer: Insp. V. Kumar\n\nOfficers arrived on scene at 01:45 HRS. Victim found supine adjacent to Server Rack 4. No vital signs. Severe burns noted on the right index finger and left wrist, consistent with high-voltage electrical entry and exit wounds. The manual power breaker for Rack 4 was observed to be in the OFF (locked out) position, strictly following maintenance protocol.\n\nThe investigation aims to determine how lethal voltage was delivered to an isolated rack, and whether human intent was involved.",
      objective: "Read all statements, forensic reports, and digital logs. Cross-reference timelines to determine if this was an accident or murder, and identify the responsible party."
    },
    scene: {
      location: "Server Room B, 4th Floor, Apex Datacenters, Hitec City",
      observations: [
        "SCENE DOCUMENTATION:",
        "Server Room B is a 400 sq.ft secure climate-controlled environment containing 12 server racks.",
        "Access is restricted via biometric (fingerprint) and RFID badge entry. Only IT staff have physical access.",
        "The room lacks internal CCTV coverage due to corporate privacy policies regarding proprietary hardware handling, though the external hallway has a camera (Cam-04).",
        "The victim, Ajay Desai, was found lying face-up between Rack 3 and Rack 4.",
        "He was wearing a standard blue anti-static (ESD) wristband on his left wrist, clipped to the grounded metal chassis of Rack 4.",
        "A toolkit was open on the floor next to him.",
        "The manual breaker switch for Rack 4 (located on the wall panel) was flipped to the OFF position and secured with a standard lockout tag bearing Ajay's signature.",
        "SEIZED MATERIAL:",
        "EX-01: ESD Wristband (from victim's left wrist).",
        "EX-02: Victim's corporate laptop (found on a crash cart nearby).",
        "EX-03: Facility Power Logs (digital extraction).",
        "EX-04: Network VPN Logs (digital extraction)."
      ]
    },
    timeline: [
      { time: "04 Oct, 18:30", desc: "Most day-shift staff leave the building." },
      { time: "04 Oct, 19:42", desc: "Hallway CCTV shows Rahul Mehta entering the Server Room B exterior hallway." },
      { time: "04 Oct, 20:15", desc: "Access Badge logs show Neha Sharma exiting the main lobby turnstiles." },
      { time: "04 Oct, 22:15", desc: "Ajay's terminal logs show him initiating a local audit on the 'Billing_API_v2' repository." },
      { time: "04 Oct, 23:05", desc: "Hallway CCTV shows Ajay Desai entering Server Room B." },
      { time: "04 Oct, 23:08", desc: "Facility logs: Manual breaker for Rack 4 is switched to OFF." },
      { time: "04 Oct, 23:14", desc: "Facility logs: Emergency Bypass Relay 4 is triggered." },
      { time: "04 Oct, 23:18", desc: "Hallway CCTV shows Rahul Mehta leaving the exterior hallway." },
      { time: "05 Oct, 01:15", desc: "Night security discovers the body." }
    ],
    people: {
      "char_neha": {
        id: "char_neha", name: "Neha Sharma", role: "Vice President of Engineering",
        statement: "STATEMENT OF NEHA SHARMA\nDate: 05 October 2026, 14:00 HRS\nLocation: Cyberabad Commissionerate\n\n\"I am currently employed as VP of Engineering. Ajay was one of my best leads. On the evening of October 4th, I remained in the office late to finalize the Q4 deployment schedule. I believe I left around 8:00 PM. I drove straight home and went to sleep.\n\nAjay was scheduled to do routine maintenance on Rack 4. It's a tragedy, but accidents happen when dealing with high-voltage industrial equipment. Yes, I have administrative access to the network relays—as do all senior managers—but I certainly didn't log in that night. If my account was used, someone must have spoofed my IP or stolen my credentials.\"",
        notes: "She is calm and collected. Claims she went straight home at 20:00 (Badge logs confirm she left the building at 20:15). She pre-emptively brought up IP spoofing without being prompted about the VPN logs."
      },
      "char_rahul": {
        id: "char_rahul", name: "Rahul Mehta", role: "Junior Sysadmin",
        statement: "STATEMENT OF RAHUL MEHTA\nDate: 05 October 2026, 15:30 HRS\n\n\"Look, I was in the hallway, yes. From around 7:45 PM until maybe 11:15 PM. But I didn't go into Server Room B! I was exhausted from a 14-hour shift, so I went into the storage closet across the hall to take a nap where the managers wouldn't see me. \n\nI didn't hear anything over the sound of the server fans. I woke up, walked out, and went home. I didn't even know Ajay was in the building. I don't have the biometric clearance to open Room B anyway.\"",
        notes: "Nervous. Hallway CCTV confirms he entered the hallway at 19:42 and left at 23:18. The storage closet does not have camera coverage. He does NOT have biometric access to Room B."
      },
      "char_ajay": {
        id: "char_ajay", name: "Ajay Desai", role: "Victim (DevOps Lead)",
        statement: "N/A (Deceased).",
        notes: "Known by colleagues as a 'stickler for safety'. He wrote the company's lockout/tagout manual."
      }
    },
    evidence: {
      "ev_wristband_fsl": {
        id: "ev_wristband_fsl", type: "FORENSIC", title: "FSL Report: EX-01 (ESD Wristband)", source: "Forensic Science Laboratory", reliability: "HIGH",
        desc: "Forensic Examination Report for the blue anti-static wristband recovered from the victim.",
        insight: "EXHIBIT: EX-01 (Anti-static wrist strap)\nDATE OF EXAM: 05 Oct 2026\nMETHOD: Microscopic inspection, Ohmmeter testing.\n\nOBSERVATIONS:\nStandard ESD wristbands contain a 1-megaohm safety resistor to prevent lethal electric shock if the wearer accidentally touches a live circuit. \n\nUpon disassembly of EX-01's plastic housing, analysts noted tool marks consistent with a small flathead screwdriver. The factory resistor had been unsoldered and completely removed. In its place, a solid copper wire (approx 1.5mm diameter) was soldered bridging the connection.\n\nCONCLUSION:\nThis modification completely bypassed the safety mechanism, turning the wristband into a perfect ground path with zero resistance. If the wearer touched a live current, the electricity would flow directly through them to ground. This tampering was deliberate and required soldering equipment."
      },
      "ev_power_logs": {
        id: "ev_power_logs", type: "DIGITAL", title: "Facility Power Logs", source: "Apex Datacenter Automation", reliability: "HIGH",
        desc: "Automated CSV export of power states for Server Room B.",
        insight: "TIMESTAMP | EVENT | SOURCE\n23:05:12 | DOOR_UNLOCK | BIOMETRIC_DESAI_A\n23:08:01 | RACK_4_BREAKER_MANUAL_OFF | WALL_PANEL\n23:14:02 | EMERGENCY_BYPASS_RELAY_4_TRIGGERED | API_REMOTE_CMD\n23:14:03 | RACK_4_VOLTAGE_SPIKE_240V | SENSOR_R4\n23:14:05 | RACK_4_CIRCUIT_TRIP | AUTO_FAILSAFE\n\nANALYSIS: The manual breaker was correctly turned off by the victim. Six minutes later, a software command triggered the 'Emergency Bypass Relay', which overrides the manual breaker and forces power to the rack. This cannot happen accidentally."
      },
      "ev_vpn_logs": {
        id: "ev_vpn_logs", type: "DIGITAL", title: "VPN Auth Records", source: "Core Cisco Router", reliability: "HIGH",
        desc: "Authentication and session logs for the management VPN.",
        insight: "SESSION ID: V-8892\nSTART TIME: 04 Oct 23:13:45\nEND TIME: 04 Oct 23:14:10\nUSER: admin_sharma_n\nIP ADDRESS: 122.161.45.192 (ISP: Airtel Broadband)\n\nCOMMAND HISTORY:\n23:13:58 - sudo su\n23:14:02 - ./sys_override.sh -rack 4 -force_relay\n\nNOTES: A lookup of the IP address (122.161.45.192) reveals it is the static home IP address registered to Neha Sharma's residence in Jubilee Hills. The commands executed perfectly match the power log anomaly."
      },
      "ev_laptop": {
        id: "ev_laptop", type: "DIGITAL", title: "Victim's Laptop (EX-02)", source: "Scene", reliability: "HIGH",
        desc: "Data extraction from Ajay's corporate machine.",
        insight: "FILE FOUND: 'api_audit_notes_DRAFT.txt' (Last modified 04 Oct 22:45)\n\nCONTENTS:\n'I've been tracing the micro-transactions on the legacy billing API. Someone injected a routing script (sha256 hash attached) that skims 0.01% of all batch transfers into an offshore dummy account. I checked the commit history. The auth keys used to deploy the script belong to Neha. I am going to pull the physical server logs from Rack 4 tonight to verify the hardware cache before I go to HR.'\n\nANALYSIS: This establishes a clear, immediate motive. Ajay was gathering undeniable physical proof of embezzlement just before he was killed."
      }
    }
  },

  "NOX-1146": {
    meta: {
      id: "NOX-1146",
      title: "The Silent Apartment",
      type: "Suspicious Death / Burglary",
      location: "Bandra West, Mumbai",
      date: "12 November 2026",
      difficulty: "8/10",
      status: "Available"
    },
    truth: {
      what: "Accidental medical overdose overlaid with a crime of opportunity.",
      who: "Dr. Aris Varghese (Medical Negligence) / Kiran Patil (Burglary)",
      how: "Priya Rao, suffering from early dementia, accidentally took a double dose of a highly concentrated sleeping pill prescribed negligently by Dr. Aris. She died peacefully at 23:30. Hours later, at 02:40, a local burglar (Kiran) scaled the balcony, broke in, stole jewelry, realized she was dead, and fled in a panic.",
      why: "Medical error compounded by unrelated theft.",
      red_herrings: ["The burglar's footprints make it look like a home invasion murder.", "A threatening text from an ex-husband."],
      unresolved: "None.",
      proven: "Tox report proves time of death at 23:30. CCTV proves burglar entered at 02:40. Therefore, the burglar could not have killed her."
    },
    brief: {
      what: "CASE BACKGROUND\n\nOn the morning of 12 November 2026, a housekeeper discovered 62-year-old Priya Rao deceased in her 8th-floor apartment in Bandra West. The apartment showed clear signs of a violent break-in: the sliding balcony door was shattered, and the bedroom dresser had been ransacked.\n\nLocal police initially registered it as a home invasion resulting in homicide. However, the complete lack of defensive wounds or physical trauma on the victim has raised questions, prompting a deeper review.",
      assessment: "INITIAL REPORT\n\nThe victim was found in her bed, positioned as if peacefully sleeping. The jewelry box on her dresser was emptied. Two empty blister packs of Zolpidem (a powerful sedative) were found on the nightstand. Muddy footprints lead from the balcony to the dresser, but crucially, do not approach the bed itself.",
      objective: "Reconstruct the timeline of the evening. Determine the exact cause of death and whether the burglary and the death are causally linked."
    },
    scene: {
      location: "Apt 804, Sea View Towers, Bandra West",
      observations: [
        "SCENE DOCUMENTATION:",
        "Balcony sliding glass door is shattered near the lock. Glass fragments are entirely inside the apartment, indicating forced entry from the outside.",
        "Muddy footprints (size 9 sneaker) enter from the balcony, proceed directly to the wooden dresser, and then retreat quickly back to the balcony.",
        "The footprints do NOT approach the bed where the victim was found.",
        "A gold chain was found dropped on the balcony floor.",
        "Victim is in bed under the covers. No signs of struggle. No lividity shifts.",
        "Nightstand contains a glass of water and two empty 10mg Zolpidem blister packs."
      ]
    },
    timeline: [
      { time: "11 Nov, 18:00", desc: "Text message received from ex-husband." },
      { time: "11 Nov, 20:00", desc: "Priya speaks to her daughter on the phone for 15 minutes." },
      { time: "11 Nov, 23:30", desc: "Estimated time of death based on rigor and lividity." },
      { time: "12 Nov, 02:15", desc: "Street CCTV shows a figure scaling the exterior balconies." },
      { time: "12 Nov, 02:40", desc: "Estimated time burglar broke the balcony glass." },
      { time: "12 Nov, 02:45", desc: "Street CCTV shows the figure rapidly descending and fleeing." }
    ],
    people: {
      "char_daughter": {
        id: "char_daughter", name: "Ananya Rao", role: "Victim's Daughter",
        statement: "STATEMENT OF ANANYA RAO\n\n\"I spoke to my mother at 8:00 PM. She sounded a bit confused, slurring her words slightly. She was recently diagnosed with early-stage dementia. She often forgot if she had taken her medication. I told her doctor, Dr. Aris, to lower her dosage, but he never listens.\"",
        notes: "Confirms victim's confused state and memory issues regarding medication."
      },
      "char_kiran": {
        id: "char_kiran", name: "Kiran 'Spider' Patil", role: "Known Burglar",
        statement: "STATEMENT OF KIRAN PATIL (Arrested trying to pawn the jewelry)\n\n\"Look, I'll admit the theft. I scaled the pipe, broke the glass, and went straight for the dresser. But I didn't touch the old lady! I thought she was a heavy sleeper. After I grabbed the gold, I looked over and... she wasn't breathing. Her face was pale. She was already dead! I panicked, dropped a chain, and ran.\"",
        notes: "Admits to the break-in. Denies murder. His story aligns with the footprint evidence (not approaching the bed)."
      },
      "char_aris": {
        id: "char_aris", name: "Dr. Aris Varghese", role: "Victim's Physician",
        statement: "STATEMENT OF DR. ARIS VARGHESE\n\n\"I prescribed Priya standard 5mg Zolpidem for insomnia. I strictly warned her daughter to monitor the dosage. It is not my fault if the patient abused the medication.\"",
        notes: "Defensive. Claims he prescribed 5mg."
      }
    },
    evidence: {
      "ev_tox_report": {
        id: "ev_tox_report", type: "MEDICAL", title: "Post-Mortem & Toxicology", source: "Mumbai Coroner", reliability: "HIGH",
        desc: "Full autopsy and blood analysis.",
        insight: "AUTOPSY FINDINGS:\nNo blunt force trauma. No petechial hemorrhaging (rules out asphyxiation). Rigor mortis and algor mortis place the time of death firmly between 23:00 and 00:00.\n\nTOXICOLOGY:\nBlood analysis reveals a Zolpidem concentration of 200 ng/mL, consistent with the ingestion of at least 20mg of the drug. Cause of death is respiratory depression secondary to acute Zolpidem toxicity.\n\nCONCLUSION: The victim died of an overdose at approximately 23:30, roughly three hours before the burglary occurred."
      },
      "ev_pharmacy": {
        id: "ev_pharmacy", type: "DOCUMENT", title: "Pharmacy Dispensing Record", source: "Apollo Pharmacy", reliability: "HIGH",
        desc: "Prescription records for Priya Rao.",
        insight: "DATE: 08 Nov 2026\nPRESCRIBER: Dr. Aris Varghese\nMEDICATION: Zolpidem 10mg tablets.\nQUANTITY: 30\n\nCONTRADICTION: Dr. Aris stated he prescribed 5mg tablets. The pharmacy records, signed by him, show he prescribed 10mg tablets. If the victim, suffering from dementia, took two pills forgetting she had already taken one, she ingested 20mg—a fatal dose for a frail 62-year-old."
      },
      "ev_cctv": {
        id: "ev_cctv", type: "CCTV", title: "Street Camera 04", source: "Building Exterior", reliability: "HIGH",
        desc: "Footage of the exterior drain pipes.",
        insight: "02:15 AM: An unidentified athletic male is seen scaling the exterior pipes from the ground floor up to the 8th floor.\n02:45 AM: The same male descends the pipe rapidly, slips on the 2nd floor, drops to the ground, and sprints away into an alley.\n\nANALYSIS: This firmly establishes the timeline of the burglary. The burglar was not in the apartment during the victim's time of death (23:30)."
      },
      "ev_phone": {
        id: "ev_phone", type: "DIGITAL", title: "Victim's Phone Extractions", source: "Scene", reliability: "MEDIUM",
        desc: "SMS history.",
        insight: "11 Nov, 18:00 - SMS from Ex-Husband: 'You'll regret cutting me out of the will.'\n\nINVESTIGATOR NOTE: We checked the ex-husband's alibi. Flight manifests and immigration records prove he boarded Emirates Flight EK501 to Dubai at 17:30, using in-flight Wi-Fi to send the text. He is completely ruled out as a physical suspect."
      }
    }
  },

  "NOX-1147": {
    meta: {
      id: "NOX-1147",
      title: "The Missing Ledger",
      type: "Financial Fraud / Cybercrime",
      location: "Bengaluru, Karnataka",
      date: "28 August 2026",
      difficulty: "7/10",
      status: "Available"
    },
    truth: {
      what: "Internal corporate sabotage staged to look like a Russian ransomware attack.",
      who: "Vikram Singh (Chief Financial Officer)",
      how: "Vikram Singh stole the IT Lead's (Tara Menon) credentials. He used them from his own office desktop (IP 192.168.1.15) to execute a wipe script on the Q3 ledger to destroy evidence of his embezzlement, and left a fake ransomware note.",
      why: "To hide massive financial irregularities before the upcoming surprise audit.",
      red_herrings: ["Actual Russian port scanning on the firewall.", "Tara Menon's credentials being used."],
      unresolved: "Where the embezzled funds were actually routed.",
      proven: "The internal IP address (192.168.1.15) maps to the CFO's personal desktop; linguistic analysis of the ransom note points to an Indian author ('revert back'); the firewall repelled the external Russian scan."
    },
    brief: {
      what: "CASE BACKGROUND\n\nApex Logistics reported a massive ransomware attack on their offshore accounting servers. The entire Q3 ledger was wiped. The company claims a Russian syndicate known as 'DarkByte' breached their systems and destroyed the backups.",
      assessment: "INITIAL REPORT\n\nThe breach occurred just 3 days before a scheduled surprise audit of the offshore accounts.",
      objective: "Determine if this was an external breach or an internal cover-up."
    },
    scene: { location: "Apex Logistics HQ, Bengaluru", observations: [] },
    timeline: [
      { time: "27 Aug, 14:00", desc: "Firewall detects and blocks Russian IP scan." },
      { time: "27 Aug, 23:45", desc: "Tara Menon's admin account logs in from internal IP 192.168.1.15." },
      { time: "28 Aug, 00:15", desc: "Wipe script executed on Q3 ledger." }
    ],
    people: {
      "char_vikram": { id: "char_vikram", name: "Vikram Singh", role: "Chief Financial Officer" },
      "char_tara": { id: "char_tara", name: "Tara Menon", role: "IT Lead" }
    },
    evidence: {
      "ev_logs": { id: "ev_logs" },
      "ev_note": { id: "ev_note" }
    }
  }
};
