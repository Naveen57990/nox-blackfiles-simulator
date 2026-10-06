// NAGAR-BOT: 3D WebGL Digital Twin (Three.js)
// Illustrative spatial twin sharing canonical Ward 42 route coordinates and defect beacons.

export class Map3DController {
  constructor(targetElementId = 'canvas-3d-target') {
    this.targetId = targetElementId;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.roverMesh = null;
    this.beacons = [];
    this.isInitialized = false;
    this.animId = null;
  }

  init(waypoints, currentWaypointId) {
    const container = document.getElementById(this.targetId);
    if (!container || this.isInitialized) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0e14);
    this.scene.fog = new THREE.FogExp2(0x0a0e14, 0.003);

    // Camera (Isometric perspective)
    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    this.camera.position.set(120, 180, 260);
    this.camera.lookAt(40, 0, 40);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00d2b4, 0.8);
    dirLight.position.set(100, 200, 100);
    this.scene.add(dirLight);

    // Grid Floor
    const grid = new THREE.GridHelper(600, 60, 0x1f293d, 0x141a29);
    grid.position.y = -0.5;
    this.scene.add(grid);

    // Generate Procedural City Blocks & Buildings
    this.generateBuildings();

    // Generate Road Corridor
    this.generateRoad(waypoints);

    // Create 3D Rover
    this.createRover();

    this.updateRoverPosition(currentWaypointId, waypoints);

    // Animation Loop
    const animate = () => {
      this.animId = requestAnimationFrame(animate);
      
      // Gentle beacon pulsing
      const time = Date.now() * 0.003;
      this.beacons.forEach(b => {
        b.scale.set(1 + Math.sin(time) * 0.2, 1 + Math.sin(time) * 0.2, 1 + Math.sin(time) * 0.2);
        b.rotation.y += 0.02;
      });

      this.renderer.render(this.scene, this.camera);
    };
    animate();

    this.isInitialized = true;
    window.addEventListener('resize', () => this.onResize());
  }

  generateBuildings() {
    const buildingMat = new THREE.MeshLambertMaterial({ color: 0x172033, wireframe: false });
    const wireMat = new THREE.LineBasicMaterial({ color: 0x22324f });

    // Deterministic procedural buildings away from road center
    for (let x = -200; x <= 200; x += 50) {
      for (let z = -200; z <= 200; z += 50) {
        if (Math.abs(x - z * 0.7) < 35) continue; // Leave road corridor clear

        const height = 15 + Math.abs(Math.sin(x * 0.05 + z * 0.03)) * 60;
        const geo = new THREE.BoxGeometry(28, height, 28);
        const mesh = new THREE.Mesh(geo, buildingMat);
        mesh.position.set(x + (Math.sin(z) * 10), height / 2, z);
        this.scene.add(mesh);

        const edges = new THREE.EdgesGeometry(geo);
        const line = new THREE.LineSegments(edges, wireMat);
        line.position.copy(mesh.position);
        this.scene.add(line);
      }
    }
  }

  generateRoad(waypoints) {
    const roadMat = new THREE.MeshBasicMaterial({ color: 0x273142, side: THREE.DoubleSide });
    const points = waypoints.map(wp => new THREE.Vector3(wp.pos3d.x, 0.2, wp.pos3d.z));
    
    // Draw segmented road ribbons
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      
      const geom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(p1.x - 8, 0.2, p1.z),
        new THREE.Vector3(p1.x + 8, 0.2, p1.z),
        new THREE.Vector3(p2.x + 8, 0.2, p2.z),
        new THREE.Vector3(p2.x - 8, 0.2, p2.z),
        new THREE.Vector3(p1.x - 8, 0.2, p1.z)
      ]);
      const roadMesh = new THREE.Mesh(geom, roadMat);
      this.scene.add(roadMesh);
    }
  }

  createRover() {
    const group = new THREE.Group();
    
    // Chassis
    const bodyGeo = new THREE.BoxGeometry(10, 5, 14);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x00d2b4 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 4;
    group.add(body);

    // Sensor Mast & Camera
    const mastGeo = new THREE.CylinderGeometry(1, 1, 6);
    const mastMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.set(0, 8, 2);
    group.add(mast);

    // Headlight Beam
    const light = new THREE.SpotLight(0x00ffff, 2, 80, Math.PI / 6);
    light.position.set(0, 7, 6);
    light.target.position.set(0, 0, 40);
    group.add(light);
    group.add(light.target);

    this.roverMesh = group;
    this.scene.add(group);
  }

  updateRoverPosition(waypointId, waypoints) {
    const wp = waypoints.find(w => w.id === waypointId);
    if (wp && this.roverMesh) {
      this.roverMesh.position.set(wp.pos3d.x, 0, wp.pos3d.z);
    }
  }

  renderIssueBeacons(issues) {
    // Clear old beacons
    this.beacons.forEach(b => this.scene.remove(b));
    this.beacons = [];

    issues.forEach(issue => {
      if (!issue.pos3d) return;

      const isResolved = ["VERIFIED", "CLOSED"].includes(issue.status);
      const color = isResolved ? 0x10b981 : (issue.severity === "CRITICAL" ? 0xef4444 : 0xf59e0b);

      const beaconGroup = new THREE.Group();

      // Floating ring
      const ringGeo = new THREE.TorusGeometry(5, 0.8, 8, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: color });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 12;
      beaconGroup.add(ring);

      // Vertical laser line
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 20, 0)
      ]);
      const lineMat = new THREE.LineBasicMaterial({ color: color });
      const line = new THREE.Line(lineGeo, lineMat);
      beaconGroup.add(line);

      beaconGroup.position.set(issue.pos3d.x, 0, issue.pos3d.z);
      this.scene.add(beaconGroup);
      this.beacons.push(beaconGroup);
    });

    const countEl = document.getElementById('beacon-count');
    if (countEl) countEl.innerText = this.beacons.length;
  }

  onResize() {
    const container = document.getElementById(this.targetId);
    if (!container || !this.renderer || !this.camera) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}
