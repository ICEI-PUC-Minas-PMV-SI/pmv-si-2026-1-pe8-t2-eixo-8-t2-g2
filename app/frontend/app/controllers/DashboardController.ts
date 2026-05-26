import type { Scheduler } from '~/@types/scheduler';
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
}

export default new DashboardController();
