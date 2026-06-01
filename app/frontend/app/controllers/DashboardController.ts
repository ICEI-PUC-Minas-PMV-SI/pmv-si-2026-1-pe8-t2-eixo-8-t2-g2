import type { PaymentMethod } from '~/@types/payment';
import type { DeliveryType, Scheduler, SchedulerStatus } from '~/@types/scheduler';
import type { DeliveryToday } from '~/components/dashboard/Planning';
import { Colors } from '~/constants/Colors';
import { PaymentMethodMap } from '~/constants/PaymentMethod';
import { SchedulerConstant } from '~/constants/SchedulerConstant';
import Request from '~/utils/Request';

export type TodaySummary = {
  totalPrice: number;
  avgPrice: number;
  inProgress: number;
  schedulers: number;
  schedulersYesterday: number;
  created: number;
  cancelled: number;
  delivery: number;
  pickup: number;
};

export type MonthSummary = {
  timestamp: number;
  dateStr: string;
  monthYear: string;
  status: {
    pending: number;
    confirmed: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  deliveryType: {
    pickup: number;
    delivery: number;
  };
  paymentMethod: {
    credit_card: number;
    debit_card: number;
    pix: number;
    bank_transfer: number;
    cash: number;
  };
};

type LatestMonthsSummary = {
  months: MonthSummary[];
  statusPercent: {
    pending: number;
    confirmed: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  summary: {
    status: {
      pending: number;
      confirmed: number;
      in_progress: number;
      completed: number;
      cancelled: number;
    };
    paymentMethod: {
      credit_card: number;
      debit_card: number;
      pix: number;
      bank_transfer: number;
      cash: number;
    };
    deliveryType: {
      delivery: number;
      pickup: number;
    };
  };
};

type LatestMonthsRevenueSummary = {
  timestamp: number;
  dateStr: string;
  monthYear: string;
  revenue: number;
};

export type TopProducts = {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
  percent: number;
};

export type SchedulerAlert = {
  pendingConfirmationsTomorrow: {
    id: string;
    customerId: string;
    scheduledAt: string;
    scheduledTo: string;
    status: SchedulerStatus;
    paymentMethod: PaymentMethod;
    deliveryType: DeliveryType;
    cancellationReason: string | null;
    createdAt: string;
    updatedAt: string;
    googleEventId: string | null;
    customer: {
      id: string;
      name: string;
      phone: string;
    };
  }[];
  pendingConfirmationsTwoDays: {
    id: string;
    customerId: string;
    scheduledAt: string;
    scheduledTo: string | null;
    status: SchedulerStatus;
    paymentMethod: PaymentMethod;
    deliveryType: DeliveryType;
    cancellationReason: string | null;
    createdAt: string;
    updatedAt: string;
    googleEventId: string | null;
    customer: {
      id: string;
      name: string;
      phone: string;
    };
    items: {
      id: string;
      schedulerId: string;
      productId: string;
      quantity: number;
      priceAtBooking: number;
      durationMinutes: number | null;
      customization: string;
      orderIndex: number;
      createdAt: string;
      product: {
        id: string;
        name: string;
      };
    }[];
  }[];
  delayedOrders: {
    id: string;
    customerId: string;
    scheduledAt: string;
    scheduledTo: string;
    status: SchedulerStatus;
    paymentMethod: PaymentMethod;
    deliveryType: DeliveryType;
    cancellationReason: string | null;
    createdAt: string;
    updatedAt: string;
    googleEventId: string | null;
    customer: {
      id: string;
      name: string;
      phone: string;
    };
  }[];
};

export type BookingLeadTime = {
  name: string;
  bookingLeadMinutes: number;
};

export interface DashboardAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  orders: any[];
}

class DashboardController {
  async todaySummary() {
    return Request.get<{ data: TodaySummary }>('/dashboard-today').then(
      (result) => result.data,
    );
  }
  async latestMonths() {
    return Request.get<{ data: LatestMonthsSummary }>('/dashboard-latest-months').then(
      (result) => result.data,
    );
  }
  async latestMonthsRevenue() {
    return Request.get<{ data: LatestMonthsRevenueSummary[] }>(
      '/dashboard-latest-months-revenue',
    ).then((result) => result.data);
  }
  async topProducts() {
    return Request.get<{ data: TopProducts[] }>('/dashboard-top-products').then(
      (result) => result.data,
    );
  }
  async deliveriesToday() {
    return Request.get<{ data: Scheduler[] }>('/dashboard-deliveries-today').then(
      (result) => result.data,
    );
  }
  async dashboardAlerts() {
    return Request.get<{ data: SchedulerAlert }>('/dashboard-alerts').then(
      (result) => result.data,
    );
  }
  async bookingLeadTime() {
    return Request.get<{ data: BookingLeadTime[] }>('/dashboard-booking-lead-time').then(
      (result) => result.data,
    );
  }
  getMonthSummaryDelivery = (months: MonthSummary[]) => {
    const summary = months.reduce(
      (summary, monthData) => {
        summary.delivery += monthData.deliveryType.delivery;
        summary.pickup += monthData.deliveryType.pickup;
        return summary;
      },
      { delivery: 0, pickup: 0 },
    );

    return [
      { name: 'Entrega', value: summary.delivery, color: Colors.primary },
      { name: 'Retirada', value: summary.pickup, color: Colors.pickup },
    ];
  };
  getMonthsSummaryPayment = (data?: Record<PaymentMethod, number> | null) => {
    if (!data) return [];
    const total = Object.values(data).reduce((sum, v) => sum + v, 0);
    return Object.entries(data).map(([key, value]) => ({
      name: PaymentMethodMap[key as PaymentMethod],
      value: Math.round((value / total) * 100),
      color: Colors[key as PaymentMethod],
    }));
  };
  getTodayOrdersLabel(todaySummary?: TodaySummary) {
    if (!todaySummary) return '';
    const todayOrders = todaySummary.schedulers;
    const tomorrowOrders = todaySummary.schedulersYesterday;
    if (todayOrders === tomorrowOrders) return '';
    if (todayOrders > tomorrowOrders) {
      return `↑ ${todayOrders - tomorrowOrders} vs ontem`;
    }
    return `↓${tomorrowOrders - todayOrders} vs ontem`;
  }
  getLabelAndColor(status: SchedulerStatus) {
    const config = SchedulerConstant.status[status];
    return {
      color: config.color,
      label: config.label,
    };
  }

  getStatusPercent(statusPercent: Record<SchedulerStatus, number> | null) {
    if (!statusPercent) return [];
    return Object.keys(statusPercent || {})
      .map((status) => {
        const config = this.getLabelAndColor(status as SchedulerStatus);
        return {
          name: config.label,
          value: statusPercent[status as SchedulerStatus],
          color: config.color,
        };
      })
      .sort((a, b) => b.value - a.value);
  }
  getAlertComponentData(payload: SchedulerAlert | null): DashboardAlert[] {
    if (!payload) {
      return [];
    }
    const alerts: DashboardAlert[] = [];
    const processedIds = new Set<string>();

    const delayed = payload.delayedOrders.filter((order) => {
      processedIds.add(order.id);
      return true;
    });

    const tomorrow = payload.pendingConfirmationsTomorrow.filter(
      (order) => !processedIds.has(order.id),
    );

    tomorrow.forEach((order) => processedIds.add(order.id));

    const twoDays = payload.pendingConfirmationsTwoDays.filter(
      (order) => !processedIds.has(order.id),
    );

    if (delayed.length) {
      alerts.push({
        id: 'delayed-orders',
        type: 'error',
        title: 'Pedidos atrasados',
        description: `${delayed.length} pedido(s) em atraso`,
        orders: delayed,
      });
    }

    if (twoDays.length) {
      alerts.push({
        id: 'pending-confirmations-two-days',
        type: 'warning',
        title: 'Confirmações pendentes',
        description: `${twoDays.length} pedido(s) aguardando confirmação há mais de 2 dias`,
        orders: twoDays,
      });
    }

    if (tomorrow.length) {
      alerts.push({
        id: 'pending-confirmations-tomorrow',
        type: 'info',
        title: 'Entregas próximas',
        description: `${tomorrow.length} pedido(s) agendados para amanhã ainda pendentes`,
        orders: tomorrow,
      });
    }

    return alerts;
  }
  getDeliveriesToday(schedulers: Scheduler[]) {
    return schedulers.map((scheduler) => {
      const scheduledAt = new Date(scheduler.scheduledAt);
      let productLabel = scheduler.items[0].product.name;
      if (scheduler.items.length > 1) {
        productLabel += ` (+${scheduler.items.length - 1} produtos)`;
      }
      return {
        id: scheduler.id,
        time:
          scheduledAt.getHours().toString().padStart(2, '0') +
          ':' +
          scheduledAt.getMinutes().toString().padStart(2, '0'),
        customerName: scheduler.customer.name,
        productLabel,
        deliveryType: scheduler.deliveryType,
        status: scheduler.status,
      } satisfies DeliveryToday;
    });
  }
}

export default new DashboardController();
