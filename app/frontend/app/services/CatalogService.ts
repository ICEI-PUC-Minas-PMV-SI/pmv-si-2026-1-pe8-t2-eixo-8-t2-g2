import Request from '~/utils/Request';

export type PublicProduct = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  estimatedMinPrice: number;
  estimatedMaxPrice: number;
  bookingLeadDays?: number;
  categories: { id: string; name: string; slug: string }[];
  characteristics: { id: string; name: string }[];
};

export type PublicCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
};

export const CatalogService = {
  /** Lista produtos ativos para o catálogo público */
  async list(params?: { category?: string; search?: string }) {
    const { category = '', search = '' } = params || {};
    return Request.getTableData<PublicProduct>('/catalog', {
      search,
      filters: { category },
      page: 1,
      pageSize: 100,
      sorters: [],
    });
  },

  /** Detalhes de um produto pelo id */
  async find(id: string): Promise<PublicProduct> {
    return Request.get<PublicProduct>(`/catalog/${id}`);
  },

  /** Lista as categorias ativas para o filtro do catálogo */
  async listCategories() {
    return Request.getTableData<PublicCategory>('/catalog-categories', {
      filters: [] as any,
      search: '',
      page: 1,
      pageSize: 100,
      sorters: [],
    });
  },
};
