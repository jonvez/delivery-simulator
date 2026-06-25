import { describe, it, expect } from 'vitest';
import { getStatusCounts, deriveDayState } from '@/lib/dayState';
import type { Order } from '@/types/order';
import { OrderStatus } from '@/types/order';

function order(status: OrderStatus, id = '1'): Order {
  return {
    id,
    customerName: 'Store',
    customerPhone: '+1',
    deliveryAddress: 'Addr',
    orderDetails: null,
    status,
    latitude: null,
    longitude: null,
    planogramReviewed: false,
    planogramNotes: null,
    driverId: null,
    driver: null,
    createdAt: '2026-01-01T00:00:00Z',
    assignedAt: null,
    inTransitAt: null,
    deliveredAt: null,
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

describe('getStatusCounts', () => {
  it('tallies each status in one pass', () => {
    const orders = [
      order(OrderStatus.PENDING),
      order(OrderStatus.PENDING),
      order(OrderStatus.ASSIGNED),
      order(OrderStatus.IN_TRANSIT),
      order(OrderStatus.DELIVERED),
      order(OrderStatus.DELIVERED),
      order(OrderStatus.DELIVERED),
    ];
    expect(getStatusCounts(orders)).toEqual({ pending: 2, assigned: 1, inTransit: 1, delivered: 3 });
  });

  it('returns all zeros for no orders', () => {
    expect(getStatusCounts([])).toEqual({ pending: 0, assigned: 0, inTransit: 0, delivered: 0 });
  });
});

describe('deriveDayState', () => {
  it('is plan while any stop is unassigned', () => {
    expect(deriveDayState([order(OrderStatus.PENDING), order(OrderStatus.DELIVERED)])).toBe('plan');
  });

  it('is monitor once nothing is pending', () => {
    expect(deriveDayState([order(OrderStatus.ASSIGNED), order(OrderStatus.DELIVERED)])).toBe('monitor');
  });

  it('is monitor for an empty day', () => {
    expect(deriveDayState([])).toBe('monitor');
  });
});
