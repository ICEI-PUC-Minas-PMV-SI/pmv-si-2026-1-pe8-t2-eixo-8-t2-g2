import { Prisma } from '../db/Prisma';
import type { PaginationParams, ProductCreatePayload } from '@types';
import { Text } from '../utils/Text';
import { ResponseUtil } from 'utils/ResponseUtil';

class ProductService {
  async create(product: ProductCreatePayload) {
    const prisma = await Prisma.getClient();
    const { characteristics = [], categories = [], ...productProps } = product;
    const categoriesToCreate = categories.length
      ? {
          create: categories.map((id) => ({ categoryId: id })),
        }
      : {};
    const characteristicsToCreate = characteristics.length
      ? {
          create: characteristics.map((id) => ({ characteristicId: id })),
        }
      : {};
    const createdProduct = await prisma.product.create({
      data: {
        ...productProps,
        slug: Text.generateSlug(productProps.name),
        categories: categoriesToCreate,
        characteristics: characteristicsToCreate,
      },
    });

    return createdProduct;
  }

  async find(id: string) {
    const prisma = await Prisma.getClient();
    const product = await prisma.product.findUnique({
      where: { id },
    });
    return product;
  }

  async list(pagination?: PaginationParams | null) {
    const prisma = await Prisma.getClient();
    const pageParams = pagination || {};
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        ...pageParams,
        include: {
          categories: true,
          characteristics: true,
        },
      }),
      prisma.product.count(),
    ]);
    return { data: products, total, ...ResponseUtil.handlePageParams(pageParams, total) };
  }

  async delete(id: string) {
    const prisma = await Prisma.getClient();
    await prisma.product.delete({
      where: { id },
    });
  }

  async deleteMany(ids: string[]) {
    const prisma = await Prisma.getClient();
    await prisma.product.deleteMany({
      where: { id: { in: ids } },
    });
  }

  async update(id: string, data: Partial<ProductCreatePayload>) {
    const prisma = await Prisma.getClient();
    const { characteristics, categories, ...productProps } = data;
    const dataToUpdate = { ...productProps };
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
    });
    return updatedProduct;
  }
}

const instance = new ProductService();
export { instance as ProductService };
