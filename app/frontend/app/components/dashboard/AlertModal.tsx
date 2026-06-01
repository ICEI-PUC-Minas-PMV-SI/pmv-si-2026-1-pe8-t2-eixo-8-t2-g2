import { Modal, Tag, Typography, Flex, Divider, Avatar, Tooltip, Badge } from 'antd';
import {
  CalendarOutlined,
  ShoppingOutlined,
  CreditCardOutlined,
  CarOutlined,
  ShopOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons';
import type { DashboardAlert } from '~/controllers/DashboardController';
import type { PaymentMethod } from '~/@types/payment';
import type { DeliveryType, SchedulerStatus } from '~/@types/scheduler';
import DateUtil from '~/utils/DateUtil';
import { PaymentMethodMap } from '~/constants/PaymentMethod';
import { SchedulerConstant } from '~/constants/SchedulerConstant';

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderItem = {
  id: string;
  quantity: number;
  priceAtBooking?: number | null;
  customization?: string | null;
  product: { id: string; name: string };
};

type AlertOrder = {
  id: string;
  scheduledAt: string;
  scheduledTo?: string | null;
  status: SchedulerStatus;
  paymentMethod: PaymentMethod;
  deliveryType: DeliveryType;
  cancellationReason?: string | null;
  createdAt: string;
  customer: { id: string; name: string; phone?: string | null };
  items?: OrderItem[];
};

type ComponentProps = {
  isOpened: boolean;
  onClose: () => void;
  alert?: DashboardAlert | null;
};

// ─── Helpers visuais ──────────────────────────────────────────────────────────

const ALERT_HEADER = {
  error: {
    bg: '#FFF1F0',
    border: '#FFCCC7',
    color: '#CF1322',
    icon: <ExclamationCircleOutlined />,
  },
  warning: {
    bg: '#FFFBE6',
    border: '#FFE58F',
    color: '#AD6800',
    icon: <WarningOutlined />,
  },
  info: {
    bg: '#E6F4FF',
    border: '#91CAFF',
    color: '#0958D9',
    icon: <InfoCircleOutlined />,
  },
} as const;

const DELIVERY_CONFIG: Record<
  DeliveryType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  delivery: { label: 'Entrega', icon: <CarOutlined />, color: '#1677FF' },
  pickup: { label: 'Retirada', icon: <ShopOutlined />, color: '#722ED1' },
};

function StatusTag({ status }: { status: SchedulerStatus }) {
  const cfg = SchedulerConstant.status[status];
  return (
    <Tag
      color={cfg.color}
      style={{ borderRadius: 20, fontWeight: 500, fontSize: 11, margin: 0 }}
    >
      {cfg.label}
    </Tag>
  );
}

function DeliveryTag({ type }: { type: DeliveryType }) {
  const cfg = DELIVERY_CONFIG[type] ?? { label: type, icon: null, color: 'default' };
  return (
    <Tag
      icon={cfg.icon}
      style={{
        borderRadius: 20,
        fontWeight: 500,
        fontSize: 11,
        margin: 0,
        color: cfg.color,
        borderColor: cfg.color,
        background: `${cfg.color}12`,
      }}
    >
      {cfg.label}
    </Tag>
  );
}

function PaymentTag({ method }: { method: PaymentMethod }) {
  return (
    <Tag
      icon={<CreditCardOutlined />}
      style={{
        borderRadius: 20,
        fontSize: 11,
        margin: 0,
        color: '#595959',
        background: '#FAFAFA',
        borderColor: '#D9D9D9',
      }}
    >
      {PaymentMethodMap[method] ?? method}
    </Tag>
  );
}

function whatsappHref(phone?: string | null) {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, '');
  const number = cleaned.startsWith('55') ? cleaned : `55${cleaned}`;
  return `https://wa.me/${number}`;
}

// ─── OrderCard ────────────────────────────────────────────────────────────────

