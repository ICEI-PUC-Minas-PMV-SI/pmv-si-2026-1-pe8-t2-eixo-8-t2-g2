import { Col, Form, Input, InputNumber, message, Modal, Row, Switch } from 'antd';
import type { CreateProductCategoryPayload, ProductCategory } from '~/@types/product';
import ProductCategoryController from '~/controllers/ProductCategoryController';
import { useTableQuery } from '~/hooks/useTableQuery';
import TextUtil from '~/utils/TextUtil';

type ComponentProps = {
  isOpened: boolean;
  onClose: (reason?: 'cancel' | 'save', productCategory?: ProductCategory) => void;
};

export function ModalAddProductCategory(props: ComponentProps) {
  const { isOpened, onClose } = props;

  const {
    tableProps: { dataSource },
    forceRefetch,
  } = useTableQuery<ProductCategory>('product-category', (params) =>
    ProductCategoryController.list<ProductCategory>(params),
  );
  const categories = dataSource || [];
  const [categoryForm] = Form.useForm();
  return (
    <Modal
      title="Nova categoria"
      getContainer={document.body}
      open={isOpened}
      onCancel={() => onClose('cancel')}
      onOk={() => {
        categoryForm.validateFields().then(async (values) => {
          const next: CreateProductCategoryPayload = {
            name: values.name,
            slug: values.slug || TextUtil.createSlug(values.name),
            description: values.description,
            isActive: values.isActive ?? true,
            orderIndex: values.orderIndex ?? categories.length + 1,
            parentId: null,
          };
          const result = await ProductCategoryController.create(next);
          forceRefetch();
          message.success('Categoria criada.');
          onClose('save', result);
          categoryForm.resetFields();
        });
      }}
      okText="Criar"
      cancelText="Cancelar"
    >
      <Form
        layout="vertical"
        form={categoryForm}
        initialValues={{ isActive: true, orderIndex: categories.length + 1 }}
      >
        <Form.Item label="Nome" name="name" rules={[{ required: true }]}>
          <Input
            onChange={(e) =>
              categoryForm.setFieldValue('slug', TextUtil.createSlug(e.target.value))
            }
          />
        </Form.Item>
        <Form.Item label="Slug" name="slug" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Descrição" name="description">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Ordem" name="orderIndex">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Ativa" name="isActive" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
