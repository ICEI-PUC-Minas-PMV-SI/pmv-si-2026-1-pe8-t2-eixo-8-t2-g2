import Request from '~/utils/Request';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

type ListResponse<T> = { data: T[]; total: number };

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || `Erro ${res.status}`);
  }
  return res.json();
}

export const CatalogService = {
  /** Lista produtos ativos para o catálogo público */
  async list(params?: {
    category?: string;
    search?: string;
  }): Promise<ListResponse<PublicProduct>> {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    if (params?.search) qs.set('search', params.search);
    const query = qs.toString() ? `?${qs}` : '';
    return get<ListResponse<PublicProduct>>(`/catalog${query}`);
  },

  /** Detalhes de um produto pelo id */
  async find(id: string): Promise<PublicProduct> {
    return get<PublicProduct>(`/catalog/${id}`);
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
