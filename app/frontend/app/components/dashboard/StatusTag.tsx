import type { SchedulerStatus } from '~/@types/scheduler';
import { SchedulerConstant } from '~/constants/SchedulerConstant';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { Tag } from 'antd';

const getLabelAndColor = (status: SchedulerStatus) => {
  const config = SchedulerConstant.status[status];
  return {
    color: config.color,
    label: config.label,
  };
};

const statusConfig: Record<
  SchedulerStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: { ...getLabelAndColor('pending'), icon: <ClockCircleOutlined /> },
  confirmed: { ...getLabelAndColor('confirmed'), icon: <CheckCircleOutlined /> },
  in_progress: { ...getLabelAndColor('in_progress'), icon: <SyncOutlined spin /> },
  completed: { ...getLabelAndColor('completed'), icon: <CheckCircleOutlined /> },
  cancelled: { ...getLabelAndColor('cancelled'), icon: <CloseCircleOutlined /> },
};

export function StatusTag({ status }: { status: SchedulerStatus }) {
  const cfg = statusConfig[status];
  return (
    <Tag color={cfg.color} icon={cfg.icon}>
      {cfg.label}
    </Tag>
  );
}
