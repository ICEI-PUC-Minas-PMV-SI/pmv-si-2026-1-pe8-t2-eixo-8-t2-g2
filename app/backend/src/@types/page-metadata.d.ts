export type SchedulerFilter = {
  deliveryType: ('pickup' | 'delivery')[];
  status: ('pending' | 'confirmed' | 'cancelled' | 'completed')[];
  paymentMethod: ('credit_card' | 'pix' | 'bank_transfer' | 'cash')[];
};

export type SchedulerFilterKey = keyof SchedulerFilter;

export type SchedulerSort =
  | 'customer_name'
  | 'customer_date'
  | 'items_quantity'
  | 'items_price';
