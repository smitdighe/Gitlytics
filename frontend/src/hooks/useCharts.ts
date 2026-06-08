import { useState, useEffect } from 'react';

export function useChartImage(url: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const img = new Image();
    img.src = url;
    img.onload = () => setIsLoading(false);
    img.onerror = () => {
      setError(new Error('Failed to load chart'));
      setIsLoading(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [url]);

  return { isLoading, error };
}
