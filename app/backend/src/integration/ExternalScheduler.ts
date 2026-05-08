import type { SchedulerEvent } from '@types';
import { Env } from '../utils/Env';
import { HttpCode } from '../utils/HttpCode';
import { GoogleCalendar } from './GoogleCalendar';
import { AppError } from '../error/AppError';

class ExternalScheduler {
  addEvent(event: SchedulerEvent) {
    if (Env.get('GOOGLE_CALENDAR_REFRESH_TOKEN')) {
      return GoogleCalendar.addEvent(event);
    }
    throw new AppError('INVALID_EXTERNAL_SCHEDULER', HttpCode.INTERNAL_SERVER_ERROR);
  }
}

const instance = new ExternalScheduler();
export { instance as ExternalScheduler };
export default instance;
