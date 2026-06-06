import type { SchedulerItem } from '~/@types/scheduler';
import NumberUtil from '~/utils/NumberUtil';

class SchedulerHelper {
  getOrderTotal = (items: SchedulerItem[]): number => {
    const total = items.reduce(
      (acc, item) => acc + (item.priceAtBooking ?? 0) * item.quantity,
      0,
    );
    return Math.round(total * 100) / 100;
  };

  getItemColumnText = (items: SchedulerItem[]) => {
    const count = items.length;
    const price = this.getOrderTotal(items);
    return `${count} ${count > 1 ? 'itens' : 'item'} · ${NumberUtil.currency(price)} est.`;
  };
}

const instance = new SchedulerHelper();

export { instance as SchedulerHelper };
