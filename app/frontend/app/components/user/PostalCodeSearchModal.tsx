import { Button, Flex, Form, Input, List, Modal, Typography } from 'antd';
import { useState } from 'react';
import AddressAPI from '~/utils/AddressAPI';

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (postalCode: string) => void;
};

export function PostalCodeSearchModal({ open, onClose, onSelect }: Props) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const [form] = Form.useForm();

  async function handleSearch(values: any) {
    try {
      setLoading(true);

      const response = await AddressAPI.searchPostalCode({
        state: values.state,
        city: values.city,
        street: values.street,
      });

      setResults(response);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Descobrir CEP" open={open} footer={null} onCancel={onClose}>
      <Form
        layout="vertical"
        form={form}
        onFinish={handleSearch}
        initialValues={{ state: 'MG' }}
      >
        <Form.Item label="Estado (UF)" name="state" required>
          <Input disabled placeholder="Ex: MG" maxLength={2} />
        </Form.Item>

        <Form.Item label="Cidade" name="city" required>
          <Input />
        </Form.Item>

        <Form.Item label="Rua" name="street" required>
          <Input />
        </Form.Item>

        <Button htmlType="submit" type="primary" loading={loading} block>
          Buscar CEP
        </Button>
      </Form>

      {!!results.length && (
        <div
          style={{
            marginTop: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            maxHeight: 320,
            overflowY: 'auto',
          }}
        >
          {results.map((item) => (
            <Button
              key={item.postalCode}
              type="text"
              block
              onClick={() => {
                onSelect(item.postalCode);
                onClose();
              }}
              style={{
                height: 'auto',
                padding: 14,
                border: '1px solid #f0f0f0',
                borderRadius: 10,
                justifyContent: 'flex-start',
              }}
            >
              <Flex vertical align="flex-start" gap={2}>
                <Typography.Text strong>{item.postalCode}</Typography.Text>

                <Typography.Text type="secondary">{item.street}</Typography.Text>

                <Typography.Text type="secondary">
                  {item.neighborhood} • {item.city}/{item.stateAbbreviation}
                </Typography.Text>
              </Flex>
            </Button>
          ))}
        </div>
      )}
    </Modal>
  );
}
