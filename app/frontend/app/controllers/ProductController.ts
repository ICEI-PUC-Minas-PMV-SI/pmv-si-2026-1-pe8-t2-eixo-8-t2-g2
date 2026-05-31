import type { PublicCharacteristic } from '~/@types/characteristic';
import type { CreateProduct, Product, PublicProduct } from '~/@types/product';
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
    const result = await Request.delete<{
      message: string;
      status: 'success' | 'partial' | 'failed';
    }>(`/product`, { data: { ids } });
    return result;
  }

  async list<T>(params?: TableParams) {
    if (params) {
      return Request.getTableData<T>('/product-list', params);
    }
    return Request.post<{ data: T[]; total: number }>('/product-list');
  }
  getCategories(product: PublicProduct): { id: string; name: string }[] {
    return (product.categories ?? [])
      .map((c: any) => ({
        id: c?.category?.id ?? c?.id ?? c?.name ?? '',
        name: c?.category?.name ?? c?.name ?? '',
      }))
      .filter((c) => c.name);
  }

  getCharacteristics(product: PublicProduct): PublicCharacteristic[] {
    return (product.characteristics ?? []).map((c: any) => c?.characteristic ?? c);
  }
}

export default new ProductController();
