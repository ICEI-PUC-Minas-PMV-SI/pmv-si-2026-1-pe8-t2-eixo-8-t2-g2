import { Prisma as PrismaDB } from '../db/Prisma.js';
import type { Prisma } from '../generated/prisma';
import type { ProductCategoryCreatePayload, PaginationParams } from '../@types/index.js';
import { Text } from '../utils/Text.js';
import { ResponseUtil } from '../utils/ResponseUtil.js';
// import type {
//   CategoryOrderByWithRelationInput,
//   CategoryWhereInput,
// } from '../generated/prisma/models.js';
import { Env } from '../utils/Env.js';
import { fromZonedTime } from 'date-fns-tz';

type NormalizedCategoryPayload = Omit<
  ProductCategoryCreatePayload,
  'startsAt' | 'endsAt'
> & {
  startsAt: Date | null;
  endsAt: Date | null;
};

class ProductCategoryService {
  normalizeCategoryDates(
    payload: Pick<ProductCategoryCreatePayload, 'isRecurring' | 'startsAt' | 'endsAt'>,
  ) {
    const TIME_ZONE = Env.getTimeZone();
    const { isRecurring, startsAt, endsAt } = payload;

    if (!startsAt && !endsAt) return { startsAt: null, endsAt: null };

    if (!isRecurring) {
      // Data fixa: salva como data real no fuso de SP
      return {
        startsAt: startsAt ? fromZonedTime(new Date(startsAt), TIME_ZONE) : null,
        endsAt: endsAt ? fromZonedTime(new Date(endsAt), TIME_ZONE) : null,
      };
    }

    // Recorrente: projeta em 1970, preservando só dia/mês do fuso de SP
    const projectTo1970 = (isoString: string) => {
      // Parse no fuso local para pegar o dia/mês que o usuário viu
      const zonedDate = new Date(
        new Date(isoString).toLocaleString('en-US', { timeZone: TIME_ZONE }),
      );
      const month = zonedDate.getMonth();
      const day = zonedDate.getDate();

      return fromZonedTime(new Date(1970, month, day, 0, 0, 0), TIME_ZONE);
    };

    return {
      startsAt: startsAt ? projectTo1970(startsAt) : null,
      endsAt: endsAt ? projectTo1970(endsAt) : null,
    };
  }
  normalizePayload(payload: ProductCategoryCreatePayload): NormalizedCategoryPayload {
    const { isRecurring, startsAt, endsAt, ...rest } = payload;

    const normalizedDates = this.normalizeCategoryDates({
      isRecurring,
      startsAt: startsAt || null,
      endsAt: endsAt || null,
    });

    return { ...rest, isRecurring, ...normalizedDates };
  }
  async create(category: ProductCategoryCreatePayload) {
    const prisma = await PrismaDB.getClient();

    const createdCategory = await prisma.category.create({
      data: {
        ...this.normalizePayload(category),
        slug: Text.generateSlug(category.name),
      },
    });

    return createdCategory;
  }

  async find(id: string) {
    const prisma = await PrismaDB.getClient();
    const category = await prisma.category.findUnique({
      where: { id },
    });
    return category;
  }

  async list(
    filter?: Prisma.CategoryWhereInput,
    orderBy?: Prisma.CategoryOrderByWithRelationInput[],
    pagination?: PaginationParams,
  ) {
    const prisma = await PrismaDB.getClient();
    const pageParams = pagination || {};
    const where = filter ? filter : {};
    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        ...pageParams,
        where,
        orderBy: orderBy && orderBy.length > 0 ? orderBy : { orderIndex: 'asc' },
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
    const prisma = await PrismaDB.getClient();
    await prisma.category.delete({
      where: { id },
    });
  }

  async update(id: string, data: Partial<ProductCategoryCreatePayload>) {
    const prisma = await PrismaDB.getClient();

    const hasDateFields = 'startsAt' in data || 'endsAt' in data || 'isRecurring' in data;

    let normalized:
      | Partial<ProductCategoryCreatePayload>
      | Partial<NormalizedCategoryPayload> = data;

    if (hasDateFields) {
      if (!('isRecurring' in data)) {
        const existing = await prisma.category.findUniqueOrThrow({ where: { id } });
        data = { isRecurring: existing.isRecurring, ...data };
      }
      normalized = this.normalizePayload(data as ProductCategoryCreatePayload);
    }

    return prisma.category.update({
      where: { id },
      data: normalized as NormalizedCategoryPayload,
    });
  }

  async reorder(items: { id: string; orderIndex: number }[]) {
    const prisma = await PrismaDB.getClient();
    await Promise.all(
      items.map(({ id, orderIndex }) =>
        prisma.category.update({ where: { id }, data: { orderIndex } }),
      ),
    );
    return { success: true };
  }

  async toggleActive(id: string, isActive: boolean) {
    const prisma = await PrismaDB.getClient();
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { isActive },
    });
    return updatedCategory;
  }
}

const instance = new ProductCategoryService();
export { instance as ProductCategoryService };
