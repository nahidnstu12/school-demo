import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FilterConfig } from '@/utils/filter-helpers';
import { useFilterStore } from '../useFilterStore';

export function useSyncUrlWithFilterStore(config: FilterConfig) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setConfig = useFilterStore((state) => state.setConfig);
  const parseFromUrl = useFilterStore((state) => state.parseFromUrl);

  // Set config once
  useEffect(() => {
    setConfig(config);
  }, [config, setConfig]);

  // Sync from URL when it changes
  useEffect(() => {
    parseFromUrl(searchParams as unknown as URLSearchParams);
  }, [searchParams, parseFromUrl]);

  return null;
}
