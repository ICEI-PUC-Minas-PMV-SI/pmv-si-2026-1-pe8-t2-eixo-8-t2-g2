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
  TimePicker,
} from 'antd';
import type {
  CreateProduct,
  Product,
  ProductCategory,
  ProductCharacteristic,
  PublicProduct,
} from '~/@types/product';
import TextUtil from '~/utils/TextUtil';
import { useTableQuery } from '~/hooks/useTableQuery';
import ProductCategoryController from '~/controllers/ProductCategoryController';
import ProductCharacteristicController from '~/controllers/ProductCharacteristicController';
import { useEffect, useRef } from 'react';
import TypeCheck from '~/utils/TypeCheck';
import ProductController from '~/controllers/ProductController';
import { Duration } from '~/utils/Duration';
import { ProductImageUpload } from './ProductImageUpload';

type ComponentProps = {
  product?: Product | null;
  drawerOpened: boolean;
  onClose: (reason: 'cancel' | 'save', product?: Product | null) => void;
};

export function ProductFormImageSection({
  form,
  product,
  onCrop,
  categories,
  characteristics,
}: {
  form: any;
  product?: PublicProduct | null;
  onCrop: (blob: Blob | null) => void;
  categories: readonly ProductCategory[];
  characteristics: readonly ProductCharacteristic[];
}) {
  const watchedName = Form.useWatch('name', form);
  const watchedPrice = Form.useWatch('price', form);
  const watchedCategories = Form.useWatch('categories', form);
  const watchedCharacteristics = Form.useWatch('characteristics', form);
  const previewCategoryNames =
    watchedCategories?.map((item: string | { value: string }) => {
      const id = typeof item === 'object' ? item.value : item;
      return categories.find((c) => c.id === id)?.name;
    }) ?? [];

  const previewCharacteristicNames =
    watchedCharacteristics?.map((item: string | { value: string }) => {
      const id = typeof item === 'object' ? item.value : item;
      return characteristics.find((c) => c.id === id)?.name;
    }) ?? [];
  console.log('product', product);
  console.log('watchedCategories', watchedCategories);
  console.log('watchedCharacteristics', watchedCharacteristics);
  const productPreview: Partial<PublicProduct> = {
    name: watchedName ?? product?.name,
    price: watchedPrice ?? product?.price,
    categories: previewCategoryNames,
    characteristics: previewCharacteristicNames,
  };

  return (
    <Form.Item label="Imagem do produto">
      <ProductImageUpload
        currentImageUrl={product?.imageUrl}
        productPreview={productPreview}
        onCrop={onCrop}
      />
    </Form.Item>
  );
}

export function ProductDrawer(props: ComponentProps) {
  const { product, drawerOpened, onClose } = props;
  const [productForm] = Form.useForm();
  const croppedImageRef = useRef<Blob | null>(null);
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
      const { days, hours, minutes } = Duration.parse(product.bookingLeadMinutes);
      const time = Duration.toTimePickerValue(hours * 60 + minutes);
      productForm.setFieldsValue({
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        bookingLeadDays: days,
        bookingLeadTime: time,
        isActive: product.isActive,
        characteristics: product.characteristics.map((char) => {
          const {
            characteristic: { id, name },
          } = char;
          return { label: name, value: id };
        }),
        categories: product.categories.map((data) => {
          const {
            category: { id, name },
          } = data;
          return { label: name, value: id };
        }),
      });
    } else {
      productForm.resetFields();
      productForm.setFieldsValue({
        isActive: true,
        characteristics: [],
        categories: [],
      });
    }
  }, [product, productForm]);

  const saveProduct = () => {
    productForm.validateFields().then(async (values) => {
      const minutes = Duration.fromTimePickerValue(values.bookingLeadTime);
      const days = values.bookingLeadDays;
      const nextProduct: Product | CreateProduct = {
        id: product?.id || '',
        name: values.name,
        slug: values.slug || TextUtil.createSlug(values.name),
        description: values.description,
        price: values.price,
        bookingLeadMinutes: Duration.toMinutes({ days, minutes }),
        isActive: values.isActive,
        characteristics: values.characteristics ?? [],
        categories: values.categories ?? [],
      };

      let result = null;
      if (TypeCheck.isNewProduct(nextProduct)) {
        result = await ProductController.create(nextProduct, croppedImageRef.current);
      } else {
        result = await ProductController.update(nextProduct, croppedImageRef.current);
      }

      croppedImageRef.current = null;
      message.success('Produto salvo com sucesso.');
      productForm.resetFields();
      onClose('save', result);
    });
  };

  return (
    <Drawer
      destroyOnHidden
      size="large"
      title={props.product ? 'Editar produto' : 'Novo produto'}
      open={drawerOpened}
      onClose={() => {
        productForm.resetFields();
        croppedImageRef.current = null;
        onClose('cancel');
      }}
      extra={
        <Space>
          <Button
            onClick={() => {
              productForm.resetFields();
              croppedImageRef.current = null;
              onClose('cancel');
            }}
          >
            Cancelar
          </Button>
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

        <Form.Item label="Antecedência mínima">
          <Space>
            <Form.Item name="bookingLeadDays" noStyle initialValue={0}>
              <InputNumber min={0} />
            </Form.Item>

            <span>dias</span>

            <Form.Item name="bookingLeadTime" noStyle>
              <TimePicker
                format="HH:mm"
                minuteStep={5}
                needConfirm={false}
                showNow={false}
              />
            </Form.Item>
          </Space>
        </Form.Item>

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

        <ProductFormImageSection
          form={productForm}
          product={product}
          categories={categories}
          characteristics={characteristics}
          onCrop={(blob) => {
            croppedImageRef.current = blob;
          }}
        />
      </Form>
    </Drawer>
  );
}
