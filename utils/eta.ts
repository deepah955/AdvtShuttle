// Haversine distance calculation
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ETA calculation
export function calculateETA(
  shuttleLat: number,
  shuttleLon: number,
  userLat: number,
  userLon: number,
  shuttleSpeed: number // m/s
): number {
  const distance = haversineDistance(shuttleLat, shuttleLon, userLat, userLon);
  const speedMs = (shuttleSpeed * 1000) / 3600; // Convert km/h to m/s
  return distance / speedMs; // seconds
}

export function formatETA(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}