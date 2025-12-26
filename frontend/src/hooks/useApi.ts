import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  options: UseApiOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(options.immediate !== false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.immediate !== false) {
      execute();
    }
  }, dependencies);

  return { data, loading, error, execute, refetch: execute };
}

export function useUsers(page = 1, limit = 10, search = '') {
  return useApi(
    () => api.getUsers(page, limit, search),
    [page, limit, search]
  );
}

export function useBranches() {
  return useApi(() => api.getBranches());
}

export function useElections() {
  return useApi(() => api.getElections());
}

export function usePositions(electionId?: string) {
  return useApi(
    () => api.getPositions(electionId),
    [electionId]
  );
}

export function useCandidates(positionId?: string) {
  return useApi(
    () => api.getCandidates(positionId),
    [positionId]
  );
}

export function useDashboardStats() {
  return useApi(() => api.getDashboardStats());
}