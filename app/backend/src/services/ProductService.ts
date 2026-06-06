import { Prisma as PrismaDB } from '../db/Prisma.js';
import type { Prisma } from '../generated/prisma';
import type { PaginationParams, ProductCreatePayload } from '../@types/index.js';
import { Text } from '../utils/Text.js';
import { ResponseUtil } from '../utils/ResponseUtil.js';
// import type {
//   ProductOrderByWithRelationInput,
//   ProductWhereInput,
// } from '../generated/prisma/models.js';
import { HttpCode } from '../utils/HttpCode.js';
import { AppError } from '../error/AppError.js';
import SupabaseStorage, { BUCKETS } from '../integration/SupabaseStorage.js';
import { ValidityHelper } from '../helper/ValidityHelper.js';

class ProductService {
  async create(product: ProductCreatePayload) {
    const prisma = await PrismaDB.getClient();
    const { characteristics = [], categories = [], ...productProps } = product;
    const categoriesToCreate = categories.length
      ? {
          create: categories.map((id) => ({ category: { connect: { id } } })),
        }
      : {};
    const characteristicsToCreate = characteristics.length
      ? {
          create: characteristics.map((id) => ({ characteristic: { connect: { id } } })),
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
    const prisma = await PrismaDB.getClient();
    const product = await prisma.product.findUnique({
      where: { id },
    });
    return product;
  }

  async list(
    filter?: Prisma.ProductWhereInput,
    orderBy?: Prisma.ProductOrderByWithRelationInput[],
    pagination?: PaginationParams,
    isAdmin = false,
  ) {
    const prisma = await PrismaDB.getClient();
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
            where: isAdmin
              ? {}
              : { category: { isActive: true, ...ValidityHelper.buildValidityFilter() } },
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
        orderBy: orderBy && orderBy.length > 0 ? orderBy : { name: 'asc' },
      }),
      prisma.product.count({ where }),
    ]);
    return {
      data: products.map((product) => {
        return {
          ...product,
          imageUrl: product.hasImage
            ? SupabaseStorage.getPublicUrl(BUCKETS.PRODUCT_IMAGES, `${product.id}.webp`)
                .data.publicUrl
            : null,
        };
      }),
      total,
      ...ResponseUtil.handlePageParams(pageParams, total),
    };
  }

  async delete(id: string) {
    const prisma = await PrismaDB.getClient();
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
    const prisma = await PrismaDB.getClient();
    const productsInSchedulers = await prisma.schedulerItem.findMany({
      distinct: 'productId',
      where: {
        productId: {
          in: ids,
        },
      },
      select: {
        productId: true,
      },
    });
    const fkProducts = productsInSchedulers.map((prod) => prod.productId);
    const idsToRemove = ids.filter((id) => !fkProducts.includes(id));
    const removedProductsWithImage = await prisma.product.findMany({
      where: {
        id: { in: idsToRemove },
        hasImage: true,
      },
      select: {
        id: true,
      },
    });
    if (idsToRemove.length) {
      await prisma.product.deleteMany({
        where: { id: { in: idsToRemove } },
      });
    }
    const alternativeMsg = idsToRemove.length
      ? 'Alguns produtos não foram removidos por estarem relacionados a pedidos'
      : 'Não foi possível remover estes produtos por estarem associados a pedidos';
    let status = 'success';

    if (idsToRemove.length !== ids.length) {
      status = 'partial';
    }

    if (!idsToRemove.length) {
      status = 'failed';
    }

    return {
      data: removedProductsWithImage,
      status,
      message:
        idsToRemove.length === ids.length
          ? 'Produtos removidos com sucesso'
          : alternativeMsg,
    };
  }

  async update(id: string, data: Partial<ProductCreatePayload>) {
    const prisma = await PrismaDB.getClient();
    const { characteristics, categories, ...productProps } = data;
    const dataToUpdate = { ...productProps };
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
    });
    return updatedProduct;
  }

  async toggleHasImage(id: string, hasImage: boolean) {
    const prisma = await PrismaDB.getClient();
    return prisma.product.update({
      where: { id },
      data: { hasImage },
    });
  }
}

const instance = new ProductService();
export { instance as ProductService };
