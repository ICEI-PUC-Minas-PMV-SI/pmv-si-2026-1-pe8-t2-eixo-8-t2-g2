import {
  Button,
  Col,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Space,
  Switch,
  Upload,
  type UploadFile,
} from 'antd';
import type {
  CreateProduct,
  Product,
  ProductCategory,
  ProductCharacteristic,
} from '~/@types/product';
import TextUtil from '~/utils/TextUtil';
import { PlusOutlined } from '@ant-design/icons';
import { useTableQuery } from '~/hooks/useTableQuery';
import ProductCategoryController from '~/controllers/ProductCategoryController';
import ProductCharacteristicController from '~/controllers/ProductCharacteristicController';
import { useEffect, useState } from 'react';
import TypeCheck from '~/utils/TypeCheck';
import ProductController from '~/controllers/ProductController';

type ComponentProps = {
  product?: Product | null;
  drawerOpened: boolean;
  onClose: (reason: 'cancel' | 'save', product?: Product | null) => void;
};

export function ProductDrawer(props: ComponentProps) {
  const { product, drawerOpened, onClose } = props;
  const [productForm] = Form.useForm();
  const [productImages, setProductImages] = useState<UploadFile[]>([]);
  const {
    tableProps: { dataSource: categories = [] },
  } = useTableQuery<ProductCategory>('categories', (params) =>
    ProductCategoryController.list<ProductCategory>(params),
  );
  const {
    tableProps: { dataSource: characteristics = [] },
  } = useTableQuery<ProductCharacteristic>('characteristics', (params) =>
    ProductCharacteristicController.list<ProductCharacteristic>(params),
  );
  useEffect(() => {
    if (product) {
      productForm.setFieldsValue({
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        estimatedMinPrice: product.estimatedMinPrice,
        estimatedMaxPrice: product.estimatedMaxPrice,
        bookingLeadTimeMinutes: product.bookingLeadTimeMinutes,
        bookingLeadDays: product.bookingLeadDays,
        isActive: product.isActive,
        characteristics: product.characteristics,
        categories: product.categories,
      });
      setProductImages(
        product.imageUrl
          ? [
              {
                uid: product.id,
                name: product.name,
                status: 'done',
                url: product.imageUrl,
              },
            ]
          : [],
      );
    } else {
      productForm.resetFields();
      productForm.setFieldsValue({
        isActive: true,
        characteristics: [],
        categories: [],
      });
      setProductImages([]);
    }
  }, [product]);

  const saveProduct = () => {
    productForm.validateFields().then(async (values) => {
      const file = productImages[0];
      const imageUrl = file?.thumbUrl || file?.url || product?.imageUrl;
      const nextProduct: Product | CreateProduct = {
        id: product?.id,
        name: values.name,
        slug: values.slug || TextUtil.createSlug(values.name),
        description: values.description,
        price: values.price,
        estimatedMinPrice: values.estimatedMinPrice,
        estimatedMaxPrice: values.estimatedMaxPrice,
        bookingLeadTimeMinutes: values.bookingLeadTimeMinutes,
        bookingLeadDays: values.bookingLeadDays,
        isActive: values.isActive,
        characteristics: values.characteristics ?? [],
        categories: values.categories ?? [],
        imageUrl,
      };

      let result = null;
      if (TypeCheck.isNewProduct(nextProduct)) {
        result = await ProductController.create(nextProduct);
      } else {
        result = await ProductController.update(nextProduct);
      }

      message.success('Produto salvo com sucesso.');
      productForm.resetFields();
      setProductImages([]);
      onClose('save', result);
    });
  };

  return (
    <Drawer
      size="large"
      title={props.product ? 'Editar produto' : 'Novo produto'}
      open={drawerOpened}
      onClose={() => onClose('cancel')}
      extra={
        <Space>
          <Button onClick={() => onClose('cancel')}>Cancelar</Button>
          <Button type="primary" onClick={saveProduct}>
            Salvar
          </Button>
        </Space>
      }
    >
      <Form layout="vertical" form={productForm} initialValues={{ isActive: true }}>
        <Form.Item label="Nome" name="name" rules={[{ required: true }]}>
          <Input
            placeholder="Ex.: Bolo de Chocolate"
            onChange={(e) =>
              productForm.setFieldValue('slug', TextUtil.createSlug(e.target.value))
            }
          />
        </Form.Item>

        <Form.Item label="Slug" name="slug" rules={[{ required: true }]}>
          <Input placeholder="bolo-de-chocolate" />
        </Form.Item>

        <Form.Item label="Descrição" name="description">
          <Input.TextArea
            rows={4}
            placeholder="Descrição objetiva do produto"
            maxLength={255}
            showCount
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Preço (aproximado)"
              name="price"
              rules={[{ required: true }]}
            >
              <InputNumber min={0} step={1} style={{ width: '100%' }} prefix="R$" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Ativo" name="isActive" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        {/* <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Preço estimado mínimo" name="estimatedMinPrice">
              <InputNumber min={0} step={1} style={{ width: '100%' }} prefix="R$" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Preço estimado máximo" name="estimatedMaxPrice">
              <InputNumber min={0} step={1} style={{ width: '100%' }} prefix="R$" />
            </Form.Item>
          </Col>
        </Row> */}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Antecedência mínima (minutos)"
              name="bookingLeadTimeMinutes"
            >
              <InputNumber min={0} step={5} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Antecedência mínima (dias)" name="bookingLeadDays">
              <InputNumber min={0} step={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Categorias" name="categories">
          <Select
            mode="multiple"
            placeholder="Selecione as categorias"
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
          />
        </Form.Item>

        <Form.Item label="Características" name="characteristics">
          <Select
            mode="multiple"
            placeholder="Selecione as características"
            options={characteristics.map((c) => ({ label: c.name, value: c.id }))}
          />
        </Form.Item>

        <Form.Item label="Imagem do produto">
          <Upload
            listType="picture-card"
            fileList={productImages}
            onChange={({ fileList }) => setProductImages(fileList)}
            beforeUpload={() => false}
            maxCount={1}
          >
            {productImages.length >= 1 ? null : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </Form.Item>
      </Form>
    </Drawer>
  );
}
