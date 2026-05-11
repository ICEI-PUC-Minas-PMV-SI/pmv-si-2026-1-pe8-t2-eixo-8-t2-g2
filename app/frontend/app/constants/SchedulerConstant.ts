import type { SchedulerStatus } from '~/@types/scheduler';

type SchedulerConstantType = {
  status: Record<SchedulerStatus, { label: string; color: string; bg: string }>;
};

export const SchedulerConstant: SchedulerConstantType = {
  status: {
    pending: { label: 'Pendente', color: '#BA7517', bg: '#FAEEDA' },
    confirmed: {
      label: 'Confirmado',
      color: '#185FA5',
      bg: '#E6F1FB',
    },
    in_progress: {
      label: 'Em produção',
      color: '#A2D729',
      bg: '#E6F8BB',
    },
    completed: {
      label: 'Concluído',
      color: '#3B6D11',
      bg: '#EAF3DE',
    },
    cancelled: {
      label: 'Cancelado',
      color: '#A32D2D',
      bg: '#FCEBEB',
    },
  },
};
