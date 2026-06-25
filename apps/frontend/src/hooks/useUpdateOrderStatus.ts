import { useState } from 'react';
import { api, ApiError } from '../lib/api';
import type { Order, OrderStatus } from '../types/order';

interface UseUpdateOrderStatusResult {
  updateStatus: (orderId: string, status: OrderStatus) => Promise<Order | null>;
  loading: boolean;
  error: string | null;
}

/**
 * Advance a stop through its lifecycle (Assigned → En Route → Delivered). PATCH /api/orders/:id
 * with { status } sets the matching timestamp server-side. Mirrors useAssignOrder.
 */
export function useUpdateOrderStatus(): UseUpdateOrderStatusResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (orderId: string, status: OrderStatus): Promise<Order | null> => {
    setLoading(true);
    setError(null);

    try {
      const order = await api.patch<Order>(`/api/orders/${orderId}`, { status });
      return order;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Failed to update stop status');
      } else {
        setError('An unexpected error occurred');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateStatus, loading, error };
}
