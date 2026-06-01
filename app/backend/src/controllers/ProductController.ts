import type {
  ProductCreatePayload,
  ProductFilterKey,
  ProductRequest,
} from '../@types/index.js';
import { ProductService } from '../services/ProductService.js';
import type {
  ProductOrderByWithRelationInput,
  ProductWhereInput,
} from '../generated/prisma/models.js';
import { UserRole } from '../validations/UserValidation.js';

class ProductController {
  async create(product: ProductCreatePayload) {
    const result = await ProductService.create(product);
    return result;
  }
  list(req: ProductRequest) {
    const isAdmin = req.user?.role === UserRole.ADMIN;
    const orderBy = [] as ProductOrderByWithRelationInput[];
    const filter: ProductWhereInput = isAdmin ? {} : { isActive: true };
    const filters = req.filters;
    const sorters = req.sort;
    const search = req.search?.trim();
    if (filters) {
      Object.keys(filters).forEach((key) => {
        const value = filters[key as ProductFilterKey];
        switch (key as ProductFilterKey) {
          case 'categoryId':
            filter.categories = {
              some: {
                categoryId: value as string,
              },
            };
            break;
          case 'isActive':
            if (isAdmin) {
              filter.isActive = value as boolean;
            }
            break;
          case 'characteristics':
            filter.characteristics = {
              some: { characteristicId: { in: value as string[] } },
            };
            break;
        }
      });
    }

    if (sorters) {
      sorters.forEach((sort) => {
        const { key, order } = sort;
        switch (key) {
          case 'name':
            orderBy.push({
              name: order === 'ascend' ? 'asc' : 'desc',
            });
            break;
          case 'price':
            orderBy.push({ price: order === 'ascend' ? 'asc' : 'desc' });
            break;
        }
      });
    }

    if (search) {
      filter.OR = [
        {
          name: {
            contains: search,
          },
        },
        {
          description: {
            contains: search,
          },
        },
        {
          categories: {
            some: {
              category: {
                name: {
                  contains: search,
                },
              },
            },
          },
        },
        {
          characteristics: {
            some: {
              characteristic: {
                name: {
                  contains: search,
                },
              },
            },
          },
        },
      ];
    }

    return ProductService.list(filter, orderBy, req.pagination);
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
  async toggleHasImage(id: string, hasImage: boolean) {
    return ProductService.toggleHasImage(id, hasImage);
  }
}

const instance = new ProductController();
export { instance as ProductController };
