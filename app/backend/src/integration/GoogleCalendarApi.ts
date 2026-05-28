import { RequestUtil } from '../utils/RequestUtil.js';
import { GoogleApi, INTEGRATION } from './GoogleApi.js';

export interface GoogleCalendarEventDateTime {
  dateTime: string;
  timeZone?: string;
}

export interface GoogleCalendarAttendee {
  email: string;
  displayName?: string;
}

export interface CreateGoogleCalendarEventInput {
  summary: string;
  description?: string;
  location?: string;
  start: GoogleCalendarEventDateTime;
  end: GoogleCalendarEventDateTime;
  attendees?: GoogleCalendarAttendee[];
}

export interface GoogleCalendarEvent {
  id: string;
  status: string;
  htmlLink?: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: {
    dateTime?: string;
    timeZone?: string;
  };
  end?: {
    dateTime?: string;
    timeZone?: string;
  };
  attendees?: GoogleCalendarAttendee[];
}

class GoogleCalendarApi {
  private readonly BASE_URL = 'https://www.googleapis.com/calendar/v3';

  private async request<T>(
    endpoint: string,
    options?: {
      method?: 'GET' | 'POST' | 'DELETE';
      body?: unknown;
    },
  ): Promise<T> {
    const { accessToken } = await GoogleApi.getClient(INTEGRATION.CALENDAR);

    return RequestUtil.send<T>(`${this.BASE_URL}${endpoint}`, {
      method: options?.method || 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      data: options?.body,
    });
  }

  async createEvent(event: CreateGoogleCalendarEventInput) {
    return this.request<GoogleCalendarEvent>('/calendars/primary/events', {
      method: 'POST',
      body: event,
    });
  }

  async getEventById(eventId: string) {
    return this.request<GoogleCalendarEvent>(
      `/calendars/primary/events/${encodeURIComponent(eventId)}`,
      {
        method: 'GET',
      },
    );
  }

  async deleteEventById(eventId: string) {
    await this.request<void>(`/calendars/primary/events/${encodeURIComponent(eventId)}`, {
      method: 'DELETE',
    });
  }

  testCalendarIntegration() {
    return this.request('/calendars/primary/events', {
      method: 'GET',
    });
  }
}

const instance = new GoogleCalendarApi();

export { instance as GoogleCalendarApi };
