import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUpdateOrderStatus } from '@/hooks/useUpdateOrderStatus';
import { api, ApiError } from '@/lib/api';
import { OrderStatus } from '@/types/order';

describe('useUpdateOrderStatus', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('PATCHes /api/orders/:id with the new status and returns the order', async () => {
    const mockOrder = { id: 'o1', status: OrderStatus.IN_TRANSIT } as never;
    const spy = vi.spyOn(api, 'patch').mockResolvedValue(mockOrder);

    const { result } = renderHook(() => useUpdateOrderStatus());

    let returned;
    await act(async () => {
      returned = await result.current.updateStatus('o1', OrderStatus.IN_TRANSIT);
    });

    expect(spy).toHaveBeenCalledWith('/api/orders/o1', { status: OrderStatus.IN_TRANSIT });
    expect(returned).toBe(mockOrder);
    expect(result.current.error).toBeNull();
  });

  it('sets the error message and returns null on ApiError', async () => {
    vi.spyOn(api, 'patch').mockRejectedValue(new ApiError('Cannot update', 400));

    const { result } = renderHook(() => useUpdateOrderStatus());

    let returned;
    await act(async () => {
      returned = await result.current.updateStatus('o1', OrderStatus.DELIVERED);
    });

    expect(returned).toBeNull();
    expect(result.current.error).toBe('Cannot update');
  });
});
