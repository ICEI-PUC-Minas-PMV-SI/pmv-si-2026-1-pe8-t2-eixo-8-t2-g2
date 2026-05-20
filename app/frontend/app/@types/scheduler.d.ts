import type { PaymentMethod } from './payment';
import type { Product } from './product';

export type Scheduler = {
  id: string;
  customer: {
    id: string;
    name: string;
  };
  scheduledAt: string;
  scheduledTo?: string;
  estimatedStartAt?: string;
  estimatedEndAt?: string;
  status: SchedulerStatus;
  items: SchedulerItem[];
  paymentMethod?: PaymentMethod;
  deliveryType: DeliveryType;
  cancellationReason?: string;
};

export type CreateScheduler = Omit<Scheduler, 'id' | 'status' | 'customer'> & {
  customerId?: string;
  customerName?: string;
  customerPhone: string;
};

export type SchedulerStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type SchedulerItem = {
  orderIndex: number;
  quantity: number;
  priceAtBooking: number | null;
  durationMinutes: number | null;
  product: Pick<Product, 'id' | 'name' | 'price' | 'description'>;
};

export type DeliveryType = 'pickup' | 'delivery';
