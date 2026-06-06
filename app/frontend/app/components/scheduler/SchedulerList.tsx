import {
  Button,
  Input,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  Dropdown,
  Flex,
  message,
  Progress,
  Rate,
  Divider,
  Card,
  Pagination,
} from 'antd';
import { useState } from 'react';
import {
  CloseCircleOutlined,
  EditOutlined,
  DownOutlined,
  DollarOutlined,
  PlayCircleOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  StarOutlined,
} from '@ant-design/icons';
import type { PaymentMethod } from '~/@types/payment';
import type { DeliveryType, Scheduler, SchedulerStatus } from '~/@types/scheduler';
import { PaymentMethodMap } from '~/constants/PaymentMethod';
import DateUtil from '~/utils/DateUtil';
import { SchedulerStatusTag } from './SchedulerStatusTag';
import { DeliveryTag } from './DeliveryTag';
import { SortDropdown } from '../sort-dropdown/SortDropdown';
import SchedulerController from '~/controllers/SchedulerController';
import { useTableQuery } from '~/hooks/useTableQuery';
import { SchedulerCancel } from './SchedulerCancel';
import NumberUtil from '~/utils/NumberUtil';
import { useAuthStore } from '~/hooks/useAuthStore';
import { PaymentModal, type RegisterPaymentPayload } from '../payment/PaymentModal';
import { ReviewModal, type ReviewPayload } from '../review/ReviewModal';
import ReviewController from '~/controllers/ReviewController';
import { SchedulerHelper } from '~/helpers/SchedulerHelper';
import { useBreakpoint } from '~/hooks/useBreakpoint';

// ─── Types estendidos ─────────────────────────────────────────────────────────

type SchedulerWithRelations = Scheduler & {
  payments?: any[];
  review?: { rating: number; comment?: string | null } | null;
};

const STATUS_TRANSITIONS: Partial<
  Record<SchedulerStatus, { value: SchedulerStatus; label: string; color: string }[]>
> = {
  pending: [
    { value: 'confirmed', label: 'Confirmar', color: '#1677FF' },
    { value: 'in_progress', label: 'Iniciar produção', color: '#722ED1' },
  ],
  confirmed: [{ value: 'in_progress', label: 'Iniciar produção', color: '#722ED1' }],
  in_progress: [{ value: 'completed', label: 'Marcar como concluído', color: '#52C41A' }],
};

const STATUS_ICON: Partial<Record<SchedulerStatus, React.ReactNode>> = {
  confirmed: <CheckOutlined />,
  in_progress: <PlayCircleOutlined />,
  completed: <CheckOutlined />,
  pending: <ClockCircleOutlined />,
};

// ─── PaymentProgressCell ──────────────────────────────────────────────────────

function PaymentProgressCell({
  scheduler,
  onPayClick,
}: {
  scheduler: SchedulerWithRelations;
  onPayClick: () => void;
}) {
  const total = SchedulerHelper.getOrderTotal(scheduler.items);
  const paid =
    Math.round(
      (scheduler.payments ?? []).reduce((acc: number, p: any) => acc + p.amount, 0) * 100,
    ) / 100;
  const percent = total > 0 ? Math.round((paid / total) * 100) : 0;
  const isFullyPaid = paid >= total && total > 0;

  return (
    <Flex vertical gap={4} style={{ minWidth: 130 }}>
      <Flex justify="space-between" align="center">
        <Typography.Text
          style={{ padding: 2, fontSize: 12, color: isFullyPaid ? '#389E0D' : '#AD6800' }}
        >
          {isFullyPaid ? '✓ Quitado' : `${percent}% pago`}
        </Typography.Text>
        {!isFullyPaid && (
          <Button
            type="primary"
            size="small"
            icon={<DollarOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onPayClick();
            }}
            style={{ padding: 2, height: 'auto', fontSize: 12 }}
          >
            Registrar
          </Button>
        )}
      </Flex>
      <Progress
        percent={percent}
        size={[120, 5]}
        strokeColor={isFullyPaid ? '#52C41A' : '#FAAD14'}
        showInfo={false}
      />
    </Flex>
  );
}

