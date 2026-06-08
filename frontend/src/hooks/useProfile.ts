import { useQuery } from '@tanstack/react-query';
import { profileApi, ProfileData } from '../api/profile';

export function useProfile(username: string) {
  return useQuery<ProfileData>({
    queryKey: ['profile', username],
    queryFn: () => profileApi.getProfile(username),
    staleTime: 5 * 60 * 1000,
    enabled: !!username,
    retry: (failureCount, error) => {
      if ((error as { response?: { status?: number } }).response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
}
