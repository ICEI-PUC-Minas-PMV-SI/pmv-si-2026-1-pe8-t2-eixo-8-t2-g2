export type ProductCategoryCreatePayload = {
  name: string;
  description?: string;
  startsAt: string | null; // ISO date string
  endsAt: string | null; // ISO date string
  isRecurring: boolean;
  orderIndex: number;
  isActive: boolean;
};

export type ProductCategory = {
  id: string;
  name: string;
  description?: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
};
