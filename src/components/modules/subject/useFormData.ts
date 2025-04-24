// hooks/useFormData.ts
import { ActionResult } from '@/actions/IServerAction';
import { useEffect, useState } from 'react';

export // Truly reusable useFormData hook
function useFormData<T>(
  fetchFunction: (id: string) => Promise<ActionResult<T>>,
  id?: string,
  enabled: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip if no ID or fetch is disabled
    if (!id || !enabled) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await fetchFunction(id);
        if (result.success) {
          setData(result.data);
          setError(null);
        } else {
          setError(result.errors?.[0]?.message || 'Failed to load data');
          setData(null);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('An error occurred while loading the data');
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, fetchFunction, enabled]);

  return { data, isLoading, error };
}