import type { ProductCategoryCreatePayload } from '../@types/index.js';
import type { ProductCategoryRequest } from '../@types/product-category.js';
import type {
  CategoryOrderByWithRelationInput,
  CategoryWhereInput,
} from '../generated/prisma/models.js';
import { ValidityHelper } from '../helper/ValidityHelper.js';
import { ProductCategoryService } from '../services/ProductCategoryService.js';

class ProductCategoryController {
  async create(category: ProductCategoryCreatePayload) {
    const result = await ProductCategoryService.create(category);
    return result;
  }
  list(req: ProductCategoryRequest) {
    const orderBy = [] as CategoryOrderByWithRelationInput[];
    const sorters = req.sort;
    const isAdmin = req.user?.role === 'admin';
    const validityFilter = isAdmin ? {} : ValidityHelper.buildValidityFilter();
    const isActiveFilter = isAdmin ? {} : { isActive: true };
    const filter = { ...validityFilter, ...isActiveFilter } as CategoryWhereInput;
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
    return ProductCategoryService.list(filter, orderBy, req.pagination);
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

  async toggleActive(id: string, isActive: boolean) {
    return ProductCategoryService.toggleActive(id, isActive);
  }
}

const instance = new ProductCategoryController();
export { instance as ProductCategoryController };
