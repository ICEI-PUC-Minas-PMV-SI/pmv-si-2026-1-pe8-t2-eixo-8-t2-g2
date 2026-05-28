// import { google } from 'googleapis';
import { GoogleApi, INTEGRATION } from './GoogleApi';
import type { SchedulerEvent } from '@types';

class GoogleCalendar {
  async addEvent(event: SchedulerEvent) {
    const { google } = await import('googleapis');
    const { client, accessToken } = await GoogleApi.getClient(INTEGRATION.CALENDAR);
    client.setCredentials({
      access_token: accessToken,
      scope: 'https://www.googleapis.com/auth/calendar',
      token_type: 'Bearer',
      expiry_date: 1774494337004,
    });
    const calendar = google.calendar({
      version: 'v3',
      auth: client,
    });
    const { title, description, startDate, endDate, startDateTime, endDateTime } = event;

    const result = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: title, //'Pedido de bolo',
        description, //'Cliente: João',
        start: {
          date: startDate || null,
          dateTime: startDateTime || null, //'2026-03-25T10:00:00-03:00',
        },
        end: {
          date: endDate || null,
          dateTime: endDateTime || null, //'2026-03-25T11:00:00-03:00',
        },
      },
    });
    return result.data;
  }
}

const instance = new GoogleCalendar();
export { instance as GoogleCalendar };
export default instance;
