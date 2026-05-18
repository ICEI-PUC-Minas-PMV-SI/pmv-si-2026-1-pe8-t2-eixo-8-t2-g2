import { Form, Input, Modal, Space, Upload, type UploadFile } from 'antd';
import { useState } from 'react';
import ProductCharacteristicController from '~/controllers/ProductCharacteristicController';
import { PlusOutlined } from '@ant-design/icons';
import Text from 'antd/es/typography/Text';

type Props = {
  isOpened: boolean;
  onClose: (reason: 'cancel' | 'save') => void;
};

export function ProductCharacteristicForm({ isOpened, onClose }: Props) {
  const [form] = Form.useForm();
  const [iconList, setIconList] = useState<UploadFile[]>([]);

  const saveProductCharacteristic = async () => {
    try {
      const values = await form.validateFields();
      console.log('Dados do formulário:', values);
      console.log('Arquivo de ícone:', iconList[0]);
      await ProductCharacteristicController.create({
        name: values.name,
        // iconFile: iconList[0]?.originFileObj || null,
      });

      form.resetFields();
      setIconList([]);
      onClose('save');
    } catch (error) {
      console.error('Erro ao criar característica do produto:', error);
    }
  };

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      {/* Modal: Nova característica */}
      <Modal
        title="Nova característica"
        open={isOpened}
        onCancel={() => {
          form.resetFields();
          setIconList([]);
          onClose('cancel');
        }}
        onOk={saveProductCharacteristic}
        okText="Criar"
        cancelText="Cancelar"
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="Nome" name="name" rules={[{ required: true }]}>
            <Input placeholder="Ex.: Sem glúten" />
          </Form.Item>
          <Form.Item label="Ícone / imagem (opcional)">
            <Upload
              listType="picture-card"
              fileList={iconList}
              onChange={({ fileList }) => setIconList(fileList)}
              beforeUpload={() => false}
              maxCount={1}
            >
              {iconList.length >= 1 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Recomendado: PNG ou SVG 32×32px com fundo transparente.
            </Text>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
