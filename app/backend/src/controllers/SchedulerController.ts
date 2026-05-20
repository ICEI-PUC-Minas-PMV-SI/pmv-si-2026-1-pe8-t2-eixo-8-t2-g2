import type {
  SchedulerCreatePayload,
  SchedulerFilterKey,
  SchedulerRequest,
} from '@types';
import { SchedulerService, type CreatedScheduler } from '../services/SchedulerService';
import type {
  SchedulerOrderByWithRelationInput,
  SchedulerWhereInput,
} from '../generated/prisma/models';
import { GoogleApi, INTEGRATION } from '../integration/GoogleApi';
import { ExternalScheduler } from '../integration/ExternalScheduler';
import { UserRole } from '../validations/UserValidation';
import type {
  DeliveryType,
  PaymentMethod,
  SchedulerStatus,
} from '../generated/prisma/enums';
import { CustomerService } from '../services/CustomerService';

class SchedulerController {
  async create(scheduler: SchedulerCreatePayload) {
    const result = await SchedulerService.create(scheduler);
    // this.addEventExternalScheduler(result);
    return result;
  }
  async list(req: SchedulerRequest) {
    const userId = req.user?.id || '';
    const isAdmin = req.user?.role === UserRole.ADMIN;
    let customer = null;
    if (!isAdmin) {
      customer = await CustomerService.findByUserId(userId);
    }
    const orderBy = [] as SchedulerOrderByWithRelationInput[];
    const filter: SchedulerWhereInput = isAdmin ? {} : { customerId: customer?.id || '' };
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
  async update(id: string, data: Partial<SchedulerCreatePayload>) {
    return SchedulerService.update(id, data);
  }
  async delete(id: string) {
    return SchedulerService.delete(id);
  }
  getGoogleAuthUrl() {
    return GoogleApi.getAuthUrl(INTEGRATION.CALENDAR);
  }
  async addEventExternalScheduler(scheduler: CreatedScheduler) {
    const {
      customer: { name },
      scheduledAt,
      items,
    } = scheduler;
    const title = `Pedido para ${name} - Produtos: ${items.length}`;
    const description = items
      .map((item) => {
        return `${item.quantity}x - ${item.product?.name.substring(0, 20)}`;
      })
      .join('\n');
    return ExternalScheduler.addEvent({
      title,
      description,
      startDateTime: scheduledAt.toISOString(),
      endDateTime: scheduledAt.toISOString(),
    });
  }
}

const instance = new SchedulerController();
export { instance as SchedulerController };
