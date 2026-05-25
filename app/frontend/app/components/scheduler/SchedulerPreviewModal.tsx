import {
  Alert,
  Avatar,
  Card,
  Col,
  Divider,
  List,
  Modal,
  Row,
  Space,
  Tag,
  Typography,
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from '@ant-design/icons';

import dayjs from 'dayjs';
import type { Scheduler } from '~/@types/scheduler';
import TextUtil from '~/utils/TextUtil';

const { Title, Text, Paragraph } = Typography;

type Props = {
  open: boolean;
  onClose: () => void;
  order?: Scheduler | null;
};

const paymentMethodMap = {
  cash: {
    label: 'Dinheiro',
    color: 'green',
  },
  credit_card: {
    label: 'Cartão de crédito',
    color: 'blue',
  },
  debit_card: {
    label: 'Cartão de débito',
    color: 'cyan',
  },
  pix: {
    label: 'PIX',
    color: 'purple',
  },
  bank_transfer: {
    label: 'Transferência',
    color: 'gold',
  },
};

export function SchedulerPreviewModal({ open, onClose, order }: Props) {
  if (!order) return null;

  const total = order.items.reduce((acc, item) => {
    return acc + (item.priceAtBooking ?? 0) * item.quantity;
  }, 0);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={820}
      title="Resumo do pedido"
    >
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        {/* HEADER */}
        <Card>
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={14}>
              <Space align="start">
                <Avatar
                  size={56}
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: '#f5f5f5',
                    color: '#555',
                  }}
                />

                <Space orientation="vertical" size={0}>
                  <Title level={4} style={{ margin: 0 }}>
                    {order.customer.name}
                  </Title>

                  <Space size={4}>
                    <PhoneOutlined />
                    <Text>{TextUtil.formatPhone(order.customer.phone)}</Text>
                  </Space>

                  <Space wrap>
                    <Tag
                      color={order.deliveryType === 'delivery' ? 'processing' : 'default'}
                    >
                      {order.deliveryType === 'delivery' ? 'Entrega' : 'Retirada'}
                    </Tag>
                    {order.paymentMethod && (
                      <Tag color={paymentMethodMap[order.paymentMethod]?.color}>
                        {paymentMethodMap[order.paymentMethod]?.label}
                      </Tag>
                    )}
                  </Space>
                </Space>
              </Space>
            </Col>

            <Col xs={24} md={10}>
              <Space orientation="vertical" style={{ width: '100%' }}>
                <Space>
                  <CalendarOutlined />
                  <Text strong>Pedido:</Text>
                  <Text>{dayjs(order.scheduledAt).format('DD/MM/YYYY HH:mm')}</Text>
                </Space>

                {order.scheduledTo && (
                  <Space>
                    <ClockCircleOutlined />
                    <Text strong>Entrega:</Text>
                    <Text>{dayjs(order.scheduledTo).format('DD/MM/YYYY HH:mm')}</Text>
                  </Space>
                )}
              </Space>
            </Col>
          </Row>
        </Card>

        {/* ITENS */}
        <Card
          title={
            <Space>
              <ShoppingCartOutlined />
              <span>Itens do pedido</span>
            </Space>
          }
        >
          <List
            itemLayout="vertical"
            dataSource={order.items}
            renderItem={(item) => {
              const subtotal = (item.priceAtBooking ?? 0) * item.quantity;

              return (
                <List.Item>
                  <Row gutter={[16, 12]} align="top" style={{ width: '100%' }}>
                    {/* QUANTIDADE */}
                    <Col flex="50px">
                      <Tag
                        style={{
                          minWidth: 36,
                          textAlign: 'center',
                          fontSize: 16,
                          fontWeight: 700,
                        }}
                      >
                        {item.quantity}x
                      </Tag>
                    </Col>

                    {/* PRODUTO */}
                    <Col flex={1}>
                      <Space direction="vertical" size={2}>
                        <Text
                          strong
                          style={{
                            fontSize: 16,
                            display: 'block',
                          }}
                        >
                          {item.product.name}
                        </Text>

                        {item.customization && (
                          <Paragraph
                            type="secondary"
                            style={{
                              marginBottom: 0,
                              fontSize: 13,
                            }}
                          >
                            {item.customization}
                          </Paragraph>
                        )}
                      </Space>
                    </Col>

                    {/* SUBTOTAL */}
                    <Col>
                      <Text strong>
                        {subtotal.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </Text>
                    </Col>
                  </Row>
                </List.Item>
              );
            }}
          />

          <Divider />

          <Row justify="space-between" align="middle">
            <Col>
              <Title level={5} style={{ margin: 0 }}>
                Total
              </Title>
            </Col>

            <Col>
              <Title
                level={4}
                style={{
                  margin: 0,
                  color: '#d4380d',
                }}
              >
                {total.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </Title>
            </Col>
          </Row>
        </Card>

        {/* ENTREGA */}
        {order.deliveryType === 'delivery' && order.address && (
          <Card
            title={
              <Space>
                <EnvironmentOutlined />
                <span>Endereço de entrega</span>
              </Space>
            }
          >
            <Paragraph style={{ marginBottom: 0 }}>
              {order.address.street}, {order.address.number}
              <br />
              {order.address.neighborhood} - {order.address.city}/{order.address.state}
              {order.address.complement ? ` • ${order.address.complement}` : ''}
            </Paragraph>
          </Card>
        )}

        {/* OBSERVAÇÕES */}
        {order.notes && (
          <Alert
            type="info"
            showIcon
            title="Observações do pedido"
            description={order.notes}
          />
        )}
      </Space>
    </Modal>
  );
}
