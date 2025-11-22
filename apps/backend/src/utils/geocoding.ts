import { findAddressCoordinates } from '../data/brooklyn-addresses';

/**
 * Geocoding utility for converting addresses to coordinates
 * Story 4.2: Add Geocoding Support for Addresses
 *
 * Uses pre-seeded Brooklyn address database for fast offline geocoding
 */

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  source: 'preseeded' | 'nominatim' | 'default';
}

// Default center of Brooklyn for addresses that can't be geocoded
const BROOKLYN_DEFAULT: GeocodingResult = {
  latitude: 40.6782,
  longitude: -73.9442,
  source: 'default'
};

/**
 * Geocode an address to latitude/longitude coordinates
 *
 * Strategy:
 * 1. Check pre-seeded Brooklyn addresses database (fast, offline)
 * 2. Return default Brooklyn center if not found (for MVP simplicity)
 * 3. Future: Could add Nominatim API fallback with rate limiting
 *
 * @param address - The delivery address to geocode
 * @returns Coordinates and source of geocoding
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult> {
  // Try pre-seeded database first
  const preseeded = findAddressCoordinates(address);
  if (preseeded) {
    return {
      latitude: preseeded.latitude,
      longitude: preseeded.longitude,
      source: 'preseeded'
    };
  }

  // For MVP, return default Brooklyn center for unknown addresses
  // In production, this could call Nominatim API with rate limiting
  console.warn(`Address not found in pre-seeded database: ${address}. Using default Brooklyn center.`);
  return BROOKLYN_DEFAULT;
}

/**
 * Batch geocode multiple addresses
 */
export async function geocodeAddresses(addresses: string[]): Promise<GeocodingResult[]> {
  return Promise.all(addresses.map(addr => geocodeAddress(addr)));
}
