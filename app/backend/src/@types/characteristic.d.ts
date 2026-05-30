import type { CharacteristicSort } from './page-metadata';
import type { Request } from './server';

export type ProductCharacteristic = {
  id: string;
  name: string;
};

export type ProductCharacteristicCreatePayload = Omit<ProductCharacteristic, 'id'>;

export type CharacteristicRequest = Request<{}, CharacteristicSort>;
