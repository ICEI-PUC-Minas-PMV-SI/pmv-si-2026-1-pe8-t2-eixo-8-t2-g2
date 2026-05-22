import { Col, Form, Input, InputNumber, message, Modal, Row, Switch, Upload, type UploadFile } from 'antd';
import type { CreateAboutItem, AboutItem } from '~/@types/about';
import { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import AboutItemController from '~/controllers/AboutItemController';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import TextUtil from '~/utils/TextUtil';

type ComponentProps = {
  isOpened: boolean;
  onClose: (reason?: 'cancel' | 'save', aboutItem?: AboutItem) => void;
};

export function ModalAddAboutItem(props: ComponentProps) {
  const { isOpened, onClose } = props;
  const [iconList, setIconList] = useState<UploadFile[]>([]);
  const queryClient = useQueryClient();
  const [itemForm] = Form.useForm();
  const { data } = useQuery({
    queryKey: ['about-item'],
    queryFn: () => AboutItemController.list({ 
      page: 1, 
      pageSize: 100, 
      filters: {}, 
      sorters: [], 
      search: '' 
    }),
  });

  const items = data?.data ?? [];

  return (
    <Modal
      title="Novo item"
      getContainer={document.body}
      open={isOpened}
      onCancel={() => onClose('cancel')}
      onOk={() => {
        itemForm.validateFields().then(async (values) => {
          const next: CreateAboutItem = {
            icon: values.icon,
            text: values.text,
            orderIndex: values.orderIndex ?? items.length + 1,
          };
          const result = await AboutItemController.create(next);
          queryClient.invalidateQueries({ queryKey: ['about-item'] }); // ← invalida a query do AboutItemList
          onClose('save', result);
          itemForm.resetFields();
        });
      }}
      okText="Criar"
      cancelText="Cancelar"
    >
      <Form
        layout="vertical"
        form={itemForm}
        initialValues={{ orderIndex: items.length + 1 }}
      >
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
        </Form.Item>
        <Form.Item label="Texto" name="text" rules={[{ required: true }]}>
          <Input minLength={3} maxLength={50}
              showCount/>
        </Form.Item>
        <Form.Item label="Ordem" name="orderIndex">
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
