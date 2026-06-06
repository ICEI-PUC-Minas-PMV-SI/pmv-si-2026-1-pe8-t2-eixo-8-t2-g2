import type {
  SchedulerCreatePayload,
  SchedulerFilterKey,
  SchedulerPayment,
  SchedulerRequest,
  SchedulerUpdatePayload,
} from '../@types/index.js';
import { SchedulerService, type CreatedScheduler } from '../services/SchedulerService.js';
// import type {
//   SchedulerOrderByWithRelationInput,
//   SchedulerWhereInput,
// } from '../generated/prisma/models.js';
import type {
  Prisma,
  DeliveryType,
  PaymentMethod,
  SchedulerStatus,
} from '../generated/prisma';
import { GoogleApi, INTEGRATION } from '../integration/GoogleApi.js';
import { UserRole } from '../validations/UserValidation.js';
// import type {
// DeliveryType,
// PaymentMethod,
// SchedulerStatus,
// } from '../generated/prisma/enums.js';
import { CustomerService } from '../services/CustomerService.js';
import { GoogleCalendarApi } from '../integration/GoogleCalendarApi.js';
import { Logger } from '../logger/Logger.js';
import { Env } from '../utils/Env.js';

class SchedulerController {
  private logger = new Logger('SchedulerController');
  async create(scheduler: SchedulerCreatePayload) {
    const result = await SchedulerService.create(scheduler);
    const externalEvent = await this.addEventExternalScheduler(result);
    if (externalEvent) {
      await SchedulerService.updateExternalId(result.id, externalEvent.id);
      return { integrationStatus: 'success', ...result };
    }
    return { integrationStatus: 'failure', ...result };
  }
  async list(req: SchedulerRequest) {
    const userId = req.user?.id || '';
    const isAdmin = req.user?.role === UserRole.ADMIN;
    let customer = null;
    if (!isAdmin) {
      customer = await CustomerService.findByUserId(userId);
    }
    const orderBy = [] as Prisma.SchedulerOrderByWithRelationInput[];
    const filter: Prisma.SchedulerWhereInput = isAdmin
      ? {}
      : { customerId: customer?.id || '' };
    const filters = req.filters;
    const sorters = req.sort;
    const search = req.search?.trim();
    if (filters) {
      Object.keys(filters).forEach((key) => {
        const value = filters[key as SchedulerFilterKey];
        switch (key as SchedulerFilterKey) {
          case 'status':
            filter.status = { in: value as SchedulerStatus[] };
            break;
          case 'deliveryType':
            filter.deliveryType = { in: value as DeliveryType[] };
            break;
          case 'paymentMethod':
            filter.paymentMethod = { in: value as PaymentMethod[] };
            break;
        }
      });
    }

    if (sorters) {
      sorters.forEach((sort) => {
        const { key, order } = sort;
        switch (key) {
          case 'customer_name':
            orderBy.push({
              customer: {
                name: order === 'ascend' ? 'asc' : 'desc',
              },
            });
            break;
          case 'customer_date':
            orderBy.push({ scheduledAt: order === 'ascend' ? 'asc' : 'desc' });
            break;
          case 'scheduledAt':
            orderBy.push({ scheduledAt: order === 'ascend' ? 'asc' : 'desc' });
            break;
        }
      });

      if (search) {
        filter.OR = [
          {
            customer: {
              name: {
                contains: search,
              },
            },
          },
          {
            items: {
              some: {
                product: {
                  name: {
                    contains: search,
                  },
                },
              },
            },
          },
        ];
      }
    }
    return SchedulerService.list(filter, orderBy, req.pagination);
  }
  async find(id: string) {
    return SchedulerService.find(id);
  }
  async getCountUnsyncedSchedulers() {
    return SchedulerService.getCountUnsyncedSchedulers();
  }
  async findUnsyncedSchedulers() {
    return SchedulerService.findUnsyncedSchedulers();
  }
  async syncUnsyncedSchedulers() {
    const unsyncedSchedulers = await this.findUnsyncedSchedulers();
    const results = [];
    for (const scheduler of unsyncedSchedulers) {
      try {
        const result = await this.addEventExternalScheduler(scheduler);
        if (result) {
          await SchedulerService.updateExternalId(scheduler.id, result.id);
        }
        results.push({
          schedulerId: scheduler.id,
          status: 'success',
          googleEventId: result ? result.id : null,
        });
      } catch (error) {
        results.push({
          schedulerId: scheduler.id,
          status: 'failure',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
    return results;
  }
  async update(id: string, data: SchedulerUpdatePayload) {
    return SchedulerService.update(id, data);
  }
  async updateStatus(id: string, status: SchedulerStatus) {
    return SchedulerService.updateStatus(id, status);
  }
  async createPayment(data: SchedulerPayment) {
    return SchedulerService.createPayment(data);
  }
  async cancel(id: string, cancellationReason: string) {
    return SchedulerService.cancel(id, cancellationReason);
  }
  async delete(id: string) {
    return SchedulerService.delete(id);
  }
  getGoogleAuthUrl() {
    return GoogleApi.getAuthUrl(INTEGRATION.CALENDAR);
  }
  async addEventExternalScheduler(scheduler: CreatedScheduler) {
    try {
      const {
        customer: { name },
        scheduledTo,
        items,
      } = scheduler;
      if (!scheduledTo) {
        return null;
      }
      const title = `Pedido para ${name} - Produtos: ${items.length}`;
      const description = items
        .map((item) => {
          return `${item.quantity}x - ${item.product?.name.substring(0, 20)}`;
        })
        .join('\n');
      const timeZone = Env.getTimeZone();
      const event = await GoogleCalendarApi.createEvent({
        summary: title,
        description,
        start: {
          dateTime: scheduledTo.toISOString(),
          timeZone,
        },
        end: {
          dateTime: scheduledTo.toISOString(),
          timeZone,
        },
      });
      return event;
    } catch (err) {
      this.logger.error('Error adding event to Google Calendar', {
        error: err,
        schedulerId: scheduler.id,
      });
      return null;
    }
  }
}

const instance = new SchedulerController();
export { instance as SchedulerController };
