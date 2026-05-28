import type { SorterResult, TablePaginationConfig } from 'antd/es/table/interface';

import type { UseQueryResult } from '@tanstack/react-query';

type Sort = {
  key: string;
  order: 'ascend' | 'descend';
};

type Params = {
  page: number;
  pageSize: number;
  filters: Record<string, any>;
  sorters: Sort[];
  search?: string;
};

type TableQueryResult<T> = UseQueryResult<{
  data: T[];
  total: number;
}> & {
  params: Params;
  setPage: (page: number, pageSize?: number) => void;
  setFilters: (filters: Record<string, any>) => void;
  setSorters: (sorters: Sort[]) => void;
  setSearch: (search: string) => void;
  reset: () => void;
};

class PaginatedTable {
  buildTableProps<T extends { id: React.Key }>(query: TableQueryResult<T>) {
    return {
      dataSource: query.data?.data || [],
      loading: query.isLoading,
      rowKey: 'id' as const,

      pagination: {
        current: query.params.page,
        pageSize: query.params.pageSize,
        total: query.data?.total,
      } as TablePaginationConfig,

      onChange: (
        pag: TablePaginationConfig,
        filters: Record<string, any>,
        sorter: SorterResult<T> | SorterResult<T>[],
      ) => {
        query.setPage(pag.current || 1, pag.pageSize);
        query.setFilters(filters);

        const sorterArray = Array.isArray(sorter) ? sorter : [sorter];

        const parsed = sorterArray
          .filter((s) => s.order)
          .map((s) => ({
            key: String(s.field),
            order: s.order as 'ascend' | 'descend',
          }));

        query.setSorters(parsed);
      },
    };
  }
}

export default new PaginatedTable();
