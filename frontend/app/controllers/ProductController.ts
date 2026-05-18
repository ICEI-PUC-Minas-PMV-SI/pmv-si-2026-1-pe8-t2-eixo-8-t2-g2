import type { CreateProduct, Product } from '~/@types/product';
import type { TableParams } from '~/hooks/useTableQuery';
import Request from '~/utils/Request';

class ProductController {
  async create(product: CreateProduct): Promise<Product> {
    const result = await Request.post<Product>('/product', product);
    return result;
  }

  async update(product: Partial<Product> & { id: string }) {
    const result = await Request.patch<Product>(`/product/${product.id}`, product);
    return result;
  }

  async delete(id: string) {
    const result = await Request.delete(`/product/${id}`);
    return result;
  }

  async deleteMany(ids: string[]) {
    const result = await Request.delete(`/product`, { data: { ids } });
    return result;
  }

  async list<T>(params?: TableParams) {
    if (params) {
      return Request.getTableData<T>('/product-list', params);
    }
    return Request.post<{ data: T[]; total: number }>('/product-list');
  }
}

export default new ProductController();
