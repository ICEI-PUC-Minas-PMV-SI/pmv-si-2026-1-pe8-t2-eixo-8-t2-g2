import { Button, Card, Drawer, Form, message, Segmented, Space } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import type { Scheduler, SchedulerItem } from '~/@types/scheduler';
import SchedulerController from '~/controllers/SchedulerController';
import { useTableQuery } from '~/hooks/useTableQuery';
import DateUtil from '~/utils/DateUtil';
import { SchedulerSummary } from './SchedulerSummary';
import { CalendarOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { SchedulerCreateForm } from './SchedulerCreateForm';
import { SchedulerList } from './SchedulerList';
import { SchedulerCalendar } from './SchedulerCalendar';
import { SchedulerConstant } from '~/constants/SchedulerConstant';

export function SchedulerTab() {
  const schedulerQuery = useTableQuery<Scheduler>('scheduler', (params) =>
    SchedulerController.list<Scheduler>(params),
  );

  const {
    tableProps: { dataSource: schedulers = [], pagination },
    forceRefetch,
  } = schedulerQuery;

  const [scheduleView, setScheduleView] = useState<'list' | 'calendar'>('list');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();

  const scheduleStats = useMemo(() => {
    const total = schedulers.length;
    const confirmed = schedulers.filter((s) => s.status === 'confirmed').length;
    const pending = schedulers.filter((s) => s.status === 'pending').length;
    const completed = schedulers.filter((s) => s.status === 'completed').length;
    const cancelled = schedulers.filter((s) => s.status === 'cancelled').length;
    const inProgress = schedulers.filter((s) => s.status === 'in_progress').length;

    const stats = {
      status: [
        { ...SchedulerConstant.status.pending, value: pending },
        { ...SchedulerConstant.status.confirmed, value: confirmed },
        { ...SchedulerConstant.status.in_progress, value: inProgress },
        { ...SchedulerConstant.status.completed, value: completed },
        { ...SchedulerConstant.status.cancelled, value: cancelled },
      ],
      total,
    };
    return stats;
  }, [schedulers, pagination]);

  const calendarEvents = useMemo(() => {
    const map = new Map<string, Scheduler[]>();
    schedulers.forEach((item) => {
      const dateKey = DateUtil.format(item.scheduledAt, 'YYYY-MM-DD');
      const current = map.get(dateKey) ?? [];
      current.push(item);
      map.set(dateKey, current);
    });
    return map;
  }, [schedulers]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const items: SchedulerItem[] = (values.items ?? []).map((it: any, idx: number) => ({
        id: `it-new-${Date.now()}-${idx}`,
        productName: it.productName,
        quantity: it.quantity ?? 1,
      }));

      const next: Scheduler = {
        id: `sch-${Date.now()}`,
        customer: values.customer,
        scheduledAt: values.scheduledAt
          ? DateUtil.toISO(values.scheduledAt)
          : DateUtil.toISO(new Date()),
        status: 'pending',
        paymentMethod: values.paymentMethod,
        deliveryType: values.deliveryType,
        items,
      };
      SchedulerController.create(next);

      // onAdd(next);
      message.success('Pedido criado com sucesso.');
      setDrawerOpen(false);
      form.resetFields();
      forceRefetch();
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
    }
  };

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <SchedulerSummary stats={scheduleStats} /> {/* resumo estatístico */}
      <Card
        title="Pedidos"
        extra={
          <Space>
            <Segmented
              value={scheduleView}
              onChange={(value) => setScheduleView(value as 'list' | 'calendar')}
              options={[
                { label: 'Lista', value: 'list', icon: <EyeOutlined /> },
                { label: 'Calendário', value: 'calendar', icon: <CalendarOutlined /> },
              ]}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setDrawerOpen(true)}
            >
              Novo pedido
            </Button>
          </Space>
        }
      >
        {scheduleView === 'list' ? (
          <SchedulerList schedulerQuery={schedulerQuery} />
        ) : (
          <SchedulerCalendar calendarEvents={calendarEvents} />
        )}
      </Card>
      {/* Drawer: Novo pedido */}
      <Drawer
        size="large"
        title="Novo pedido"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>Cancelar</Button>
            <Button type="primary" onClick={handleSave}>
              Salvar
            </Button>
          </Space>
        }
      >
        <SchedulerCreateForm form={form} />
      </Drawer>
    </Space>
  );
}
