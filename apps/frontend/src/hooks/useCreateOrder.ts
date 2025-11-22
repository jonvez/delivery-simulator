import { useState } from 'react';
import { api, ApiError } from '../lib/api';
import { CreateOrderInput, Order } from '../types/order';

interface UseCreateOrderResult {
  createOrder: (data: CreateOrderInput) => Promise<Order | null>;
  loading: boolean;
  error: string | null;
  success: boolean;
  resetState: () => void;
}

export function useCreateOrder(): UseCreateOrderResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createOrder = async (data: CreateOrderInput): Promise<Order | null> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const order = await api.post<Order, CreateOrderInput>('/api/orders', data);
      setSuccess(true);
      return order;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Failed to create order');
      } else {
        setError('An unexpected error occurred');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    createOrder,
    loading,
    error,
    success,
    resetState,
  };
}
