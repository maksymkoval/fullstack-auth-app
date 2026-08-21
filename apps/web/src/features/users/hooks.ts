/**
 * React Query hook for the user list. A component just calls
 * useUsers() and gets { data, isLoading, isError } — no useEffect needed.
 */
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api';
import type { User } from '../auth/types';

export const userKeys = {
  all: ['users'] as const,
};

export function useUsers() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: () => apiRequest<User[]>('/users'),
  });
}
