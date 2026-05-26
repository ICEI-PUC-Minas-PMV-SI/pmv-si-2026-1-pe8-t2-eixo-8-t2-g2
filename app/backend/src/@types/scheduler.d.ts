import type { DeliveryType, PaymentMethod } from '../generated/prisma/enums.ts';
import type { SchedulerFilter, SchedulerSort } from './page-metadata.js';
import type { Product } from './product';
import type { Request } from './server';

export type ProductItem = {
  id: Product['id'];
  quantity: number;
  customization?: string;
};

export type SchedulerRequest = Request<SchedulerFilter, SchedulerSort>;

export type SchedulerCreatePayload = {
  userId: string;
  customerId?: string;
  customerName?: string;
  customerPhone: string;
  scheduledAt: string;
  scheduledTo?: string;
  paymentMethod: PaymentMethod;
  deliveryType: DeliveryType;
  items: ProductItem[];
};

export type SchedulerItemPayload = {
  id?: string;
  productId: string;
  quantity: number;
  orderIndex: number;
  customization?: string;
  priceAtBooking?: number;
  durationMinutes?: number;
};

export type SchedulerUpdatePayload = {
  scheduledAt?: string;
  scheduledTo?: string;
  status?: SchedulerStatus;
  deliveryType?: DeliveryType;
  paymentMethod?: PaymentMethod;
  items: SchedulerItemPayload[];
};

export type LeadTimeConfig = {
  leadTimeInMinutes?: number | undefined;
  leadTimeInDays?: number | undefined;
};

export type SchedulerEvent = {
  title: string;
  description: string;
  startDate?: string;
  endDate?: string;
  startDateTime?: string;
  endDateTime?: string;
};
