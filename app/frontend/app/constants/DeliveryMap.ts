import type { DeliveryType } from '~/@types/scheduler';
import { ShopOutlined, CarOutlined } from '@ant-design/icons';

type ConstantProp = Record<DeliveryType, { label: string; Icon: React.FC }>;

export const DeliveryTypeMap: ConstantProp = {
  pickup: { label: 'Retirada', Icon: ShopOutlined },
  delivery: { label: 'Entrega', Icon: CarOutlined },
};
