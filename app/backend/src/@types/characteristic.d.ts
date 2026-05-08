export type ProductCharacteristic = {
  id: string;
  name: string;
};

export type ProductCharacteristicCreatePayload = Omit<ProductCharacteristic, 'id'>;
