import { Tag } from 'antd';
import type { DeliveryType } from '~/@types/scheduler';
import { DeliveryTypeMap } from '~/constants/DeliveryMap';

type ComponentProps = {
  type?: DeliveryType;
};
export function DeliveryTag({ type }: ComponentProps) {
  if (!type) return null;
  const { label, Icon } = DeliveryTypeMap[type];
  return (
    <Tag icon={<Icon />} color={type === 'delivery' ? 'purple' : 'cyan'}>
      {label}
    </Tag>
  );
}
