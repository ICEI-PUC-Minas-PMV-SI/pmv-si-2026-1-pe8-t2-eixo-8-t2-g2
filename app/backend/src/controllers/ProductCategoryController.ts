import type { ProductCategoryCreatePayload, PaginationParams } from '../@types/index.js';
import { ProductCategoryService } from '../services/ProductCategoryService.js';

class ProductCategoryController {
  async create(category: ProductCategoryCreatePayload) {
    const result = await ProductCategoryService.create(category);
    return result;
  }
  list(pagination?: PaginationParams | null) {
    return ProductCategoryService.list(pagination);
  }
  async find(id: string) {
    return ProductCategoryService.find(id);
  }
  async update(id: string, data: Partial<ProductCategoryCreatePayload>) {
    return ProductCategoryService.update(id, data);
  }
  async delete(id: string) {
    return ProductCategoryService.delete(id);
  }

  async reorder(categories: { id: string; orderIndex: number }[]) {
    return ProductCategoryService.reorder(categories);
  }
}

const instance = new ProductCategoryController();
export { instance as ProductCategoryController };