function OrderCard({ order, index }: { order: AlertOrder; index: number }) {
  const wa = whatsappHref(order.customer.phone);
  const hasItems = Array.isArray(order.items) && order.items.length > 0;

  return (
    <div
      style={{
        background: '#FAFAFA',
        border: '1px solid #F0F0F0',
        borderRadius: 10,
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Linha 1: índice + cliente + status */}
      <Flex align="center" justify="space-between" gap={8} wrap="wrap">
        <Flex align="center" gap={10}>
          <Avatar
            size={34}
            style={{
              background: '#E06D5B',
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {order.customer.name.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Flex align="center" gap={6}>
              <Typography.Text strong style={{ fontSize: 14, color: '#1A1A1A' }}>
                {order.customer.name}
              </Typography.Text>
              {wa && (
                <Tooltip title={`WhatsApp: ${order.customer.phone}`}>
                  <a href={wa} target="_blank" rel="noreferrer">
                    <WhatsAppOutlined style={{ color: '#25D366', fontSize: 14 }} />
                  </a>
                </Tooltip>
              )}
            </Flex>
            <Typography.Text style={{ fontSize: 11, color: '#8C8C8C' }}>
              Pedido #{order.id.slice(-6).toUpperCase()}
            </Typography.Text>
          </div>
        </Flex>
        <StatusTag status={order.status} />
      </Flex>

      {/* Linha 2: datas + entrega + pagamento */}
      <Flex wrap="wrap" gap={8} align="center">
        <Flex align="center" gap={5}>
          <ClockCircleOutlined style={{ color: '#8C8C8C', fontSize: 12 }} />
          <Typography.Text style={{ fontSize: 12, color: '#595959' }}>
            Criado em {DateUtil.format(order.createdAt)}
          </Typography.Text>
        </Flex>

        {order.scheduledTo && (
          <>
            <Typography.Text style={{ color: '#D9D9D9', fontSize: 12 }}>
              ·
            </Typography.Text>
            <Flex align="center" gap={5}>
              <CalendarOutlined style={{ color: '#8C8C8C', fontSize: 12 }} />
              <Typography.Text style={{ fontSize: 12, color: '#595959' }}>
                Entrega: <strong>{DateUtil.format(order.scheduledTo)}</strong>
              </Typography.Text>
            </Flex>
          </>
        )}

        <Typography.Text style={{ color: '#D9D9D9', fontSize: 12 }}>·</Typography.Text>
        <DeliveryTag type={order.deliveryType} />
        <PaymentTag method={order.paymentMethod} />
      </Flex>

      {/* Linha 3: itens do pedido (se disponíveis) */}
      {hasItems && (
        <>
          <Divider style={{ margin: '2px 0', borderColor: '#F0F0F0' }} />
          <div>
            <Flex align="center" gap={6} style={{ marginBottom: 8 }}>
              <ShoppingOutlined style={{ color: '#8C8C8C', fontSize: 12 }} />
              <Typography.Text
                style={{
                  fontSize: 11,
                  color: '#8C8C8C',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: 600,
                }}
              >
                Itens
              </Typography.Text>
            </Flex>
            <Flex vertical gap={6}>
              {order.items!.map((item) => (
                <Flex key={item.id} justify="space-between" align="flex-start" gap={8}>
                  <Flex align="flex-start" gap={8}>
                    <Badge
                      count={item.quantity}
                      style={{
                        backgroundColor: '#E06D5B',
                        fontSize: 10,
                        minWidth: 18,
                        height: 18,
                        lineHeight: '18px',
                      }}
                    />
                    <div>
                      <Typography.Text style={{ fontSize: 13, color: '#262626' }}>
                        {item.product.name}
                      </Typography.Text>
                      {item.customization && (
                        <Typography.Text
                          style={{
                            fontSize: 11,
                            color: '#8C8C8C',
                            display: 'block',
                            marginTop: 1,
                          }}
                        >
                          Personalização: {item.customization}
                        </Typography.Text>
                      )}
                    </div>
                  </Flex>
                  {item.priceAtBooking != null && (
                    <Typography.Text
                      style={{
                        fontSize: 12,
                        color: '#389E0D',
                        fontWeight: 500,
                        flexShrink: 0,
                      }}
                    >
                      {(item.priceAtBooking * item.quantity).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </Typography.Text>
                  )}
                </Flex>
              ))}
            </Flex>
          </div>
        </>
      )}

      {/* Motivo de cancelamento, se houver */}
      {order.cancellationReason && (
        <>
          <Divider style={{ margin: '2px 0', borderColor: '#FFF1F0' }} />
          <Flex align="flex-start" gap={6}>
            <ExclamationCircleOutlined
              style={{ color: '#FF4D4F', fontSize: 12, marginTop: 2 }}
            />
            <Typography.Text style={{ fontSize: 12, color: '#CF1322' }}>
              {order.cancellationReason}
            </Typography.Text>
          </Flex>
        </>
      )}
    </div>
  );
}

// ─── AlertModal ───────────────────────────────────────────────────────────────

export function AlertModal({ isOpened, onClose, alert }: ComponentProps) {
  if (!alert) return null;

  const orders = (alert.orders ?? []) as AlertOrder[];
  const cfg = ALERT_HEADER[alert.type] ?? ALERT_HEADER.info;

  return (
    <Modal
      open={isOpened}
      onCancel={onClose}
      footer={null}
      width={640}
      title={null}
      styles={{ body: { padding: 0 } }}
    >
      {/* Header colorido por tipo */}
      <div
        style={{
          background: cfg.bg,
          borderBottom: `1px solid ${cfg.border}`,
          borderRadius: '8px 8px 0 0',
          padding: '18px 24px',
        }}
      >
        <Flex align="center" gap={10}>
          <span style={{ fontSize: 18, color: cfg.color }}>{cfg.icon}</span>
          <div>
            <Typography.Title
              level={5}
              style={{ margin: 0, color: cfg.color, fontSize: 15 }}
            >
              {alert.title}
            </Typography.Title>
            <Typography.Text style={{ fontSize: 12, color: cfg.color, opacity: 0.75 }}>
              {alert.description}
            </Typography.Text>
          </div>
        </Flex>
      </div>

      {/* Lista de pedidos */}
      <div
        style={{
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          maxHeight: '65vh',
          overflowY: 'auto',
        }}
      >
        {orders.length === 0 ? (
          <Typography.Text
            style={{
              color: '#8C8C8C',
              textAlign: 'center',
              display: 'block',
              padding: '32px 0',
            }}
          >
            Nenhum pedido encontrado.
          </Typography.Text>
        ) : (
          orders.map((order, idx) => (
            <OrderCard key={order.id} order={order} index={idx + 1} />
          ))
        )}
      </div>
    </Modal>
  );
}
