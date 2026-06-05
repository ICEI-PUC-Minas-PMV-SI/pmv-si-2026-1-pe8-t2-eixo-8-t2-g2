import type {
  PaginationParams,
  ProductItem,
  SchedulerCreatePayload,
  SchedulerPayment,
  SchedulerUpdatePayload,
} from '../@types/index.js';
import { Prisma as PrismaDB } from '../db/Prisma.js';
import { ProductService } from './ProductService.js';
import { BookingLeadTimeHelper } from '../helper/BookingLeadTimeHelper.js';
import { AppError } from '../error/AppError.js';
import { HttpCode } from '../utils/HttpCode.js';
import type { Prisma, SchedulerStatus } from '../generated/prisma';
// import type {
//   SchedulerItemUncheckedCreateWithoutSchedulerInput,
//   SchedulerOrderByWithRelationInput,
//   SchedulerWhereInput,
// } from '../generated/prisma/models.js';
// import type { SchedulerStatus } from '../generated/prisma/enums.js';
import { ResponseUtil } from '../utils/ResponseUtil.js';
import { CustomerService } from './CustomerService.js';

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
  scheduledTo: Date | null;
  status: SchedulerStatus;
  createdAt: Date;
};

class SchedulerService {
  private async getProductsList(products: ProductItem[]) {
    return Promise.all(
      products.map(async (product) => {
        const result = await ProductService.find(product.productId);
        if (!result) {
          throw new AppError(
            `Product with id ${product.productId} not found`,
            HttpCode.NOT_FOUND,
          );
        }
        return {
          ...result,
          quantity: product.quantity,
          customization: product.customization,
        };
      }),
    );
  }

  isValidItemsByLeadTime(
    scheduledAt: Date,
    schedulerItems: {
      bookingLeadMinutes?: number | undefined;
    }[],
  ) {
    const invalidItems = schedulerItems.filter((item) => {
      return !BookingLeadTimeHelper.isValidLeadTime(scheduledAt, {
        leadTimeInMinutes: item.bookingLeadMinutes,
      });
    });
    return invalidItems;
  }
  async create(scheduler: SchedulerCreatePayload) {
    const prisma = await PrismaDB.getClient();
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
          throw new AppError('Usuário inválido', HttpCode.BAD_REQUEST);
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
            bookingLeadMinutes: item.bookingLeadMinutes,
          })),
        },
      );
    }
    const schedulerItems: Prisma.SchedulerItemUncheckedCreateWithoutSchedulerInput[] = [
      ...productsList.map((product, orderIndex: number) => ({
        productId: product.id,
        quantity: product.quantity,
        priceAtBooking: product.price,
        orderIndex: orderIndex + 1,
        customization: product.customization || '',
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
    const prisma = await PrismaDB.getClient();
    const scheduler = await prisma.scheduler.findUnique({
      where: { id },
      select: {
        id: true,
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        scheduledAt: true,
        scheduledTo: true,
        status: true,
        deliveryType: true,
        paymentMethod: true,
        cancellationReason: true,
        items: {
          select: {
            id: true,
            quantity: true,
            priceAtBooking: true,
            durationMinutes: true,
            customization: true,
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    return scheduler;
  }

  async list(
    filter?: Prisma.SchedulerWhereInput,
    orderBy?: Prisma.SchedulerOrderByWithRelationInput[],
    pagination?: PaginationParams,
  ) {
    const prisma = await PrismaDB.getClient();
    const where = filter ? filter : {};
    const pageParams = pagination || {};
    const [schedulers, total] = await Promise.all([
      prisma.scheduler.findMany({
        ...pageParams,
        include: {
          payments: true,
          review: true,
          items: {
            select: {
              id: true,
              orderIndex: true,
              priceAtBooking: true,
              durationMinutes: true,
              quantity: true,
              customization: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  price: true,
                },
              },
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
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
    const prisma = await PrismaDB.getClient();
    await prisma.scheduler.delete({
      where: { id },
    });
  }

  async updateExternalId(id: string, externalId: string) {
    const prisma = await PrismaDB.getClient();
    return prisma.scheduler.update({
      where: { id },
      data: {
        googleEventId: externalId,
      },
    });
  }

  async updateStatus(id: string, status: SchedulerStatus) {
    const prisma = await PrismaDB.getClient();
    return prisma.scheduler.update({
      where: { id },
      data: {
        status,
      },
    });
  }

  async createPayment(data: SchedulerPayment) {
    const prisma = await PrismaDB.getClient();
    return prisma.payment.create({
      data,
    });
  }

  async update(id: string, data: SchedulerUpdatePayload) {
    const prisma = await PrismaDB.getClient();

    const { items, ...schedulerData } = data;

    if (!items || !items.length) {
      throw new AppError(
        'Não foi possível identificar os produtos no pedido',
        HttpCode.BAD_REQUEST,
      );
    }

    const existingScheduler = await prisma.scheduler.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!existingScheduler) {
      throw new AppError('Pedido não encontrado', HttpCode.NOT_FOUND);
    }

    const existingItems = existingScheduler.items;

    const incomingIds = items.filter((item) => item.id).map((item) => item.id as string);

    const itemsToDelete = existingItems.filter(
      (existing) => !incomingIds.includes(existing.id),
    );

    const itemsToCreate = items.filter((item) => !item.id);

    const itemsToUpdate = items.filter((item) => item.id);

    await prisma.$transaction(async (tx) => {
      await tx.scheduler.update({
        where: { id },
        data: schedulerData,
      });

      if (itemsToDelete.length) {
        await tx.schedulerItem.deleteMany({
          where: {
            id: {
              in: itemsToDelete.map((item) => item.id),
            },
          },
        });
      }

      for (const item of itemsToUpdate) {
        await tx.schedulerItem.update({
          where: {
            id: item.id || '',
          },
          data: {
            productId: item.productId,
            quantity: item.quantity,
            orderIndex: item.orderIndex,
            customization: item.customization || null,
            priceAtBooking: item.priceAtBooking || null,
            durationMinutes: item.durationMinutes || null,
          },
        });
      }

      // Cria novos itens
      if (itemsToCreate.length) {
        await tx.schedulerItem.createMany({
          data: itemsToCreate.map((item) => ({
            schedulerId: id,
            productId: item.productId,
            quantity: item.quantity,
            customization: item.customization || null,
            orderIndex: item.orderIndex,
            priceAtBooking: item.priceAtBooking || null,
            durationMinutes: item.durationMinutes || null,
          })),
        });
      }
    });

    return prisma.scheduler.findUnique({
      where: { id },
      include: {
        customer: {
          select: userSelect,
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async cancel(id: string, cancellationReason: string) {
    const prisma = await PrismaDB.getClient();
    const updatedScheduler = await prisma.scheduler.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancellationReason,
      },
      select: {
        id: true,
        scheduledAt: true,
        status: true,
      },
    });
    return updatedScheduler;
  }

  async getCountUnsyncedSchedulers() {
    const prisma = await PrismaDB.getClient();
    const count = await prisma.scheduler.count({
      where: {
        googleEventId: null,
        status: {
          in: ['pending', 'in_progress', 'confirmed'],
        },
      },
    });
    return count;
  }

  async findUnsyncedSchedulers() {
    const prisma = await PrismaDB.getClient();
    return prisma.scheduler.findMany({
      where: {
        googleEventId: null,
        status: {
          in: ['pending', 'in_progress', 'confirmed'],
        },
      },
      include: {
        customer: {
          select: userSelect,
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }
}

const instance = new SchedulerService();
export { instance as SchedulerService };
