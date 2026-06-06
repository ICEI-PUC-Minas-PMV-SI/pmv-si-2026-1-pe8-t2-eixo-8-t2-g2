import dayjs from 'dayjs';

export interface ParsedDuration {
  days: number;
  hours: number;
  minutes: number;
  totalHours: number;
}

export interface DurationType {
  days?: number;
  hours?: number;
  minutes?: number;
}

const ONE_DAY_IN_MINUTES = 60 * 24;

class Duration {
  parse(minutes: number) {
    const days = Math.floor(minutes / ONE_DAY_IN_MINUTES);
    const remainingMinutes = minutes % ONE_DAY_IN_MINUTES;
    const hours = Math.floor(remainingMinutes / 60);

    return {
      days,
      hours,
      minutes: remainingMinutes % 60,
      totalHours: minutes / 60,
    };
  }
  toMinutes(duration: DurationType = {}) {
    const { days = 0, hours = 0, minutes = 0 } = duration;
    return days * 24 * 60 + hours * 60 + minutes;
  }
  minutesToHours(minutes: number) {
    return Number((minutes / 60).toFixed(2));
  }
  toTimePickerValue(minutes: number) {
    const hours = Math.floor(minutes / ONE_DAY_IN_MINUTES);

    return dayjs()
      .startOf('day')
      .hour(hours)
      .minute(minutes % ONE_DAY_IN_MINUTES);
  }
  fromTimePickerValue(value?: dayjs.Dayjs) {
    if (!value) return 0;

    return value.hour() * 60 + value.minute();
  }
}

const instance = new Duration();
export { instance as Duration };
