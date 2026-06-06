import { useCallback, useEffect, useRef, useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TableProps } from 'antd';
import type { SorterResult, TablePaginationConfig } from 'antd/es/table/interface';

export type SortOrder = 'ascend' | 'descend';

export type Sort = { key: string; order: SortOrder };

export type TableParams<F extends Record<string, unknown> = Record<string, unknown>> = {
  page: number;
  pageSize: number;
  filters: F;
  sorters: Sort[];
  search: string;
};

export type FetchResult<T> = { data: T[]; total: number };

export type FetchFn<T, F extends Record<string, unknown>> = (
  params: TableParams<F>,
) => Promise<FetchResult<T>>;

export type UseTableQueryOptions<F extends Record<string, unknown>> = {
  initialParams?: Partial<TableParams<F>>;
  searchDebounce?: number;
  /** Persiste estado no localStorage usando `key` como namespace. @default true */
  persist?: boolean;
};

const STORAGE_PREFIX = 'table:';

function loadFromStorage<F extends Record<string, unknown>>(
  key: string,
  defaults: TableParams<F>,
): TableParams<F> {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

function saveToStorage(key: string, params: TableParams) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(params));
  } catch {
    /* storage indisponível */
  }
}

export function useTableQuery<
  T,
  F extends Record<string, unknown> = Record<string, unknown>,
>(key: string, fetchFn: FetchFn<T, F>, options: UseTableQueryOptions<F> = {}) {
  const { initialParams = {}, searchDebounce = 400, persist = true } = options;

  const defaults: TableParams<F> = {
    page: 1,
    pageSize: 10,
    filters: {} as F,
    sorters: [],
    search: '',
    ...initialParams,
  };

  const [params, setParams] = useState<TableParams<F>>(() =>
    persist ? loadFromStorage(key, defaults) : defaults,
  );

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState(params.search);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(
      () => setDebouncedSearch(params.search),
      searchDebounce,
    );
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [params.search, searchDebounce]);

  useEffect(() => {
    if (persist) saveToStorage(key, params);
  }, [key, params, persist]);

  const query = useQuery({
    queryKey: [key, { ...params, search: debouncedSearch }],
    queryFn: () => fetchFn({ ...params, search: debouncedSearch }),
    placeholderData: keepPreviousData,
  });

  const setSearch = useCallback(
    (search: string) => setParams((prev) => ({ ...prev, search, page: 1 })),
    [],
  );

  const setPage = useCallback((page: number, pageSize?: number) => {
    setParams((prev) => ({
      ...prev,
      page,
      pageSize: pageSize ?? prev.pageSize,
    }));
  }, []);

  const setFilters = useCallback(
    (filters: F) => setParams((prev) => ({ ...prev, filters, page: 1 })),
    [],
  );
  const setSorters = useCallback(
    (sorters: Sort[]) => setParams((prev) => ({ ...prev, sorters, page: 1 })),
    [],
  );
  const updateSorter = useCallback((field: string, order: SortOrder) => {
    setParams((prev) => {
      const current = prev.sorters.find((s) => s.key === field);

      let newSorters: Sort[];

      if (current) {
        if (current.order === order) {
          // Se a ordenação é a mesma, remove o sorter (toggle)
          newSorters = prev.sorters.filter((s) => s.key !== field);
        } else {
          // Caso contrário, atualiza a ordenação
          newSorters = prev.sorters.map((s) => (s.key === field ? { ...s, order } : s));
        }
      } else {
        newSorters = [...prev.sorters, { key: field, order }];
      }

      return { ...prev, sorters: newSorters, page: 1 };
    });
  }, []);
  const clearSorters = useCallback(
    (sortKeys: string[]) =>
      setParams((prev) => ({
        ...prev,
        sorters: prev.sorters.filter((s) => !sortKeys.includes(s.key)),
        page: 1,
      })),
    [],
  );
  const queryClient = useQueryClient();
  const forceRefetch = useCallback(() => {
    queryClient.refetchQueries({ queryKey: [key] });
  }, [key, queryClient]);

  const reset = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setDebouncedSearch(defaults.search);
    setParams({ ...defaults });
    if (persist) localStorage.removeItem(STORAGE_PREFIX + key);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const tableProps: Pick<
    TableProps<T>,
    'dataSource' | 'loading' | 'onChange' | 'pagination' | 'rowKey'
  > = {
    dataSource: query.data?.data ?? [],
    loading: query.isFetching,
    rowKey: 'id',
    pagination: {
      current: params.page,
      pageSize: params.pageSize,
      total: query.data?.total ?? 0,
      showSizeChanger: true,
    } satisfies TablePaginationConfig,
    onChange(pagination, antdFilters, sorter) {
      const sorters = (Array.isArray(sorter) ? sorter : [sorter]) as SorterResult<T>[];
      setParams((prev) => ({
        ...prev,
        page: pagination.current ?? 1,
        pageSize: pagination.pageSize ?? prev.pageSize,
        filters: antdFilters as F,
        sorters: sorters.flatMap((s) =>
          s.columnKey && s.order ? [{ key: String(s.columnKey), order: s.order }] : [],
        ),
      }));
    },
  };

  return {
    params,
    tableProps,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    setSearch,
    setFilters,
    reset,
    forceRefetch,
    setSorters,
    updateSorter,
    clearSorters,
    setPage,
  };
}
