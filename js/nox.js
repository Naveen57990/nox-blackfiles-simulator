/* =========================================================================
   NOX BLACKFILES — shared runtime
   01 shell (rail marking) · 02 overlay kit · 03 toasts · 04 data
   05 board engine · 06 misc interactions
   ========================================================================= */
(function () {
  'use strict';

  /* ---- 01 shell -------------------------------------------------------- */
  function markRail() {
    var here = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.rail-link').forEach(function (a) {
      if ((a.getAttribute('href') || '').split('/').pop() === here) a.setAttribute('aria-current', 'page');
    });
  }

  /* ---- 02 overlay kit -------------------------------------------------- */
  var openStack = [];
  function closeTop() {
    var top = openStack.pop();
    if (!top) return;
    if (top.scrim) top.scrim.remove();
    if (top.panel) top.panel.remove();
    document.removeEventListener('keydown', esc);
    if (!openStack.length) document.body.style.overflow = '';
  }
  function esc(e) { if (e.key === 'Escape') closeTop(); }

  window.nxModal = function (opts) {
    var scrim = document.createElement('div');
    scrim.className = 'scrim';
    scrim.innerHTML =
      '<div class="modal' + (opts.wide ? ' wide' : '') + '" role="dialog" aria-modal="true" aria-label="' + esc_(opts.title || 'Dialog') + '">' +
        '<div class="modal-hd"><h3>' + opts.title + '</h3><div class="spacer"></div>' +
          '<button class="btn btn-ghost btn-sm" data-x aria-label="Close">✕</button></div>' +
        '<div class="modal-bd scroll">' + opts.body + '</div>' +
        (opts.footer === null ? '' : '<div class="modal-ft">' + (opts.footer || '<button class="btn" data-x>Close</button>') + '</div>') +
      '</div>';
    document.body.appendChild(scrim);
    scrim.querySelectorAll('[data-x]').forEach(function (b) { b.onclick = closeTop; });
    scrim.addEventListener('mousedown', function (e) { if (e.target === scrim) closeTop(); });
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', esc);
    openStack.push({ scrim: scrim });
    if (opts.onOpen) opts.onOpen(scrim);
    return scrim;
  };

  window.nxDrawer = function (opts) {
    var d = document.createElement('aside');
    d.className = 'drawer';
    d.setAttribute('role', 'dialog');
    d.innerHTML =
      '<div class="modal-hd"><h3>' + opts.title + '</h3><div class="spacer"></div>' +
        '<button class="btn btn-ghost btn-sm" data-x aria-label="Close">✕</button></div>' +
      '<div class="modal-bd scroll" style="flex:1">' + opts.body + '</div>' +
      (opts.footer ? '<div class="modal-ft">' + opts.footer + '</div>' : '');
    document.body.appendChild(d);
    d.querySelectorAll('[data-x]').forEach(function (b) { b.onclick = closeTop; });
    document.addEventListener('keydown', esc);
    openStack.push({ panel: d });
    if (opts.onOpen) opts.onOpen(d);
    return d;
  };

  window.nxClose = closeTop;

  function esc_(s) { return String(s).replace(/[<>&"]/g, function (c) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]; }); }

  /* ---- 03 toasts ------------------------------------------------------- */
  window.nxToast = function (title, msg) {
    var host = document.getElementById('toasts');
    if (!host) { host = document.createElement('div'); host.id = 'toasts'; document.body.appendChild(host); }
    var t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = '<b>' + title + '</b>' + (msg || '');
    host.appendChild(t);
    setTimeout(function () { t.style.transition = 'opacity .3s, transform .3s'; t.style.opacity = '0'; t.style.transform = 'translateY(6px)'; }, 3400);
    setTimeout(function () { t.remove(); }, 3800);
  };

  /* ---- 04 case data ---------------------------------------------------- */
  var CASE = {
    id: 'NOX-1142',
    short: '1142/26',
    title: 'The Vikhroli Ledger',
    location: 'B-1204, Shantivan Heights, Vikhroli East, Mumbai 400083',
    station: 'Zone D · Vikhroli Police Station',
    category: 'financial-crime · secondary homicide',
    difficulty: 4,
    mode: 'Guided simulation',
    opened: '14 SEP 2026 · 09:20',
    lastActivity: 'Today · 11:42',
    progress: 61,
    victims: 1,
    persons: 9,
    evidenceTotal: 148,
    evidenceReviewed: 74,
    leads: 23,
    leadsOpen: 8,
    questions: 11,
    status: 'active'
  };

  var EVIDENCE = [
    { id: 'E-001', kind: 'document', k: 'DOCUMENT', t: 'Ledger extract — Nilkanth Cold Storage', s: 'Printout, 11 pages, columns A–F, handwritten corrections in the margin.', src: 'Seized from desk drawer, 14 SEP', rev: 1, pin: 1, conf: 'Established' },
    { id: 'E-004', kind: 'bank', k: 'BANK RECORD', t: 'Indus Co-op Bank statement — A/C 0041182', s: 'Twelve transfers totalling ₹46,80,000 routed through four beneficiary accounts.', src: 'Bank sealed response, 17 SEP', rev: 1, pin: 1, conf: 'Established' },
    { id: 'E-007', kind: 'cctv', k: 'CCTV', t: 'Lobby CCTV — 16 SEP, 22:41:08 to 22:44:51', s: 'Two figures enter the service lift. Faces not resolved. Second figure carries a flat case.', src: 'Building mgmt archive, 16 SEP', rev: 1, pin: 1, conf: 'Partially established' },
    { id: 'E-011', kind: 'audio', k: 'AUDIO', t: 'Call recording — 19 SEP, 21:06 (2m 14s)', s: 'Voices: one unidentified male, one female caller identified as F. Qureshi.', src: 'CDR triangulation warrant, 20 SEP', rev: 1, pin: 0, conf: 'Established' },
    { id: 'E-014', kind: 'chat', k: 'CHAT EXPORT', t: 'WhatsApp export — group "Ganpati 25"', s: '318 messages, 4 participants. Four messages deleted by sender on 20 SEP.', src: 'Voluntary surrender, N. Sathe, 21 SEP', rev: 1, pin: 1, conf: 'Partially established' },
    { id: 'E-019', kind: 'forensic', k: 'FORENSIC REPORT', t: 'Digital forensics — handset IMEI 91••••4471', s: 'Last cellular fix: Vikhroli East, 17 SEP 23:38. No sync after 17 SEP 23:41.', src: 'Regional Cyber Cell, 22 SEP', rev: 1, pin: 0, conf: 'Established' },
    { id: 'E-023', kind: 'autopsy', k: 'AUTOPSY REPORT', t: 'Post-mortem — late Kadam, N. (54, M)', s: 'Death window 23:00–03:00 on 16–17 SEP. Consistent with hyponatraemia from forced ingestion.', src: 'JJ Hospital morgue, 17 SEP', rev: 1, pin: 0, conf: 'Established' },
    { id: 'E-026', kind: 'lab', k: 'LAB REPORT', t: 'Toxicology — gastric aspirate, deceased', s: 'Sodium concentration indicates ingestion of a saline load over 45–70 minutes.', src: 'FSL Bandra, 24 SEP', rev: 0, pin: 0, conf: 'Established' },
    { id: 'E-031', kind: 'object', k: 'OBJECT', t: 'Recovered — steel cash box, 30 × 18 cm', s: 'Deceased\'s handwriting on lid: "KYC / September". Contents not inventoried.', src: 'Crime scene, Flat B-1204, 14 SEP', rev: 0, pin: 1, conf: 'Established' },
    { id: 'E-034', kind: 'statement', k: 'STATEMENT', t: 'Statement — R. Kadam (spouse), recorded 15 SEP', s: 'States she was at her sister\'s residence in Dadar from 18:00. Duration unverified.', src: 'PIO Vikhroli, 15 SEP', rev: 1, pin: 0, conf: 'Disputed' },
    { id: 'E-038', kind: 'map', k: 'MAP', t: 'Route reconstruction — 16 SEP, 20:10 to 00:30', s: 'Vehicle KDM-11-HH-9907 tracked between Vikhroli, Bhiwandi and back.', src: 'RTO vehicle data, 19 SEP', rev: 0, pin: 0, conf: 'Established' },
    { id: 'E-041', kind: 'device', k: 'DEVICE DATA', t: 'Laptop image — deceased\'s desktop, sector unallocated 4.2 GB', s: 'Recovered fragments reference a second ledger held by "D. R." dated Aug 2025.', src: 'Cyber Cell extraction, 23 SEP', rev: 0, pin: 1, conf: 'Partially established' },
    { id: 'E-047', kind: 'document', k: 'LEGAL DOCUMENT', t: 'Search warrant return — Flat 3, Sai Residency annexe', s: 'Returned sealed. Inventory item 6 listed but not produced.', src: 'JMFC Vikhroli, 22 SEP', rev: 0, pin: 0, conf: 'Unresolved' },
    { id: 'E-052', kind: 'cctv', k: 'CCTV', t: 'Parking CCTV — B wing ramp, 17 SEP, 00:12', s: 'Vehicle departs. Two rear passengers. Plate partially legible.', src: 'Building mgmt archive, 17 SEP', rev: 0, pin: 0, conf: 'Partially established' },
    { id: 'E-058', kind: 'audio', k: 'AUDIO', t: 'Intercom capture — 16 SEP, 22:44', s: 'Unauthorised buzzer entry from Flat B-0903. Door released.', src: 'Building security, 18 SEP', rev: 0, pin: 0, conf: 'Established' },
    { id: 'E-063', kind: 'chat', k: 'CHAT EXPORT', t: 'Signal messages — 6 archived threads', s: 'Sender "DK". Transferred on 03 SEP. Carrier records retained.', src: 'Cyber Cell lawful intercept, 25 SEP', rev: 0, pin: 0, conf: 'Partially established' },
    { id: 'E-070', kind: 'forensic', k: 'FORENSIC REPORT', t: 'Scene photography — 34 frames', s: 'Reconstructed scene. Beverage glass absent from listed inventory.', src: 'FSL Bandra, 18 SEP', rev: 0, pin: 0, conf: 'Established' },
    { id: 'E-074', kind: 'bank', k: 'BANK RECORD', t: 'Benicial audit — four beneficiary accounts', s: 'All four accounts opened within nine days of each other at two branches.', src: 'Bank sealed response, 24 SEP', rev: 0, pin: 0, conf: 'Established' },
    { id: 'E-081', kind: 'statement', k: 'STATEMENT', t: 'Statement — F. Qureshi (accounts clerk), recorded 23 SEP', s: 'Admits issuing a payee memo on verbal instruction. Names the instructor.', src: 'PIO Vikhroli, 23 SEP', rev: 1, pin: 0, conf: 'Partially established' },
    { id: 'E-088', kind: 'document', k: 'DOCUMENT', t: 'Director\'s resolution — Nilkanth Cold Storage', s: 'Signed by R. Kadam and D. Rane. Registered 11 MAR 2025, filed 30 APR 2025.', src: 'ROC Mumbai, 26 SEP', rev: 0, pin: 0, conf: 'Established' }
  ];

  var PERSONS = [
    { n: 'Kadam, N.', r: 'Deceased — chartered accountant, 54', st: 'deceased', note: 'Principal of a Vikhroli accounting practice. Died 16–17 SEP at Flat B-1204.', link: 22 },
    { n: 'Kadam, R.', r: 'Spouse', st: 'cooperative', note: 'Statement places her in Dadar from 18:00 on 16 SEP. No corroboration obtained.', link: 9 },
    { n: 'Sathe, N.', r: 'Junior associate, 29', st: 'nervous', note: 'Surrendered a phone and a printed register. Deleted four group messages.', link: 11 },
    { n: 'Dsouza, A.', r: 'Branch manager, Indus Co-op Bank', st: 'evasive', note: 'Two statements filed. Signatures on both differ in the initial.', link: 7 },
    { n: 'Qureshi, F.', r: 'Accounts clerk, 41', st: 'distressed', note: 'Named the person who instructed the payee memo. Will not repeat the name.', link: 14 },
    { n: 'Rane, D.', r: 'Property broker, SBI-linked', st: 'defensive', note: 'Co-signatory on the director\'s resolution. Travel record places him in Bhiwandi 16 SEP.', link: 12 },
    { n: 'Salvi, K.', r: 'Inspector, Zone D', st: 'cooperative', note: 'Case officer. Declined two of your four requisition requests.', link: 6 },
    { n: 'Fernandes, J.', r: 'Watchman, Shantivan Heights', st: 'cooperative', note: 'Logged the 00:12 departure. Claims he never saw the faces.', link: 3 },
    { n: 'Bakshi, P.', r: 'Hotel manager, Bhiwandi transit lodge', st: 'calm', note: 'Cash room used twice in September. Receipt produced for the second visit only.', link: 4 }
  ];

  var TIMELINE = [
    { lane: 'Vehicle · KDM-11-HH-9907', at: 5.5, to: 9.2, k: 'RTO', t: 'Vehicle exits ramp, Vikhroli East', band: true },
    { lane: 'Vehicle · KDM-11-HH-9907', at: 14.0, to: 16.5, k: 'RTO', t: 'Transit lodge, Bhiwandi — cash room access 21:10', band: true },
    { lane: 'Vehicle · KDM-11-HH-9907', at: 19.0, to: 22.6, k: 'RTO', t: 'Vehicle returns to B wing ramp, Vikhroli', band: true },
    { lane: 'CCTV · Building archive', at: 22.68, to: 22.75, k: 'CCTV', t: 'Two figures enter service lift', band: false },
    { lane: 'CCTV · Building archive', at: 22.75, to: 22.81, k: 'CCTV', t: 'Intercom released from Flat B-0903', band: false },
    { lane: 'Audio · Intercom', at: 22.73, to: 22.74, k: 'AUDIO', t: 'Unauthorised buzzer entry', band: false },
    { lane: 'Statement · R. Kadam', at: 18.0, to: 30.0, k: 'STMT', t: 'Spouse states she was in Dadar — window only', band: true, cls: 'window' },
    { lane: 'Autopsy · JJ Hospital', at: 23.0, to: 27.0, k: 'AUTOPSY', t: 'Estimated death window 23:00–03:00', band: true, cls: 'window' },
    { lane: 'Toxicology · FSL Bandra', at: 22.3, to: 23.4, k: 'TOX', t: 'Saline load ingested over 45–70 min', band: true, cls: 'window' },
    { lane: 'Digital · IMEI 91••••4471', at: 23.63, to: 23.7, k: 'DEVICE', t: 'Last cellular fix, then no sync', band: false },
    { lane: 'CCTV · Building archive', at: 24.2, to: 24.3, k: 'CCTV', t: 'Vehicle departs ramp, two rear passengers', band: false },
    { lane: 'Bank · Indus Co-op', at: 28.5, to: 29.2, k: 'BANK', t: 'Credit memo to beneficiary 3 · ₹8,40,000', band: false },
    { lane: 'Chat · Signal archive', at: 52.0, to: 53.0, k: 'CHAT', t: '"DK": send the file at the same time', band: false },
    { lane: 'Chat · Signal archive', at: 68.0, to: 69.5, k: 'CHAT', t: '"DK": did you keep the second copy?', band: false }
  ];

  var DIARY = [
    { d: '01 OCT 2026', t: '10:42', h: 'Interviewed Sathe, N. — fourth sitting',
      body: [{ l: 'Observation', p: 'Statement conflicts with the 16 SEP lobby recording. He places himself at the office until 19:30; the intercom capture puts him in B wing at 22:44.' }],
      links: ['E-007', 'E-058', 'PERSON: Sathe, N.'], tags: ['contradiction', 'timeline'] },
    { d: '29 SEP 2026', t: '16:08', h: 'Steel cash box — inventoried, not opened',
      body: [{ l: 'Observation', p: 'Lid carries the deceased\'s hand. Contents still sealed pending a fresh warrant; the 22 SEP return did not list an item for it.' }],
      links: ['E-031', 'E-047'], tags: ['chain-of-custody', 'blocker'] },
    { d: '26 SEP 2026', t: '11:20', h: 'Director\'s resolution obtained from ROC',
      body: [
        { l: 'Observation', p: 'Filed 30 APR 2025, four weeks after signature. The second signatory is D. Rane — whose surname does not appear anywhere in the Nilkanth records.' },
        { l: 'Next step', p: 'Pull Rane\'s PAN filings and travel for 16 SEP.' }
      ],
      links: ['E-088', 'PERSON: Rane, D.'], tags: ['document', 'lead'] },
    { d: '24 SEP 2026', t: '19:55', h: 'Four beneficiary accounts opened in nine days',
      body: [{ l: 'Observation', p: 'Two branches, same introducer code in every file. The introducer is not a customer of the bank.' }],
      links: ['E-074', 'E-004'], tags: ['financial'] },
    { d: '22 SEP 2026', t: '08:15', h: 'Warrant return — item 6 missing',
      body: [{ l: 'Observation', p: 'The annexe flat was searched and the return filed the same evening. Item 6 is on the inventory and absent from the box.' }],
      links: ['E-047'], tags: ['blocker', 'unresolved'] }
  ];

  window.NOX = {
    CASE: CASE, EVIDENCE: EVIDENCE, PERSONS: PERSONS, TIMELINE: TIMELINE, DIARY: DIARY,
    statusChip: function (s) {
      var m = { 'ACTIVE': 'chip-accent', 'NEW': 'chip-cold', 'ON HOLD': 'chip-warn', 'SOLVED': 'chip-ok',
        'CLOSED': 'chip', 'UNRESOLVED': 'chip-danger', 'ABANDONED': 'chip' };
      return '<span class="chip ' + (m[s] || 'chip') + '">' + s + '</span>';
    },
    confChip: function (c) {
      var m = { 'Established': 'chip-ok', 'Partially established': 'chip-warn', 'Disputed': 'chip-danger', 'Unresolved': 'chip' };
      return '<span class="chip ' + (m[c] || 'chip') + '">' + c + '</span>';
    },
    kindClass: function (k) {
      var d = { 'DOCUMENT': 'k-accent', 'BANK RECORD': 'k-cold', 'CCTV': 'k-cold', 'AUDIO': 'k-cold', 'CALL RECORD': 'k-cold',
        'CHAT EXPORT': 'k-cold', 'FORENSIC REPORT': 'k-cold', 'AUTOPSY REPORT': 'k-danger', 'LAB REPORT': 'k-cold',
        'MAP': '', 'DEVICE DATA': 'k-cold', 'OBJECT': 'k-accent', 'STATEMENT': '', 'LEGAL DOCUMENT': 'k-accent' };
      return d[k] || '';
    },
    ICONS: {
      document: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
      bank: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 10h18M5 10v8m4-8v8m6-8v8m4-8v8M3 21h18M12 3l9 5H3z"/></svg>',
      cctv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="6" width="14" height="10" rx="1.5"/><path d="m16 10 6-3v8l-6-3z"/></svg>',
      audio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
      chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 12a8 8 0 0 1-8 8H7l-4 3 1-5.2A8 8 0 1 1 21 12z"/></svg>',
      forensic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 3v6.5L4.5 18A2.5 2.5 0 0 0 7 21.5h10a2.5 2.5 0 0 0 2.4-3.4L15 9.5V3M8 3h8M7.5 14h9"/></svg>',
      autopsy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 9h18M8 4v16M16 4v16"/></svg>',
      lab: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 3h6M10 3v6.5L5.5 18a2.5 2.5 0 0 0 2.4 3.5h8a2.5 2.5 0 0 0 2.4-3.5L14 9.5V3M7 14h10"/></svg>',
      object: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 8h18v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM3 8l2-4h14l2 4M9 12h6"/></svg>',
      statement: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
      buddy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 8v.01M8.5 12.5a3.5 3.5 0 0 1 7 0c0 2-3.5 2-3.5 3.5"/><path d="M12 3v2M12 19v2"/></svg>',
      search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
      map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m9 4-5 2v14l5-2 6 2 5-2V4l-5 2zM9 4v14M15 6v14"/></svg>',
      device: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg>',
      pin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 3l7 7-3 1-1 5-4-4-5 5-1-1 5-5-4-4 5-1z"/></svg>'
    },
    kindIcon: function (k) {
      var m = { 'DOCUMENT': 'document', 'LEGAL DOCUMENT': 'document', 'BANK RECORD': 'bank', 'CCTV': 'cctv',
        'AUDIO': 'audio', 'CALL RECORD': 'audio', 'CHAT EXPORT': 'chat', 'FORENSIC REPORT': 'forensic',
        'AUTOPSY REPORT': 'autopsy', 'LAB REPORT': 'lab', 'MAP': 'map', 'DEVICE DATA': 'device',
        'OBJECT': 'object', 'STATEMENT': 'statement' };
      return window.NOX.ICONS[m[k] || 'document'];
    },
    /* ---- shell rail is attached after the literal closes --------------- */
    __railAnchor: 0
  };
  window.NOX.ICONS.nav = {
      deck:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
      lib:'<path d="M3 7h18v13H3z"/><path d="M3 7l2-4h14l2 4M3 12h18"/>',
      ws:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 13h8M8 17h5"/>',
      ev:'<path d="M3 7h18v12H3z"/><path d="M3 11h18M8 7v12"/>',
      tl:'<path d="M3 12h18M6 8v8M12 6v12M18 9v6"/>',
      board:'<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="9" r="2.5"/><circle cx="9" cy="18" r="2.5"/><path d="M8 7.5 15.6 8.4M7.4 8.3 8.6 15.6M16.5 11.2 10.7 16.4"/>',
      inter:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M9 21h6M12 17v4M8 9h8M8 12.5h5"/>',
      diary:'<path d="M5 3h11l3 3v15H5z"/><path d="M8 9h8M8 13h8M8 17h5"/>',
      notes:'<path d="M4 5h16v14H4z"/><path d="M8 9h8M8 13h5"/>',
      chat:'<path d="M21 12a8 8 0 0 1-8 8H7l-4 3 1-5.2A8 8 0 1 1 21 12z"/>',
      buddy:'<circle cx="12" cy="12" r="8"/><path d="M9 10h.01M15 10h.01M8.5 14.5a4.5 4.5 0 0 0 7 0"/>',
      concl:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 15l2 2 4-4"/>',
      review:'<path d="M4 19V5h16v14z"/><path d="M8 15v-4M12 15V8M16 15v-6"/>',
      exp:'<path d="M12 3v12M8 7l4-4 4 4"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>',
      set:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
      mob:'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>'
    };
    window.NOX.ICONS.search = '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>';

  window.NOX.NAV = [
      ['Command', [
        ['deck','Command deck','index.html',''],
        ['lib','Case library','case-library.html','12']
      ]],
      ['Case NOX-1142', [
        ['ws','Case workspace','case-workspace.html',''],
        ['ev','Evidence & persons','evidence.html','148'],
        ['tl','Timeline','timeline.html','34'],
        ['board','Investigation board','board.html','15'],
        ['inter','Interrogation','interrogation.html','4'],
        ['diary','Case diary','diary.html',''],
        ['notes','Notes','notes.html','']
      ]],
      ['Assistants', [
        ['chat','Case chat','chat.html',''],
        ['buddy','Buddy assistant','chat.html#buddy','']
      ]],
      ['Resolution', [
        ['concl','Conclusion','conclusion.html',''],
        ['review','Case review','review.html',''],
        ['exp','Export dossier','export.html',''],
        ['set','Settings','settings.html','']
      ]]
    ];

    window.NOX.mountRail = function (active, avatar, name, role) {
      var el = document.createElement('nav');
      el.className = 'rail';
      var h = '<div class="rail-brand"><div class="rail-mark"><b>NOX</b><span>Blackfiles</span></div></div>' +
        '<a class="rail-case" href="case-workspace.html"><span class="eyebrow">Active file</span>' +
        '<strong>The Vikhroli Ledger</strong><small>NOX-1142 · 61%</small></a>';
      window.NOX.NAV.forEach(function (grp) {
        h += '<div class="rail-group"><span class="eyebrow">' + grp[0] + '</span><div class="rail-nav">';
        grp[1].forEach(function (l) {
          var is = (l[2].split('#')[0] === active) ? ' aria-current="page"' : '';
          h += '<a class="rail-link" href="' + l[2] + '"' + is + '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">' + window.NOX.ICONS.nav[l[0]] + '</svg>' +
            l[1] + (l[3] ? '<span class="tail">' + l[3] + '</span>' : '') + '</a>';
        });
        h += '</div></div>';
      });
      h += '<div class="rail-foot"><div class="avatar sm">' + avatar + '</div><div class="who"><b>' + name + '</b><small>' + role + '</small></div></div>';
      el.innerHTML = h;
      var app = document.querySelector('.app') || document.querySelector('.lib');
      if (app) app.insertBefore(el, app.firstChild);
      markRail();
      return el;
    };

  /* ---- 05 board engine --------------------------------------------- */
  window.NOX.board = function (host) {
      var st = { z: 0.85, x: 40, y: 40, sel: null, hist: [], fut: [] };
      var W = 3200, H = 2100;
      host.innerHTML =
        '<div class="board-toolbar">' +
          '<button class="btn btn-sm" data-a="add-evid" data-tip="Add evidence card">+ Evidence</button>' +
          '<button class="btn btn-sm" data-a="add-person" data-tip="Add person card">+ Person</button>' +
          '<button class="btn btn-sm" data-a="link" data-tip="Draw relationship">Link</button>' +
          '<button class="btn btn-sm" data-a="draw" data-tip="Free draw">Draw</button>' +
          '<button class="btn btn-sm" data-a="frame" data-tip="Group / frame">Frame</button>' +
          '<button class="btn btn-sm" data-a="undo" data-tip="Undo">Undo</button>' +
          '<button class="btn btn-sm" data-a="redo" data-tip="Redo">Redo</button>' +
        '</div>' +
        '<div class="board" style="width:' + W + 'px;height:' + H + 'px">' +
          '<svg class="links" width="' + W + '" height="' + H + '">' +
            '<defs><marker id="ah" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">' +
            '<path d="M0 0 L7 3.5 L0 7 z" fill="oklch(45% 0.015 262)"/></marker></defs><g id="lk"></g><g id="free"></g></svg>' +
          '<div id="nodes"></div>' +
        '</div>' +
        '<div class="minimap"><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">' +
          '<g id="mm"></g><rect class="vp" width="300" height="200"/></svg></div>' +
        '<div class="zoom-read" id="zr">85%</div>';

      var boardEl = host.querySelector('.board');
      var nodesEl = host.querySelector('#nodes');
      var lk = host.querySelector('#lk');
      var free = host.querySelector('#free');
      var zr = host.querySelector('#zr');
      var vp = host.querySelector('.minimap .vp');

      var seed = [
        { t: 'PERSON', c: 'person', x: 380, y: 300, n: 'Sathe, N.', s: 'Junior associate' },
        { t: 'PERSON', c: 'person', x: 120, y: 640, n: 'Qureshi, F.', s: 'Accounts clerk' },
        { t: 'PERSON', c: 'person', x: 700, y: 120, n: 'Dsouza, A.', s: 'Branch manager' },
        { t: 'PERSON', c: 'person', x: 1180, y: 380, n: 'Rane, D.', s: 'Property broker' },
        { t: 'PLACE', c: 'place', x: 660, y: 780, n: 'Flat B-1204', s: 'Scene of death' },
        { t: 'PLACE', c: 'place', x: 130, y: 1010, n: 'Bhiwandi lodge', s: 'Cash room · 21:10' },
        { t: 'EVIDENCE', c: 'evid', x: 430, y: 470, n: 'E-011 Call 21:06', s: 'Qureshi + unknown male' },
        { t: 'EVIDENCE', c: 'evid', x: 900, y: 300, n: 'E-014 WhatsApp', s: '"Ganpati 25" · 4 deleted' },
        { t: 'EVIDENCE', c: 'evid', x: 1500, y: 500, n: 'E-004 Bank stmt', s: '₹46,80,000 · 4 accounts' },
        { t: 'EVIDENCE', c: 'evid', x: 1520, y: 160, n: 'E-088 ROC resolution', s: 'Second signatory' },
        { t: 'EVIDENCE', c: 'evid', x: 1900, y: 620, n: 'E-063 Signal archive', s: '"DK" · 6 threads' },
        { t: 'EVIDENCE', c: 'evid', x: 2280, y: 340, n: 'E-041 Laptop image', s: 'Sector 4.2 GB' },
        { t: 'TIME', c: 'time', x: 830, y: 1080, n: '22:41–22:44', s: 'Lobby CCTV' },
        { t: 'TIME', c: 'time', x: 1180, y: 1230, n: '23:00–03:00', s: 'Death window' },
        { t: 'TIME', c: 'time', x: 1620, y: 1100, n: '17 SEP 00:12', s: 'Vehicle departs' }
      ];
      var links = [[0, 6], [6, 1], [1, 4], [0, 7], [7, 2], [2, 5], [3, 9], [9, 10], [10, 11], [6, 12], [4, 13], [5, 14], [4, 13]];
      var N = seed.length;

      function build() {
        nodesEl.innerHTML = seed.map(function (d, i) {
          return '<div class="node-card ' + d.c + '" data-i="' + i + '" style="left:' + d.x + 'px;top:' + d.y + 'px">' +
            '<span class="node-tag">' + d.t + '</span><b>' + d.n + '</b>' +
            '<small class="faint" style="font:400/1.4 var(--font-mono);font-size:10.5px">' + d.s + '</small></div>';
        }).join('');
        drawLinks();
        var mm = host.querySelector('#mm');
        mm.innerHTML = seed.map(function (d) {
          return '<rect x="' + d.x + '" y="' + d.y + '" width="176" height="58" fill="oklch(45% 0.015 262)" opacity=".5"/>';
        }).join('');
        bindDrag();
      }
      function drawLinks() {
        lk.querySelectorAll('path').forEach(function (p) { p.remove(); });
        links.forEach(function (p) {
          var a = seed[p[0]], b = seed[p[1]];
          var x1 = a.x + 88, y1 = a.y + 29, x2 = b.x + 88, y2 = b.y + 29;
          var mx = (x1 + x2) / 2;
          var el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          el.setAttribute('d', 'M' + x1 + ' ' + y1 + ' C' + mx + ' ' + y1 + ' ' + mx + ' ' + y2 + ' ' + x2 + ' ' + y2);
          el.setAttribute('fill', 'none'); el.setAttribute('stroke', 'oklch(45% 0.015 262)');
          el.setAttribute('stroke-width', '1.4'); el.setAttribute('marker-end', 'url(#ah)');
          lk.appendChild(el);
        });
      }
      function apply() {
        boardEl.style.transform = 'translate(' + st.x + 'px,' + st.y + 'px) scale(' + st.z + ')';
        zr.textContent = Math.round(st.z * 100) + '%';
        var vw = host.clientWidth / st.z, vh = host.clientHeight / st.z;
        vp.setAttribute('x', -st.x / st.z); vp.setAttribute('y', -st.y / st.z);
        vp.setAttribute('width', vw); vp.setAttribute('height', vh);
        persist();
      }
      function persist() {
        try { localStorage.setItem('nox.board', JSON.stringify({ z: st.z, x: st.x, y: st.y, nodes: seed, links: links })); } catch (e) {}
      }
      function restore() {
        try {
          var d = JSON.parse(localStorage.getItem('nox.board') || 'null');
          if (d && d.nodes && d.nodes.length) { seed = d.nodes; links = d.links; st.z = d.z; st.x = d.x; st.y = d.y; }
        } catch (e) {}
      }

      function bindDrag() {
        nodesEl.querySelectorAll('.node-card').forEach(function (el) {
          el.addEventListener('pointerdown', function (e) {
            e.stopPropagation();
            el.setPointerCapture(e.pointerId);
            var i = +el.dataset.i, sx = e.clientX, sy = e.clientY;
            var ox = seed[i].x, oy = seed[i].y;
            el.classList.add('drag');
            nodesEl.querySelectorAll('.node-card').forEach(function (x) { x.classList.remove('sel'); });
            el.classList.add('sel'); st.sel = i;
            function mv(ev) {
              seed[i].x = Math.max(0, ox + (ev.clientX - sx) / st.z);
              seed[i].y = Math.max(0, oy + (ev.clientY - sy) / st.z);
              el.style.left = seed[i].x + 'px'; el.style.top = seed[i].y + 'px';
              drawLinks();
              var mm = host.querySelector('#mm');
              var r = mm.querySelectorAll('rect')[i];
              if (r) { r.setAttribute('x', seed[i].x); r.setAttribute('y', seed[i].y); }
            }
            function up() { el.classList.remove('drag'); st.hist.push(JSON.stringify(seed)); persist(); el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); }
            el.addEventListener('pointermove', mv);
            el.addEventListener('pointerup', up);
          });
        });
      }

      restore(); build(); apply();

      var panning = false, drawing = false, linkMode = false, sx = 0, sy = 0;
      host.addEventListener('pointerdown', function (e) {
        if (e.target.closest('.board-toolbar') || e.target.closest('.node-card')) return;
        if (drawing) {
          drawing = false;
          var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          p.setAttribute('d', free.getAttribute('data-d') || '');
          p.setAttribute('fill', 'none'); p.setAttribute('stroke', 'var(--accent)');
          p.setAttribute('stroke-width', '2.2'); p.setAttribute('stroke-linecap', 'round');
          free.appendChild(p); free.removeAttribute('data-d');
          return;
        }
        panning = true; sx = e.clientX - st.x; sy = e.clientY - st.y; host.setPointerCapture(e.pointerId);
      });
      host.addEventListener('pointermove', function (e) {
        var r = host.getBoundingClientRect();
        if (drawing) {
          var d = free.getAttribute('data-d');
          free.setAttribute('data-d', (d ? d + ' L' : 'M') + (e.clientX - r.left - st.x) + ' ' + (e.clientY - r.top - st.y));
        } else if (panning) {
          st.x = e.clientX - sx; st.y = e.clientY - sy; apply();
        }
      });
      host.addEventListener('pointerup', function () { panning = false; });
      host.addEventListener('wheel', function (e) {
        e.preventDefault();
        var r = host.getBoundingClientRect();
        var mx = e.clientX - r.left, my = e.clientY - r.top;
        var f = e.deltaY < 0 ? 1.12 : 0.89;
        var nz = Math.min(2.2, Math.max(0.35, st.z * f));
        st.x = mx - (mx - st.x) * (nz / st.z); st.y = my - (my - st.y) * (nz / st.z); st.z = nz; apply();
      }, { passive: false });

      host.querySelectorAll('.board-toolbar [data-a]').forEach(function (b) {
        b.onclick = function () {
          var a = b.dataset.a;
          if (a === 'undo') { if (st.hist.length) { st.fut.push(JSON.stringify(seed)); seed = JSON.parse(st.hist.pop()); build(); apply(); } }
          else if (a === 'redo') { if (st.fut.length) { st.hist.push(JSON.stringify(seed)); seed = JSON.parse(st.fut.pop()); build(); apply(); } }
          else if (a === 'draw') { drawing = true; b.style.color = 'var(--accent)'; window.nxToast('Free draw', 'Drag on the board to annotate.'); }
          else if (a === 'link') { linkMode = !linkMode; b.classList.toggle('btn-primary', linkMode); window.nxToast('Relationship mode', linkMode ? 'Click two cards to relate them.' : 'Cancelled.'); }
          else if (a === 'add-evid' || a === 'add-person' || a === 'frame') {
            var t = a === 'add-evid' ? ['EVIDENCE', 'evid'] : a === 'add-person' ? ['PERSON', 'person'] : ['GROUP', 'place'];
            var n = a === 'frame' ? 'Frame — ' + (seed.length + 1) : 'New ' + t[0].toLowerCase() + ' ' + (seed.length + 1);
            st.hist.push(JSON.stringify(seed));
            seed.push({ t: t[0], c: t[1], x: 240 + (seed.length * 40) % 2200, y: 320 + (seed.length * 62) % 1500, n: n, s: 'Unsorted' });
            build(); apply();
            window.nxToast('Board autosaved', 'Layout persisted to this device.');
          }
        };
      });
      nodesEl.addEventListener('click', function (e) {
        if (!linkMode) return;
        var el = e.target.closest('.node-card'); if (!el) return;
        var i = +el.dataset.i;
        if (st.sel === null || st.sel === i) return;
        st.hist.push(JSON.stringify(seed)); links.push([st.sel, i]); drawLinks(); st.sel = i; linkMode = false;
        host.querySelector('[data-a="link"]').classList.remove('btn-primary');
        window.nxToast('Relationship added', 'Potential connection — not a conclusion.');
      });
    };
  document.addEventListener('DOMContentLoaded', markRail);
})();