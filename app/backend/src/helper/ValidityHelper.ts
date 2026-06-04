import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { endOfDay, startOfDay } from 'date-fns';
import { Env } from '../utils/Env.js';

const TIME_ZONE = Env.getTimeZone();

class ValidityHelper {
  private getTodayInTimeZone() {
    const now = new Date();
    const localNow = toZonedTime(now, TIME_ZONE);

    return {
      startOfToday: fromZonedTime(startOfDay(localNow), TIME_ZONE),
      endOfToday: fromZonedTime(endOfDay(localNow), TIME_ZONE),
    };
  }
  buildValidityFilter() {
    const now = toZonedTime(new Date(), TIME_ZONE);

    // Hoje projetado em 1970 para comparar com recorrentes
    const todayAs1970Start = fromZonedTime(
      new Date(1970, now.getMonth(), now.getDate(), 0, 0, 0),
      TIME_ZONE,
    );
    const todayAs1970End = fromZonedTime(
      new Date(1970, now.getMonth(), now.getDate(), 23, 59, 59),
      TIME_ZONE,
    );

    // Para datas fixas, usa a data real
    const { startOfToday, endOfToday } = this.getTodayInTimeZone();

    return {
      OR: [
        // 1. Sem vigência — sempre retorna
        { startsAt: null, endsAt: null },

        // 2. Vigência Fixa — compara data completa
        {
          isRecurring: false,
          startsAt: { lte: endOfToday },
          endsAt: { gte: startOfToday },
        },

        // 3. Recorrente — período normal (start <= end dentro do mesmo ano)
        {
          isRecurring: true,
          startsAt: { lte: todayAs1970End },
          endsAt: { gte: todayAs1970Start },
        },

        // 4. Recorrente — período que cruza virada de ano (ex: 26/12 → 01/01)
        //    start > end em 1970, dividido em dois sub-ranges
        {
          isRecurring: true,
          startsAt: { lte: fromZonedTime(new Date(1970, 11, 31, 23, 59, 59), TIME_ZONE) },
          endsAt: { gte: fromZonedTime(new Date(1971, 0, 1, 0, 0, 0), TIME_ZONE) },
          OR: [
            { startsAt: { lte: todayAs1970End } }, // hoje está após o início
            { endsAt: { gte: todayAs1970Start } }, // hoje está antes do fim
          ],
        },
      ],
    };
  }
}

const instance = new ValidityHelper();
export { instance as ValidityHelper };
