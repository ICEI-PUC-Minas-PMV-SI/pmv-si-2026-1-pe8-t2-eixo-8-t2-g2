import { Prisma } from '../db/Prisma';
import { AppError } from '../error/AppError';
import { HttpCode } from '../utils/HttpCode';

type ListPublicParams = {
  category?: string;
  search?: string;
};

/**
 * CatalogService
 *
 * Expõe apenas produtos ativos (isActive = true) para usuários não logados.
 * Não inclui informações sensíveis como preços de custo ou dados internos.
 */
class CatalogService {
  async listPublic({ category, search }: ListPublicParams) {
    const prisma = await Prisma.getClient();

    const where: any = { isActive: true };

    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category,
          },
        },
      };
    }

    if (search?.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term } },
        { description: { contains: term } },
        {
          categories: {
            some: { category: { name: { contains: term } } },
          },
        },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        categories: {
          include: { category: true },
        },
        characteristics: {
          include: { characteristic: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Mapeia para resposta pública (sem campos internos)
    const publicProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      estimatedMinPrice: p.estimatedMinPrice,
      estimatedMaxPrice: p.estimatedMaxPrice,
      categories: p.categories.map((pc) => ({
        id: pc.category.id,
        name: pc.category.name,
        slug: pc.category.slug,
      })),
      characteristics: p.characteristics.map((pch) => ({
        id: pch.characteristic.id,
        name: pch.characteristic.name,
      })),
    }));

    return { data: publicProducts, total: publicProducts.length };
  }

  async findPublic(id: string) {
    const prisma = await Prisma.getClient();

    const product = await prisma.product.findUnique({
      where: { id, isActive: true },
      include: {
        categories: {
          include: { category: true },
        },
        characteristics: {
          include: { characteristic: true },
        },
      },
    });

    if (!product) {
      throw new AppError('Produto não encontrado.', HttpCode.NOT_FOUND);
    }

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      estimatedMinPrice: product.estimatedMinPrice,
      estimatedMaxPrice: product.estimatedMaxPrice,
      bookingLeadDays: product.bookingLeadDays,
      categories: product.categories.map((pc) => ({
        id: pc.category.id,
        name: pc.category.name,
        slug: pc.category.slug,
      })),
      characteristics: product.characteristics.map((pch) => ({
        id: pch.characteristic.id,
        name: pch.characteristic.name,
      })),
    };
  }

  async listActiveCategories() {
    const prisma = await Prisma.getClient();

    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { orderIndex: 'asc' },
      select: { id: true, name: true, slug: true, description: true },
    });

    return { data: categories, total: categories.length };
  }
}

const instance = new CatalogService();
export { instance as CatalogService };
export default instance;