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
import { useEffect, useState } from 'react';
import TextUtil from '~/utils/TextUtil';
import CustomerController from '~/controllers/CustomerController';

type ComponentProps = {
  form: FormInstance<any>;
};

const findCustomerByPhone = async (phone: string) => {
  const customer = await CustomerController.findByPhone(phone);
  return customer;
};

export function SchedulerCreateForm({ form }: ComponentProps) {
  const { isAdmin } = useAuthStore();
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [isCustomerNameDisabled, setIsCustomerNameDisabled] = useState(true);
  const [phoneSearchTimeout, setPhoneSearchTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const handleCustomerPhoneChange = (e: React.InputEvent<HTMLInputElement>) => {
    const input = e.currentTarget;

    const formatted = TextUtil.formatPhone(input.value);
    input.value = formatted;

    form.setFieldValue('customerPhone', formatted);

    const rawPhone = TextUtil.unformatPhone(formatted);
    form.setFieldValue('customerId', null);
    form.setFieldValue('customerName', '');

    // limpa timeout anterior
    if (phoneSearchTimeout) {
      clearTimeout(phoneSearchTimeout);
    }

    // telefone incompleto
    if (rawPhone.length < 10) {
      setIsCustomerNameDisabled(true);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearchingCustomer(true);
      setIsCustomerNameDisabled(true);
      try {
        const customer = await findCustomerByPhone(rawPhone);

        if (customer) {
          form.setFieldValue('customerName', customer.name);

          // AQUI
          form.setFieldValue('customerId', customer.id);

          setIsCustomerNameDisabled(true);
        } else {
          form.setFieldValue('customerName', '');

          // AQUI
          form.setFieldValue('customerId', null);

          setIsCustomerNameDisabled(false);
        }
      } finally {
        setIsSearchingCustomer(false);
      }
    }, 500);

    setPhoneSearchTimeout(timeout);
  };

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
    async (search) => {
      return ProductController.list<Product>({
        page: 1,
        pageSize: 50,
        filters: {},
        sorters: [{ key: 'productName', order: 'ascend' }],
        search,
      }).then((res) => res.data);
    },
    300,
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <Form
      layout="vertical"
      form={form}
      initialValues={{
        scheduledAt: dayjs(),
        paymentMethod: 'cash',
        deliveryType: 'pickup',
      }}
    >
      {isAdmin() && (
        <>
          <Form.Item
            label="Telefone do cliente"
            name="customerPhone"
            rules={[{ required: true, message: 'Informe o telefone do cliente' }]}
          >
            <Input
              placeholder="Ex.: (31) 92222-2222"
              onInput={handleCustomerPhoneChange}
              maxLength={16}
            />
          </Form.Item>

          <Form.Item
            label="Nome do cliente"
            name="customerName"
            rules={[{ required: true, message: 'Informe o nome do cliente' }]}
          >
            <Input
              placeholder={
                isSearchingCustomer ? 'Buscando cliente...' : 'Ex.: Maria Silva'
              }
              disabled={isCustomerNameDisabled}
              suffix={isSearchingCustomer ? <Spin size="small" /> : null}
            />
          </Form.Item>
          <Form.Item name="customerId" hidden>
            <Input />
          </Form.Item>
        </>
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
          <Form.Item label="Estimativa de retirada / entrega" name="scheduledTo">
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
                  value: 'cash',
                },
                {
                  label: (
                    <div style={{ padding: '4px 0' }}>
                      <CreditCard style={{ fontSize: 24 }} />
                      <div style={{ fontSize: 14 }}>Crédito</div>
                    </div>
                  ),
                  value: 'credit_card',
                },
                {
                  label: (
                    <div style={{ padding: '4px 0' }}>
                      <SackDollar style={{ fontSize: 24 }} />
                      <div style={{ fontSize: 14 }}>Débito</div>
                    </div>
                  ),
                  value: 'debit_card',
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
                        name={[name, 'productId']}
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
                            value: p.id,
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
