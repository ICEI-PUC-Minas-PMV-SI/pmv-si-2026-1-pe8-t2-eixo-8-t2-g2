import type { ReviewCreatePayload } from '../@types/review.js';
import { Prisma } from '../db/Prisma.js';
import { AppError } from '../error/AppError.js';
import { HttpCode } from '../utils/HttpCode.js';

class ReviewService {
  async create(userId: string, data: ReviewCreatePayload) {
    const prisma = await Prisma.getClient();
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
    const prisma = await Prisma.getClient();

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
    const prisma = await Prisma.getClient();
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
        schedulerId: {
          in: schedulerIds,
        },
      },
    });
  }
  async list(featured?: boolean) {
    const prisma = await Prisma.getClient();
    return prisma.review.findMany({
      ...(featured !== undefined && { take: 3 }),
      where: featured !== undefined ? { featured } : {},
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
    });
  }
  async getPending(userId: string) {
    const prisma = await Prisma.getClient();
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
    const prisma = await Prisma.getClient();
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
