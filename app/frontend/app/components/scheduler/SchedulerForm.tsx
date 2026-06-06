import {
  Alert,
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  Grid,
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
import { Duration } from '~/utils/Duration';
import { useBreakpoint } from '~/hooks/useBreakpoint';

type ComponentProps = {
  form: FormInstance<any>;
};

const findCustomerByPhone = async (phone: string) => {
  const customer = await CustomerController.findByPhone(phone);
  return customer;
};

export function SchedulerForm({ form }: ComponentProps) {
  const { isAdmin, getUserShortname } = useAuthStore();
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [isCustomerNameDisabled, setIsCustomerNameDisabled] = useState(true);
  const scheduledTo = Form.useWatch('scheduledTo', form);
  const isMobile = useBreakpoint('md');
  const [phoneSearchTimeout, setPhoneSearchTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const getUnavailableLeadMinutes = (product: Product) => {
    if (!scheduledTo || !product.bookingLeadMinutes) {
      return null;
    }

    const minutesUntilDelivery = dayjs(scheduledTo).diff(dayjs(), 'minute');

    if (minutesUntilDelivery < product.bookingLeadMinutes) {
      return product.bookingLeadMinutes;
    }

    return null;
  };

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

          form.setFieldValue('customerId', customer.id);

          setIsCustomerNameDisabled(true);
        } else {
          form.setFieldValue('customerName', '');

          form.setFieldValue('customerId', null);

          setIsCustomerNameDisabled(false);
        }
      } finally {
        setIsSearchingCustomer(false);
      }
    }, 500);

    setPhoneSearchTimeout(timeout);
  };

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

  const items = Form.useWatch('items', form) as
    | { productId: string; quantity: number; customization: string }[]
    | undefined;
  const total =
    items?.reduce((acc, item) => {
      const product = productOptions.find((p) => p.id === item?.productId);
      return acc + (product?.price ?? 0) * (item?.quantity ?? 1);
    }, 0) ?? 0;

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
        clientName: isAdmin() ? '' : getUserShortname(),
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
              disabled={form.getFieldValue('isEdit')}
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
              disabled={isCustomerNameDisabled || form.getFieldValue('isEdit')}
              suffix={isSearchingCustomer ? <Spin size="small" /> : null}
            />
          </Form.Item>
          <Form.Item name="customerId" hidden>
            <Input />
          </Form.Item>
        </>
      )}

      <Row gutter={16}>
        <Col xs={24} sm={12} hidden={isAdmin()}>
          <Form.Item label="Nome" name="clientName">
            <Input disabled value={getUserShortname()} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} hidden={!isAdmin()}>
          <Form.Item
            label="Data e hora do pedido"
            name="scheduledAt"
            rules={[{ required: true, message: 'Informe a data' }]}
          >
            <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
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
              vertical={!Grid.useBreakpoint().md}
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
        <Col xs={24} sm={12}>
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
                    </div>
                  ),
                  value: 'pickup',
                },
                {
                  label: (
                    <div style={{ padding: '4px 0' }}>
                      <Car style={{ fontSize: 24 }} />
                      <div style={{ fontSize: 14 }}>Entrega</div>
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
                  <Row gutter={[8, 8]} key={key} align="top">
                    <Col span={isMobile ? 24 : undefined} flex={isMobile ? undefined : 1}>
                      <Form.Item
                        {...rest}
                        label="Produto"
                        style={{ marginBottom: 0 }}
                        name={[name, 'productId']}
                        rules={[
                          { required: true, message: 'Informe o produto' },
                          {
                            validator: (_, value) => {
                              if (!value || !scheduledTo) {
                                return Promise.resolve();
                              }

                              const product = productOptions.find((p) => p.id === value);

                              if (!product) {
                                return Promise.resolve();
                              }

                              const leadMinutes = getUnavailableLeadMinutes(product);

                              if (leadMinutes) {
                                const duration = Duration.parse(leadMinutes);

                                return Promise.reject(
                                  new Error(
                                    `Este produto exige ${
                                      duration.days > 0 ? `${duration.days} dia(s) ` : ''
                                    }${
                                      duration.hours > 0
                                        ? `${duration.hours} hora(s) `
                                        : ''
                                    }${duration.minutes > 0 ? `${duration.minutes} minuto(s)` : ''} de antecedência.`,
                                  ),
                                );
                              }

                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <Select
                          placeholder="Selecione o produto"
                          showSearch={{
                            filterOption: false,
                            onSearch: setProductSearch,
                          }}
                          options={productOptions.map((p) => {
                            const leadMinutes = getUnavailableLeadMinutes(p);
                            const duration = leadMinutes
                              ? Duration.parse(leadMinutes)
                              : null;

                            return {
                              value: p.id,
                              disabled: !!leadMinutes,
                              label: leadMinutes ? (
                                <>
                                  {p.name}
                                  <span style={{ color: '#999' }}>
                                    {' '}
                                    (mín. {duration?.days ? `${duration.days}d ` : ''}
                                    {duration?.hours ?? 0}h{duration?.minutes ?? 0}min)
                                  </span>
                                </>
                              ) : (
                                p.name
                              ),
                            };
                          })}
                          notFoundContent={
                            isFetchingProduct ? <Spin size="small" /> : 'Sem resultados'
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={12} sm={4}>
                      <Form.Item
                        {...rest}
                        label="Qtd."
                        name={[name, 'quantity']}
                        initialValue={1}
                        style={{ marginBottom: 0 }}
                      >
                        <InputNumber min={1} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col xs={12} sm={2}>
                      <Form.Item label=" ">
                        <Button
                          style={{ width: '100%' }}
                          icon={<DeleteOutlined />}
                          danger
                          onClick={() => remove(name)}
                        />
                      </Form.Item>
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
