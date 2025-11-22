import { useState, useEffect } from 'react';
import { api, ApiError } from '../lib/api';
import type { Order } from '../types/order';

interface UseDriverOrdersResult {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching orders for a specific driver
 * Story 3.7: Display Driver-Specific Order Views
 */
export function useDriverOrders(driverId: string | null): UseDriverOrdersResult {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!driverId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await api.get<Order[]>(`/api/drivers/${driverId}/orders`);
      setOrders(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Failed to fetch driver orders');
      } else {
        setError('An unexpected error occurred');
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [driverId]);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
  };
}
