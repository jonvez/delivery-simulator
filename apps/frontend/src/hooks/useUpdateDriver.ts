import { useState } from 'react';
import { api, ApiError } from '../lib/api';
import type { Driver } from '../types/driver';

interface UpdateDriverInput {
  name?: string;
  isAvailable?: boolean;
}

interface UseUpdateDriverResult {
  updateDriver: (id: string, data: UpdateDriverInput) => Promise<Driver | null>;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for updating drivers
 * Story 3.3: Implement Driver Availability Toggle
 */
export function useUpdateDriver(): UseUpdateDriverResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDriver = async (id: string, data: UpdateDriverInput): Promise<Driver | null> => {
    setLoading(true);
    setError(null);

    try {
      const driver = await api.patch<Driver>(`/api/drivers/${id}`, data);
      return driver;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Failed to update driver');
      } else {
        setError('An unexpected error occurred');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateDriver,
    loading,
    error,
  };
}
