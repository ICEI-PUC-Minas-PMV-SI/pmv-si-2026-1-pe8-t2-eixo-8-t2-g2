import type { UserRole } from '.../validations/UserValidation';

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
  | 'items_price'
  | 'scheduledAt';

export type ProductFilter = {
  isActive: boolean;
  characteristics: string[];
  categoryId: string;
};

export type ProductFilterKey = keyof ProductFilter;

export type ProductSort = 'name' | 'price';

export type UserFilter = {
  role: UserRole[];
};

export type UserFilterKey = keyof UserFilter;

export type UserSort = 'name' | 'createdAt';

export type CharacteristicFilter = {
  name: string;
};

export type CharacteristicFilterKey = keyof CharacteristicFilter;

export type CharacteristicSort = 'name';

export type ProductCategoryFilter = {
  isActive: boolean;
  isRecurring: boolean;
  startsAt: string;
  endsAt: string;
};

export type ProductCategorySort = 'name';

export type ReviewFilter = {
  comment: string;
  rating: number;
  featured: boolean;
};

export type ReviewSort = 'rating';
export type ReviewFilterKey = keyof ReviewFilter;
