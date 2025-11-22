/**
 * Pre-seeded Brooklyn, NY addresses with coordinates
 * Story 4.2: Add Geocoding Support for Addresses
 *
 * This provides fast, offline geocoding for common Brooklyn addresses
 * without needing external API calls
 */

export interface AddressCoordinates {
  address: string;
  latitude: number;
  longitude: number;
  neighborhood?: string;
}

export const BROOKLYN_ADDRESSES: AddressCoordinates[] = [
  // Williamsburg
  { address: '123 Bedford Ave, Brooklyn, NY 11249', latitude: 40.7189, longitude: -73.9572, neighborhood: 'Williamsburg' },
  { address: '456 Metropolitan Ave, Brooklyn, NY 11211', latitude: 40.7147, longitude: -73.9521, neighborhood: 'Williamsburg' },
  { address: '789 Grand St, Brooklyn, NY 11211', latitude: 40.7132, longitude: -73.9564, neighborhood: 'Williamsburg' },

  // Park Slope
  { address: '321 7th Ave, Brooklyn, NY 11215', latitude: 40.6693, longitude: -73.9809, neighborhood: 'Park Slope' },
  { address: '654 5th Ave, Brooklyn, NY 11215', latitude: 40.6649, longitude: -73.9857, neighborhood: 'Park Slope' },
  { address: '987 Prospect Park West, Brooklyn, NY 11215', latitude: 40.6613, longitude: -73.9736, neighborhood: 'Park Slope' },

  // Brooklyn Heights
  { address: '147 Montague St, Brooklyn, NY 11201', latitude: 40.6933, longitude: -73.9932, neighborhood: 'Brooklyn Heights' },
  { address: '258 Henry St, Brooklyn, NY 11201', latitude: 40.6918, longitude: -73.9938, neighborhood: 'Brooklyn Heights' },
  { address: '369 Atlantic Ave, Brooklyn, NY 11201', latitude: 40.6889, longitude: -73.9872, neighborhood: 'Brooklyn Heights' },

  // DUMBO
  { address: '75 Washington St, Brooklyn, NY 11201', latitude: 40.7033, longitude: -73.9893, neighborhood: 'DUMBO' },
  { address: '101 Front St, Brooklyn, NY 11201', latitude: 40.7028, longitude: -73.9897, neighborhood: 'DUMBO' },
  { address: '200 Water St, Brooklyn, NY 11201', latitude: 40.7018, longitude: -73.9856, neighborhood: 'DUMBO' },

  // Bushwick
  { address: '444 Knickerbocker Ave, Brooklyn, NY 11237', latitude: 40.7054, longitude: -73.9190, neighborhood: 'Bushwick' },
  { address: '555 Myrtle Ave, Brooklyn, NY 11237', latitude: 40.6979, longitude: -73.9232, neighborhood: 'Bushwick' },
  { address: '666 Broadway, Brooklyn, NY 11206', latitude: 40.7037, longitude: -73.9471, neighborhood: 'Bushwick' },

  // Sunset Park
  { address: '777 4th Ave, Brooklyn, NY 11232', latitude: 40.6535, longitude: -74.0067, neighborhood: 'Sunset Park' },
  { address: '888 5th Ave, Brooklyn, NY 11220', latitude: 40.6414, longitude: -74.0074, neighborhood: 'Sunset Park' },
  { address: '999 8th Ave, Brooklyn, NY 11220', latitude: 40.6359, longitude: -74.0065, neighborhood: 'Sunset Park' },

  // Crown Heights
  { address: '111 Franklin Ave, Brooklyn, NY 11238', latitude: 40.6735, longitude: -73.9568, neighborhood: 'Crown Heights' },
  { address: '222 Nostrand Ave, Brooklyn, NY 11225', latitude: 40.6673, longitude: -73.9502, neighborhood: 'Crown Heights' },
  { address: '333 Eastern Pkwy, Brooklyn, NY 11238', latitude: 40.6694, longitude: -73.9425, neighborhood: 'Crown Heights' },

  // Fort Greene
  { address: '444 Fulton St, Brooklyn, NY 11201', latitude: 40.6872, longitude: -73.9818, neighborhood: 'Fort Greene' },
  { address: '555 Myrtle Ave, Brooklyn, NY 11205', latitude: 40.6934, longitude: -73.9692, neighborhood: 'Fort Greene' },
  { address: '666 DeKalb Ave, Brooklyn, NY 11205', latitude: 40.6914, longitude: -73.9655, neighborhood: 'Fort Greene' },
];

/**
 * Normalize address string for matching
 */
function normalizeAddress(address: string): string {
  return address
    .toLowerCase()
    .replace(/[,\.]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Find coordinates for a given address in the pre-seeded database
 */
export function findAddressCoordinates(address: string): AddressCoordinates | null {
  const normalized = normalizeAddress(address);

  const match = BROOKLYN_ADDRESSES.find(entry =>
    normalizeAddress(entry.address) === normalized ||
    normalizeAddress(entry.address).includes(normalized) ||
    normalized.includes(normalizeAddress(entry.address).split(' brooklyn')[0])
  );

  return match || null;
}
