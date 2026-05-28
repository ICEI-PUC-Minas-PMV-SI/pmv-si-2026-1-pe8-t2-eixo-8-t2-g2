import type { PaginationParams, SchedulerCreatePayload } from '@types';
import { Prisma } from '../db/Prisma';
import { ProductService } from './ProductService';
import { BookingLeadTimeHelper } from '../helper/BookingLeadTimeHelper';
import { AppError } from '../error/AppError';
import { HttpCode } from '../utils/HttpCode';
import type {
  SchedulerOrderByWithRelationInput,
  SchedulerWhereInput,
} from '../generated/prisma/models';
import type { SchedulerStatus } from '../generated/prisma/enums';
import { ResponseUtil } from 'utils/ResponseUtil';

const userSelect = {
  id: true,
  name: true,
};

export type CreatedScheduler = {
  customer: {
    id: string;
    name: string;
  };
  items: ({
    product: {
      id: string;
      name: string;
      description: string | null;
      estimatedMinPrice: number;
      estimatedMaxPrice: number;
    } | null;
  } & {
    id: string;
    createdAt: Date;
    quantity: number;
    priceAtBooking: number | null;
    durationMinutes: number | null;
    orderIndex: number;
  })[];
} & {
  id: string;
  scheduledAt: Date;
  estimatedStartAt: Date | null;
  estimatedEndAt: Date | null;
  status: SchedulerStatus;
  createdAt: Date;
};

class SchedulerService {
  private async getProductsList(products: SchedulerCreatePayload['products']) {
    return Promise.all(
      products.map(async (product) => {
        const result = await ProductService.find(product.id);
        if (!result) {
          throw new AppError(
            `Product with id ${product.id} not found`,
            HttpCode.NOT_FOUND,
          );
        }
        return { ...result, quantity: product.quantity };
      }),
    );
  }

  isValidItemsByLeadTime(
    scheduledAt: Date,
    schedulerItems: {
      bookingLeadTimeMinutes?: number | undefined;
      bookingLeadDays?: number | undefined;
    }[],
  ) {
    const invalidItems = schedulerItems.filter((item) => {
      return !BookingLeadTimeHelper.isValidLeadTime(scheduledAt, {
        leadTimeInMinutes: item.bookingLeadTimeMinutes,
        leadTimeInDays: item.bookingLeadDays,
      });
    });
    return invalidItems;
  }
  async create(scheduler: SchedulerCreatePayload) {
    const prisma = await Prisma.getClient();
    const { customerId, products, scheduledAt, paymentMethod, deliveryType } = scheduler;
    const productsList = await this.getProductsList(products);
    const invalidItems = this.isValidItemsByLeadTime(new Date(scheduledAt), productsList);
    if (invalidItems.length > 0) {
      throw new AppError(
        `Some items do not meet the booking lead time requirements`,
        HttpCode.BAD_REQUEST,
        {
          invalidItems: invalidItems.map((item) => ({
            id: 'id' in item ? item.id : null,
            name: 'name' in item ? item.name : null,
            bookingLeadTimeMinutes: item.bookingLeadTimeMinutes,
            bookingLeadDays: item.bookingLeadDays,
          })),
        },
      );
    }
    const schedulerItems = [
      ...productsList.map((product, orderIndex) => ({
        productId: product.id,
        quantity: product.quantity,
        priceAtBooking: product.price || null,
        orderIndex: orderIndex + 1,
      })),
    ];
    const createdScheduler = await prisma.scheduler.create({
      data: {
        customerId: customerId,
        deliveryType,
        paymentMethod,
        status: 'pending',
        scheduledAt: new Date(scheduledAt),
        items: {
          create: schedulerItems,
        },
      },
      omit: {
        customerId: true,
      },
      include: {
        customer: {
          select: userSelect,
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                estimatedMinPrice: true,
                estimatedMaxPrice: true,
              },
            },
          },
          omit: {
            productId: true,
            schedulerId: true,
          },
        },
      },
    });

    return createdScheduler;
  }

  async find(id: string) {
    const prisma = await Prisma.getClient();
    const scheduler = await prisma.scheduler.findUnique({
      where: { id },
      include: {
        items: true,
        customer: {
          select: userSelect,
        },
      },
    });
    return scheduler;
  }

  async list(
    filter?: SchedulerWhereInput,
    orderBy?: SchedulerOrderByWithRelationInput[],
    pagination?: PaginationParams,
  ) {
    const prisma = await Prisma.getClient();
    const where = filter ? filter : {};
    const pageParams = pagination || {};
    const [schedulers, total] = await Promise.all([
      prisma.scheduler.findMany({
        ...pageParams,
        include: {
          items: {
            select: {
              orderIndex: true,
              priceAtBooking: true,
              durationMinutes: true,
              quantity: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  price: true,
                  estimatedMinPrice: true,
                  estimatedMaxPrice: true,
                },
              },
            },
          },
          customer: {
            select: userSelect,
          },
        },
        omit: {
          customerId: true,
        },
        where,
        orderBy: orderBy && orderBy.length > 0 ? orderBy : { createdAt: 'desc' },
      }),
      prisma.scheduler.count({ where }),
    ]);

    return {
      data: schedulers,
      total,
      ...ResponseUtil.handlePageParams(pageParams, total),
    };
  }

  async delete(id: string) {
    const prisma = await Prisma.getClient();
    await prisma.scheduler.delete({
      where: { id },
    });
  }

  async update(id: string, data: Partial<SchedulerCreatePayload>) {
    const prisma = await Prisma.getClient();
    const dataToUpdate: Partial<SchedulerCreatePayload> = { ...data };

    const updatedScheduler = await prisma.scheduler.update({
      where: { id },
      data: dataToUpdate,
      include: {
        customer: {
          select: userSelect,
        },
      },
    });
    return updatedScheduler;
  }
}

const instance = new SchedulerService();
export { instance as SchedulerService };
