import type { ProductCharacteristicCreatePayload, PaginationParams } from '../@types';
import { ProductCharacteristicService } from '../services/ProductCharacteristicService';

class ProductCharacteristicController {
  async create(characteristic: ProductCharacteristicCreatePayload) {
    const result = await ProductCharacteristicService.create(characteristic);
    return result;
  }
  list(pagination?: PaginationParams | null) {
    return ProductCharacteristicService.list(pagination);
  }
  async find(id: string) {
    return ProductCharacteristicService.find(id);
  }
  async update(id: string, data: Partial<ProductCharacteristicCreatePayload>) {
    return ProductCharacteristicService.update(id, data);
  }
  async delete(id: string) {
    return ProductCharacteristicService.delete(id);
  }
}

const instance = new ProductCharacteristicController();
export { instance as ProductCharacteristicController };
