import { Prisma } from '../db/Prisma.js';
import type { ProductCategoryCreatePayload, PaginationParams } from '../@types/index.js';
import { Text } from '../utils/Text.js';
import { ResponseUtil } from '../utils/ResponseUtil.js';

class ProductCategoryService {
  async create(category: ProductCategoryCreatePayload) {
    const prisma = await Prisma.getClient();
    const createdCategory = await prisma.category.create({
      data: {
        ...category,
        slug: Text.generateSlug(category.name),
      },
    });

    return createdCategory;
  }

  async find(id: string) {
    const prisma = await Prisma.getClient();
    const category = await prisma.category.findUnique({
      where: { id },
    });
    return category;
  }

  async list(pagination?: PaginationParams | null) {
    const prisma = await Prisma.getClient();
    const pageParams = pagination || {};
    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        ...pageParams,
        orderBy: {
          orderIndex: 'asc',
        },
      }),
      prisma.category.count(),
    ]);
    return {
      data: categories,
      total,
      ...ResponseUtil.handlePageParams(pageParams, total),
    };
  }

  async delete(id: string) {
    const prisma = await Prisma.getClient();
    await prisma.category.delete({
      where: { id },
    });
  }

  async update(id: string, data: Partial<ProductCategoryCreatePayload>) {
    const prisma = await Prisma.getClient();
    const dataToUpdate: Partial<ProductCategoryCreatePayload> = { ...data };
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: dataToUpdate,
    });
    return updatedCategory;
  }

  async reorder(items: { id: string; orderIndex: number }[]) {
    const prisma = await Prisma.getClient();
    await Promise.all(
      items.map(({ id, orderIndex }) =>
        prisma.category.update({ where: { id }, data: { orderIndex } }),
      ),
    );
    return { success: true };
  }
}

const instance = new ProductCategoryService();
export { instance as ProductCategoryService };
