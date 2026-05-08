import type { SchedulerStatus } from '~/@types/scheduler';

type SchedulerConstantType = {
  status: Record<SchedulerStatus, { label: string; color: string }>;
};

export const SchedulerConstant: SchedulerConstantType = {
  status: {
    pending: { label: 'Pendente', color: 'gold' },
    confirmed: { label: 'Confirmado', color: 'blue' },
    in_progress: { label: 'Em andamento', color: 'processing' },
    completed: { label: 'Concluído', color: 'success' },
    cancelled: { label: 'Cancelado', color: 'error' },
  },
};
