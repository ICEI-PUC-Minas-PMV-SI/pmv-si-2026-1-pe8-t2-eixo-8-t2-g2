import type { LeadTimeConfig } from '../@types';
import { addMinutes } from 'date-fns/addMinutes';
import { addDays } from 'date-fns/addDays';
import { isAfter } from 'date-fns/isAfter';
import { isEqual } from 'date-fns/isEqual';

class BookingLeadTimeHelper {
  isValidLeadTime(scheduledAt: Date, leadTimeConfig?: LeadTimeConfig): boolean {
    const { leadTimeInMinutes = 0, leadTimeInDays = 0 } = leadTimeConfig || {};

    const minAllowedDate = addDays(
      addMinutes(new Date(), leadTimeInMinutes),
      leadTimeInDays,
    );

    return isEqual(scheduledAt, minAllowedDate) || isAfter(scheduledAt, minAllowedDate);
  }
}

const instance = new BookingLeadTimeHelper();
export { instance as BookingLeadTimeHelper };
