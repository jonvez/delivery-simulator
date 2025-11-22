import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../lib/api';
import type { Order, OrderStatus } from '../types/order';

interface UseOrdersOptions {
  status?: OrderStatus;
  limit?: number;
  offset?: number;
  autoFetch?: boolean;
}

interface UseOrdersResult {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useOrders(options: UseOrdersOptions = {}): UseOrdersResult {
  const { status, limit, offset, autoFetch = true } = options;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query string
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (limit !== undefined) params.append('limit', limit.toString());
      if (offset !== undefined) params.append('offset', offset.toString());

      const queryString = params.toString();
      const endpoint = queryString ? `/api/orders?${queryString}` : '/api/orders';

      const data = await api.get<Order[]>(endpoint);
      setOrders(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Failed to fetch orders');
      } else {
        setError('An unexpected error occurred');
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [status, limit, offset]);

  useEffect(() => {
    if (autoFetch) {
      fetchOrders();
    }
  }, [autoFetch, fetchOrders]);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
  };
}
