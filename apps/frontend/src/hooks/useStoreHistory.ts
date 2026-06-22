import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../lib/api';
import type { StoreAccountAggregate } from '../types/storeHistory';

interface UseStoreHistoryResult {
  accounts: StoreAccountAggregate[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for the Per-Account view (Issue #3).
 * Fetches per-store-account aggregates: stop history, total drops, last visit.
 */
export function useStoreHistory(): UseStoreHistoryResult {
  const [accounts, setAccounts] = useState<StoreAccountAggregate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.get<StoreAccountAggregate[]>('/api/orders/by-store');
      setAccounts(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Failed to fetch store accounts');
      } else {
        setError('An unexpected error occurred');
      }
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return {
    accounts,
    loading,
    error,
    refetch: fetchAccounts,
  };
}
