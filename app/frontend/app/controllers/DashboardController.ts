import Request from '~/utils/Request';

type TodaySummary = {
  totalPrice: number;
  avgPrice: number;
  inProgress: number;
  schedulers: number;
  created: number;
  cancelled: number;
};

type MonthSummary = {
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
};

type LatestMonthsBillingSummary = {
  timestamp: number;
  dateStr: string;
  monthYear: string;
  billing: number;
}[];

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
  async latestMonthsBilling() {
    return Request.get<{ data: LatestMonthsBillingSummary }>(
      '/dashboard-latest-months-billing',
    ).then((result) => result.data);
  }
}

export default new DashboardController();
