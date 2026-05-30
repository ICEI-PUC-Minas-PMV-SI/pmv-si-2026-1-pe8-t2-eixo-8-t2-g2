import { Modal, Table } from 'antd';
import type { DashboardAlert } from '~/controllers/DashboardController';
import DateUtil from '~/utils/DateUtil';

type ComponentProps = {
  isOpened: boolean;
  onClose: () => void;
  alert?: DashboardAlert | null;
};

export function AlertModal({ isOpened, onClose, alert }: ComponentProps) {
  return (
    <Modal
      title={alert?.title}
      open={isOpened}
      footer={null}
      width={900}
      onCancel={onClose}
    >
      <Table
        rowKey="id"
        pagination={false}
        dataSource={alert?.orders ?? []}
        columns={[
          {
            title: 'Cliente',
            dataIndex: ['customer', 'name'],
          },
          {
            title: 'Entrega',
            render: (_, record) => DateUtil.format(record.scheduledTo),
          },
          {
            title: 'Tipo',
            dataIndex: 'deliveryType',
          },
          {
            title: 'Produtos',
            render: (_, record) =>
              record.items?.length
                ? record.items
                    .map((item: any) => `${item.quantity}x ${item.product.name}`)
                    .join(', ')
                : '-',
          },
          {
            title: 'Pagamento',
            dataIndex: 'paymentMethod',
          },
          {
            title: 'Status',
            dataIndex: 'status',
          },
        ]}
      />
    </Modal>
  );
}
