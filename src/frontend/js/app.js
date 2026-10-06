// NAGAR-BOT: Unified Robust Client Application
// Self-contained, zero-failure browser script with synchronous global bindings.

(function() {
  console.log("[NAGAR-BOT] Initializing unified command center engine...");

  // --- 1. STATE & CANONICAL TOPOLOGY ---
  const WARD_METADATA = {
    ward_id: "WARD-42",
    ward_name: "Ward 42 (Indiranagar - Central Corridor)",
    city: "Bengaluru, Karnataka (Demo Corridor)"
  };

  const CANONICAL_WAYPOINTS = [
    { id: "WP-01", name: "Ward Depot Exit", distance_m: 0, coords: [12.9784, 77.6408], pos3d: { x: -80, y: 0, z: -120 } },
    { id: "WP-02", name: "100ft Road Cross", distance_m: 140, coords: [12.9772, 77.6415], pos3d: { x: -45, y: 0, z: -80 } },
    { id: "WP-03", name: "Main Vegetable Market", distance_m: 290, coords: [12.9758, 77.6425], pos3d: { x: -10, y: 0, z: -30 } },
    { id: "WP-04", name: "Hospital Flyover Base", distance_m: 440, coords: [12.9745, 77.6438], pos3d: { x: 25, y: 0, z: 20 } },
    { id: "WP-05", name: "Storm-Drain Culvert", distance_m: 590, coords: [12.9732, 77.6450], pos3d: { x: 60, y: 0, z: 70 } },
    { id: "WP-06", name: "Residential Sector 4", distance_m: 730, coords: [12.9720, 77.6462], pos3d: { x: 95, y: 0, z: 115 } },
    { id: "WP-07", name: "Community Park Road", distance_m: 860, coords: [12.9708, 77.6475], pos3d: { x: 130, y: 0, z: 160 } },
    { id: "WP-08", name: "Metro East Terminal", distance_m: 1000, coords: [12.9695, 77.6488], pos3d: { x: 165, y: 0, z: 200 } }
  ];

  let appState = {
    ward: WARD_METADATA,
    waypoints: CANONICAL_WAYPOINTS,
    telemetry: {
      battery_pct: 88,
      current_waypoint_id: "WP-04",
      current_waypoint_index: 3,
      speed_kmh: 0.0,
      status: "STANDBY"
    },
    issues: [],
    work_orders: [],
    audit_logs: []
  };

  let map2d = null;
  let map2dRoverMarker = null;
  let map2dIssueMarkers = [];
  let map3dScene = null;
  let map3dCamera = null;
  let map3dRenderer = null;
  let map3dRover = null;
  let map3dBeacons = [];

  let simCanvas = null;
  let simInterval = null;
  let autoSweepTimer = null;
  let activeModalIssueId = null;
  let currentPresetBase64 = null;
  let currentVideoSource = 'SIMULATION';
  let webcamStream = null;

  // --- 2. SAMPLE HIGH-FIDELITY SVGS FOR ROAD DEFECTS & REPAIRS ---
  function getPotholeSvgDataUri(title = "BEFORE: Deep Pothole (Pre-Repair)") {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
      <rect width="640" height="480" fill="#22252a"/>
      <path d="M0,0 L640,0 L640,480 L0,480 Z" fill="#2d3138"/>
      <line x1="320" y1="0" x2="320" y2="480" stroke="#f59e0b" stroke-dasharray="25,25" stroke-width="6"/>
      <ellipse cx="360" cy="270" rx="140" ry="90" fill="#141517" stroke="#0a0a0b" stroke-width="8"/>
      <ellipse cx="370" cy="280" rx="90" ry="50" fill="#000000"/>
      <path d="M220,270 L170,260 L140,280 M490,250 L540,240 L570,270 M360,180 L350,130" stroke="#1c1d1f" stroke-width="4"/>
      <rect x="20" y="20" width="600" height="45" fill="rgba(0,0,0,0.8)" rx="6"/>
      <text x="35" y="48" font-family="monospace" font-size="16" fill="#00d2b4" font-weight="bold">NAGAR-ROVER POV // CAM-01 [WARD-42 WP-04]</text>
      <rect x="20" y="415" width="600" height="45" fill="rgba(0,0,0,0.8)" rx="6"/>
      <text x="35" y="443" font-family="monospace" font-size="14" fill="#ef4444">${title} | IRC:SP:98</text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  function getRepairedSvgDataUri() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
      <rect width="640" height="480" fill="#22252a"/>
      <path d="M0,0 L640,0 L640,480 L0,480 Z" fill="#2d3138"/>
      <line x1="320" y1="0" x2="320" y2="480" stroke="#f59e0b" stroke-dasharray="25,25" stroke-width="6"/>
      <ellipse cx="360" cy="270" rx="150" ry="100" fill="#1f2022" stroke="#2c2d30" stroke-width="6"/>
      <line x1="230" y1="240" x2="490" y2="240" stroke="#111214" stroke-width="3" opacity="0.7"/>
      <line x1="220" y1="280" x2="500" y2="280" stroke="#111214" stroke-width="3" opacity="0.7"/>
      <rect x="20" y="20" width="600" height="45" fill="rgba(0,0,0,0.8)" rx="6"/>
      <text x="35" y="48" font-family="monospace" font-size="16" fill="#00d2b4" font-weight="bold">CONTRACTOR REPAIR EVIDENCE // CONT-PWD-01</text>
      <rect x="20" y="415" width="600" height="45" fill="rgba(0,0,0,0.8)" rx="6"/>
      <text x="35" y="443" font-family="monospace" font-size="14" fill="#10b981">COMPLETED: Cold-Mix Poly-Asphalt Compaction [WP-04]</text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  function getGarbageSvgDataUri() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
      <rect width="640" height="480" fill="#2b2d30"/>
      <rect x="0" y="240" width="640" height="240" fill="#3a3e45"/>
      <ellipse cx="380" cy="310" rx="160" ry="80" fill="#3d372e"/>
      <circle cx="340" cy="280" r="35" fill="#4a7c59"/>
      <circle cx="410" cy="290" r="40" fill="#2d5d7b"/>
      <rect x="360" y="300" width="60" height="50" fill="#9e6240" rx="4"/>
      <rect x="20" y="20" width="600" height="45" fill="rgba(0,0,0,0.8)" rx="6"/>
      <text x="35" y="48" font-family="monospace" font-size="16" fill="#00d2b4" font-weight="bold">NAGAR-ROVER POV // CAM-01 [WARD-42 WP-03]</text>
      <rect x="20" y="415" width="600" height="45" fill="rgba(0,0,0,0.8)" rx="6"/>
      <text x="35" y="443" font-family="monospace" font-size="14" fill="#f59e0b">HAZARD: Solid Waste Heap (>150kg) | SWM Div</text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  // --- 3. TOAST NOTIFICATIONS ---
  function showToast(message, type = "info") {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type === 'alert' ? 'alert' : 'success'}`;
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // --- 4. API FETCH WRAPPER ---
  async function fetchJson(url, options = {}) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn(`[API] Call to ${url} failed:`, e.message);
      return null;
    }
  }

  // --- 5. CAMERA & SIMULATION ENGINE ---
  function startSimulation() {
    const video = document.getElementById('rover-video');
    if (!simCanvas) {
      simCanvas = document.createElement('canvas');
      simCanvas.width = 640;
      simCanvas.height = 480;
    }
    const ctx = simCanvas.getContext('2d');
    let offset = 0;

    if (simInterval) clearInterval(simInterval);

    simInterval = setInterval(() => {
      offset = (offset + 6) % 80;
      ctx.fillStyle = '#1c1f24';
      ctx.fillRect(0, 0, 640, 480);

      // Perspective road
      ctx.fillStyle = '#2a2f38';
      ctx.beginPath();
      ctx.moveTo(260, 160);
      ctx.lineTo(380, 160);
      ctx.lineTo(600, 480);
      ctx.lineTo(40, 480);
      ctx.fill();

      // Center dashed line
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 6;
      ctx.setLineDash([30, 30]);
      ctx.lineDashOffset = -offset;
      ctx.beginPath();
      ctx.moveTo(320, 160);
      ctx.lineTo(320, 480);
      ctx.stroke();

      // Simulated defect for WP-04 or WP-03
      const wp = appState.telemetry.current_waypoint_id;
      if (wp === 'WP-04') {
        ctx.fillStyle = '#0f1012';
        ctx.beginPath();
        ctx.ellipse(360, 340, 70, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#050505';
        ctx.lineWidth = 4;
        ctx.stroke();
      } else if (wp === 'WP-03') {
        ctx.fillStyle = '#3d372e';
        ctx.beginPath();
        ctx.ellipse(420, 360, 80, 45, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }, 40);

    try {
      const stream = simCanvas.captureStream(25);
      if (video) {
        video.srcObject = stream;
        video.play().catch(() => {});
      }
    } catch (e) {
      console.warn("[Camera] captureStream fallback:", e);
    }
  }

  function captureCurrentFrameBase64() {
    if (currentVideoSource === 'UPLOAD' && currentPresetBase64) {
      return currentPresetBase64;
    }
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    const video = document.getElementById('rover-video');

    if (currentVideoSource === 'WEBCAM' && video && video.videoWidth > 0) {
      ctx.drawImage(video, 0, 0, 640, 480);
    } else if (simCanvas) {
      ctx.drawImage(simCanvas, 0, 0, 640, 480);
    } else {
      const wp = appState.telemetry.current_waypoint_id;
      return wp === 'WP-03' ? getGarbageSvgDataUri() : (wp === 'WP-04' ? getPotholeSvgDataUri() : getRepairedSvgDataUri());
    }
    return canvas.toDataURL('image/jpeg', 0.85);
  }

  // --- 6. 2D LEAFLET GIS MAP ---
  function initMap2D() {
    const el = document.getElementById('map-2d-container');
    if (!el || typeof L === 'undefined' || map2d) return;

    map2d = L.map('map-2d-container', {
      center: [12.9745, 77.6438],
      zoom: 15,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map2d);

    L.control.zoom({ position: 'bottomright' }).addTo(map2d);

    // Route Polyline
    const latlngs = CANONICAL_WAYPOINTS.map(wp => wp.coords);
    L.polyline(latlngs, {
      color: '#00d2b4',
      weight: 4,
      opacity: 0.8,
      dashArray: '8, 8'
    }).addTo(map2d);

    // Waypoints
    CANONICAL_WAYPOINTS.forEach(wp => {
      const circle = L.circleMarker(wp.coords, {
        radius: 6,
        fillColor: '#1e293b',
        color: '#00d2b4',
        weight: 2,
        fillOpacity: 0.9
      }).addTo(map2d);

      circle.bindTooltip(`<b>${wp.id}</b>: ${wp.name}`, { direction: 'top' });
    });

    // Rover Marker
    map2dRoverMarker = L.marker([12.9745, 77.6438], {
      icon: L.divIcon({
        className: 'rover-map-icon',
        html: `<div style="background:#00d2b4; width:16px; height:16px; border-radius:50%; border:3px solid #fff; box-shadow:0 0 12px #00d2b4;"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })
    }).addTo(map2d);

    renderMap2DIssues();
  }

  function renderMap2DIssues() {
    if (!map2d) return;
    map2dIssueMarkers.forEach(m => map2d.removeLayer(m));
    map2dIssueMarkers = [];

    appState.issues.forEach(issue => {
      const isResolved = ["VERIFIED", "CLOSED"].includes(issue.status);
      const isCritical = issue.severity === "CRITICAL" || issue.severity === "HIGH";
      let color = isResolved ? "#10b981" : (isCritical ? "#ef4444" : "#f59e0b");

      const marker = L.marker(issue.coords, {
        icon: L.divIcon({
          className: 'issue-map-icon',
          html: `<div style="background:${color}; width:14px; height:14px; border-radius:3px; border:2px solid #fff; box-shadow:0 0 8px ${color};"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        })
      }).addTo(map2d);

      marker.bindTooltip(`<b>${issue.id}</b>: ${issue.hazard_type} (${issue.status})`, { direction: 'top' });
      marker.on('click', () => window.openIssueModal(issue.id));
      map2dIssueMarkers.push(marker);
    });
  }

  function updateMap2DRover() {
    const wp = CANONICAL_WAYPOINTS.find(w => w.id === appState.telemetry.current_waypoint_id);
    if (wp && map2dRoverMarker) {
      map2dRoverMarker.setLatLng(wp.coords);
    }
  }

  // --- 7. 3D WEBGL SPATIAL TWIN (THREE.JS) ---
  function initMap3D() {
    const container = document.getElementById('canvas-3d-target');
    if (!container || typeof THREE === 'undefined' || map3dScene) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    map3dScene = new THREE.Scene();
    map3dScene.background = new THREE.Color(0x0a0e14);
    map3dScene.fog = new THREE.FogExp2(0x0a0e14, 0.003);

    map3dCamera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    map3dCamera.position.set(120, 180, 260);
    map3dCamera.lookAt(40, 0, 40);

    map3dRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    map3dRenderer.setSize(width, height);
    map3dRenderer.setPixelRatio(window.devicePixelRatio);
    container.innerHTML = '';
    container.appendChild(map3dRenderer.domElement);

    // Lights
    map3dScene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0x00d2b4, 0.8);
    dirLight.position.set(100, 200, 100);
    map3dScene.add(dirLight);

    // Grid Floor
    const grid = new THREE.GridHelper(600, 60, 0x1f293d, 0x141a29);
    grid.position.y = -0.5;
    map3dScene.add(grid);

    // Procedural Buildings
    const buildingMat = new THREE.MeshLambertMaterial({ color: 0x172033 });
    const wireMat = new THREE.LineBasicMaterial({ color: 0x22324f });

    for (let x = -200; x <= 200; x += 50) {
      for (let z = -200; z <= 200; z += 50) {
        if (Math.abs(x - z * 0.7) < 35) continue;
        const h = 15 + Math.abs(Math.sin(x * 0.05 + z * 0.03)) * 60;
        const geo = new THREE.BoxGeometry(28, h, 28);
        const mesh = new THREE.Mesh(geo, buildingMat);
        mesh.position.set(x + (Math.sin(z) * 10), h / 2, z);
        map3dScene.add(mesh);

        const edges = new THREE.EdgesGeometry(geo);
        const line = new THREE.LineSegments(edges, wireMat);
        line.position.copy(mesh.position);
        map3dScene.add(line);
      }
    }

    // Road Ribbon
    const roadMat = new THREE.MeshBasicMaterial({ color: 0x273142, side: THREE.DoubleSide });
    const pts = CANONICAL_WAYPOINTS.map(wp => new THREE.Vector3(wp.pos3d.x, 0.2, wp.pos3d.z));
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const geom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(p1.x - 8, 0.2, p1.z),
        new THREE.Vector3(p1.x + 8, 0.2, p1.z),
        new THREE.Vector3(p2.x + 8, 0.2, p2.z),
        new THREE.Vector3(p2.x - 8, 0.2, p2.z),
        new THREE.Vector3(p1.x - 8, 0.2, p1.z)
      ]);
      map3dScene.add(new THREE.Mesh(geom, roadMat));
    }

    // 3D Rover
    const roverGroup = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 14), new THREE.MeshLambertMaterial({ color: 0x00d2b4 }));
    body.position.y = 4;
    roverGroup.add(body);

    const mast = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    mast.position.set(0, 8, 2);
    roverGroup.add(mast);

    map3dRover = roverGroup;
    map3dScene.add(roverGroup);

    updateMap3DRover();
    renderMap3DBeacons();

    // Loop
    function animate() {
      requestAnimationFrame(animate);
      const t = Date.now() * 0.003;
      map3dBeacons.forEach(b => {
        b.scale.set(1 + Math.sin(t) * 0.2, 1 + Math.sin(t) * 0.2, 1 + Math.sin(t) * 0.2);
        b.rotation.y += 0.02;
      });
      if (map3dRenderer && map3dScene && map3dCamera) {
        map3dRenderer.render(map3dScene, map3dCamera);
      }
    }
    animate();
  }

  function updateMap3DRover() {
    const wp = CANONICAL_WAYPOINTS.find(w => w.id === appState.telemetry.current_waypoint_id);
    if (wp && map3dRover) {
      map3dRover.position.set(wp.pos3d.x, 0, wp.pos3d.z);
    }
  }

  function renderMap3DBeacons() {
    if (!map3dScene) return;
    map3dBeacons.forEach(b => map3dScene.remove(b));
    map3dBeacons = [];

    appState.issues.forEach(issue => {
      if (!issue.pos3d) return;
      const isResolved = ["VERIFIED", "CLOSED"].includes(issue.status);
      const color = isResolved ? 0x10b981 : (issue.severity === "CRITICAL" ? 0xef4444 : 0xf59e0b);

      const grp = new THREE.Group();
      const ring = new THREE.Mesh(new THREE.TorusGeometry(5, 0.8, 8, 24), new THREE.MeshBasicMaterial({ color }));
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 12;
      grp.add(ring);

      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 20, 0)
      ]), new THREE.LineBasicMaterial({ color }));
      grp.add(line);

      grp.position.set(issue.pos3d.x, 0, issue.pos3d.z);
      map3dScene.add(grp);
      map3dBeacons.push(grp);
    });

    const beaconCountEl = document.getElementById('beacon-count');
    if (beaconCountEl) beaconCountEl.innerText = map3dBeacons.length;
  }

  // --- 8. UI RENDERING & LISTS ---
  function renderAll() {
    // Header telemetry
    const wp = CANONICAL_WAYPOINTS.find(w => w.id === appState.telemetry.current_waypoint_id) || CANONICAL_WAYPOINTS[0];
    const hudWp = document.getElementById('hud-waypoint');
    const hudBat = document.getElementById('hud-battery');
    const hudWard = document.getElementById('hud-ward-name');
    if (hudWp) hudWp.innerText = `${wp.id} (${wp.name.split('-')[0].trim()})`;
    if (hudBat) hudBat.innerText = `${appState.telemetry.battery_pct}%`;
    if (hudWard) hudWard.innerText = appState.ward.ward_name;

    // Stat counters
    const activeCount = appState.issues.filter(i => !["VERIFIED", "CLOSED"].includes(i.status)).length;
    const verifiedCount = appState.issues.filter(i => i.status === "VERIFIED").length;
    const dupeCount = appState.issues.reduce((acc, i) => acc + (i.duplicate_candidates ? i.duplicate_candidates.length : 0), 0);

    const statDefects = document.getElementById('stat-active-defects');
    const statVer = document.getElementById('stat-verified');
    const statDupes = document.getElementById('stat-duplicates');
    if (statDefects) statDefects.innerText = `${activeCount} Defects`;
    if (statVer) statVer.innerText = `${verifiedCount} Closed`;
    if (statDupes) statDupes.innerText = `${dupeCount} Clustered`;

    // Waypoint stepper chips
    const stepper = document.getElementById('waypoint-stepper-track');
    if (stepper) {
      stepper.innerHTML = CANONICAL_WAYPOINTS.map(w => {
        const isActive = w.id === appState.telemetry.current_waypoint_id;
        const hasDefect = appState.issues.some(i => i.waypoint_id === w.id && !["VERIFIED", "CLOSED"].includes(i.status));
        return `<div class="wp-chip ${isActive ? 'active' : ''} ${hasDefect ? 'has-defect' : ''}" onclick="window.selectWaypoint('${w.id}')"><b>${w.id}</b></div>`;
      }).join('');
    }

    // Issues list
    const issuesContainer = document.getElementById('issues-list-container');
    const countIssues = document.getElementById('count-issues');
    if (countIssues) countIssues.innerText = appState.issues.length;
    if (issuesContainer) {
      if (appState.issues.length === 0) {
        issuesContainer.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted);">No civic issues recorded yet. Click 'Inspect Current Frame' to scan.</div>`;
      } else {
        issuesContainer.innerHTML = appState.issues.map(issue => `
          <div class="issue-card" onclick="window.openIssueModal('${issue.id}')">
            <div class="card-top">
              <span class="card-id">${issue.id}</span>
              <span class="badge-hazard badge-${issue.hazard_type}">${issue.hazard_type}</span>
            </div>
            <div class="card-title">${issue.visual_description || 'Civic hazard detected.'}</div>
            <div class="card-meta-row">
              <span>📍 ${issue.waypoint_id} (${issue.waypoint_name || 'Corridor'})</span>
              <span class="status-tag status-${issue.status}">${issue.status}</span>
            </div>
            ${issue.duplicate_candidates && issue.duplicate_candidates.length > 0 ? `<div style="margin-top:6px; font-size:10px; color:var(--accent-amber); font-family:var(--font-mono);">⚠️ ${issue.duplicate_candidates.length} Candidate Match (${issue.duplicate_candidates[0].distance_meters}m)</div>` : ''}
          </div>
        `).join('');
      }
    }

    // Work Orders list
    const woContainer = document.getElementById('workorders-list-container');
    const countWo = document.getElementById('count-wo');
    if (countWo) countWo.innerText = appState.work_orders.length;
    if (woContainer) {
      if (appState.work_orders.length === 0) {
        woContainer.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted);">No draft work orders.</div>`;
      } else {
        woContainer.innerHTML = appState.work_orders.map(wo => `
          <div class="wo-card" onclick="window.openIssueModal('${wo.issue_id}')">
            <div class="card-top">
              <span class="card-id">${wo.id}</span>
              <span class="badge-hazard badge-${wo.department_code}">${wo.department_code}</span>
            </div>
            <div class="card-title">${wo.department}</div>
            <div class="card-meta-row">
              <span>👷 ${wo.assigned_contractor_name}</span>
              <span class="status-tag status-${wo.status}">${wo.status}</span>
            </div>
            <div style="margin-top:6px; font-size:10px; color:var(--text-dim); display:flex; justify-content:space-between;">
              <span>SLA: ${wo.sla_resolution_hours}h</span>
              <span>Est. Cost: ₹${(wo.estimated_total_cost_inr || 5000).toLocaleString('en-IN')}</span>
            </div>
          </div>
        `).join('');
      }
    }

    // Audit logs
    const auditContainer = document.getElementById('audit-stream-container');
    if (auditContainer) {
      auditContainer.innerHTML = appState.audit_logs.map(log => `
        <div class="audit-entry">
          <div class="audit-meta">
            <span>${log.action} // ${log.entity_id}</span>
            <span>${new Date(log.timestamp).toLocaleTimeString()}</span>
          </div>
          <div>${log.details} (${log.actor})</div>
          <span class="audit-hash">${log.immutable_hash}</span>
        </div>
      `).join('');
    }

    // Map Updates
    updateMap2DRover();
    renderMap2DIssues();
    updateMap3DRover();
    renderMap3DBeacons();
  }

  // --- 9. SYNCHRONOUS GLOBAL WINDOW BINDINGS (ALL BUTTONS WORK INSTANTLY) ---

  window.setVideoSource = function(sourceType) {
    currentVideoSource = sourceType;
    document.querySelectorAll('.source-tab').forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-source') === sourceType);
    });

    const uploadPanel = document.getElementById('upload-panel');
    const staticImg = document.getElementById('rover-static-view');
    const video = document.getElementById('rover-video');

    if (uploadPanel) uploadPanel.style.display = sourceType === 'UPLOAD' ? 'block' : 'none';

    if (sourceType === 'WEBCAM') {
      if (staticImg) staticImg.style.display = 'none';
      if (video) video.style.display = 'block';
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          webcamStream = stream;
          if (video) { video.srcObject = stream; video.play(); }
        })
        .catch(err => {
          showToast("Webcam unavailable, reverting to Simulation.", "alert");
          window.setVideoSource('SIMULATION');
        });
    } else if (sourceType === 'UPLOAD') {
      if (webcamStream) { webcamStream.getTracks().forEach(t => t.stop()); webcamStream = null; }
      if (video) video.style.display = 'none';
      if (staticImg) { staticImg.style.display = 'block'; }
      window.loadPresetSample('POTHOLE');
    } else {
      // SIMULATION
      if (webcamStream) { webcamStream.getTracks().forEach(t => t.stop()); webcamStream = null; }
      if (staticImg) staticImg.style.display = 'none';
      if (video) video.style.display = 'block';
      startSimulation();
    }
  };

  window.loadPresetSample = function(type) {
    const staticImg = document.getElementById('rover-static-view');
    if (type === 'GARBAGE') {
      currentPresetBase64 = getGarbageSvgDataUri();
    } else if (type === 'CLEAN') {
      currentPresetBase64 = getRepairedSvgDataUri();
    } else {
      currentPresetBase64 = getPotholeSvgDataUri();
    }
    if (staticImg) staticImg.src = currentPresetBase64;
    showToast(`Loaded ${type} sample frame. Click 'Inspect Current Frame' to scan.`);
  };

  window.handleManualFileUpload = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      currentPresetBase64 = evt.target.result;
      const staticImg = document.getElementById('rover-static-view');
      if (staticImg) staticImg.src = evt.target.result;
      showToast("Custom image frame uploaded ready for inspection.");
    };
    reader.readAsDataURL(file);
  };

  window.selectWaypoint = function(wpId) {
    appState.telemetry.current_waypoint_id = wpId;
    const idx = CANONICAL_WAYPOINTS.findIndex(w => w.id === wpId);
    appState.telemetry.current_waypoint_index = idx >= 0 ? idx : 0;
    renderAll();
    showToast(`Rover position set to ${wpId}`);
  };

  window.advanceRoverWaypoint = async function() {
    const res = await fetchJson('/api/telemetry/advance', { method: 'POST' });
    if (res && res.success) {
      appState.telemetry = res.telemetry;
      renderAll();
      showToast(`Rover arrived at ${res.waypoint.id}: ${res.waypoint.name}`);
    } else {
      // Offline simulation increment
      const curIdx = appState.telemetry.current_waypoint_index || 0;
      const nextIdx = (curIdx + 1) % CANONICAL_WAYPOINTS.length;
      appState.telemetry.current_waypoint_index = nextIdx;
      appState.telemetry.current_waypoint_id = CANONICAL_WAYPOINTS[nextIdx].id;
      renderAll();
      showToast(`Rover stepped to ${CANONICAL_WAYPOINTS[nextIdx].id}`);
    }
  };

  window.triggerFrameInspection = async function() {
    const banner = document.getElementById('hud-detection-banner');
    if (banner) {
      banner.className = 'hud-alert';
      banner.innerText = 'INSPECTING VIA LOCAL VLM...';
    }

    const frameBase64 = captureCurrentFrameBase64();
    const wpId = appState.telemetry.current_waypoint_id;
    const hint = wpId === 'WP-03' ? 'GARBAGE_HEAP' : (wpId === 'WP-04' ? 'POTHOLE' : 'CLEAN_ROAD');

    const res = await fetchJson('/api/detect/frame', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_base64: frameBase64,
        waypoint_id: wpId,
        source: 'ROVER_CAM_01',
        hint_hazard: hint
      })
    });

    if (res && res.success) {
      const latencyEl = document.getElementById('hud-latency');
      const modelEl = document.getElementById('hud-model-tag');
      if (latencyEl) latencyEl.innerText = `LATENCY: ${res.ai_result.latency_ms}ms`;
      if (modelEl) modelEl.innerText = `MODEL: ${res.ai_result.model_used.split(' ')[0]}`;

      if (res.ai_result.detected) {
        if (banner) {
          banner.className = 'hud-alert hud-alert-detected';
          banner.innerText = `🚨 ${res.ai_result.hazard_type} DETECTED (${(res.ai_result.confidence_score * 100).toFixed(0)}%) -> TICKET DRAFTED`;
        }
        showToast(`Defect Logged: ${res.ai_result.hazard_type} at ${wpId}`, "alert");
      } else {
        if (banner) {
          banner.className = 'hud-alert';
          banner.innerText = '✅ ROAD SURFACE NORMAL (NO HAZARDS)';
        }
        showToast(`Normal Pavement Verified at ${wpId}`);
      }

      // Re-fetch state
      const snap = await fetchJson('/api/snapshot');
      if (snap) appState = snap;
      renderAll();
    }
  };

  window.toggleAutoSweep = function() {
    const btn = document.getElementById('btn-auto-sweep');
    if (autoSweepTimer) {
      clearInterval(autoSweepTimer);
      autoSweepTimer = null;
      if (btn) {
        btn.innerText = '▶️ Start Auto-Sweep';
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
      }
      showToast("Rover Autonomous Sweep Paused");
    } else {
      if (btn) {
        btn.innerText = '⏸️ Pause Auto-Sweep';
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
      }
      showToast("Rover Autonomous Sweep Started");

      autoSweepTimer = setInterval(async () => {
        await window.advanceRoverWaypoint();
        setTimeout(() => window.triggerFrameInspection(), 800);
      }, 5000);
    }
  };

  window.switchMapView = function(mode) {
    const map2dEl = document.getElementById('map-2d-container');
    const map3dEl = document.getElementById('map-3d-container');
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));

    if (mode === '2D') {
      const b = document.getElementById('btn-view-2d');
      if (b) b.classList.add('active');
      if (map2dEl) { map2dEl.style.display = 'block'; map2dEl.style.height = '100%'; }
      if (map3dEl) map3dEl.style.display = 'none';
      if (map2d) setTimeout(() => map2d.invalidateSize(), 100);
    } else if (mode === '3D') {
      const b = document.getElementById('btn-view-3d');
      if (b) b.classList.add('active');
      if (map2dEl) map2dEl.style.display = 'none';
      if (map3dEl) { map3dEl.style.display = 'block'; map3dEl.style.height = '100%'; }
    } else {
      // SPLIT
      const b = document.getElementById('btn-view-split');
      if (b) b.classList.add('active');
      if (map2dEl) { map2dEl.style.display = 'block'; map2dEl.style.height = '50%'; }
      if (map3dEl) { map3dEl.style.display = 'block'; map3dEl.style.height = '50%'; }
      if (map2d) setTimeout(() => map2d.invalidateSize(), 100);
    }
  };

  window.switchTriageTab = function(tab) {
    document.querySelectorAll('.triage-tab').forEach(t => t.classList.toggle('active', t.getAttribute('data-tab') === tab));
    const tIssues = document.getElementById('tab-content-issues');
    const tWo = document.getElementById('tab-content-workorders');
    const tAudit = document.getElementById('tab-content-audit');
    if (tIssues) tIssues.style.display = tab === 'issues' ? 'block' : 'none';
    if (tWo) tWo.style.display = tab === 'workorders' ? 'block' : 'none';
    if (tAudit) tAudit.style.display = tab === 'audit' ? 'block' : 'none';
  };

  window.openIssueModal = function(issueId) {
    const issue = appState.issues.find(i => i.id === issueId);
    if (!issue) return;
    activeModalIssueId = issueId;

    const modal = document.getElementById('modal-issue-detail');
    if (!modal) return;

    const wo = appState.work_orders.find(w => w.id === issue.work_order_id) || {};

    document.getElementById('modal-kicker').innerText = `ISSUE DOSSIER // ${issue.id} [${issue.waypoint_id}]`;
    document.getElementById('modal-title').innerText = `${issue.hazard_type}: ${issue.visual_description || ''}`;

    document.getElementById('modal-img-before').src = issue.primary_evidence_image || getPotholeSvgDataUri();
    document.getElementById('modal-img-after').src = issue.reinspection_evidence || issue.repair_claim_image || issue.primary_evidence_image || getRepairedSvgDataUri();

    document.getElementById('modal-meta-model').innerText = `Model: ${issue.ai_model || 'Local Edge VLM'}`;
    document.getElementById('modal-meta-conf').innerText = `Confidence: ${(issue.confidence_score * 100).toFixed(0)}%`;
    document.getElementById('modal-meta-src').innerText = `Source: ${issue.source_device || 'ROVER_CAM_01'}`;
    document.getElementById('modal-meta-contractor').innerText = `Claim: ${issue.claimed_by_contractor || 'Pending Assignment'}`;
    document.getElementById('modal-meta-reinspect').innerText = `Inspector: ${issue.reinspected_by || 'Awaiting Re-sweep'}`;

    document.getElementById('modal-wo-id').innerText = wo.id || 'N/A';
    document.getElementById('modal-wo-dept').innerText = wo.department || 'Road Infrastructure (PWD)';
    document.getElementById('modal-wo-officer').innerText = wo.lead_officer || 'AEE Ward 42';
    document.getElementById('modal-wo-sla').innerText = `${wo.sla_resolution_hours || 48} Hours (${issue.severity})`;
    document.getElementById('modal-wo-budget').innerText = `₹${(wo.estimated_total_cost_inr || 5000).toLocaleString('en-IN')} (IRC:SP:98)`;
    document.getElementById('modal-claim-note').innerText = issue.repair_claim_notes || "No contractor claim submitted yet.";

    const dupeBanner = document.getElementById('modal-duplicate-banner');
    if (issue.duplicate_candidates && issue.duplicate_candidates.length > 0) {
      dupeBanner.style.display = 'block';
      const d = issue.duplicate_candidates[0];
      dupeBanner.innerHTML = `⚠️ <b>Spatial Match:</b> ${d.distance_meters}m from historical ticket <b>${d.candidate_issue_id}</b> (${d.current_status}).`;
    } else {
      dupeBanner.style.display = 'none';
    }

    const justEl = document.getElementById('modal-justification');
    if (justEl) justEl.value = issue.verification_notes || '';

    modal.style.display = 'flex';
  };

  window.closeModal = function() {
    const modal = document.getElementById('modal-issue-detail');
    if (modal) modal.style.display = 'none';
    activeModalIssueId = null;
  };

  window.simulateDispatchFromModal = async function() {
    if (!activeModalIssueId) return;
    const res = await fetchJson(`/api/issues/${activeModalIssueId}/assign-workorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contractor_name: "Shri Balaji Roadworks Ltd.", reviewer_officer: "Er. K.S. Murthy (AEE Ward 42)" })
    });
    const snap = await fetchJson('/api/snapshot');
    if (snap) appState = snap;
    renderAll();
    window.openIssueModal(activeModalIssueId);
    showToast(`Work Order Dispatched for ${activeModalIssueId}`);
  };

  window.simulateClaimFromModal = async function() {
    if (!activeModalIssueId) return;
    const res = await fetchJson(`/api/issues/${activeModalIssueId}/claim-repair`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repair_image_base64: getRepairedSvgDataUri(),
        claim_notes: "Polymer cold mix asphalt compacted with tack coat per IRC:SP:98. Ready for audit.",
        contractor_rep: "Shri Balaji Roadworks Ltd."
      })
    });
    const snap = await fetchJson('/api/snapshot');
    if (snap) appState = snap;
    renderAll();
    window.openIssueModal(activeModalIssueId);
    showToast(`Contractor Completion Claim Logged for ${activeModalIssueId}`);
  };

  window.simulateReinspectFromModal = async function() {
    if (!activeModalIssueId) return;
    const res = await fetchJson(`/api/issues/${activeModalIssueId}/reinspect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reinspection_image_base64: getRepairedSvgDataUri(),
        notes: "Rover follow-up sweep frame captured. Pavement level confirmed."
      })
    });
    const snap = await fetchJson('/api/snapshot');
    if (snap) appState = snap;
    renderAll();
    window.openIssueModal(activeModalIssueId);
    showToast(`Re-Inspection Captured for ${activeModalIssueId}`);
  };

  window.submitAuditReview = async function() {
    if (!activeModalIssueId) return;
    const verdictEl = document.querySelector('input[name="audit_verdict"]:checked');
    const justification = document.getElementById('modal-justification').value;
    const reviewer = document.getElementById('modal-reviewer-name').value;

    if (!verdictEl) {
      alert("Please select a review verdict: VERIFIED, UNRESOLVED, or INCONCLUSIVE.");
      return;
    }
    if (!justification || justification.trim().length < 5) {
      alert("Mandatory justification note is required to write to the audit ledger.");
      return;
    }

    const res = await fetchJson(`/api/issues/${activeModalIssueId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        verdict: verdictEl.value,
        justification,
        reviewer_name: reviewer
      })
    });

    if (res && res.success) {
      showToast(`Audit Verdict Committed: ${verdictEl.value}`, "success");
      const snap = await fetchJson('/api/snapshot');
      if (snap) appState = snap;
      renderAll();
      window.closeModal();
    } else {
      alert("Failed to submit audit review.");
    }
  };

  window.seedDemoData = async function() {
    await fetchJson('/api/state/reset', { method: 'POST' });
    const snap = await fetchJson('/api/snapshot');
    if (snap) appState = snap;
    renderAll();
    showToast("Baseline Demonstration Data Loaded");
  };

  window.printAuditReport = function() {
    window.print();
  };

  // --- 10. BOOTSTRAP INITIALIZATION ---
  async function startup() {
    const snap = await fetchJson('/api/snapshot');
    if (snap) appState = snap;

    startSimulation();
    initMap2D();
    initMap3D();
    renderAll();

    // SSE Event Listener
    try {
      const evtSource = new EventSource('/api/events');
      evtSource.onmessage = async (e) => {
        try {
          const parsed = JSON.parse(e.data);
          if (["ISSUE_CREATED", "WORK_ORDER_UPDATED", "REPAIR_CLAIMED", "REINSPECTED", "AUDIT_COMPLETED", "STATE_RESET"].includes(parsed.type)) {
            const updatedSnap = await fetchJson('/api/snapshot');
            if (updatedSnap) {
              appState = updatedSnap;
              renderAll();
            }
          }
        } catch (err) {}
      };
    } catch (e) {}

    console.log("[NAGAR-BOT] All subsystems active.");
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startup);
  } else {
    startup();
  }
})();
