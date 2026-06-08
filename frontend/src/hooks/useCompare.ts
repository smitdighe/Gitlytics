import { useQuery } from '@tanstack/react-query';
import { profileApi, CompareData } from '../api/profile';

export function useCompare(u1: string, u2: string) {
  return useQuery<CompareData>({
    queryKey: ['compare', u1, u2],
    queryFn: () => profileApi.compare(u1, u2),
    staleTime: 5 * 60 * 1000,
    enabled: !!u1 && !!u2,
    retry: (failureCount, error) => {
      if ((error as { response?: { status?: number } }).response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
}
