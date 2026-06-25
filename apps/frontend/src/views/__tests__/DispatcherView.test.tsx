import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DispatcherView } from '@/views/DispatcherView';
import * as ordersHook from '@/hooks/useOrders';
import type { Order } from '@/types/order';
import { OrderStatus } from '@/types/order';

vi.mock('@/hooks/useOrders');
vi.mock('@/views/dispatcher/PlanAndAssignPanel', () => ({
  PlanAndAssignPanel: () => <div data-testid="plan-panel" />,
}));
vi.mock('@/views/dispatcher/MonitorRoutesPanel', () => ({
  MonitorRoutesPanel: () => <div data-testid="monitor-panel" />,
}));

function order(status: OrderStatus, id: string): Order {
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

function mockOrders(orders: Order[]) {
  vi.spyOn(ordersHook, 'useOrders').mockReturnValue({
    orders,
    loading: false,
    error: null,
    refetch: vi.fn(),
  });
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <DispatcherView />
    </MemoryRouter>
  );
}

describe('DispatcherView', () => {
  beforeEach(() => vi.clearAllMocks());

  it('defaults to Plan & Assign while stops are unassigned', () => {
    mockOrders([order(OrderStatus.PENDING, '1'), order(OrderStatus.DELIVERED, '2')]);
    renderAt('/dispatch');
    expect(screen.getByTestId('plan-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('monitor-panel')).toBeNull();
  });

  it('defaults to Monitor Routes once nothing is pending', () => {
    mockOrders([order(OrderStatus.ASSIGNED, '1'), order(OrderStatus.DELIVERED, '2')]);
    renderAt('/dispatch');
    expect(screen.getByTestId('monitor-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('plan-panel')).toBeNull();
  });

  it('honors an explicit ?mode over the derived default', () => {
    mockOrders([order(OrderStatus.PENDING, '1')]);
    renderAt('/dispatch?mode=monitor');
    expect(screen.getByTestId('monitor-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('plan-panel')).toBeNull();
  });

  it('renders the status counts strip', () => {
    mockOrders([
      order(OrderStatus.PENDING, '1'),
      order(OrderStatus.PENDING, '2'),
      order(OrderStatus.ASSIGNED, '3'),
    ]);
    renderAt('/dispatch');
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
    // 2 pending
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
