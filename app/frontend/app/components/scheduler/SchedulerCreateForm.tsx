import {
  Alert,
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Spin,
  type FormInstance,
} from 'antd';
import type { Product } from '~/@types/product';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import ProductController from '~/controllers/ProductController';
import { useTableQuery } from '~/hooks/useTableQuery';
import { useAuthStore } from '~/hooks/useAuthStore';
import { Segmented } from 'antd';

import dayjs from 'dayjs';
import {
  BuildingColumns,
  CreditCard,
  MoneyBill,
  PIX,
  SackDollar,
  BagShopping,
  Car,
} from '../icon/components';
import { useSelectQuery } from '~/hooks/useSelectQuery';
import TextArea from 'antd/es/input/TextArea';
import { useEffect } from 'react';

type ComponentProps = {
  form: FormInstance<any>;
};

export function SchedulerCreateForm({ form }: ComponentProps) {
  const { isAdmin } = useAuthStore();
  const productQuery = useTableQuery<Product>('products', (params) =>
    ProductController.list<Product>(params),
  );
  const items = Form.useWatch('items', form) as
    | { productName: string; quantity: number }[]
    | undefined;
  const total =
    items?.reduce((acc, item) => {
      const product = productQuery.tableProps.dataSource?.find(
        (p) => p.name === item?.productName,
      );
      return acc + (product?.price ?? 0) * (item?.quantity ?? 1);
    }, 0) ?? 0;
  const {
    options: productOptions,
    isFetching: isFetchingProduct,
    setSearch: setProductSearch,
    refetch,
  } = useSelectQuery(
    'products',
    () => ProductController.list<Product>().then((res) => res.data),
    300,
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <Form layout="vertical" form={form} initialValues={{ scheduledAt: dayjs() }}>
      {isAdmin() && (
        <Form.Item
          label="Nome do cliente"
          name="customerName"
          rules={[{ required: true, message: 'Informe o nome do cliente' }]}
        >
          <Input placeholder="Ex.: Maria Silva" />
        </Form.Item>
      )}

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Data e hora do pedido"
            name="scheduledAt"
            rules={[{ required: true, message: 'Informe a data' }]}
          >
            <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Estimativa de retirada / entrega"
            name="estimatedPickupDeliveryAt"
          >
            <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="Meio de pagamento"
            name="paymentMethod"
            rules={[{ required: true, message: 'Selecione o meio de pagamento' }]}
          >
            <Segmented
              block
              options={[
                {
                  label: (
                    <div style={{ padding: '4px 0' }}>
                      <MoneyBill style={{ fontSize: 24 }} />
                      <div style={{ fontSize: 14 }}>Dinheiro</div>
                    </div>
                  ),
                  value: 'money',
                },
                {
                  label: (
                    <div style={{ padding: '4px 0' }}>
                      <CreditCard style={{ fontSize: 24 }} />
                      <div style={{ fontSize: 14 }}>Crédito</div>
                    </div>
                  ),
                  value: 'credit',
                },
                {
                  label: (
                    <div style={{ padding: '4px 0' }}>
                      <SackDollar style={{ fontSize: 24 }} />
                      <div style={{ fontSize: 14 }}>Débito</div>
                    </div>
                  ),
                  value: 'debit',
                },
                {
                  label: (
                    <div style={{ padding: '4px 0' }}>
                      <PIX style={{ fontSize: 24 }} />
                      <div style={{ fontSize: 14 }}>PIX</div>
                    </div>
                  ),
                  value: 'pix',
                },
                {
                  label: (
                    <div style={{ padding: '4px 0' }}>
                      <BuildingColumns style={{ fontSize: 24 }} />
                      <div style={{ fontSize: 14 }}>Transf. bancária</div>
                    </div>
                  ),
                  value: 'bank_transfer',
                },
              ]}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Modalidade"
            name="deliveryType"
            rules={[{ required: true, message: 'Selecione a modalidade' }]}
          >
            <Segmented
              block
              options={[
                {
                  label: (
                    <div style={{ padding: '4px 0' }}>
                      <BagShopping style={{ fontSize: 24 }} />
                      <div style={{ fontSize: 14 }}>Retirada</div>
                      {/* <div style={{ fontSize: 12, color: '#888' }}>Retirar no local</div> */}
                    </div>
                  ),
                  value: 'pickup',
                },
                {
                  label: (
                    <div style={{ padding: '4px 0' }}>
                      <Car style={{ fontSize: 24 }} />
                      <div style={{ fontSize: 14 }}>Entrega</div>
                      {/* <div style={{ fontSize: 12, color: '#888' }}>Enviamos até você</div> */}
                    </div>
                  ),
                  value: 'delivery',
                },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Form.List name="items">
          {(fields, { add, remove }) => (
            <Space orientation="vertical" style={{ width: '100%' }}>
              {fields.map(({ key, name, ...rest }) => (
                <>
                  <Row gutter={8} key={key} align="bottom">
                    <Col flex={1}>
                      <Form.Item
                        {...rest}
                        label="Produto"
                        name={[name, 'productName']}
                        rules={[{ required: true, message: 'Informe o produto' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Select
                          placeholder="Selecione o produto"
                          showSearch={{
                            filterOption: false,
                            onSearch: setProductSearch,
                          }}
                          options={productOptions.map((p) => ({
                            label: p.name,
                            value: p.name,
                          }))}
                          notFoundContent={
                            isFetchingProduct ? <Spin size="small" /> : 'Sem resultados'
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col>
                      <Form.Item
                        {...rest}
                        label="Qtd."
                        name={[name, 'quantity']}
                        initialValue={1}
                        style={{ marginBottom: 0 }}
                      >
                        <InputNumber min={1} style={{ width: 80 }} />
                      </Form.Item>
                    </Col>
                    <Col>
                      <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => remove(name)}
                      />
                    </Col>
                  </Row>
                  <Row key={key + '_order_customization'} align="middle">
                    <Col span={24}>
                      <Form.Item
                        label="Observações / Customizações"
                        name={[name, 'customization']}
                      >
                        <TextArea
                          count={{ show: true }}
                          rows={4}
                          placeholder="Observações / Customizações. Ex.: Recheio de chocolate meio amargo"
                          maxLength={125}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Divider size="small" />
                </>
              ))}
              <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                Adicionar produto
              </Button>
            </Space>
          )}
        </Form.List>
        <div>
          Total estimado:{' '}
          {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </div>
        <Alert
          title="Valores podem sofrer alteração"
          description="Os preços dos itens e o total são estimativas e podem variar conforme disponibilidade de ingredientes ou personalizações."
          type="warning"
          showIcon
          style={{ marginTop: 12 }}
        />
      </Form.Item>
    </Form>
  );
}
