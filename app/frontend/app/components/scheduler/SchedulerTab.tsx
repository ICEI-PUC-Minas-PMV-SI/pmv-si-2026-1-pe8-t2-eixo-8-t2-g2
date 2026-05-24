import { Button, Card, Drawer, Form, message, Segmented, Space, Tooltip } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import type { CreateScheduler, Scheduler, SchedulerItem } from '~/@types/scheduler';
import SchedulerController from '~/controllers/SchedulerController';
import { useTableQuery } from '~/hooks/useTableQuery';
import DateUtil from '~/utils/DateUtil';
import { SchedulerSummary } from './SchedulerSummary';
import { CalendarOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { SchedulerForm } from './SchedulerForm';
import { SchedulerList } from './SchedulerList';
import { SchedulerCalendar } from './SchedulerCalendar';
import { SchedulerConstant } from '~/constants/SchedulerConstant';
import { useAuthStore } from '~/hooks/useAuthStore';
import dayjs from 'dayjs';
import TextUtil from '~/utils/TextUtil';

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
  const { isAdmin } = useAuthStore();
  const [form] = Form.useForm();
  const [unsyncedSchedulerState, setUnsyncedSchedulerState] = useState({
    loading: false,
    count: 0,
  });

  useEffect(() => {
    const fetchUnsyncedCount = async () => {
      let count = 0;
      try {
        setUnsyncedSchedulerState((prev) => ({ ...prev, loading: true }));
        const result = await SchedulerController.getCountUnsyncedSchedulers();
        count = result.count;
      } catch (error) {
        console.error('Error fetching unsynced schedulers count:', error);
      } finally {
        setUnsyncedSchedulerState((prev) => ({ ...prev, loading: false, count }));
      }
    };

    fetchUnsyncedCount();
  }, []);

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

  const handleEdit = (scheduler: Scheduler) => {
    form.setFieldsValue({
      ...scheduler,
      customerId: scheduler.customer?.id,
      customerName: scheduler.customer?.name,
      customerPhone: TextUtil.formatPhone(scheduler.customer?.phone),
      scheduledAt: dayjs(scheduler.scheduledAt),
      scheduledTo: scheduler.scheduledTo ? dayjs(scheduler.scheduledTo) : null,
      items: scheduler.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        customization: item.customization,
      })),
      isEdit: true,
    });
    setDrawerOpen(true);
  };

  const onCloseForm = () => {
    form.resetFields();
    setDrawerOpen(false);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const items: SchedulerItem[] = (values.items ?? []).map((it: any, idx: number) => ({
        id: it.productId,
        quantity: it.quantity ?? 1,
        customization: it.customization ?? '',
      }));

      if (!items.length) {
        message.error('Adicione pelo menos um produto ao pedido.');
        return;
      }

      const next: CreateScheduler = {
        customerId: values.customerId || undefined,
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        scheduledAt: values.scheduledAt
          ? DateUtil.toISO(values.scheduledAt)
          : DateUtil.toISO(new Date()),
        scheduledTo: values.scheduledTo ? DateUtil.toISO(values.scheduledTo) : undefined,
        paymentMethod: values.paymentMethod,
        deliveryType: values.deliveryType,
        items,
      };
      const result = await SchedulerController.create(next);
      if (result.integrationStatus === 'failure') {
        message.warning('Pedido criado, mas falha na integração com o Google Calendar.');
      } else {
        message.success('Pedido criado com sucesso.');
      }

      // onAdd(next);
      onCloseForm();
      forceRefetch();
    } catch (error) {
      message.error('Erro ao criar pedido. Verifique os dados e tente novamente.');
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
            <Tooltip
              title={
                unsyncedSchedulerState.count > 0
                  ? `Há ${unsyncedSchedulerState.count} pedidos não sincronizados`
                  : 'Todos os pedidos estão sincronizados'
              }
            >
              <Button
                hidden={!isAdmin()}
                loading={unsyncedSchedulerState.loading}
                disabled={unsyncedSchedulerState.count === 0}
              >
                Sincronizar Agenda
              </Button>
            </Tooltip>
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
          <SchedulerList onEdit={handleEdit} schedulerQuery={schedulerQuery} />
        ) : (
          <SchedulerCalendar calendarEvents={calendarEvents} />
        )}
      </Card>
      {/* Drawer: Novo pedido */}
      <Drawer
        size="large"
        title="Novo pedido"
        open={drawerOpen}
        onClose={onCloseForm}
        extra={
          <Space>
            <Button onClick={onCloseForm}>Cancelar</Button>
            <Button type="primary" onClick={handleSave}>
              Salvar
            </Button>
          </Space>
        }
      >
        <SchedulerForm form={form} />
      </Drawer>
    </Space>
  );
}
