// NAGAR-BOT: Rover Camera POV & Video Ingestion Manager

export class RoverCameraController {
  constructor() {
    this.videoEl = document.getElementById('rover-video');
    this.canvasEl = document.getElementById('rover-canvas');
    this.staticImgEl = document.getElementById('rover-static-view');
    this.currentSource = 'SIMULATION';
    this.stream = null;
    this.animInterval = null;
    this.simCanvas = null;
    this.currentPresetBase64 = null;
  }

  init() {
    this.startSimulationCanvas();
  }

  setSource(sourceType) {
    this.currentSource = sourceType;
    
    // Update tab styles
    document.querySelectorAll('.source-tab').forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-source') === sourceType);
    });

    const uploadPanel = document.getElementById('upload-panel');
    if (uploadPanel) {
      uploadPanel.style.display = sourceType === 'UPLOAD' ? 'block' : 'none';
    }

    if (sourceType === 'WEBCAM') {
      this.startWebcam();
    } else if (sourceType === 'UPLOAD') {
      this.stopMedia();
      this.videoEl.style.display = 'none';
      this.staticImgEl.style.display = 'block';
      this.loadPreset('POTHOLE');
    } else {
      // SIMULATION
      this.stopMedia();
      this.staticImgEl.style.display = 'none';
      this.videoEl.style.display = 'block';
      this.startSimulationCanvas();
    }
  }

  async startWebcam() {
    try {
      this.stopMedia();
      this.staticImgEl.style.display = 'none';
      this.videoEl.style.display = 'block';

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      this.videoEl.srcObject = this.stream;
      await this.videoEl.play();
    } catch (err) {
      console.warn("[Camera] Webcam stream inaccessible, falling back to Simulation:", err.message);
      this.setSource('SIMULATION');
    }
  }

  startSimulationCanvas() {
    // Generates an interactive procedural road POV on canvas and pipes it to videoEl
    if (!this.simCanvas) {
      this.simCanvas = document.createElement('canvas');
      this.simCanvas.width = 640;
      this.simCanvas.height = 480;
    }

    const ctx = this.simCanvas.getContext('2d');
    let offset = 0;

    if (this.animInterval) clearInterval(this.animInterval);

    this.animInterval = setInterval(() => {
      offset = (offset + 6) % 80;

      // Dark asphalt
      ctx.fillStyle = '#22252a';
      ctx.fillRect(0, 0, 640, 480);

      // Perspective road horizon
      ctx.fillStyle = '#17191d';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(640, 0);
      ctx.lineTo(640, 160);
      ctx.lineTo(0, 160);
      ctx.fill();

      // Road boundaries
      ctx.fillStyle = '#2f343b';
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

      // Draw simulated defect depending on active waypoint
      const currentWp = window.currentWaypointId || 'WP-04';
      if (currentWp === 'WP-04') {
        // Severe Pothole
        ctx.fillStyle = '#0f1012';
        ctx.beginPath();
        ctx.ellipse(360, 340, 70, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#050505';
        ctx.lineWidth = 4;
        ctx.stroke();
      } else if (currentWp === 'WP-03') {
        // Garbage Pile
        ctx.fillStyle = '#3d372e';
        ctx.beginPath();
        ctx.ellipse(420, 360, 80, 45, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }, 40);

    // Stream canvas to video element
    try {
      const stream = this.simCanvas.captureStream(25);
      this.videoEl.srcObject = stream;
      this.videoEl.play().catch(() => {});
    } catch (e) {
      // Direct static fallback
    }
  }

  stopMedia() {
    if (this.animInterval) clearInterval(this.animInterval);
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    if (this.videoEl.srcObject) {
      this.videoEl.srcObject = null;
    }
  }

  captureFrameBase64() {
    if (this.currentSource === 'UPLOAD' && this.currentPresetBase64) {
      return this.currentPresetBase64;
    }

    const canvas = this.canvasEl || document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    if (this.currentSource === 'WEBCAM' && this.videoEl.videoWidth > 0) {
      ctx.drawImage(this.videoEl, 0, 0, 640, 480);
    } else if (this.simCanvas) {
      ctx.drawImage(this.simCanvas, 0, 0, 640, 480);
    } else {
      ctx.fillStyle = '#222';
      ctx.fillRect(0, 0, 640, 480);
    }

    return canvas.toDataURL('image/jpeg', 0.85);
  }

  loadPreset(type) {
    // Generate deterministic SVGs
    let svg = '';
    if (type === 'GARBAGE') {
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="640" height="480" fill="#2b2d30"/><ellipse cx="380" cy="310" rx="160" ry="80" fill="#4a7c59"/><circle cx="340" cy="280" r="35" fill="#2d5d7b"/><text x="30" y="50" font-family="monospace" font-size="20" fill="#f59e0b">SAMPLE: Uncollected Garbage Heap [WP-03]</text></svg>`;
    } else if (type === 'CLEAN') {
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="640" height="480" fill="#202226"/><line x1="320" y1="0" x2="320" y2="480" stroke="#f59e0b" stroke-dasharray="25,25" stroke-width="6"/><text x="30" y="50" font-family="monospace" font-size="20" fill="#10b981">SAMPLE: Rectified Smooth Pavement [WP-01]</text></svg>`;
    } else {
      // POTHOLE
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="640" height="480" fill="#282a2e"/><ellipse cx="360" cy="270" rx="140" ry="90" fill="#101114"/><text x="30" y="50" font-family="monospace" font-size="20" fill="#ef4444">SAMPLE: Critical Pothole Defect [WP-04]</text></svg>`;
    }

    this.currentPresetBase64 = `data:image/svg+xml;base64,${btoa(svg)}`;
    this.staticImgEl.src = this.currentPresetBase64;
  }
}
