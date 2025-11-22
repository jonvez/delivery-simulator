import { useState } from 'react';
import { api, ApiError } from '../lib/api';
import type { Order } from '../types/order';

interface UseAssignOrderResult {
  assignOrder: (orderId: string, driverId: string) => Promise<Order | null>;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for assigning orders to drivers
 * Story 3.5: Implement Order Assignment to Drivers
 */
export function useAssignOrder(): UseAssignOrderResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignOrder = async (orderId: string, driverId: string): Promise<Order | null> => {
    setLoading(true);
    setError(null);

    try {
      const order = await api.patch<Order>(`/api/orders/${orderId}/assign`, { driverId });
      return order;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Failed to assign order');
      } else {
        setError('An unexpected error occurred');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    assignOrder,
    loading,
    error,
  };
}
