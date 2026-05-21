import { addMonths, format, subDays, subMonths } from 'date-fns';
import { Prisma } from '../db/Prisma';
import { ptBR } from 'date-fns/locale';
import NumberUtil from '../utils/NumberUtil';

class DashboardService {
  getStartAndEndDay(date: Date | string) {
    const d = new Date(date);

    const startOfDay = new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0),
    );

    const endOfDay = new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999),
    );

    return {
      startOfDay,
      endOfDay,
    };
  }
  async overviewToday() {
    const prisma = await Prisma.getClient();
    const now = new Date();
    const { startOfDay, endOfDay } = this.getStartAndEndDay(now);
    const { startOfDay: startOfTomorrow, endOfDay: endOfTomorrow } =
      this.getStartAndEndDay(subDays(new Date(), 1));
    const schedulers = await prisma.scheduler.findMany({
      where: {
        scheduledTo: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        items: true,
      },
    });

    const schedulersTomorrow = await prisma.scheduler.findMany({
      where: {
        scheduledAt: {
          gte: startOfTomorrow,
          lte: endOfTomorrow,
        },
      },
      include: {
        items: true,
      },
    });
    const created = await prisma.scheduler.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
    const cancelled = await prisma.scheduler.findMany({
      where: {
        updatedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: 'cancelled',
      },
    });
    const data = {
      totalPrice: 0,
      avgPrice: 0,
      inProgress: 0,
    };
    schedulers.forEach((scheduler) => {
      if (scheduler.status === 'in_progress') {
        data.inProgress++;
      }
      data.totalPrice += scheduler.items.reduce((acc, cv) => {
        acc += cv.priceAtBooking || 0;
        return acc;
      }, 0);
    });
    if (schedulers.length) {
      data.avgPrice = data.totalPrice / schedulers.length;
    }
    data.totalPrice = NumberUtil.roundToTwo(data.totalPrice);
    data.avgPrice = NumberUtil.roundToTwo(data.avgPrice);
    return {
      ...data,
      schedulers: schedulers.length,
      schedulersTomorrow: schedulersTomorrow.length,
      created: created.length,
      cancelled: cancelled.length,
      delivery: schedulers.filter((scheduler) => scheduler.deliveryType === 'delivery')
        .length,
      pickup: schedulers.filter((scheduler) => scheduler.deliveryType === 'pickup')
        .length,
    };
  }

  calculatePercentages(data: Record<string, number>) {
    const total = Object.values(data).reduce((a, b) => a + b, 0);

    if (!total) return data;

    const result: Record<string, number> = {};

    let sum = 0;
    let largestKey: string | null = null;

    for (const [key, value] of Object.entries(data)) {
      const percent = Math.round((value / total) * 100);

      result[key] = percent;
      sum += percent;

      if (largestKey === null || value > (data[largestKey] ?? 0)) {
        largestKey = key;
      }
    }

    if (largestKey !== null) {
      result[largestKey] = (result[largestKey] ?? 0) + (100 - sum);
    }

    return result;
  }

  getMonthRevenue(currentDate: Date) {
    return {
      timestamp: currentDate.getTime(),
      dateStr: format(currentDate, 'MM/yyyy'),
      monthYear: format(currentDate, 'MMM/yyyy', { locale: ptBR }),
      revenue: 0,
    };
  }

  getMonthSummary(currentDate: Date) {
    return {
      timestamp: currentDate.getTime(),
      dateStr: format(currentDate, 'MM/yyyy'),
      monthYear: format(currentDate, 'MMM/yyyy', { locale: ptBR }),
      status: {
        pending: 0,
        confirmed: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
      },
      deliveryType: {
        pickup: 0,
        delivery: 0,
      },
      paymentMethod: {
        credit_card: 0,
        debit_card: 0,
        pix: 0,
        bank_transfer: 0,
        cash: 0,
      },
    };
  }

  async latestMonths(months = 6) {
    const prisma = await Prisma.getClient();
    const now = new Date();
    const startMonth = this.getStartAndEndDay(
      subMonths(new Date(), months - 1),
    ).startOfDay;

    const created = await prisma.scheduler.findMany({
      where: {
        createdAt: {
          gte: startMonth,
          lte: now,
        },
      },
    });
    const globalData = {
      status: {
        pending: 0,
        confirmed: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
      },
      paymentMethod: {
        credit_card: 0,
        debit_card: 0,
        pix: 0,
        bank_transfer: 0,
        cash: 0,
      },
      deliveryType: {
        delivery: 0,
        pickup: 0,
      },
    };
    const schedulerByMonth = created.reduce(
      (summary, scheduler) => {
        const month = scheduler.createdAt.getMonth() + 1;
        if (!(month in summary)) {
          summary[month] = this.getMonthSummary(scheduler.createdAt);
        }
        summary[month].status[scheduler.status]++;
        summary[month].deliveryType[scheduler.deliveryType]++;
        summary[month].paymentMethod[scheduler.paymentMethod]++;
        globalData.deliveryType[scheduler.deliveryType]++;
        globalData.paymentMethod[scheduler.paymentMethod]++;
        globalData.status[scheduler.status]++;
        return summary;
      },
      {} as Record<number, any>,
    );

    for (let i = 0; i < months; i++) {
      const currentDate = addMonths(new Date(startMonth), i);
      const month = currentDate.getMonth() + 1;
      if (!schedulerByMonth[month]) {
        schedulerByMonth[month] = this.getMonthSummary(currentDate);
      }
    }

    return {
      months: Object.values(schedulerByMonth).sort((a, b) => a.timestamp - b.timestamp),
      statusPercent: this.calculatePercentages(globalData.status),
      summary: globalData,
    };
  }

  async latestMonthsRevenue(months = 6) {
    const prisma = await Prisma.getClient();
    const now = new Date();
    const month = subMonths(new Date(), months - 1);
    month.setDate(1);
    const startMonth = this.getStartAndEndDay(month).startOfDay;
    const created = await prisma.scheduler.findMany({
      where: {
        createdAt: {
          gte: startMonth,
          lte: now,
        },
        status: 'completed',
      },
      include: {
        items: true,
      },
    });
    const revenueByMonth = created.reduce(
      (summary, scheduler) => {
        const month = scheduler.createdAt.getMonth() + 1;
        if (!(month in summary)) {
          summary[month] = this.getMonthRevenue(scheduler.createdAt);
        }
        summary[month].revenue += scheduler.items.reduce((total, schedulerItem) => {
          total += (schedulerItem.priceAtBooking || 0) * schedulerItem.quantity;
          return total;
        }, 0);
        return summary;
      },
      {} as Record<number, any>,
    );

    for (let i = 0; i < months; i++) {
      const currentDate = addMonths(new Date(startMonth), i);
      const month = currentDate.getMonth() + 1;
      if (revenueByMonth[month]) {
        revenueByMonth[month].revenue = NumberUtil.roundToTwo(
          revenueByMonth[month].revenue,
        );
      } else {
        revenueByMonth[month] = this.getMonthRevenue(currentDate);
      }
    }
    return Object.values(revenueByMonth).sort((a, b) => a.timestamp - b.timestamp);
  }

  async topProducts() {
    const prisma = await Prisma.getClient();
    const result = await prisma.$queryRaw<
      {
        id: string;
        name: string;
        quantity: number;
        revenue: number;
      }[]
    >`
  SELECT
    P.id,
    P.name,
    SUM(SI.quantity) as quantity,
    SUM(SI.quantity * SI.priceAtBooking) as revenue
  FROM SchedulerItem SI
  INNER JOIN Product P
    ON SI.productId = P.id
  GROUP BY P.id, P.name
  ORDER BY SUM(SI.quantity) DESC
  LIMIT 10
`;
    const schedulerItemSum = await prisma.schedulerItem.aggregate({
      _sum: {
        quantity: true,
      },
    });
    const totalItems = schedulerItemSum._sum.quantity || 0;

    return result.map((item) => ({
      ...item,
      quantity: Number(item.quantity),
      revenue: NumberUtil.roundToTwo(item.revenue),
      percent:
        totalItems > 0
          ? NumberUtil.roundToTwo((Number(item.quantity) * 100) / totalItems)
          : 0,
    }));
  }

  async deliveriesToday() {
    const prisma = await Prisma.getClient();
    const { startOfDay, endOfDay } = this.getStartAndEndDay(new Date());
    const result = await prisma.scheduler.findMany({
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      where: {
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
    return result;
  }
}

export default new DashboardService();
