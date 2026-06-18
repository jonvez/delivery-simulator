/**
 * DSD (Direct Store Delivery) seed data
 *
 * Shared sample data for the DSD Route Manager demo: route reps, convenience-store
 * accounts, and the product case-drops a rep delivers on a route. Imported by both
 * the seed script (scripts/seed.ts) and the data-reset service (services/data.service.ts)
 * so the two stay in sync.
 *
 * Note: the underlying Prisma columns are still named customerName / orderDetails for
 * schema stability — here they carry store-account and case-list meaning.
 */

// Route reps (the field stored as Driver.name)
export const REP_NAMES = [
  'Mike Chen',
  'Sarah Johnson',
  'David Rodriguez',
  'Emily Williams',
  'James Thompson',
  'Maria Garcia',
  'Alex Kim',
  'Jessica Martinez',
];

// Convenience-store accounts the distributor serves (stored as Order.customerName)
export const STORE_ACCOUNTS = [
  'Bedford Bodega & Deli',
  'Metropolitan Mini Mart',
  'Grand Street Convenience',
  'Park Slope Quick Stop',
  '5th Ave Deli & Grocery',
  'Prospect Corner Market',
  'Montague Smoke & Convenience',
  'Henry Street Mini Mart',
  'Atlantic Gas & Go',
  'DUMBO Front Street Market',
  'Water Street Newsstand',
  'Knickerbocker Deli & Grocery',
  'Myrtle Ave Mini Mart',
  'Broadway Beverage & Convenience',
  'Sunset Park Quick Mart',
  'Nostrand Corner Store',
];

// Product case-drops / restocks delivered on a route (stored as Order.orderDetails)
export const DELIVERY_ITEMS = [
  'Cola — 10 cases (24-pack)',
  'Energy drinks — 6 cases (cooler restock)',
  'Snack rack restock — chips & pretzels',
  'Bottled water — 15 cases',
  'Candy planogram refresh — full reset',
  'Coffee & creamer — 4 cases',
  'Sports drinks — 8 cases',
  'Salty snacks — 12 cases',
  'Iced tea — 6 cases',
  'Beer cooler restock — 20 cases',
  'Gum & mints — counter display',
  'Frozen novelties — 5 cases',
  'Juice & smoothies — 7 cases',
  'Sparkling water — 9 cases',
  'Chips & dip endcap — promo set',
];
