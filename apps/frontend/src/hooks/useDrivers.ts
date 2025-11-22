import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../lib/api';
import type { Driver } from '../types/driver';

interface UseDriversResult {
  drivers: Driver[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing drivers
 * Story 3.2: Build Driver Management UI
 */
export function useDrivers(): UseDriversResult {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.get<Driver[]>('/api/drivers');
      setDrivers(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Failed to fetch drivers');
      } else {
        setError('An unexpected error occurred');
      }
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  return {
    drivers,
    loading,
    error,
    refetch: fetchDrivers,
  };
}
