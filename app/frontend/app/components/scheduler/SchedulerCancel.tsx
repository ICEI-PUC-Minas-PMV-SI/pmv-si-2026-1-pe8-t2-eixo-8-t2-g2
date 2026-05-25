import { Input, message, Modal, Space, Typography } from 'antd';
import { useState } from 'react';

type ComponentProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
};

export function SchedulerCancel({ open, onCancel, onConfirm }: ComponentProps) {
  const [reason, setReason] = useState('');

  const handleOk = () => {
    if (!reason.trim()) {
      message.warning('Informe a justificativa do cancelamento.');
      return;
    }
    onConfirm(reason);
    setReason('');
  };

  return (
    <Modal
      title="Cancelar pedido"
      open={open}
      onCancel={() => {
        setReason('');
        onCancel();
      }}
      onOk={handleOk}
      okText="Confirmar cancelamento"
      okButtonProps={{ danger: true }}
      cancelText="Voltar"
    >
      <Space
        orientation="vertical"
        style={{ width: '100%', paddingTop: 12, paddingBottom: 12 }}
      >
        <Typography.Text type="secondary">
          Informe o motivo do cancelamento. Esta informação será registrada no pedido.
        </Typography.Text>
        <Input.TextArea
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ex.: Cliente solicitou cancelamento por motivos pessoais."
          maxLength={500}
          showCount
        />
      </Space>
    </Modal>
  );
}
