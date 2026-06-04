import type { ProductCategoryFilter, ProductCategorySort } from './page-metadata';
import type { Request } from './server';

export type ProductCategory = {
  id: string;
  name: string;
  isActive: boolean;
  orderIndex: number;
};

export type ProductCategoryCreatePayload = Omit<ProductCategory, 'id'>;

export type ProductCategoryRequest = Request<ProductCategoryFilter, ProductCategorySort>;
