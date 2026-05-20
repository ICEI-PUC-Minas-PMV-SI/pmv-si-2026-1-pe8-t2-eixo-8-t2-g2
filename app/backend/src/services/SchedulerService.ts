import type { PaginationParams, ProductItem, SchedulerCreatePayload } from '@types';
import { Prisma } from '../db/Prisma';
import { ProductService } from './ProductService';
import { BookingLeadTimeHelper } from '../helper/BookingLeadTimeHelper';
import { AppError } from '../error/AppError';
import { HttpCode } from '../utils/HttpCode';
import type {
  SchedulerOrderByWithRelationInput,
  SchedulerUpdateInput,
  SchedulerWhereInput,
} from '../generated/prisma/models';
import type { SchedulerStatus } from '../generated/prisma/enums';
import { ResponseUtil } from '../utils/ResponseUtil';
import type { Scheduler } from '../generated/prisma/client';
import { CustomerService } from './CustomerService';

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
  private async getProductsList(products: SchedulerCreatePayload['items']) {
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
    const {
      userId,
      customerId,
      customerName,
      customerPhone,
      items: products,
      scheduledAt,
      scheduledTo,
      paymentMethod,
      deliveryType,
    } = scheduler;
    let customer = null;
    if (customerId === userId) {
      customer = await CustomerService.findByUserId(userId);
      if (!customer) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
          throw new AppError('Invalid user/customer', HttpCode.BAD_REQUEST);
        }
        customer = await prisma.customer.create({
          data: {
            name: user.name,
            email: user.email,
            phone: user.phone,
            user: {
              connect: { id: userId },
            },
          },
          select: {
            id: true,
            name: true,
          },
        });
      }
    }
    const productsList = await this.getProductsList(products);
    const invalidItems = scheduledTo
      ? this.isValidItemsByLeadTime(new Date(scheduledTo), productsList)
      : [];
    if (invalidItems.length > 0 && false) {
      //temp ignore
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
      ...productsList.map((product, orderIndex: number) => ({
        productId: product.id,
        quantity: product.quantity,
        priceAtBooking: product.price || null,
        orderIndex: orderIndex + 1,
      })),
    ];
    const validCustomerId = customer?.id || customerId;

    const createdScheduler = await prisma.scheduler.create({
      data: {
        customer: validCustomerId
          ? {
              connect: {
                id: validCustomerId,
              },
            }
          : {
              create: {
                name: customerName!,
                phone: customerPhone.replace(/\D/g, ''),
              },
            },
        deliveryType,
        paymentMethod,
        status: 'pending',
        scheduledAt: new Date(scheduledAt),
        scheduledTo: scheduledTo ? new Date(scheduledTo) : null,
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
    // const prisma = await Prisma.getClient();
    // const { items: products, ...newData } = data;
    // if (!products || !products.length) {
    //   throw new AppError('Invalid products', HttpCode.BAD_REQUEST);
    // }
    // const dataToUpdate: Partial<SchedulerUpdateInput> = {
    //   ...newData,
    //   // products,
    // };
    // if (products) {
    //   dataToUpdate.items = {
    //     connectOrCreate: {
    //       create: {
    //       }
    //     }
    //   };
    // }
    // const updatedScheduler = await prisma.scheduler.update({
    //   where: { id },
    //   data: dataToUpdate,
    //   include: {
    //     customer: {
    //       select: userSelect,
    //     },
    //   },
    // });
    // return updatedScheduler;
  }
}

const instance = new SchedulerService();
export { instance as SchedulerService };
