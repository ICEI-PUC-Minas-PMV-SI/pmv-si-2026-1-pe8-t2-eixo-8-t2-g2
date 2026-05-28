import type { CreateProductCategoryPayload, ProductCategory } from '~/@types/product';
import type { TableParams } from '~/hooks/useTableQuery';
import Request from '~/utils/Request';

class ProductCategoryController {
  async create(productCategory: CreateProductCategoryPayload): Promise<ProductCategory> {
    const result = await Request.post<ProductCategory>(
      '/product-category',
      productCategory,
    );
    return result;
  }

  async update(productCategory: Partial<ProductCategory> & { id: string }) {
    const result = await Request.patch<ProductCategory>(
      `/product-category/${productCategory.id}`,
      productCategory,
    );
    return result;
  }

  async delete(id: string) {
    const result = await Request.delete(`/product-category/${id}`);
    return result;
  }

  async list<T>(params: TableParams) {
    return Request.getTableData<T>('/product-category-list', params);
  }

  async reorder(categories: { id: string; orderIndex: number }[]) {
    return Request.post('/product-category/reorder', { categories });
  }
}

export default new ProductCategoryController();