// ─── ReviewCell ───────────────────────────────────────────────────────────────

function ReviewCell({
  scheduler,
  onReviewClick,
}: {
  scheduler: SchedulerWithRelations;
  onReviewClick: () => void;
}) {
  const review = scheduler.review;

  if (review) {
    return (
      <Tooltip title={review.comment || 'Clique para editar'}>
        <Flex
          align="center"
          gap={6}
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            onReviewClick();
          }}
        >
          <Rate disabled value={review.rating} style={{ fontSize: 13 }} />
        </Flex>
      </Tooltip>
    );
  }

  return (
    <Button
      size="small"
      icon={<StarOutlined />}
      onClick={(e) => {
        e.stopPropagation();
        onReviewClick();
      }}
      style={{
        borderColor: '#E06D5B',
        color: '#E06D5B',
        borderRadius: 20,
        fontSize: 12,
      }}
    >
      Avaliar
    </Button>
  );
}

// ─── StatusDropdown ───────────────────────────────────────────────────────────

function StatusDropdown({
  scheduler,
  onStatusChange,
}: {
  scheduler: Scheduler;
  onStatusChange: (id: string, status: SchedulerStatus) => Promise<void>;
}) {
  const transitions = STATUS_TRANSITIONS[scheduler.status] ?? [];

  if (transitions.length === 0) {
    return <SchedulerStatusTag status={scheduler.status} />;
  }

  const menuItems = transitions.map((t) => ({
    key: t.value,
    label: (
      <Flex align="center" gap={6}>
        <span style={{ color: t.color }}>{STATUS_ICON[t.value]}</span>
        <span style={{ fontSize: 13 }}>{t.label}</span>
      </Flex>
    ),
  }));

  return (
    <Dropdown
      menu={{
        items: menuItems,
        onClick: ({ key, domEvent }) => {
          domEvent.stopPropagation();
          onStatusChange(scheduler.id, key as SchedulerStatus);
        },
      }}
      trigger={['click']}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          cursor: 'pointer',
        }}
      >
        <SchedulerStatusTag status={scheduler.status} />
        <DownOutlined style={{ fontSize: 9, color: '#8C8C8C' }} />
      </div>
    </Dropdown>
  );
}

// ─── SchedulerList ────────────────────────────────────────────────────────────

