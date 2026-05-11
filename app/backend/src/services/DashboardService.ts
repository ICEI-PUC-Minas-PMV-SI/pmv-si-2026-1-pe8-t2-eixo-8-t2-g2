import { addMonths, format, subMonths } from 'date-fns';
import { Prisma } from '../db/Prisma';
import { ptBR } from 'date-fns/locale';

class DashboardService {
  getStartAndEndDay(date: Date | string) {
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    endOfDay.setHours(23, 59, 59, 999);
    return {
      startOfDay,
      endOfDay,
    };
  }
  roundToTwo(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
  async overviewToday() {
    const prisma = await Prisma.getClient();
    const now = new Date(new Date(new Date().setDate(21)).setMonth(3)); //new Date();
    const { startOfDay, endOfDay } = this.getStartAndEndDay(now);
    const schedulers = await prisma.scheduler.findMany({
      where: {
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
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
    data.totalPrice = this.roundToTwo(data.totalPrice);
    data.avgPrice = this.roundToTwo(data.avgPrice);
    return {
      ...data,
      schedulers: schedulers.length,
      created: created.length,
      cancelled: cancelled.length,
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

  getMonthBilling(currentDate: Date) {
    return {
      timestamp: currentDate.getTime(),
      dateStr: format(currentDate, 'MM/yyyy'),
      monthYear: format(currentDate, 'MMM/yyyy', { locale: ptBR }),
      billing: 0,
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
    const startMonth = this.getStartAndEndDay(subMonths(new Date(), months)).startOfDay;

    const created = await prisma.scheduler.findMany({
      where: {
        createdAt: {
          gte: startMonth,
          lte: now,
        },
      },
    });
    const globalStatus = {
      pending: 0,
      confirmed: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
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
        globalStatus[scheduler.status]++;
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
      statusPercent: this.calculatePercentages(globalStatus),
    };
  }

  async latestMonthsBilling(months = 6) {
    const prisma = await Prisma.getClient();
    const now = new Date();
    const startMonth = this.getStartAndEndDay(subMonths(new Date(), months)).startOfDay;
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
    const billingByMonth = created.reduce(
      (summary, scheduler) => {
        const month = scheduler.createdAt.getMonth() + 1;
        if (!(month in summary)) {
          summary[month] = this.getMonthBilling(scheduler.createdAt);
        }
        summary[month].billing += scheduler.items.reduce((total, schedulerItem) => {
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
      if (billingByMonth[month]) {
        billingByMonth[month].billing = this.roundToTwo(billingByMonth[month].billing);
      } else {
        billingByMonth[month] = this.getMonthBilling(currentDate);
      }
    }
    return Object.values(billingByMonth).sort((a, b) => a.timestamp - b.timestamp);
  }
}

export default new DashboardService();
