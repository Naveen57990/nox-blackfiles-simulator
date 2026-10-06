// NAGAR-BOT: Municipal Work Order Generator
// Automatically prepares draft ULB work orders with department routing, SLA deadlines, and estimated budget line items.

import { DEPARTMENTS, CONTRACTOR_REGISTRY, WARD_METADATA } from './canonical_topology.js';

export function generateDraftWorkOrder(issue) {
  let deptKey = "PWD";
  let itemizedCosts = [];
  let estimatedTotalInr = 4500;
  let defaultContractor = CONTRACTOR_REGISTRY[0];

  if (issue.hazard_type === "GARBAGE_HEAP") {
    deptKey = "SWM";
    defaultContractor = CONTRACTOR_REGISTRY[1];
    itemizedCosts = [
      { item: "Compactor / Tipper Truck Mobilization (1 Trip)", qty: "1 Unit", cost_inr: 1800 },
      { item: "Sanitation Field Crew (4 Workers x 2 Hours)", qty: "8 Man-Hours", cost_inr: 1600 },
      { item: "Disinfection & Lime-Bleaching Powder Treatment", qty: "25 Kg", cost_inr: 600 }
    ];
    estimatedTotalInr = 4000;
  } else if (issue.hazard_type === "WATERLOGGING") {
    deptKey = "STORMWATER";
    defaultContractor = CONTRACTOR_REGISTRY[2];
    itemizedCosts = [
      { item: "Portable Dewatering Sump Pump Operation", qty: "3 Hours", cost_inr: 2200 },
      { item: "Culvert Silt Clearance & Grating Repair", qty: "1 Chamber", cost_inr: 3500 },
      { item: "Roadside Berm Desilting Crew", qty: "4 Workers", cost_inr: 1800 }
    ];
    estimatedTotalInr = 7500;
  } else {
    // Default POTHOLE / ROAD DEFECT
    deptKey = "PWD";
    defaultContractor = CONTRACTOR_REGISTRY[0];
    const isCritical = issue.severity === "CRITICAL" || issue.severity === "HIGH";
    itemizedCosts = [
      { item: "Cold-Mix Bituminous Polymer Concrete (Grade VG-30)", qty: isCritical ? "120 Kg" : "60 Kg", cost_inr: isCritical ? 3600 : 1800 },
      { item: "Tack Coat Bitumen Emulsion Application", qty: "15 Litres", cost_inr: 1200 },
      { item: "Vibratory Plate Compactor & Labor Crew", qty: "1 Shift", cost_inr: 2500 },
      { item: "Reflective Road Warning Cones & Barricades", qty: "4 Units", cost_inr: 500 }
    ];
    estimatedTotalInr = isCritical ? 7800 : 6000;
  }

  const dept = DEPARTMENTS[deptKey];
  const slaHours = dept.sla_hours[issue.severity] || 48;
  const deadline = new Date(Date.now() + slaHours * 3600 * 1000).toISOString();

  return {
    issue_id: issue.id,
    ward_id: WARD_METADATA.ward_id,
    ward_name: WARD_METADATA.ward_name,
    department: dept.name,
    department_code: deptKey,
    lead_officer: dept.lead_officer,
    officer_contact: dept.contact,
    hazard_type: issue.hazard_type,
    severity: issue.severity,
    location_summary: `${issue.waypoint_name} (Waypoint: ${issue.waypoint_id})`,
    coords: issue.coords,
    assigned_contractor_id: defaultContractor.id,
    assigned_contractor_name: defaultContractor.name,
    contractor_rating: defaultContractor.rating,
    sla_resolution_hours: slaHours,
    target_completion_deadline: deadline,
    itemized_budget: itemizedCosts,
    estimated_total_cost_inr: estimatedTotalInr,
    execution_notes: `Execute repair following Indian Road Congress (IRC:SP:98-2020) cold-patching specifications. Upload geo-tagged follow-up verification photograph upon completion.`
  };
}