export function SchedulerList({
  schedulerQuery,
  onEdit,
}: {
  schedulerQuery: ReturnType<typeof useTableQuery<Scheduler>>;
  onEdit: (scheduler: Scheduler) => void;
}) {
  const [cancelledSchedulerId, setCancelledSchedulerId] = useState<string | null>(null);
  const [paymentScheduler, setPaymentScheduler] = useState<SchedulerWithRelations | null>(
    null,
  );
  const [reviewScheduler, setReviewScheduler] = useState<SchedulerWithRelations | null>(
    null,
  );
  const { isAdmin } = useAuthStore();
  const isMobile = useBreakpoint('md');

  const {
    tableProps,
    forceRefetch,
    params,
    setSearch,
    setFilters,
    setSorters,
    updateSorter,
    clearSorters,
    setPage,
  } = schedulerQuery;

  const paymentFilters = Object.entries(PaymentMethodMap).map(([value, label]) => ({
    text: label,
    value,
  }));
  const deliveryFilters = [
    { text: 'Entrega', value: 'delivery' },
    { text: 'Retirada', value: 'pickup' },
  ];
  const statusFilters = [
    { text: 'Pendente', value: 'pending' },
    { text: 'Confirmado', value: 'confirmed' },
    { text: 'Em produção', value: 'in_progress' },
    { text: 'Cancelado', value: 'cancelled' },
    { text: 'Finalizado', value: 'completed' },
  ];

  const handleStatusChange = async (id: string, status: SchedulerStatus) => {
    try {
      await SchedulerController.updateStatus({ id, status });
      message.success('Status atualizado com sucesso.');
      forceRefetch();
    } catch {
      message.error('Erro ao atualizar o status.');
    }
  };

  const handlePaymentConfirm = async (payload: RegisterPaymentPayload) => {
    try {
      await SchedulerController.registerPayment(payload);
      const newStatus: SchedulerStatus =
        payload.type === 'deposit' ? 'confirmed' : 'completed';
      await SchedulerController.updateStatus({
        id: payload.schedulerId,
        status: newStatus,
      });
      message.success(
        payload.type === 'deposit'
          ? 'Sinal registrado! Pedido confirmado.'
          : 'Pagamento final registrado! Pedido concluído.',
      );
      forceRefetch();
    } catch {
      message.error('Erro ao registrar pagamento.');
    }
  };

  const handleReviewSubmit = async (payload: ReviewPayload) => {
    try {
      await ReviewController.submitReview(payload);
      message.success('Avaliação enviada! Obrigado pelo feedback.');
      forceRefetch();
    } catch {
      message.error('Erro ao enviar avaliação.');
    }
  };

  const cardList = (
    <Space orientation="vertical" style={{ width: '100%' }} size={12}>
      {((tableProps.dataSource as SchedulerWithRelations[]) ?? []).map((record) => (
        <Card
          key={record.id}
          size="small"
          styles={{ body: { padding: '10px 12px' } }}
          actions={[
            record.status !== 'cancelled' &&
              record.status !== 'completed' &&
              (isAdmin() || record.status === 'pending') && (
                <Tooltip title="Editar pedido">
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => onEdit(record)}
                  />
                </Tooltip>
              ),
            record.status !== 'cancelled' && record.status !== 'completed' && (
              <Tooltip title="Cancelar pedido">
                <Button
                  danger
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={() => setCancelledSchedulerId(record.id)}
                />
              </Tooltip>
            ),
            isAdmin() && (
              <Button
                type="primary"
                size="small"
                icon={<DollarOutlined />}
                disabled={/* já quitado */ false}
                onClick={() => setPaymentScheduler(record)}
              >
                Pagar
              </Button>
            ),
          ].filter(Boolean)}
        >
          {/* Linha 1 — cliente + status */}
          <Flex justify="space-between" align="flex-start" gap={8}>
            <Space orientation="vertical" size={0}>
              <Typography.Text strong>{record.customer?.name}</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {DateUtil.format(record.scheduledAt)}
              </Typography.Text>
            </Space>
            {isAdmin() ? (
              <StatusDropdown scheduler={record} onStatusChange={handleStatusChange} />
            ) : (
              <SchedulerStatusTag status={record.status} />
            )}
          </Flex>

          <Divider style={{ margin: '8px 0' }} />

          {/* Linha 2 — itens resumidos */}
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {SchedulerHelper.getItemColumnText(record.items)}
          </Typography.Text>

          <Divider style={{ margin: '8px 0' }} />

          {/* Linha 3 — pagamento + modalidade */}
          <Flex gap={8} wrap="wrap">
            {record.paymentMethod && (
              <Tag style={{ borderRadius: 20 }}>
                {PaymentMethodMap[record.paymentMethod]}
              </Tag>
            )}
            <DeliveryTag type={record.deliveryType} />
          </Flex>

          {/* Linha 4 — progresso de pagamento (admin) */}
          {isAdmin() && (
            <div style={{ marginTop: 8 }}>
              <PaymentProgressCell
                scheduler={record}
                onPayClick={() => setPaymentScheduler(record)}
              />
            </div>
          )}

          {/* Linha 5 — avaliação (cliente, completed) */}
          {!isAdmin() && record.status === 'completed' && (
            <div style={{ marginTop: 8 }}>
              <ReviewCell
                scheduler={record}
                onReviewClick={() => setReviewScheduler(record)}
              />
            </div>
          )}
        </Card>
      ))}

      {/* Paginação reutilizada do tableProps */}
      {tableProps.pagination && (
        <Flex justify="center" style={{ paddingTop: 8 }}>
          <Pagination {...tableProps.pagination} simple size="small" onChange={setPage} />
        </Flex>
      )}
    </Space>
  );

  return (
    <>
      <SchedulerCancel
        open={!!cancelledSchedulerId}
        onCancel={() => setCancelledSchedulerId(null)}
        onConfirm={async (reason) => {
          if (cancelledSchedulerId) {
            await SchedulerController.cancellation({
              id: cancelledSchedulerId,
              cancellationReason: reason,
            });
            forceRefetch();
            setCancelledSchedulerId(null);
          }
        }}
      />

      {paymentScheduler && (
        <PaymentModal
          open={!!paymentScheduler}
          onClose={() => setPaymentScheduler(null)}
          onConfirm={handlePaymentConfirm}
          scheduler={paymentScheduler}
        />
      )}

      {reviewScheduler && (
        <ReviewModal
          mode="single"
          open={!!reviewScheduler}
          scheduler={reviewScheduler}
          existingReview={reviewScheduler.review ?? undefined}
          onClose={() => setReviewScheduler(null)}
          onSubmitReview={handleReviewSubmit}
        />
      )}

      <Flex justify="space-between" align="center" style={{ marginBottom: 12 }} gap={8}>
        <Button
          onClick={() => {
            setSorters([]);
            setFilters({});
            setSearch('');
          }}
        >
          Limpar filtros
        </Button>
        <Input
          placeholder="Buscar..."
          value={params.search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 260 }}
        />
      </Flex>
      {isMobile ? (
        cardList
      ) : (
        <Table<Scheduler>
          {...tableProps}
          scroll={{ x: 700 }}
          style={{ overflowX: 'auto' }}
          styles={{ content: { cursor: 'pointer' } }}
          expandable={{
            expandRowByClick: true,
            expandedRowRender: (record) => (
              <Table
                dataSource={record.items}
                pagination={false}
                rowKey={(item) => item.product.id}
                size="small"
                columns={[
                  { title: 'Qtd.', dataIndex: 'quantity', width: 60 },
                  { title: 'Produto', render: (_, item) => item.product.name },
                  {
                    title: 'Customização',
                    render: (_, item) => (
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {item.customization || '—'}
                      </Typography.Text>
                    ),
                  },
                  {
                    title: 'Preço est.',
                    render: (_, item) =>
                      NumberUtil.currency((item.priceAtBooking ?? 0) * item.quantity),
                  },
                ]}
              />
            ),
          }}
          columns={[
            {
              hidden: !isAdmin(),
              fixed: true,
              title: (
                <Space>
                  Cliente
                  <SortDropdown
                    options={[
                      { key: 'customer_name', label: 'Nome', type: 'string' },
                      { key: 'customer_date', label: 'Data' },
                    ]}
                    activeSorters={params.sorters}
                    onSelect={updateSorter}
                    onClear={() => clearSorters(['customer_name', 'customer_date'])}
                  />
                </Space>
              ),
              key: 'customer',
              render: (_, record) => (
                <Space orientation="vertical" size={0}>
                  <Typography.Text strong style={{ fontSize: 13 }}>
                    {record.customer.name}
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                    {DateUtil.format(record.scheduledAt)}
                  </Typography.Text>
                </Space>
              ),
            },
            // {
            //   hidden: !isAdmin(),
            //   responsive: ['xs', 'sm'], // só em mobile
            //   title: 'Pedido',
            //   key: 'customer_mobile',
            //   render: (_, record) => (
            //     <Space orientation="vertical" size={0}>
            //       <Typography.Text strong style={{ fontSize: 13 }}>
            //         {record.customer.name}
            //       </Typography.Text>
            //       <Typography.Text type="secondary" style={{ fontSize: 11 }}>
            //         {DateUtil.format(record.scheduledAt)}
            //       </Typography.Text>
            //       <SchedulerStatusTag status={record.status} />
            //     </Space>
            //   ),
            // },
            {
              hidden: isAdmin(),
              title: (
                <Space>
                  Criado em
                  <SortDropdown
                    options={[{ key: 'scheduledAt', label: 'Data' }]}
                    activeSorters={params.sorters}
                    onSelect={updateSorter}
                    onClear={() => clearSorters(['scheduledAt'])}
                  />
                </Space>
              ),
              render: (value: Scheduler) =>
                new Date(value.scheduledAt).toLocaleString().replace(', ', ' às '),
              key: 'scheduledAt',
            },
            Table.EXPAND_COLUMN,
            {
              title: 'Itens',
              key: 'items',
              minWidth: 130,
              responsive: ['xl', 'xxl'],
              render: (_, record) => (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {SchedulerHelper.getItemColumnText(record.items)}
                </Typography.Text>
              ),
            },
            {
              title: 'Pagamento',
              dataIndex: 'paymentMethod',
              filters: paymentFilters,
              filterMode: 'tree',
              filteredValue: (params.filters['paymentMethod'] as string[]) || [],
              onFilter: (v, record) => record.paymentMethod === v,
              render: (v?: PaymentMethod) =>
                v ? <Tag style={{ borderRadius: 20 }}>{PaymentMethodMap[v]}</Tag> : '—',
            },
            {
              title: 'Recebimento',
              key: 'payment_progress',
              hidden: !isAdmin(),
              width: 160,
              render: (_, record) => (
                <PaymentProgressCell
                  scheduler={record as SchedulerWithRelations}
                  onPayClick={() => setPaymentScheduler(record as SchedulerWithRelations)}
                />
              ),
            },
            {
              title: 'Modalidade',
              dataIndex: 'deliveryType',
              filters: deliveryFilters,
              filterMode: 'tree',
              filteredValue: (params.filters['deliveryType'] as string[]) || [],
              onFilter: (v, record) => record.deliveryType === v,
              render: (v?: DeliveryType) => <DeliveryTag type={v} />,
            },
            {
              title: 'Status',
              dataIndex: 'status',
              responsive: ['md'],
              filters: statusFilters,
              filterMode: 'tree',
              filteredValue: (params.filters['status'] as string[]) || [],
              onFilter: (v, record) => record.status === v,
              render: (_, record) =>
                isAdmin() ? (
                  <StatusDropdown
                    scheduler={record}
                    onStatusChange={handleStatusChange}
                  />
                ) : (
                  <SchedulerStatusTag status={record.status} />
                ),
            },
            // Coluna de avaliação — apenas para clientes, apenas em completed
            {
              title: 'Avaliação',
              key: 'review',
              hidden: isAdmin(),
              width: 150,
              render: (_, record) => {
                if (record.status !== 'completed') return null;
                return (
                  <ReviewCell
                    scheduler={record as SchedulerWithRelations}
                    onReviewClick={() =>
                      setReviewScheduler(record as SchedulerWithRelations)
                    }
                  />
                );
              },
            },
            {
              title: 'Ações',
              width: 100,
              render: (_, record) => {
                const canEdit =
                  record.status !== 'cancelled' && record.status !== 'completed';
                const showEdit = isAdmin() || record.status === 'pending';

                if (record.status === 'cancelled' && record.cancellationReason) {
                  return (
                    <Tooltip title={`Motivo: ${record.cancellationReason}`}>
                      <Tag color="red" style={{ borderRadius: 20 }}>
                        Cancelado
                      </Tag>
                    </Tooltip>
                  );
                }

                return (
                  <Space size={4}>
                    {canEdit && showEdit && (
                      <Tooltip title="Editar pedido">
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(record);
                          }}
                        />
                      </Tooltip>
                    )}
                    {canEdit && (
                      <Tooltip title="Cancelar pedido">
                        <Button
                          danger
                          size="small"
                          icon={<CloseCircleOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCancelledSchedulerId(record.id);
                          }}
                        />
                      </Tooltip>
                    )}
                  </Space>
                );
              },
            },
          ]}
        />
      )}
    </>
  );
}
