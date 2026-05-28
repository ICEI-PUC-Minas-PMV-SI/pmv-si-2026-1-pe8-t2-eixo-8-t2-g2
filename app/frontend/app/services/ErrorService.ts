type ErrorPayload = {
  title?: string;
  message: string;
  code?: number;
  meta?: any;
};

class ErrorService {
  private listeners: Array<(e: ErrorPayload) => void> = [];

  notify(payload: ErrorPayload) {
    this.listeners.forEach((l) => l(payload));
  }

  subscribe(fn: (e: ErrorPayload) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }
}

export const errorService = new ErrorService();

export type { ErrorPayload };
