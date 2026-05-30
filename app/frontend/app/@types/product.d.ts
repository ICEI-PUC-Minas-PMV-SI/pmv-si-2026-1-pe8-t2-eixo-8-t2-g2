export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  orderIndex: number;
  parentId?: string | null;
};

export type CreateProductCategoryPayload = Omit<ProductCategory, 'id'>;

export type ProductCharacteristicType = { characteristic: { id: string; name: string } };

export type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  bookingLeadMinutes: number;
  isActive: boolean;
  characteristics: ProductCharacteristicType[];
  imageUrl?: string;
  categories: { category: { id: string; name: string } }[];
};

export type CreateProduct = Omit<Product, 'id'>;

export type ProductCharacteristic = {
  id: string;
  name: string;
  iconUrl?: string;
};

export type CreateProductCharacteristic = Omit<ProductCharacteristic, 'id'>;
