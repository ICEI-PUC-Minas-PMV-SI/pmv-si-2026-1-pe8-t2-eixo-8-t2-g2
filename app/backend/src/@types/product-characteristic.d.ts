import type { ProductCharacteristicSort } from './page-metadata';
import type { Request } from './server';

export type ProductCharacteristicRequest = Request<{}, ProductCharacteristicSort>;
