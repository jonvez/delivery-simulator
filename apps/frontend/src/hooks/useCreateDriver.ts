import { useState } from 'react';
import { api, ApiError } from '../lib/api';
import type { Driver, CreateDriverInput } from '../types/driver';

interface UseCreateDriverResult {
  createDriver: (data: CreateDriverInput) => Promise<Driver | null>;
  loading: boolean;
  error: string | null;
  success: boolean;
  resetState: () => void;
}

/**
 * Custom hook for creating drivers
 * Story 3.2: Build Driver Management UI
 */
export function useCreateDriver(): UseCreateDriverResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createDriver = async (data: CreateDriverInput): Promise<Driver | null> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const driver = await api.post<Driver>('/api/drivers', data);
      setSuccess(true);
      return driver;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Failed to create driver');
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
    createDriver,
    loading,
    error,
    success,
    resetState,
  };
}
