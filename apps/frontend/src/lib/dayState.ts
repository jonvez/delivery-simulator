import type { Order } from '@/types/order';
import { OrderStatus } from '@/types/order';

export interface StatusCounts {
  pending: number;
  assigned: number;
  inTransit: number;
  delivered: number;
}

/** Single-pass tally of orders by status. */
export function getStatusCounts(orders: Order[]): StatusCounts {
  const counts: StatusCounts = { pending: 0, assigned: 0, inTransit: 0, delivered: 0 };
  for (const order of orders) {
    switch (order.status) {
      case OrderStatus.PENDING:
        counts.pending++;
        break;
      case OrderStatus.ASSIGNED:
        counts.assigned++;
        break;
      case OrderStatus.IN_TRANSIT:
        counts.inTransit++;
        break;
      case OrderStatus.DELIVERED:
        counts.delivered++;
        break;
    }
  }
  return counts;
}

export type DayMode = 'plan' | 'monitor';

/**
 * The dispatcher's day is in "plan" mode while any stop is still unassigned, and "monitor"
 * mode once everything is dispatched. This drives the default view so the UI mirrors the
 * rhythm of the day rather than making the dispatcher pick a tab.
 */
export function deriveDayState(orders: Order[]): DayMode {
  return getStatusCounts(orders).pending > 0 ? 'plan' : 'monitor';
}
