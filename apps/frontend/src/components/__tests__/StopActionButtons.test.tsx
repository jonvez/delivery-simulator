import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StopActionButtons } from '@/components/StopActionButtons';
import * as updateHook from '@/hooks/useUpdateOrderStatus';
import type { Order } from '@/types/order';
import { OrderStatus } from '@/types/order';

vi.mock('@/hooks/useUpdateOrderStatus');

function makeOrder(status: OrderStatus): Order {
  return {
    id: 'o1',
    customerName: 'Store',
    customerPhone: '+1',
    deliveryAddress: 'Addr',
    orderDetails: null,
    status,
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

describe('StopActionButtons', () => {
  const updateStatus = vi.fn().mockResolvedValue({});

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(updateHook, 'useUpdateOrderStatus').mockReturnValue({
      updateStatus,
      loading: false,
      error: null,
    });
  });

  it('enables Start only when the stop is Assigned', () => {
    render(<StopActionButtons order={makeOrder(OrderStatus.ASSIGNED)} />);
    expect(screen.getByRole('button', { name: /start \(en route\)/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /mark delivered/i })).toBeDisabled();
  });

  it('enables Mark Delivered only when the stop is En Route', () => {
    render(<StopActionButtons order={makeOrder(OrderStatus.IN_TRANSIT)} />);
    expect(screen.getByRole('button', { name: /start \(en route\)/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /mark delivered/i })).toBeEnabled();
  });

  it('shows a Delivered badge (no buttons) once delivered', () => {
    render(<StopActionButtons order={makeOrder(OrderStatus.DELIVERED)} />);
    expect(screen.getByText(/delivered/i)).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('advances to IN_TRANSIT when Start is clicked', () => {
    render(<StopActionButtons order={makeOrder(OrderStatus.ASSIGNED)} />);
    fireEvent.click(screen.getByRole('button', { name: /start \(en route\)/i }));
    expect(updateStatus).toHaveBeenCalledWith('o1', OrderStatus.IN_TRANSIT);
  });

  it('advances to DELIVERED when Mark Delivered is clicked', () => {
    render(<StopActionButtons order={makeOrder(OrderStatus.IN_TRANSIT)} />);
    fireEvent.click(screen.getByRole('button', { name: /mark delivered/i }));
    expect(updateStatus).toHaveBeenCalledWith('o1', OrderStatus.DELIVERED);
  });
});
