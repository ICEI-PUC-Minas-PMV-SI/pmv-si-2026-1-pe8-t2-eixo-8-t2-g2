import type { ProductFilter, ProductSort } from './page-metadata';
import type { Request } from './server';

export type Product = {
  id: string;
  name: string;
  description?: string;
  price?: number;
  bookingLeadTimeMinutes?: number;
  bookingLeadDays?: number;
  characteristics?: string[];
  categories?: string[];
};

export type ProductCreatePayload = Omit<Product, 'id'>;

export type ProductRequest = Request<ProductFilter, ProductSort>;
