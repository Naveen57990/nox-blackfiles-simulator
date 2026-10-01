const fs = require('fs');

const css = `
  body {
    background-color: #525659;
    margin: 0;
    padding: 40px 0;
    font-family: "Times New Roman", Times, serif;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    background: white;
    margin: 0 auto 20px auto;
    box-shadow: 0 4px 10px rgba(0,0,0,0.5);
    padding: 25.4mm;
    box-sizing: border-box;
    color: black;
    position: relative;
    page-break-after: always;
  }
  h1, h2, h3, h4 { font-family: "Arial", sans-serif; text-transform: uppercase; }
  .header { text-align: center; border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 30px; }
  .header h1 { margin: 0; font-size: 24px; }
  .header p { margin: 5px 0 0 0; font-family: "Arial", sans-serif; font-size: 12px; }
  .confidential { color: #d32f2f; font-weight: bold; font-family: Arial, sans-serif; border: 2px solid #d32f2f; display: inline-block; padding: 5px 10px; transform: rotate(-5deg); position: absolute; top: 30px; right: 30px; }
  .content { font-size: 11pt; line-height: 1.5; text-align: justify; }
  .table { width: 100%; border-collapse: collapse; margin: 20px 0; font-family: Arial, sans-serif; font-size: 10pt; }
  .table th, .table td { border: 1px solid black; padding: 8px; text-align: left; }
  .table th { background-color: #f0f0f0; }
  .transcript { margin-left: 20px; font-family: "Courier New", Courier, monospace; font-size: 10pt; }
  .q { font-weight: bold; margin-top: 15px; }
  .a { margin-bottom: 15px; }
  .footer { position: absolute; bottom: 20mm; left: 25.4mm; right: 25.4mm; font-family: Arial, sans-serif; font-size: 9pt; border-top: 1px solid #ccc; padding-top: 5px; display: flex; justify-content: space-between; }
`;

function buildPage(content, title, pageNum) {
  return `
<div class="page">
  ${pageNum === 1 ? '<div class="confidential">CONFIDENTIAL<br>EYES ONLY</div>' : ''}
  ${title ? `<div class="header"><h1>${title}</h1></div>` : ''}
  <div class="content">
    ${content}
  </div>
  <div class="footer">
    <span>CYBERABAD POLICE COMMISSIONERATE</span>
    <span>PAGE ${pageNum}</span>
  </div>
</div>`;
}

