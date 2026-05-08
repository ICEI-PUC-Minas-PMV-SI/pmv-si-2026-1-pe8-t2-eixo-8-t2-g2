import dayjs from 'dayjs';

class DateUtil {
  format(value: string | Date, format = 'DD/MM/YYYY HH:mm') {
    return dayjs(value).format(format);
  }
  getFormattedNow(format = 'DD/MM/YYYY HH:mm') {
    return dayjs().format(format);
  }
  toISO(value: string | Date) {
    return dayjs(value).toISOString();
  }
}

export default new DateUtil();
