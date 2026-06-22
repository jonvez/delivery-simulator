import type { OrderStatus } from './order';

/**
 * A single stop in a store account's delivery history (Per-Account view, Issue #3).
 */
export interface StoreHistoryStop {
  id: string;
  status: OrderStatus;
  createdAt: string;
  deliveredAt: string | null;
}

/**
 * Per-store-account aggregate for the Per-Account view (Issue #3):
 * stop history, total drops, and last-visit date.
 */
export interface StoreAccountAggregate {
  storeAccount: string;
  storeAddress: string;
  totalStops: number;
  totalDrops: number;
  lastVisit: string | null;
  history: StoreHistoryStop[];
}