// NOX-1145
const nox1145 = `<!DOCTYPE html><html lang="en"><head><title>NOX-1145 DOSSIER</title><style>${css}</style></head><body>` + 
buildPage(`
  <div style="text-align: center; margin-top: 100px;">
    <h1 style="font-size: 36px; margin-top: 40px;">INVESTIGATION DOSSIER</h1>
    <h2 style="font-size: 24px; color: #444;">CASE FILE: NOX-1145</h2>
    <div style="margin-top: 80px; font-size: 14pt; line-height: 2;">
      <strong>SUBJECT:</strong> THE SERVER ROOM SABOTAGE<br>
      <strong>JURISDICTION:</strong> HITEC CITY, HYDERABAD<br>
      <strong>CLASSIFICATION:</strong> CYBERCRIME / HOMICIDE<br>
    </div>
  </div>
`, null, 1) + 
buildPage(`
  <h3>FIRST INFORMATION REPORT (FIR)</h3>
  <p><strong>Date & Time of Occurrence:</strong> 04 Oct 2026, 23:14 HRS.</p>
  <p><strong>Place of Occurrence:</strong> Server Room B, Apex Datacenters, Hitec City.</p>
  <p><strong>Complainant:</strong> Facility Night Manager.</p>
  <p><strong>Brief Facts:</strong> At approx 01:15 HRS, night security discovered Ajay Desai (34), DevOps Lead, unresponsive adjacent to Server Rack 4. Severe electrical burns were noted on his right index finger and left wrist. The manual breaker for Rack 4 was observed to be in the OFF position, secured with a standard lockout tag. Facility power logs indicate an anomaly regarding the emergency relay systems.</p>
`, 'SECTION 01: FIR', 2) + 
buildPage(`
  <h3>SCENE DOCUMENTATION</h3>
  <p>Server Room B is a secure climate-controlled environment. Access is restricted via biometric fingerprint scanners. The room lacks internal CCTV coverage. The victim was found wearing a blue anti-static (ESD) wristband, clipped to the grounded metal chassis of Rack 4.</p>
  <h3>SEIZURE MEMO</h3>
  <table class="table">
    <tr><th>EXHIBIT ID</th><th>DESCRIPTION</th><th>LOCATION</th></tr>
    <tr><td>EX-01</td><td>Anti-static Wristband</td><td>Victim's left wrist</td></tr>
    <tr><td>EX-02</td><td>Victim's Corporate Laptop</td><td>Crash cart near Rack 4</td></tr>
    <tr><td>EX-03</td><td>Facility Power Logs</td><td>Digital Extraction</td></tr>
    <tr><td>EX-04</td><td>VPN Access Logs</td><td>Digital Extraction</td></tr>
  </table>
`, 'SECTION 02: SCENE REGISTER', 3) + 
buildPage(`
  <h3>FORENSIC EXAMINATION: EX-01 (WRISTBAND)</h3>
  <p><strong>Method:</strong> Microscopic inspection, Ohmmeter testing.</p>
  <p><strong>Observations:</strong> Standard ESD wristbands contain a 1-megaohm safety resistor to prevent lethal electric shock. Upon disassembly of EX-01, tool marks consistent with a flathead screwdriver were noted. The factory resistor had been unsoldered and removed. In its place, a solid copper wire (1.5mm diameter) was soldered bridging the connection.</p>
  <p><strong>Conclusion:</strong> This modification bypassed the safety mechanism, turning the wristband into a perfect ground path with zero resistance. If the wearer touched a live current, electricity would flow directly through them. This tampering was deliberate.</p>
`, 'SECTION 03: FORENSIC REPORTS', 4) +
buildPage(`
  <h3>FACILITY POWER LOGS (EX-03)</h3>
  <table class="table">
    <tr><th>TIMESTAMP</th><th>EVENT</th><th>SOURCE</th></tr>
    <tr><td>23:05:12</td><td>DOOR_UNLOCK</td><td>BIOMETRIC_DESAI_A</td></tr>
    <tr><td>23:08:01</td><td>RACK_4_BREAKER_MANUAL_OFF</td><td>WALL_PANEL</td></tr>
    <tr><td>23:14:02</td><td>EMERGENCY_BYPASS_RELAY_4_TRIGGERED</td><td>API_REMOTE_CMD</td></tr>
    <tr><td>23:14:03</td><td>RACK_4_VOLTAGE_SPIKE_240V</td><td>SENSOR_R4</td></tr>
    <tr><td>23:14:05</td><td>RACK_4_CIRCUIT_TRIP</td><td>AUTO_FAILSAFE</td></tr>
  </table>
  <p><em>Investigator Note:</em> The manual breaker was correctly turned off by the victim. Six minutes later, a software command triggered the 'Emergency Bypass Relay', which overrides the manual breaker and forces power to the rack. This cannot happen accidentally.</p>
`, 'SECTION 04: DIGITAL EVIDENCE', 5) +
buildPage(`
  <h3>VPN AUTHENTICATION LOGS (EX-04)</h3>
  <p><strong>SESSION ID:</strong> V-8892<br>
  <strong>START TIME:</strong> 04 Oct 23:13:45<br>
  <strong>USER:</strong> admin_sharma_n<br>
  <strong>IP ADDRESS:</strong> 122.161.45.192 (ISP: Airtel Broadband - Registered to Neha Sharma's Residence)</p>
  
  <p><strong>COMMAND HISTORY:</strong></p>
  <div class="transcript">
    23:13:58 - sudo su<br>
    23:14:02 - ./sys_override.sh -rack 4 -force_relay
  </div>
`, 'SECTION 05: NETWORK ANALYSIS', 6) +
buildPage(`
  <h3>EXTRACTED FILE: api_audit_notes_DRAFT.txt (EX-02)</h3>
  <p>Last modified by victim: 04 Oct 22:45</p>
  <div class="transcript">
    "I've been tracing the micro-transactions on the legacy billing API. Someone injected a routing script (sha256 hash attached) that skims 0.01% of all batch transfers into an offshore dummy account. I checked the commit history. The auth keys used to deploy the script belong to Neha. I am going to pull the physical server logs from Rack 4 tonight to verify the hardware cache before I go to HR."
  </div>
`, 'SECTION 06: VICTIM LAPTOP', 7) +
buildPage(`
  <h3>STATEMENT: NEHA SHARMA (VP ENGINEERING)</h3>
  <div class="transcript">
    <div class="q">Q: Please state your movements on the evening of Oct 4th.</div>
    <div class="a">A: I remained in the office late to finalize the Q4 deployment schedule. I believe I left around 8:00 PM. I drove straight home and went to sleep.</div>
    <div class="q">Q: Who has access to the emergency bypass relays?</div>
    <div class="a">A: All senior managers have administrative VPN access. But I certainly didn't log in that night. If my account was used, someone must have spoofed my IP or stolen my credentials.</div>
  </div>
  <p><em>Investigator Note:</em> She pre-emptively brought up IP spoofing without being prompted about the VPN logs. Access Badge logs confirm she left the building at 20:15.</p>
`, 'SECTION 07: WITNESS TRANSCRIPT', 8) +
buildPage(`
  <h3>STATEMENT: RAHUL MEHTA (SYSADMIN)</h3>
  <div class="transcript">
    <div class="q">Q: CCTV places you in the hallway outside Server Room B at the time of death.</div>
    <div class="a">A: I was in the hallway, yes. From around 7:45 PM until maybe 11:15 PM. But I didn't go into Server Room B! I went into the storage closet across the hall to take a nap where the managers wouldn't see me. I didn't hear anything over the sound of the server fans. I don't even have biometric clearance to open Room B.</div>
  </div>
  <p><em>Investigator Note:</em> He does not have biometric access to Room B. Hallway CCTV confirms he never entered the server room.</p>
  
  <div style="text-align: center; margin-top: 150px; font-weight: bold; border: 2px solid black; padding: 20px; display: inline-block;">END OF DOSSIER MATERIAL</div>
`, 'SECTION 08: WITNESS TRANSCRIPT', 9) +
`</body></html>`;

