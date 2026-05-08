import type {
  CreateProductCharacteristic,
  ProductCharacteristic,
} from '~/@types/product';
import type { TableParams } from '~/hooks/useTableQuery';
import Request from '~/utils/Request';

class ProductCharacteristicController {
  async create(product: CreateProductCharacteristic): Promise<ProductCharacteristic> {
    const result = await Request.post<ProductCharacteristic>(
      '/product-characteristic',
      product,
    );
    return result;
  }

  async update(product: Partial<ProductCharacteristic> & { id: string }) {
    const result = await Request.patch<ProductCharacteristic>(
      `/product-characteristic/${product.id}`,
      product,
    );
    return result;
  }

  async delete(id: string) {
    const result = await Request.delete(`/product-characteristic/${id}`);
    return result;
  }

  async list<T>(params: TableParams) {
    return Request.getTableData<T>('/product-characteristic-list', params);
  }
}

export default new ProductCharacteristicController();
