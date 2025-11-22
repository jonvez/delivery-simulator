import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';

export interface HealthCheckResponse {
  status: string;
  database: string;
  timestamp: string;
}

interface UseHealthCheckResult {
  data: HealthCheckResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useHealthCheck(): UseHealthCheckResult {
  const [data, setData] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthCheck = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<HealthCheckResponse>('/api/health');
      setData(response);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthCheck();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchHealthCheck,
  };
}