fs.writeFileSync('cases/NOX-1145_dossier.html', nox1145);
console.log('NOX-1145 Dossier generated.');

// NOX-1147
const nox1147 = `<!DOCTYPE html><html lang="en"><head><title>NOX-1147 DOSSIER</title><style>${css}</style></head><body>` + 
buildPage(`
  <div style="text-align: center; margin-top: 100px;">
    <h1 style="font-size: 36px; margin-top: 40px;">INVESTIGATION DOSSIER</h1>
    <h2 style="font-size: 24px; color: #444;">CASE FILE: NOX-1147</h2>
    <div style="margin-top: 80px; font-size: 14pt; line-height: 2;">
      <strong>SUBJECT:</strong> THE MISSING LEDGER<br>
      <strong>JURISDICTION:</strong> BENGALURU<br>
      <strong>CLASSIFICATION:</strong> FINANCIAL FRAUD / CYBERCRIME<br>
    </div>
  </div>
`, null, 1) + 
buildPage(`
  <h3>FIRST INFORMATION REPORT (FIR)</h3>
  <p><strong>Brief Facts:</strong> Apex Logistics reported a massive ransomware attack on their offshore accounting servers. The entire Q3 ledger was wiped. The company claims a Russian syndicate known as 'DarkByte' breached their systems and destroyed the backups. The breach occurred just 3 days before a scheduled surprise audit of the offshore accounts.</p>
`, 'SECTION 01: FIR', 2) +
buildPage(`
  <h3>EXTERNAL FIREWALL LOGS</h3>
  <p>Logs from the edge router confirm automated port scanning from known DarkByte IPs (Russia) on Aug 27 at 14:00 HRS. However, ZERO data was transferred in or out. The attack was successfully repelled by the automated firewall. They never breached the perimeter.</p>
  
  <h3>INTERNAL AUTHENTICATION LOGS</h3>
  <table class="table">
    <tr><th>TIMESTAMP</th><th>ACCOUNT</th><th>SOURCE IP</th><th>ACTION</th></tr>
    <tr><td>23:45:10</td><td>ADMIN_TARA</td><td>192.168.1.15</td><td>LOGIN_SUCCESS</td></tr>
    <tr><td>00:15:02</td><td>ADMIN_TARA</td><td>192.168.1.15</td><td>EXECUTE_WIPE_SCRIPT</td></tr>
  </table>
  <p><em>Investigator Note:</em> Tara's admin account was used, but the connection originated from IP 192.168.1.15. This internal IP belongs to the desktop in the Chief Financial Officer's (Vikram Singh) personal office on the executive floor.</p>
`, 'SECTION 02: DIGITAL EVIDENCE', 3) +
buildPage(`
  <h3>RANSOMWARE NOTE (EX-03)</h3>
  <div class="transcript">
    "Your files are encrypted by DarkByte. Pay 50 Bitcoin to the following address. Do not contact police or we will leak the data. Revert back with the payment within 48 hours."
  </div>
  <p><em>Linguistic Analysis:</em> The note uses the phrase "revert back with the payment". This is a distinctively Indian corporate idiom (a tautology combining 'revert' and 'reply back'), rarely used by Russian ransomware groups. It is poorly faked.</p>
`, 'SECTION 03: DOCUMENT ANALYSIS', 4) +
buildPage(`
  <h3>STATEMENT: VIKRAM SINGH (CFO)</h3>
  <div class="transcript">
    <div class="q">Q: Can you explain the missing Q3 ledger?</div>
    <div class="a">A: This is a disaster. DarkByte has ruined us. I've told the IT department a hundred times to upgrade our security. Now the audit is ruined. It's a tragedy.</div>
  </div>
  <h3>STATEMENT: TARA MENON (IT LEAD)</h3>
  <div class="transcript">
    <div class="q">Q: Your credentials were used to wipe the servers at 23:45.</div>
    <div class="a">A: They used my credentials! I swear I didn't do it. I was at home asleep. The logs say my account logged in, but check the IP! I wasn't even in the building.</div>
  </div>
  <div style="text-align: center; margin-top: 150px; font-weight: bold; border: 2px solid black; padding: 20px; display: inline-block;">END OF DOSSIER MATERIAL</div>
`, 'SECTION 04: TRANSCRIPTS', 5) +
`</body></html>`;

fs.writeFileSync('cases/NOX-1147_dossier.html', nox1147);
console.log('NOX-1147 Dossier generated.');
