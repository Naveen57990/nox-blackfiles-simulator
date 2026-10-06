// NAGAR-BOT: Canonical Spatial Topology (Ward 42 Demonstration Environment)
// Unified source of truth for 2D GIS, 3D WebGL, Waypoint Simulation and Work Orders.

export const WARD_METADATA = {
  ward_id: "WARD-42",
  ward_name: "Ward 42 (Indiranagar - Central Corridor)",
  zone: "East Zone",
  city: "Bengaluru, Karnataka (Demonstration Urban Area)",
  total_area_sqkm: 4.8,
  total_road_km: 38.5,
  jurisdiction_officer: "Executive Engineer (Ward 42 ULB Office)",
  demo_label: "DEMO DATA: Canonical Simulation Geometry - Zero Private GPS Collected"
};

export const DEPARTMENTS = {
  PWD: {
    id: "DEPT_PWD",
    name: "Road Infrastructure & Public Works Department (PWD)",
    lead_officer: "Er. K. S. Murthy (AEE Road Maintenance)",
    contact: "pwd-ward42@ulb.gov.in.demo",
    sla_hours: { CRITICAL: 24, HIGH: 48, MEDIUM: 96, LOW: 168 }
  },
  SWM: {
    id: "DEPT_SWM",
    name: "Solid Waste Management (SWM) Division",
    lead_officer: "Smt. R. Anitha (Health Inspector)",
    contact: "swm-ward42@ulb.gov.in.demo",
    sla_hours: { CRITICAL: 12, HIGH: 24, MEDIUM: 48, LOW: 72 }
  },
  STORMWATER: {
    id: "DEPT_DRAIN",
    name: "Stormwater Drainage & Culvert Maintenance",
    lead_officer: "Er. Vivek Nair (Assistant Engineer)",
    contact: "stormwater-ward42@ulb.gov.in.demo",
    sla_hours: { CRITICAL: 12, HIGH: 36, MEDIUM: 72, LOW: 120 }
  }
};

export const CANONICAL_WAYPOINTS = [
  {
    id: "WP-01",
    name: "Ward Depot Exit / Commercial Cross",
    distance_m: 0,
    coords: [12.9784, 77.6408], // [Lat, Lng]
    pos3d: { x: -80, y: 0, z: -120 },
    landmark: "Ward 42 Sanitation Depot Main Gate",
    hazard_profile: "Low Risk - Routine Traffic"
  },
  {
    id: "WP-02",
    name: "100ft Road Cross - Pavement Segment A",
    distance_m: 140,
    coords: [12.9772, 77.6415],
    pos3d: { x: -45, y: 0, z: -80 },
    landmark: "Commercial Plaza Frontage",
    hazard_profile: "Moderate Risk - Heavy Footfall"
  },
  {
    id: "WP-03",
    name: "Main Vegetable Market Corner",
    distance_m: 290,
    coords: [12.9758, 77.6425],
    pos3d: { x: -10, y: 0, z: -30 },
    landmark: "Market Loading Gate & Wet Waste Bins",
    hazard_profile: "High Risk: Chronic Garbage Spillage"
  },
  {
    id: "WP-04",
    name: "Hospital Flyover Base - Left Carriage",
    distance_m: 440,
    coords: [12.9745, 77.6438],
    pos3d: { x: 25, y: 0, z: 20 },
    landmark: "District Hospital Emergency Approach",
    hazard_profile: "Critical Risk: Deep Edge Potholes"
  },
  {
    id: "WP-05",
    name: "Storm-Drain Culvert Junction",
    distance_m: 590,
    coords: [12.9732, 77.6450],
    pos3d: { x: 60, y: 0, z: 70 },
    landmark: "Culvert Sump 14",
    hazard_profile: "High Risk: Monsoon Waterlogging & Silt"
  },
  {
    id: "WP-06",
    name: "Residential Sector 4 Cross",
    distance_m: 730,
    coords: [12.9720, 77.6462],
    pos3d: { x: 95, y: 0, z: 115 },
    landmark: "Government Senior School Gate",
    hazard_profile: "Moderate Risk: Pavement Debris"
  },
  {
    id: "WP-07",
    name: "Community Park Periphery Road",
    distance_m: 860,
    coords: [12.9708, 77.6475],
    pos3d: { x: 130, y: 0, z: 160 },
    landmark: "Park Gate 2 & Walkway Entry",
    hazard_profile: "Low Risk: Minor Cracking"
  },
  {
    id: "WP-08",
    name: "Metro Station East Terminal",
    distance_m: 1000,
    coords: [12.9695, 77.6488],
    pos3d: { x: 165, y: 0, z: 200 },
    landmark: "Metro Pillar 182 - Bus Interchange",
    hazard_profile: "Critical Risk: Dense Multi-Modal Traffic"
  }
];

export const CONTRACTOR_REGISTRY = [
  {
    id: "CONT-PWD-01",
    name: "Shri Balaji Roadworks Ltd.",
    category: "ROAD_REPAIR",
    rating: 4.4,
    active_jobs: 2
  },
  {
    id: "CONT-SWM-02",
    name: "GreenClean Urban Solutions",
    category: "SOLID_WASTE",
    rating: 4.7,
    active_jobs: 1
  },
  {
    id: "CONT-DRAIN-03",
    name: "Cauvery Hydrotech Drainage Works",
    category: "DRAINAGE",
    rating: 4.2,
    active_jobs: 3
  }
];
