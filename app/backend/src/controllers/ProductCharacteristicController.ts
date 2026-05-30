import type {
  ProductCharacteristicCreatePayload,
  CharacteristicRequest,
} from '../@types/index.js';
import type {
  CharacteristicOrderByWithRelationInput,
  CharacteristicWhereInput,
} from '../generated/prisma/models.js';
import { ProductCharacteristicService } from '../services/ProductCharacteristicService.js';

class ProductCharacteristicController {
  async create(characteristic: ProductCharacteristicCreatePayload) {
    const result = await ProductCharacteristicService.create(characteristic);
    return result;
  }
  list(req: CharacteristicRequest) {
    const orderBy = [] as CharacteristicOrderByWithRelationInput[];
    const sorters = req.sort;
    const filter = {} as CharacteristicWhereInput;
    const search = req.search?.trim();
    if (sorters) {
      sorters.forEach((sort) => {
        const { key, order } = sort;
        switch (key) {
          case 'name':
            orderBy.push({
              name: order === 'ascend' ? 'asc' : 'desc',
            });
            break;
        }
      });
    }

    if (search) {
      filter.name = {
        contains: search,
      };
    }
    return ProductCharacteristicService.list(filter, orderBy, req.pagination);
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
