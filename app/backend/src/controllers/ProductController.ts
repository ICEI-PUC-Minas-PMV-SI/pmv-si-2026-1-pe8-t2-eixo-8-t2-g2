import type { PaginationParams, ProductCreatePayload } from '@types';
import { ProductService } from '../services/ProductService';

class ProductController {
  async create(product: ProductCreatePayload) {
    const result = await ProductService.create(product);
    return result;
  }
  list(pagination?: PaginationParams | null) {
    return ProductService.list(pagination);
  }
  async find(id: string) {
    return ProductService.find(id);
  }
  async update(id: string, data: Partial<ProductCreatePayload>) {
    return ProductService.update(id, data);
  }
  async delete(id: string) {
    return ProductService.delete(id);
  }
  async deleteMany(ids: string[]) {
    return ProductService.deleteMany(ids);
  }
}

const instance = new ProductController();
export { instance as ProductController };
