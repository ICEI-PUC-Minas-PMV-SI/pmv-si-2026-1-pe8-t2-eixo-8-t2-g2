import {
  Button,
  Card,
  Drawer,
  Flex,
  Form,
  message,
  Segmented,
  Space,
  Tooltip,
} from 'antd';
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
import { useBreakpoint } from '~/hooks/useBreakpoint';

export function SchedulerTab() {
  const schedulerQuery = useTableQuery<Scheduler>('scheduler', (params) =>
    SchedulerController.list<Scheduler>(params),
  );
  const {
    tableProps: { dataSource: schedulers = [], pagination },
    forceRefetch,
  } = schedulerQuery;

  const isMobile = useBreakpoint('md');

  const [scheduleView, setScheduleView] = useState<'list' | 'calendar'>('list');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
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
    return {
      status: [
        { ...SchedulerConstant.status.pending, value: pending },
        { ...SchedulerConstant.status.confirmed, value: confirmed },
        { ...SchedulerConstant.status.in_progress, value: inProgress },
        { ...SchedulerConstant.status.completed, value: completed },
        { ...SchedulerConstant.status.cancelled, value: cancelled },
      ],
      total,
    };
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
        id: item.id,
        orderIndex: item.orderIndex,
        priceAtBooking: item.priceAtBooking,
        productId: item.product.id,
        quantity: item.quantity,
        customization: item.customization,
      })),
      isEdit: true,
    });
    setIsEditMode(true);
    setDrawerOpen(true);
  };

  const onCloseForm = () => {
    form.resetFields();
    setIsEditMode(false);
    setDrawerOpen(false);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields().catch(() => {
        return { error: new Error('Preencha corretamente o formulário') };
      });
      if (values.error) {
        message.error(values.error.message);
        return;
      }
      const items: SchedulerItem[] = (values.items ?? []).map((it: any, idx: number) => ({
        id: it.productId,
        quantity: it.quantity ?? 1,
        customization: it.customization ?? '',
      }));
      const isEdit = !!form.getFieldValue('isEdit');
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
        items: form
          .getFieldValue('items')
          .map((item: any, idx: number) => ({ ...item, orderIndex: idx })),
      };
      let result = {} as any;
      if (isEdit) {
        result = await SchedulerController.update({
          ...next,
          id: form.getFieldValue('id'),
        });
      } else {
        result = await SchedulerController.create(next);
      }
      if (result.integrationStatus === 'failure') {
        message.warning('Pedido criado, mas falha na integração com o Google Calendar.');
      } else {
        message.success('Pedido criado com sucesso.');
      }
      onCloseForm();
      forceRefetch();
    } catch (error) {
      message.error('Erro ao criar pedido. Verifique os dados e tente novamente.');
      console.error('Erro ao criar pedido:', error);
    }
  };

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <SchedulerSummary stats={scheduleStats} />
      <Card
        title="Pedidos"
        extra={
          <Flex wrap="wrap" gap={8} justify="flex-end">
            <Tooltip
              title={
                unsyncedSchedulerState.count > 0
                  ? `${unsyncedSchedulerState.count} pedidos não sincronizados`
                  : 'Todos sincronizados'
              }
            >
              <Button
                hidden={!isAdmin()}
                loading={unsyncedSchedulerState.loading}
                disabled={unsyncedSchedulerState.count === 0}
                size="small" // ← menor em mobile
              >
                Sincronizar
              </Button>
            </Tooltip>

            <Segmented
              value={scheduleView}
              onChange={(value) => setScheduleView(value as 'list' | 'calendar')}
              options={[
                { value: 'list', icon: <EyeOutlined /> }, // sem label — só ícone
                { value: 'calendar', icon: <CalendarOutlined /> },
              ]}
            />

            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="small"
              onClick={() => {
                form.resetFields();
                setIsEditMode(false);
                setDrawerOpen(true);
              }}
            >
              {isMobile ? 'Novo' : 'Novo pedido'}
            </Button>
          </Flex>
        }
      >
        {scheduleView === 'list' ? (
          <SchedulerList onEdit={handleEdit} schedulerQuery={schedulerQuery} />
        ) : (
          <SchedulerCalendar calendarEvents={calendarEvents} />
        )}
      </Card>

      <Drawer
        size="large"
        title={isEditMode ? 'Editar pedido' : 'Novo pedido'}
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
