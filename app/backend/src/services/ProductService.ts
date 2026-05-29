import { Prisma } from '../db/Prisma.js';
import type { PaginationParams, ProductCreatePayload } from '../@types/index.js';
import { Text } from '../utils/Text.js';
import { ResponseUtil } from '../utils/ResponseUtil.js';
import type {
  ProductOrderByWithRelationInput,
  ProductWhereInput,
} from '../generated/prisma/models.js';
import { HttpCode } from '../utils/HttpCode.js';
import { AppError } from '../error/AppError.js';

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

  async list(
    filter?: ProductWhereInput,
    orderBy?: ProductOrderByWithRelationInput[],
    pagination?: PaginationParams,
  ) {
    const prisma = await Prisma.getClient();
    const where = filter ? filter : {};
    const pageParams = pagination || {};
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        ...pageParams,
        include: {
          categories: {
            select: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          characteristics: {
            select: {
              characteristic: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        where,
        orderBy: orderBy && orderBy.length > 0 ? orderBy : { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);
    return { data: products, total, ...ResponseUtil.handlePageParams(pageParams, total) };
  }

  async delete(id: string) {
    const prisma = await Prisma.getClient();
    const productInSchedulers = await prisma.schedulerItem.findFirst({
      where: {
        productId: id,
      },
    });
    if (productInSchedulers) {
      throw new AppError(
        'Produto não pode ser removido pois há pedidos registrados com ele',
        HttpCode.CONFLICT,
      );
    }
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
