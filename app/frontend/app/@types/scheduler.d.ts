import type { PaymentMethod } from './payment';
import type { Product } from './product';

export type Scheduler = {
  id: string;
  customer: {
    id: string;
    name: string;
    phone: string;
  };
  scheduledAt: string;
  scheduledTo?: string;
  estimatedStartAt?: string;
  estimatedEndAt?: string;
  status: SchedulerStatus;
  items: SchedulerItem[];
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    complement?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  notes?: string;
  paymentMethod?: PaymentMethod;
  deliveryType: DeliveryType;
  cancellationReason?: string;
  integrationStatus?: 'success' | 'failure';
};

export type PendingScheduler = Scheduler & {
  review: null;
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
  // orderIndex: number;
  // quantity: number;
  // priceAtBooking: number | null;
  // durationMinutes: number | null;
  // product: Pick<Product, 'id' | 'name' | 'price' | 'description'>;
  id: string;
  schedulerId: string;
  productId: string;
  quantity: number;
  priceAtBooking: number;
  durationMinutes: number;
  orderIndex: number;
  createdAt: string;
  customization: string;
  product: {
    id: string;
    name: string;
  };
};

export type DeliveryType = 'pickup' | 'delivery';
