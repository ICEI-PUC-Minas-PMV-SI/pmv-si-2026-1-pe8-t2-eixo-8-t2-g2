import { Prisma } from '../db/Prisma';

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
    const schedulerToday = await prisma.scheduler.findMany({
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
    const data = {
      totalPrice: 0,
      avgPrice: 0,
      inProgress: 0,
    };
    schedulerToday.forEach((scheduler) => {
      if (scheduler.status === 'in_progress') {
        data.inProgress++;
      }
      data.totalPrice += scheduler.items.reduce((acc, cv) => {
        acc += cv.priceAtBooking || 0;
        return acc;
      }, 0);
    });
    if (schedulerToday.length) {
      data.avgPrice = data.totalPrice / schedulerToday.length;
    }
    data.totalPrice = this.roundToTwo(data.totalPrice);
    data.avgPrice = this.roundToTwo(data.avgPrice);
    return {
      ...data,
      count: schedulerToday.length,
    };
  }
}

export default new DashboardService();
