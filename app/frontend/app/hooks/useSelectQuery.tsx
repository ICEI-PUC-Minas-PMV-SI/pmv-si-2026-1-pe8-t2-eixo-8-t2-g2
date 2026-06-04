import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export function useSelectQuery<T>(
  key: string,
  fetchFn: (search: string) => Promise<T[]>,
  debounce = 300,
) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, debounce);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [search, debounce]);

  const query = useQuery({
    queryKey: [key, debouncedSearch],
    queryFn: () => fetchFn(debouncedSearch),
    enabled: true,
  });

  return {
    search,
    setSearch,
    options: query.data ?? [],
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}
