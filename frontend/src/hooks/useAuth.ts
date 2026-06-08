import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { useEffect } from 'react';

export function useAuthCheck() {
  const { setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authApi.me();
        setUser(user);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [setUser, logout, setLoading]);
}

export function useUser() {
  return useQuery({
    queryKey: ['me'],
    queryFn: authApi.me,
    enabled: false,
  });
}
