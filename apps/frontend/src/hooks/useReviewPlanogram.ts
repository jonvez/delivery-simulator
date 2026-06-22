import { useState } from 'react';
import { api, ApiError } from '../lib/api';
import type { Order, ReviewPlanogramInput } from '../types/order';

interface UseReviewPlanogramResult {
  reviewPlanogram: (orderId: string, input: ReviewPlanogramInput) => Promise<Order | null>;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for recording a planogram-compliance review for a stop.
 * Issue #4: a rep marks "planogram reviewed" and optionally records notes.
 */
export function useReviewPlanogram(): UseReviewPlanogramResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reviewPlanogram = async (
    orderId: string,
    input: ReviewPlanogramInput
  ): Promise<Order | null> => {
    setLoading(true);
    setError(null);

    try {
      const order = await api.patch<Order, ReviewPlanogramInput>(
        `/api/orders/${orderId}/planogram`,
        input
      );
      return order;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Failed to save planogram review');
      } else {
        setError('An unexpected error occurred');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    reviewPlanogram,
    loading,
    error,
  };
}
