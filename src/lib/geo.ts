import { Location } from '@/types';

// Haversine formula to calculate distance between two coordinates
export function calculateDistance(loc1: Location, loc2: Location): number {
  const R = 6371000; // Earth's radius in meters
  const lat1Rad = (loc1.lat * Math.PI) / 180;
  const lat2Rad = (loc2.lat * Math.PI) / 180;
  const deltaLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const deltaLng = ((loc2.lng - loc1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export function isWithinRadius(userLocation: Location, spaceCenter: Location, radius: number): boolean {
  const distance = calculateDistance(userLocation, spaceCenter);
  return distance <= radius;
}

export function isOutsideBoundary(
  userLocation: Location,
  spaceCenter: Location,
  radius: number,
  buffer: number = 50
): boolean {
  const distance = calculateDistance(userLocation, spaceCenter);
  return distance > radius + buffer;
}

// Generate random position within a radius for demo purposes
export function generateRandomPosition(center: Location, radius: number): Location {
  const r = radius * Math.sqrt(Math.random());
  const theta = Math.random() * 2 * Math.PI;
  
  // Convert radius from meters to degrees (approximate)
  const radiusDegrees = radius / 111320;
  
  return {
    lat: center.lat + (r / 111320) * Math.cos(theta),
    lng: center.lng + (r / (111320 * Math.cos(center.lat * Math.PI / 180))) * Math.sin(theta),
  };
}

// Convert distance to radar coordinates (0-100 scale)
export function distanceToRadarPosition(
  userLocation: Location,
  targetLocation: Location,
  maxRadius: number
): { x: number; y: number } {
  const dx = targetLocation.lng - userLocation.lng;
  const dy = targetLocation.lat - userLocation.lat;
  
  const distance = calculateDistance(userLocation, targetLocation);
  const normalizedDistance = Math.min(distance / maxRadius, 1);
  
  const angle = Math.atan2(dy, dx);
  
  return {
    x: 50 + normalizedDistance * 40 * Math.cos(angle),
    y: 50 - normalizedDistance * 40 * Math.sin(angle),
  };
}
