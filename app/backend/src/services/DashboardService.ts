import { addMonths } from 'date-fns/addMonths';

import { subDays } from 'date-fns/subDays';
import { subMonths } from 'date-fns/subMonths';
import { startOfDay } from 'date-fns/startOfDay';
import { endOfDay } from 'date-fns/endOfDay';

import { fromZonedTime } from 'date-fns-tz';
import { Prisma } from '../db/Prisma';
import NumberUtil from '../utils/NumberUtil';

class DashboardService {
  getStartAndEndDay(date: Date | string) {
    const timeZone = 'America/Sao_Paulo';

    const localDate = new Date(date);

    const start = startOfDay(localDate);
    const end = endOfDay(localDate);

    return {
      startOfDay: fromZonedTime(start, timeZone),
      endOfDay: fromZonedTime(end, timeZone),
    };
  }
  async overviewToday() {
    const prisma = await Prisma.getClient();
    const now = new Date();
    const { startOfDay, endOfDay } = this.getStartAndEndDay(now);
    const { startOfDay: startOfYesterday, endOfDay: endOfYesterday } =
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

    const schedulersYesterday = await prisma.scheduler.findMany({
      where: {
        scheduledAt: {
          gte: startOfYesterday,
          lte: endOfYesterday,
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
      schedulersYesterday: schedulersYesterday.length,
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

  formatDate(date: Date) {
    return new Intl.DateTimeFormat('pt-BR', {
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  formatMonthYear(date: Date) {
    return new Intl.DateTimeFormat('pt-BR', {
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  getMonthRevenue(currentDate: Date) {
    return {
      timestamp: currentDate.getTime(),
      dateStr: this.formatDate(currentDate),
      monthYear: this.formatMonthYear(currentDate),
      revenue: 0,
    };
  }

  getMonthSummary(currentDate: Date) {
    return {
      timestamp: currentDate.getTime(),
      dateStr: this.formatDate(currentDate),
      monthYear: this.formatMonthYear(currentDate),
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

  async topProducts(count: number = 10) {
    const prisma = await Prisma.getClient();
    const result = await prisma.$queryRaw<
      {
        id: string;
        name: string;
        price: number;
        quantity: number;
        revenue: number;
      }[]
    >`
  SELECT
    P.id,
    P.name,
    P.price,
    SUM(SI.quantity) as quantity,
    SUM(SI.quantity * SI.priceAtBooking) as revenue
  FROM SchedulerItem SI
  INNER JOIN Product P
    ON SI.productId = P.id
  GROUP BY P.id, P.name
  ORDER BY SUM(SI.quantity) DESC
  LIMIT ${count}
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
        scheduledTo: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
    return result;
  }
}

export default new DashboardService();
