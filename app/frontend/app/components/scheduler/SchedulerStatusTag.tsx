import { Tag } from 'antd';
import type { SchedulerStatus } from '~/@types/scheduler';
import { SchedulerConstant } from '~/constants/SchedulerConstant';

/** Badge de status do pedido */
export function SchedulerStatusTag({ status }: { status: SchedulerStatus }) {
  return (
    <Tag color={SchedulerConstant.status[status].color}>
      {SchedulerConstant.status[status].label}
    </Tag>
  );
}
