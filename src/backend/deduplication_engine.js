// NAGAR-BOT: Spatial & Temporal Deduplication Engine
// Identifies nearby historical defects and clusters candidate duplicates without silent auto-merging.

import { CANONICAL_WAYPOINTS } from './canonical_topology.js';

export function calculateDistanceMeters(coords1, coords2) {
  if (!coords1 || !coords2) return 9999;
  const [lat1, lon1] = coords1;
  const [lat2, lon2] = coords2;
  
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function findDuplicateCandidates(newObservation, existingIssues, thresholdMeters = 35) {
  const candidates = [];
  const targetCoords = newObservation.coords;
  const targetHazard = newObservation.hazard_type;

  for (const issue of existingIssues) {
    // Only compare against active/open or recently claimed issues
    const isClosed = ["VERIFIED", "CLOSED"].includes(issue.status);
    const dist = calculateDistanceMeters(targetCoords, issue.coords);

    if (dist <= thresholdMeters) {
      const sameHazard = issue.hazard_type === targetHazard;
      const matchScore = sameHazard ? Math.max(0.6, 1.0 - (dist / thresholdMeters) * 0.4) : 0.3;

      candidates.push({
        candidate_issue_id: issue.id,
        distance_meters: dist,
        same_hazard_type: sameHazard,
        match_confidence: Number(matchScore.toFixed(2)),
        current_status: issue.status,
        created_at: issue.created_at,
        is_historical_recurrence: isClosed,
        note: isClosed 
          ? `Recurring defect at exact historical location (${dist}m from previous resolved ticket)` 
          : `Potential duplicate of active open ticket (${dist}m away)`
      });
    }
  }

  // Sort closest first
  return candidates.sort((a, b) => a.distance_meters - b.distance_meters);
}
