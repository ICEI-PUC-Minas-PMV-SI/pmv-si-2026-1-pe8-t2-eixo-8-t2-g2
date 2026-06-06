import { Form, Input, Modal, Space, Upload, type UploadFile } from 'antd';
import { useEffect, useState } from 'react';
import ProductCharacteristicController from '~/controllers/ProductCharacteristicController';
import { PlusOutlined } from '@ant-design/icons';
import Text from 'antd/es/typography/Text';
import type { ProductCharacteristic } from '~/@types/product';

type ComponentProps = {
  isOpened: boolean;
  editingChar?: ProductCharacteristic | null; // ← adiciona
  onClose: (
    reason?: 'cancel' | 'save',
    productCharacteristic?: ProductCharacteristic,
  ) => void;
};

export function ProductCharacteristicForm(props: ComponentProps) {
  const { isOpened, onClose, editingChar } = props;
  const isEditing = !!editingChar;

  useEffect(() => {
    if (editingChar) {
      form.setFieldsValue(editingChar);
    } else {
      form.resetFields();
    }
  }, [editingChar, isOpened]);

  const [form] = Form.useForm();
  const [iconList, setIconList] = useState<UploadFile[]>([]);

  const saveProductCharacteristic = async () => {
    try {
      const values = await form.validateFields();

      if (isEditing) {
        await ProductCharacteristicController.update({
          id: editingChar.id,
          name: values.name,
        });
      } else {
        await ProductCharacteristicController.create({
          name: values.name,
        });
      }

      form.resetFields();
      setIconList([]);
      onClose('save');
    } catch (error) {
      console.error('Erro ao salvar característica:', error);
    }
  };

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      {/* Modal: Nova característica */}
      <Modal
        title={isEditing ? 'Editar característica' : 'Nova característica'}
        open={isOpened}
        onCancel={() => {
          form.resetFields();
          setIconList([]);
          onClose('cancel');
        }}
        onOk={saveProductCharacteristic}
        okText={isEditing ? 'Salvar' : 'Criar'}
        cancelText="Cancelar"
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="Nome" name="name" rules={[{ required: true }]}>
            <Input placeholder="Ex.: Sem glúten" />
          </Form.Item>
          {/* <Form.Item label="Ícone / imagem (opcional)">
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
          </Form.Item> */}
        </Form>
      </Modal>
    </Space>
  );
}
