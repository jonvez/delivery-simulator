import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RepView } from '@/views/RepView';
import * as driversHook from '@/hooks/useDrivers';
import * as driverOrdersHook from '@/hooks/useDriverOrders';
import type { Order } from '@/types/order';
import { OrderStatus } from '@/types/order';

vi.mock('@/hooks/useDrivers');
vi.mock('@/hooks/useDriverOrders');
vi.mock('@/components/DriverMapView', () => ({
  DriverMapView: () => <div data-testid="map" />,
}));
vi.mock('@/components/RepStopCard', () => ({
  RepStopCard: ({ sequence }: { sequence: number }) => (
    <div data-testid="stop">Stop {sequence}</div>
  ),
}));

function order(id: string): Order {
  return {
    id,
    customerName: 'Store',
    customerPhone: '+1',
    deliveryAddress: 'Addr',
    orderDetails: null,
    status: OrderStatus.ASSIGNED,
    latitude: null,
    longitude: null,
    planogramReviewed: false,
    planogramNotes: null,
    driverId: 'd1',
    driver: null,
    createdAt: '2026-01-01T00:00:00Z',
    assignedAt: null,
    inTransitAt: null,
    deliveredAt: null,
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

function mockDrivers() {
  vi.spyOn(driversHook, 'useDrivers').mockReturnValue({
    drivers: [{ id: 'd1', name: 'Maria Garcia', isAvailable: true, createdAt: '' }],
    loading: false,
    error: null,
    refetch: vi.fn(),
  });
}

function mockDriverOrders(orders: Order[]) {
  vi.spyOn(driverOrdersHook, 'useDriverOrders').mockReturnValue({
    orders,
    loading: false,
    error: null,
    refetch: vi.fn(),
  });
}

describe('RepView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDrivers();
  });

  it('prompts to pick a rep when none is selected', () => {
    mockDriverOrders([]);
    render(
      <MemoryRouter initialEntries={['/route']}>
        <Routes>
          <Route path="/route" element={<RepView />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/pick a rep to act as/i)).toBeInTheDocument();
    expect(screen.queryByTestId('map')).toBeNull();
  });

  it('shows the acting-as rep and their ordered stops when scoped', () => {
    mockDriverOrders([order('a'), order('b')]);
    render(
      <MemoryRouter initialEntries={['/route/d1']}>
        <Routes>
          <Route path="/route/:repId" element={<RepView />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/acting as maria garcia/i)).toBeInTheDocument();
    expect(screen.getByTestId('map')).toBeInTheDocument();
    expect(screen.getAllByTestId('stop')).toHaveLength(2);
  });
});
