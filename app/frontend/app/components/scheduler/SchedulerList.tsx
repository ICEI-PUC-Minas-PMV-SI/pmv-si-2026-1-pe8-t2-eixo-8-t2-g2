import { Button, Input, Space, Table, Tag, Tooltip, Typography } from 'antd';
import { useState } from 'react';
import { CloseCircleOutlined } from '@ant-design/icons';
import type { PaymentMethod } from '~/@types/payment';
import type {
  DeliveryType,
  Scheduler,
  SchedulerItem,
  SchedulerStatus,
} from '~/@types/scheduler';

import { PaymentMethodMap } from '~/constants/PaymentMethod';
import DateUtil from '~/utils/DateUtil';
import { SchedulerStatusTag } from './SchedulerStatusTag';
import { DeliveryTag } from './DeliveryTag';
import { SortDropdown } from '../sort-dropdown/SortDropdown';
import SchedulerController from '~/controllers/SchedulerController';
import { useTableQuery } from '~/hooks/useTableQuery';
import { SchedulerCancel } from './SchedulerCancel';
import NumberUtil from '~/utils/NumberUtil';

const getItemColumnText = (items: SchedulerItem[]) => {
  const itemsCount = items.length;
  const price = items.reduce((acc, cv) => {
    acc += cv.quantity * cv.product.price;
    return acc;
  }, 0);
  return `${itemsCount} ${itemsCount > 1 ? 'itens' : 'item'} - Preço (estimado): ${NumberUtil.currency(price)}`;
};

export function SchedulerList({
  schedulerQuery,
}: {
  schedulerQuery: ReturnType<typeof useTableQuery<Scheduler>>;
}) {
  const [cancelledSchedulerId, setCancelledSchedulerId] = useState<string | null>(null);

  const {
    tableProps,
    forceRefetch,
    params,
    setSearch,
    setFilters,
    setSorters,
    updateSorter,
    clearSorters,
  } = schedulerQuery;

  // 🔹 Filtros
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
    { text: 'Cancelado', value: 'cancelled' },
    { text: 'Finalizado', value: 'completed' },
  ];

  return (
    <>
      {/* Modal: cancelamento */}
      <SchedulerCancel
        open={!!cancelledSchedulerId}
        onCancel={() => setCancelledSchedulerId(null)}
        onConfirm={async (reason) => {
          if (cancelledSchedulerId) {
            await SchedulerController.update({
              id: cancelledSchedulerId,
              status: 'cancelled',
              cancellationReason: reason,
            });
            forceRefetch();
            setCancelledSchedulerId(null);
          }
        }}
      />
      <Space
        style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}
      >
        <Button
          onClick={() => {
            setSorters([]);
            setFilters({});
            setSearch('');
          }}
        >
          Limpar filtros/ordenação
        </Button>
        <Input
          placeholder="Buscar..."
          value={params.search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Space>

      <Table<Scheduler>
        {...tableProps}
        style={{ overflowX: 'auto' }}
        expandable={{
          expandedRowRender: (record) => (
            <Table
              dataSource={record.items}
              pagination={false}
              rowKey={(item) => item.product.id}
              size="small"
              columns={[
                {
                  title: 'Quantidade',
                  dataIndex: 'quantity',
                  width: 80,
                },
                {
                  title: 'Produto',
                  render: (_, item) => item.product.name,
                },
                {
                  title: 'Preço (estimado)',
                  render: (_, item) =>
                    NumberUtil.currency(item.quantity * item.product.price),
                },
              ]}
            />
          ),
        }}
        columns={[
          {
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
                  onClear={() => {
                    clearSorters(['customer_name', 'customer_date']);
                  }}
                />
              </Space>
            ),
            key: 'customer',
            render: (_, record) => (
              <Space orientation="vertical" size={2}>
                <Typography.Text strong>{record.customer.name}</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {DateUtil.format(record.scheduledAt)}
                </Typography.Text>
              </Space>
            ),
          },
          Table.EXPAND_COLUMN,
          {
            title: 'Itens',
            key: 'items',
            responsive: ['xl', 'xxl', 'xxxl'],
            render: (_, record) => (
              <Typography.Text type="secondary">
                {getItemColumnText(record.items)}
              </Typography.Text>
            ),
          },
          {
            title: 'Pagamento',
            dataIndex: 'paymentMethod',
            filters: paymentFilters,
            filterMode: 'tree',
            filteredValue: (params.filters['paymentMethod'] as string[]) || [],
            onFilter: (paymentMethod, record) => {
              return record.paymentMethod === paymentMethod;
            },
            render: (v?: PaymentMethod) => (v ? <Tag>{PaymentMethodMap[v]}</Tag> : '—'),
          },

          {
            title: 'Modalidade',
            dataIndex: 'deliveryType',
            filters: deliveryFilters,
            filterMode: 'tree',
            filteredValue: (params.filters['deliveryType'] as string[]) || [],
            onFilter: (deliveryType, record) => {
              return record.deliveryType === deliveryType;
            },
            render: (v?: DeliveryType) => <DeliveryTag type={v} />,
          },

          {
            title: 'Status',
            dataIndex: 'status',
            filters: statusFilters,
            filterMode: 'tree',
            filteredValue: (params.filters['status'] as string[]) || [],
            onFilter: (status, record) => {
              return record.status === status;
            },
            render: (v: SchedulerStatus) => <SchedulerStatusTag status={v} />,
          },

          {
            title: 'Ações',
            width: 120,
            render: (_, record) =>
              record.status !== 'cancelled' && record.status !== 'completed' ? (
                <Button
                  danger
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={() => {
                    setCancelledSchedulerId(record.id);
                  }}
                >
                  Cancelar
                </Button>
              ) : record.status === 'cancelled' && record.cancellationReason ? (
                <Tooltip title={`Motivo: ${record.cancellationReason}`}>
                  <Tag color="red">Cancelado</Tag>
                </Tooltip>
              ) : null,
          },
        ]}
      />
    </>
  );
}
