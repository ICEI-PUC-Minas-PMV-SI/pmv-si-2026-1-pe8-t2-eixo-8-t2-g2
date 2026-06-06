import type { ReviewCreatePayload } from '../@types/review.js';
import { Prisma as PrismaDB } from '../db/Prisma.js';
import { AppError } from '../error/AppError.js';
import { HttpCode } from '../utils/HttpCode.js';
import type { Prisma } from '../generated/prisma';
import type { PaginationParams } from '../@types/pagination.js';
import { ResponseUtil } from '../utils/ResponseUtil.js';

class ReviewService {
  async create(userId: string, data: ReviewCreatePayload) {
    const prisma = await PrismaDB.getClient();
    const { schedulerId, rating, comment = null } = data;
    const customer = await prisma.customer.findUnique({
      where: {
        userId,
      },
    });
    const scheduler = await prisma.scheduler.findUnique({
      where: {
        id: schedulerId,
        customerId: customer?.id || '',
      },
    });

    if (!scheduler) {
      throw new AppError(
        'Não foi possível validar dados do usuário',
        HttpCode.BAD_REQUEST,
      );
    }

    const createdAbout = await prisma.review.create({
      data: {
        comment,
        rating,
        schedulerId,
        customerId: scheduler.customerId,
      },
    });

    return createdAbout;
  }

  async find(id: string) {
    const prisma = await PrismaDB.getClient();

    const about = await prisma.aboutInfo.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });

    return about;
  }

  async ignoreReview(userId: string, schedulerIds: string[]) {
    const prisma = await PrismaDB.getClient();
    const customer = await prisma.customer.findUnique({
      where: {
        userId,
      },
    });
    return prisma.scheduler.updateMany({
      data: {
        ignoredReview: true,
      },
      where: {
        customerId: customer?.id || '',
        id: {
          in: schedulerIds,
        },
      },
    });
  }

  async list(
    filter?: Prisma.ReviewWhereInput,
    orderBy?: Prisma.ReviewOrderByWithRelationInput[],
    pagination?: PaginationParams,
  ) {
    const prisma = await PrismaDB.getClient();
    const where = filter ? filter : {};
    const pageParams = pagination || {};
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: orderBy && orderBy.length > 0 ? orderBy : { createdAt: 'desc' },
        include: {
          customer: true,
          scheduler: {
            include: {
              items: {
                include: {
                  product: true,
                },
              },
              customer: false,
            },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);
    return {
      data: reviews,
      total,
      ...ResponseUtil.handlePageParams(pageParams, total),
    };
  }
  async getPending(userId: string) {
    const prisma = await PrismaDB.getClient();
    const customer = await prisma.customer.findUnique({
      where: {
        userId,
      },
    });
    if (!customer) {
      throw new AppError('Falha ao buscar avaliações pendentes', HttpCode.BAD_REQUEST);
    }
    return prisma.scheduler.findMany({
      where: {
        review: null,
        customerId: customer.id,
        ignoredReview: false,
      },
    });
  }
  async changeFeatured(reviewId: string, featured: boolean) {
    const prisma = await PrismaDB.getClient();
    return prisma.review.update({
      data: {
        featured,
      },
      where: {
        id: reviewId,
      },
    });
  }
}

const instance = new ReviewService();

export { instance as ReviewService };
