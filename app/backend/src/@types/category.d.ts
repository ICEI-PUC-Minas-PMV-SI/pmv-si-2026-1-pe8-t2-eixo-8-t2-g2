export type ProductCategoryCreatePayload = {
  name: string;
  description?: string;
};

export type ProductCategory = {
  id: string;
  name: string;
  description?: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
};
