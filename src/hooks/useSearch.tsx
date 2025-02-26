import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

interface UseSearchOptions {
  debounceMs?: number;
}

export function useSearch({ debounceMs = 300 }: UseSearchOptions = {}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const updateSearchParams = useDebouncedCallback(
    (name: string, value: string | number | boolean | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value !== null && value !== '') {
        params.set(name, String(value));
      } else {
        params.delete(name);
      }

      // Reset page when search params change
      if (name !== 'page') {
        params.delete('page');
      }

      replace(`${pathname}?${params.toString()}`);
    },
    debounceMs
  );

  return {
    searchParams,
    updateSearchParams,
  };
}
