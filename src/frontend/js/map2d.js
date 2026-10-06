// NAGAR-BOT: 2D GIS Leaflet Map Controller
// Displays canonical Ward 42 corridor, waypoints, live rover location, and defect pins.

export class Map2DController {
  constructor(containerId = 'map-2d-container') {
    this.containerId = containerId;
    this.map = null;
    this.roverMarker = null;
    this.waypointMarkers = [];
    this.issueMarkers = [];
    this.routePolyline = null;
  }

  init(waypoints, currentWaypointId) {
    const defaultCenter = [12.9745, 77.6438]; // Ward 42 center
    
    this.map = L.map(this.containerId, {
      center: defaultCenter,
      zoom: 15,
      zoomControl: false,
      attributionControl: false
    });

    // Dark Tile Layer (CartoDB Dark Matter / OpenStreetMap)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(this.map);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Draw Canonical Route
    const latlngs = waypoints.map(wp => wp.coords);
    this.routePolyline = L.polyline(latlngs, {
      color: '#00d2b4',
      weight: 4,
      opacity: 0.8,
      dashArray: '8, 8'
    }).addTo(this.map);

    // Draw Waypoints
    waypoints.forEach((wp, idx) => {
      const circle = L.circleMarker(wp.coords, {
        radius: 6,
        fillColor: '#1e293b',
        color: '#00d2b4',
        weight: 2,
        fillOpacity: 0.9
      }).addTo(this.map);

      circle.bindTooltip(`<b>${wp.id}</b>: ${wp.name}`, {
        permanent: false,
        direction: 'top',
        className: 'leaflet-custom-tooltip'
      });

      this.waypointMarkers.push(circle);
    });

    // Initialize Rover Marker
    this.roverMarker = L.marker(defaultCenter, {
      icon: L.divIcon({
        className: 'rover-map-icon',
        html: `<div style="background:#00d2b4; width:16px; height:16px; border-radius:50%; border:3px solid #fff; box-shadow:0 0 12px #00d2b4; animation:pulse 1.5s infinite;"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })
    }).addTo(this.map);

    this.updateRoverPosition(currentWaypointId, waypoints);
  }

  updateRoverPosition(waypointId, waypoints) {
    const wp = waypoints.find(w => w.id === waypointId);
    if (wp && this.roverMarker) {
      this.roverMarker.setLatLng(wp.coords);
      this.roverMarker.bindTooltip(`<b>NAGAR-ROVER</b> (Active: ${wp.id})`, { permanent: false });
    }
  }

  renderIssues(issues) {
    // Clear previous issue markers
    this.issueMarkers.forEach(m => this.map.removeLayer(m));
    this.issueMarkers = [];

    issues.forEach(issue => {
      const isResolved = ["VERIFIED", "CLOSED"].includes(issue.status);
      const isCritical = issue.severity === "CRITICAL" || issue.severity === "HIGH";
      
      let markerColor = "#f59e0b"; // amber
      if (isResolved) markerColor = "#10b981"; // green
      else if (isCritical) markerColor = "#ef4444"; // red

      const iconHtml = `<div style="background:${markerColor}; width:14px; height:14px; border-radius:3px; border:2px solid #fff; box-shadow:0 0 8px ${markerColor};"></div>`;

      const marker = L.marker(issue.coords, {
        icon: L.divIcon({
          className: 'issue-map-icon',
          html: iconHtml,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        })
      }).addTo(this.map);

      marker.bindTooltip(`<b>${issue.id}</b>: ${issue.hazard_type} (${issue.status})`, {
        direction: 'top'
      });

      marker.on('click', () => {
        if (window.openIssueModal) {
          window.openIssueModal(issue.id);
        }
      });

      this.issueMarkers.push(marker);
    });
  }

  invalidateSize() {
    if (this.map) {
      setTimeout(() => this.map.invalidateSize(), 150);
    }
  }
}
