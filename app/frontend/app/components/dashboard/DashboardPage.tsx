import { useState } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Tag,
  Table,
  Alert,
  Progress,
  Badge,
  Button,
  Space,
  Segmented,
  List,
  Avatar,
  Spin,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ShoppingOutlined,
  DollarOutlined,
  FireOutlined,
  CarOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  RiseOutlined,
  FallOutlined,
  ToolOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import type {
  NameType,
  ValueType,
  Payload,
} from 'recharts/types/component/DefaultTooltipContent';
import { SchedulerConstant } from '~/constants/SchedulerConstant';
import { useQuery } from '@tanstack/react-query';
import DashboardController, {
  type MonthSummary,
  type TodaySummary,
  type TopProducts,
} from '~/controllers/DashboardController';
import type { DeliveryType, Scheduler } from '~/@types/scheduler';
import SchedulerController from '~/controllers/SchedulerController';
import { SchedulerPreviewModal } from '../scheduler/SchedulerPreviewModal';
import type { PaymentMethod } from '~/@types/payment';
import { PaymentMethodMap } from '~/constants/PaymentMethod';

const { Content } = Layout;
const { Text } = Typography;

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  primary: '#e06d5b',
  primaryLight: '#f0997b',
  confirmed: '#1677ff',
  pending: '#fa8c16',
  progress: '#13c2c2',
  completed: '#52c41a',
  cancelled: '#ff4d4f',
  pickup: '#722ed1',
  card: '#faad14',
  cash: '#52c41a',
  transfer: '#13c2c2',
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────
type SchedulerStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';
// type DeliveryType = 'pickup' | 'delivery';

interface AgendaItem {
  time: string;
  name: string;
  product: string;
  status: SchedulerStatus;
  type: DeliveryType;
}

type DeliveryToday = {
  id: string;
  time: string;
  customerName: string;
  productLabel: string;
  deliveryType: DeliveryType;
  status: SchedulerStatus;
};

interface ProductRow {
  key: number;
  name: string;
  orders: number;
  revenue: number;
  percent: number;
}

interface FlowStep {
  num: number;
  title: string;
  desc: string;
  pnr: boolean;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const leadTimes = [
  { name: 'Bolo decorado', horas: 72 },
  { name: 'Torta', horas: 72 },
  { name: 'Brigadeiro gourmet', horas: 48 },
  { name: 'Cupcake personalizado', horas: 48 },
  { name: 'Bolo no pote', horas: 24 },
  { name: 'Pronta entrega', horas: 0 },
];

const flowSteps: FlowStep[] = [
  {
    num: 1,
    title: 'Recebimento do pedido',
    desc: 'Cliente entra em contato. Coleta: nome, telefone, email, produto, data, entrega e pagamento.',
    pnr: false,
  },
  {
    num: 2,
    title: 'Registro & confirmação',
    desc: 'Pedido lançado no sistema. Status → pending. Cliente recebe resumo e valor estimado.',
    pnr: false,
  },
  {
    num: 3,
    title: 'Confirmação de pagamento',
    desc: 'Pagamento confirmado. Status → confirmed. Alterações a partir daqui podem gerar custo adicional.',
    pnr: false,
  },
  {
    num: 4,
    title: 'Início da produção',
    desc: 'Pedido entra na fila. Status → in_progress. Ingredientes separados e produção iniciada.',
    pnr: true,
  },
  {
    num: 5,
    title: 'Finalização & controle de qualidade',
    desc: 'Produto finalizado, embalado e fotografado para registro. Checklist conferido.',
    pnr: false,
  },
  {
    num: 6,
    title: 'Entrega ou retirada',
    desc: 'Delivery ou pickup conforme tipo. Status → completed. Confirmação enviada ao cliente.',
    pnr: false,
  },
];

// ─── Shared styles ────────────────────────────────────────────────────────────
const cardStyle: React.CSSProperties = {
  borderRadius: 12,
  border: '1px solid #f0f0f0',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
};

const cardHeaderStyles = {
  header: { borderBottom: '1px solid #f5f5f5', padding: '12px 16px' },
};

const getLabelAndColor = (status: SchedulerStatus) => {
  const config = SchedulerConstant.status[status];
  return {
    color: config.color,
    label: config.label,
  };
};

const getStatusPercent = (statusPercent: Record<SchedulerStatus, number> | null) => {
  if (!statusPercent) return [];
  return Object.keys(statusPercent || {})
    .map((status) => {
      const config = getLabelAndColor(status as SchedulerStatus);
      return {
        name: config.label,
        value: statusPercent[status as SchedulerStatus],
        color: config.color,
      };
    })
    .sort((a, b) => b.value - a.value);
};

const getMonthSummaryDelivery = (months: MonthSummary[]) => {
  const summary = months.reduce(
    (summary, monthData) => {
      summary.delivery += monthData.deliveryType.delivery;
      summary.pickup += monthData.deliveryType.pickup;
      return summary;
    },
    { delivery: 0, pickup: 0 },
  );

  return [
    { name: 'Entrega', value: summary.delivery, color: C.primary },
    { name: 'Retirada', value: summary.pickup, color: C.pickup },
  ];
};

const PAYMENT_METHOD_COLORS: Record<PaymentMethod, string> = {
  pix: '#32BCAD', // verde PIX
  credit_card: '#1677FF', // azul
  debit_card: '#13C2C2', // ciano
  cash: '#52C41A', // verde dinheiro
  bank_transfer: '#722ED1', // roxo
};

const getMonthsSummaryPayment = (data?: Record<PaymentMethod, number> | null) => {
  if (!data) return [];
  const total = Object.values(data).reduce((sum, v) => sum + v, 0);
  return Object.entries(data).map(([key, value]) => ({
    name: PaymentMethodMap[key as PaymentMethod],
    value: Math.round((value / total) * 100),
    color: PAYMENT_METHOD_COLORS[key as PaymentMethod],
  }));
};

// ─── Status config ────────────────────────────────────────────────────────────
const statusConfig: Record<
  SchedulerStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: { ...getLabelAndColor('pending'), icon: <ClockCircleOutlined /> },
  confirmed: { ...getLabelAndColor('confirmed'), icon: <CheckCircleOutlined /> },
  in_progress: { ...getLabelAndColor('in_progress'), icon: <SyncOutlined spin /> },
  completed: { ...getLabelAndColor('completed'), icon: <CheckCircleOutlined /> },
  cancelled: { ...getLabelAndColor('cancelled'), icon: <CloseCircleOutlined /> },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusTag({ status }: { status: SchedulerStatus }) {
  const cfg = statusConfig[status];
  return (
    <Tag color={cfg.color} icon={cfg.icon}>
      {cfg.label}
    </Tag>
  );
}

function SectionTitle({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0' }}>
      <span style={{ color: C.primary, fontSize: 18 }}>{icon}</span>
      <Text
        strong
        style={{
          fontSize: 13,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: '#888',
        }}
      >
        {children}
      </Text>
      <div style={{ flex: 1, height: 1, background: '#f0f0f0', marginLeft: 8 }} />
    </div>
  );
}

interface KpiCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend?: number;
  trendLabel?: string;
  icon: React.ReactNode;
  color?: string;
  loading?: boolean;
}

function KpiCard({
  title,
  value,
  prefix,
  suffix,
  trend,
  trendLabel,
  icon,
  loading = false,
  color = C.primary,
}: KpiCardProps) {
  return (
    <Card
      loading={loading}
      style={{ ...cardStyle, borderTop: `3px solid ${color}` }}
      styles={{ body: { padding: '16px 20px' } }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ flex: 1 }}>
          <Text
            style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }}
          >
            {title}
          </Text>
          <Statistic
            value={value}
            prefix={prefix}
            suffix={suffix}
            styles={{ content: { fontSize: 26, fontWeight: 600, color: '#1a1a1a' } }}
          />
          {trend !== undefined && trendLabel && (
            <Text
              style={{
                fontSize: 11,
                color: trend >= 0 ? '#389e0d' : '#cf1322',
                marginTop: 4,
                display: 'block',
              }}
            >
              {trend >= 0 ? <RiseOutlined /> : <FallOutlined />} {trendLabel}
            </Text>
          )}
        </div>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: `${color}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            color,
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

// ─── Custom Recharts Tooltip ──────────────────────────────────────────────────
type CustomTooltipProps = TooltipProps<ValueType, NameType> & {
  prefix?: string;
  suffix?: string;
  payload?: Payload<ValueType, NameType>[];
  label?: string | number;
};

function CustomTooltip(props: CustomTooltipProps) {
  const { active, payload, label, prefix = '', suffix = '' } = props;
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #f0f0f0',
        borderRadius: 8,
        padding: '8px 14px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}
    >
      <Text style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>
        {String(label)}
      </Text>
      {payload.map((p: Payload<ValueType, NameType>, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: (p.color ?? p.fill) as string,
            }}
          />
          <Text style={{ fontSize: 13 }}>
            {p.name}:{' '}
            <strong>
              {prefix}
              {typeof p.value === 'number' ? p.value.toLocaleString('pt-BR') : p.value}
              {suffix}
            </strong>
          </Text>
        </div>
      ))}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function DashboardPage() {
  const [agendaFilter, setAgendaFilter] = useState<'Todos' | 'Entrega' | 'Retirada'>(
    'Todos',
  );
  const [schedulerPreviewState, setSchedulerPreviewState] = useState<{
    isOpened: boolean;
    order: Scheduler | null;
  }>({ isOpened: false, order: null });
  const staleTime = 0; // 60*60*1000;
  const todaySummary = useQuery({
    queryKey: ['today-summary'],
    queryFn: () => {
      return DashboardController.todaySummary();
    },
    staleTime,
  });

  const latestMonthsSummary = useQuery({
    queryKey: ['latest-months-summary'],
    queryFn: () => {
      return DashboardController.latestMonths();
    },
    staleTime,
  });

  const latestMonthsRevenueSummary = useQuery({
    queryKey: ['latest-months-revenue-summary'],
    queryFn: () => {
      return DashboardController.latestMonthsRevenue();
    },
    staleTime,
  });

  const topProductsSummary = useQuery({
    queryKey: ['top-products-summary'],
    queryFn: () => {
      return DashboardController.topProducts();
    },
    staleTime,
  });

  const deliveriesToday = useQuery({
    queryKey: ['deliveries-today'],
    queryFn: () => {
      return DashboardController.deliveriesToday();
    },
    staleTime,
  });

  const handleOpenOrder = async (item: DeliveryToday) => {
    const order = await SchedulerController.getById(item.id);
    setSchedulerPreviewState({ isOpened: true, order });
  };

  const getDeliveriesToday = (schedulers: Scheduler[]) => {
    return schedulers.map((scheduler) => {
      const scheduledAt = new Date(scheduler.scheduledAt);
      let productLabel = scheduler.items[0].product.name;
      if (scheduler.items.length > 1) {
        productLabel += ` (+${scheduler.items.length - 1} produtos)`;
      }
      return {
        id: scheduler.id,
        time:
          scheduledAt.getHours().toString().padStart(2, '0') +
          ':' +
          scheduledAt.getMinutes().toString().padStart(2, '0'),
        customerName: scheduler.customer.name,
        productLabel,
        deliveryType: scheduler.deliveryType,
        status: scheduler.status,
      } satisfies DeliveryToday;
    });
  };

  const filteredAgenda: DeliveryToday[] =
    agendaFilter === 'Todos'
      ? getDeliveriesToday(deliveriesToday.data || [])
      : agendaFilter === 'Entrega'
        ? getDeliveriesToday(deliveriesToday.data || []).filter(
            (a) => a.deliveryType === 'delivery',
          )
        : getDeliveriesToday(deliveriesToday.data || []).filter(
            (a) => a.deliveryType === 'pickup',
          );

  const productColumns: ColumnsType<TopProducts> = [
    {
      title: 'Produto',
      dataIndex: 'name',
      key: 'name',
      render: (t: string) => <Text style={{ fontSize: 13 }}>{t}</Text>,
    },
    {
      title: 'Pedidos',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      render: (v: number) => <Text strong>{v}</Text>,
    },
    {
      title: 'Volume',
      dataIndex: 'percent',
      key: 'percent',
      width: 120,
      render: (v: number) => (
        <Progress percent={v} size="small" strokeColor={C.primary} showInfo={false} />
      ),
    },
    {
      title: 'Receita',
      dataIndex: 'revenue',
      key: 'revenue',
      width: 110,
      render: (v: number) => (
        <Text style={{ color: '#389e0d', fontWeight: 500 }}>
          R$ {v.toLocaleString('pt-BR')}
        </Text>
      ),
    },
  ];

  const getTodayOrdersLabel = (todaySummary?: TodaySummary) => {
    if (!todaySummary) return '';
    const todayOrders = todaySummary.schedulers;
    const tomorrowOrders = todaySummary.schedulersYesterday;
    if (todayOrders === tomorrowOrders) return '';
    if (todayOrders > tomorrowOrders) {
      return `↑ ${todayOrders - tomorrowOrders} vs ontem`;
    }
    return `↓${tomorrowOrders - todayOrders} vs ontem`;
  };

  return (
    <Layout style={{ background: '#f8f8f7', minHeight: '100vh' }}>
      <SchedulerPreviewModal
        open={schedulerPreviewState.isOpened}
        onClose={() => setSchedulerPreviewState({ isOpened: false, order: null })}
        order={schedulerPreviewState.order}
      />
      <Content
        style={{
          /*padding: "24px 28px", maxWidth: 1280,*/ margin: '0 auto',
          width: '100%',
        }}
      >
        {/* ── Header ── */}
        {/* <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              🎂
            </div>
            <div>
              <Title level={4} style={{ margin: 0, lineHeight: 1.2 }}>Painel de Gestão</Title>
              <Text style={{ fontSize: 12, color: "#888" }}>Confeitaria — inteligência de negócios</Text>
            </div>
          </div>
          <Badge count={3} color={C.primary}>
            <Button icon={<BellOutlined />} shape="circle" />
          </Badge>
        </div> */}

        {/* ── KPIs ── */}
        <SectionTitle icon={<BarChartOutlined />}>Visão Geral — Hoje</SectionTitle>
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} md={8} lg={4}>
            <KpiCard
              loading={todaySummary.isLoading}
              title="Pedidos hoje"
              value={todaySummary.data?.created || 0}
              icon={<ShoppingOutlined />}
              trend={2}
              trendLabel={getTodayOrdersLabel(todaySummary.data)}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={5}>
            <KpiCard
              loading={todaySummary.isLoading}
              title="Faturamento estimado"
              value={todaySummary.data?.totalPrice || 0}
              prefix="R$"
              icon={<DollarOutlined />}
              trend={12}
              trendLabel="↑ 12% vs semana passada"
              color="#389e0d"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <KpiCard
              loading={todaySummary.isLoading}
              title="Ticket médio"
              value={todaySummary.data?.avgPrice || 0}
              prefix="R$"
              icon={<RiseOutlined />}
              color="#722ed1"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <KpiCard
              loading={todaySummary.isLoading}
              title="Em produção"
              value={todaySummary.data?.inProgress || 0}
              // suffix=" pedidos"
              icon={<FireOutlined />}
              color={C.progress}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <KpiCard
              loading={todaySummary.isLoading}
              title="Entregas hoje"
              value={todaySummary.data?.schedulers || 0}
              icon={<CarOutlined />}
              trend={0}
              trendLabel={
                todaySummary.data?.schedulers
                  ? `${todaySummary.data?.pickup || 0} retirada · ${todaySummary.data?.delivery || 0} entrega`
                  : ''
              }
              color="#fa8c16"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <KpiCard
              loading={todaySummary.isLoading}
              title="Cancelamentos"
              value={
                (todaySummary.data?.created || 0) === 0
                  ? 0
                  : (Math.round(
                      ((todaySummary.data?.cancelled || 0) * 100) /
                        (todaySummary.data?.created || 0) +
                        Number.EPSILON,
                    ) *
                      100) /
                    100
              }
              suffix="%"
              icon={<WarningOutlined />}
              trend={-1}
              trendLabel="↑ 1,1pp vs mês"
              color={C.cancelled}
            />
          </Col>
        </Row>

        {/* ── Demanda ── */}
        <SectionTitle icon={<BarChartOutlined />}>
          Demanda & Volume (Últ. 6 meses)
        </SectionTitle>
        <Row gutter={[12, 12]}>
          {/* Volume de pedidos */}
          <Col xs={24} lg={14}>
            <Card
              style={cardStyle}
              styles={{
                header: { borderBottom: '1px solid #f5f5f5', padding: '12px 16px' },
                body: { padding: '12px 16px' },
              }}
              title={
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text strong style={{ fontSize: 13 }}>
                    Volume de pedidos
                  </Text>
                </div>
              }
            >
              <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
                <Space size={4}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: C.primary,
                    }}
                  />
                  <Text style={{ fontSize: 11, color: '#888' }}>Confirmados</Text>
                </Space>
                <Space size={4}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: C.primaryLight,
                    }}
                  />
                  <Text style={{ fontSize: 11, color: '#888' }}>Pendentes</Text>
                </Space>
              </div>
              <Spin spinning={latestMonthsSummary.isLoading} fullscreen={false}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={(latestMonthsSummary.data?.months || []).map((month) => {
                      return {
                        label: month.monthYear,
                        confirmados: month.status.confirmed,
                        pendentes: month.status.pending,
                      };
                    })}
                    barCategoryGap="30%"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f0f0f0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <RTooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="confirmados"
                      name="Confirmados"
                      stackId="a"
                      fill={C.primary}
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="pendentes"
                      name="Pendentes"
                      stackId="a"
                      fill={C.primaryLight}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Spin>
            </Card>
          </Col>

          {/* Status dos pedidos */}
          <Col xs={24} sm={12} lg={5}>
            <Card
              style={{ ...cardStyle, height: '100%' }}
              styles={{
                ...cardHeaderStyles,
                body: { padding: '12px 16px' },
              }}
              title={
                <Text strong style={{ fontSize: 13 }}>
                  Status dos pedidos
                </Text>
              }
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <Spin spinning={latestMonthsSummary.isLoading} fullscreen={false}>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={getStatusPercent(
                          latestMonthsSummary.data?.statusPercent || null,
                        )}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={45}
                        outerRadius={72}
                        paddingAngle={2}
                      >
                        {getStatusPercent(
                          latestMonthsSummary.data?.statusPercent || null,
                        ).map((s, i) => (
                          <Cell key={i} fill={s.color} />
                        ))}
                      </Pie>

                      <RTooltip
                        formatter={(v: ValueType | undefined) =>
                          v != null ? [`${v}%`] : []
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Spin>

                {/* Legenda */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  {getStatusPercent(latestMonthsSummary.data?.statusPercent || null).map(
                    (s, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                          minWidth: 0,
                        }}
                      >
                        <Space
                          size={6}
                          style={{
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 2,
                              background: s.color,
                              flexShrink: 0,
                            }}
                          />

                          <Text
                            ellipsis
                            style={{
                              fontSize: 11,
                              color: '#666',
                            }}
                          >
                            {s.name}
                          </Text>
                        </Space>

                        <Text
                          strong
                          style={{
                            fontSize: 11,
                            flexShrink: 0,
                          }}
                        >
                          {s.value}%
                        </Text>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </Card>
          </Col>

          {/* Entrega + Pagamento */}
          <Col xs={24} sm={12} lg={5}>
            <Card
              style={{ ...cardStyle, marginBottom: 12 }}
              styles={{ ...cardHeaderStyles, body: { padding: '8px 16px' } }}
              title={
                <Text strong style={{ fontSize: 13 }}>
                  Tipo de entrega
                </Text>
              }
            >
              <Spin spinning={latestMonthsSummary.isLoading} fullscreen={false}>
                <ResponsiveContainer width="100%" height={100}>
                  <PieChart>
                    <Pie
                      data={getMonthSummaryDelivery(
                        latestMonthsSummary.data?.months || [],
                      )}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={44}
                      paddingAngle={2}
                    >
                      {getMonthSummaryDelivery(
                        latestMonthsSummary.data?.months || [],
                      ).map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                    <RTooltip
                      formatter={(v: ValueType | undefined) =>
                        v != null ? [`${v}%`] : []
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Spin>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                {getMonthSummaryDelivery(latestMonthsSummary.data?.months || []).map(
                  (d, i) => (
                    <Space key={i} size={4}>
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 2,
                          background: d.color,
                        }}
                      />
                      <Text style={{ fontSize: 11, color: '#666' }}>
                        {d.name} {d.value}%
                      </Text>
                    </Space>
                  ),
                )}
              </div>
            </Card>

            <Card
              style={cardStyle}
              styles={{ ...cardHeaderStyles, body: { padding: '8px 16px' } }}
              title={
                <Text strong style={{ fontSize: 13 }}>
                  Pagamento
                </Text>
              }
            >
              <Spin spinning={latestMonthsSummary.isLoading} fullscreen={false}>
                <ResponsiveContainer width="100%" height={100}>
                  <PieChart>
                    <Pie
                      data={getMonthsSummaryPayment(
                        latestMonthsSummary.data?.summary.paymentMethod,
                      )}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={44}
                      paddingAngle={2}
                    >
                      {getMonthsSummaryPayment(
                        latestMonthsSummary.data?.summary.paymentMethod,
                      ).map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                    <RTooltip
                      formatter={(v: ValueType | undefined) =>
                        v != null ? [`${v}%`] : []
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Spin>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '4px 12px',
                  justifyContent: 'center',
                }}
              >
                {getMonthsSummaryPayment(
                  latestMonthsSummary.data?.summary.paymentMethod,
                ).map((d, i) => (
                  <Space key={i} size={4}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: d.color,
                      }}
                    />
                    <Text style={{ fontSize: 11, color: '#666' }}>
                      {d.name} {d.value}%
                    </Text>
                  </Space>
                ))}
              </div>
            </Card>
          </Col>
        </Row>

        {/* ── Produtos & Produção ── */}
        <SectionTitle icon={<ToolOutlined />}>Produtos & Produção</SectionTitle>
        <Row gutter={[12, 12]}>
          {/* Alertas */}
          <Col xs={24} lg={12}>
            <Card
              style={cardStyle}
              styles={{ ...cardHeaderStyles, body: { padding: '12px 16px' } }}
              title={
                <Text strong style={{ fontSize: 13 }}>
                  🔔 Pedidos que precisam de atenção
                </Text>
              }
            >
              <Space orientation="vertical" style={{ width: '100%' }}>
                <Alert
                  type="warning"
                  showIcon
                  description="Bolo de Pedro Costa — prazo de confirmação pendente há 2 dias"
                />
                <Alert
                  type="info"
                  showIcon
                  description="3 pedidos para o fim de semana sem confirmação de pagamento"
                />
              </Space>
            </Card>
          </Col>
          {/* Top products */}
          <Col xs={24} lg={12}>
            <Card
              style={cardStyle}
              styles={{ ...cardHeaderStyles, body: { padding: 0 } }}
              title={
                <Text strong style={{ fontSize: 13 }}>
                  🏆 Produtos mais pedidos — mês
                </Text>
              }
            >
              <Table<TopProducts>
                rowKey={'id'}
                loading={topProductsSummary.isLoading}
                dataSource={topProductsSummary.data || []}
                columns={productColumns}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>

        {/* Faturamento mensal */}
        <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
          <Col xs={24}>
            <Card
              style={cardStyle}
              styles={{ ...cardHeaderStyles, body: { padding: '12px 16px' } }}
              title={
                <Text strong style={{ fontSize: 13 }}>
                  📈 Faturamento — últimos 6 meses
                </Text>
              }
            >
              <Spin spinning={latestMonthsRevenueSummary.isLoading} fullscreen={false}>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={latestMonthsRevenueSummary.data} dataKey={'revenue'}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.primary} stopOpacity={0.18} />
                        <stop offset="95%" stopColor={C.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f0f0f0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="monthYear"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="revenue"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`}
                    />
                    <RTooltip content={<CustomTooltip prefix="R$ " />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Faturamento"
                      stroke={C.primary}
                      strokeWidth={2.5}
                      fill="url(#revGrad)"
                      dot={{ r: 4, fill: C.primary }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Spin>
            </Card>
          </Col>
        </Row>

        {/* ── Agenda & Planejamento ── */}
        <SectionTitle icon={<CalendarOutlined />}>Agenda & Planejamento</SectionTitle>
        <Row gutter={[12, 12]}>
          {/* Agenda do dia */}
          <Col xs={24} lg={12}>
            <Card
              style={cardStyle}
              title={
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text strong style={{ fontSize: 13 }}>
                    📅 Entregas do dia
                  </Text>
                  <Segmented
                    size="small"
                    options={['Todos', 'Entrega', 'Retirada']}
                    value={agendaFilter}
                    onChange={(v) =>
                      setAgendaFilter(v as 'Todos' | 'Entrega' | 'Retirada')
                    }
                  />
                </div>
              }
              styles={{ ...cardHeaderStyles, body: { padding: '0 16px' } }}
            >
              <List<DeliveryToday>
                dataSource={filteredAgenda}
                renderItem={(item) => (
                  <List.Item
                    className="delivery-today-item"
                    style={{
                      padding: '10px 12px',
                      borderRadius: 12,
                      marginBottom: 4,
                    }}
                    onClick={() => handleOpenOrder(item)}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        width: '100%',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: '#aaa',
                          minWidth: 40,
                          paddingTop: 2,
                        }}
                      >
                        {item.time}
                      </Text>

                      <Avatar
                        size={32}
                        style={{
                          background:
                            item.deliveryType === 'delivery'
                              ? `${C.primary}22`
                              : `${C.pickup}22`,
                          color: item.deliveryType === 'delivery' ? C.primary : C.pickup,
                          fontSize: 13,
                          flexShrink: 0,
                        }}
                      >
                        {item.deliveryType === 'delivery' ? '🚗' : '🏪'}
                      </Avatar>

                      <div style={{ flex: 1 }}>
                        <Text
                          strong
                          style={{
                            fontSize: 13,
                            display: 'block',
                          }}
                        >
                          {item.customerName}
                        </Text>

                        <Text
                          style={{
                            fontSize: 12,
                            color: '#888',
                          }}
                        >
                          {item.productLabel}
                        </Text>
                      </div>

                      <StatusTag status={item.status} />
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* Antecedência mínima */}
          <Col xs={24} lg={12}>
            <Card
              style={cardStyle}
              styles={{ ...cardHeaderStyles, body: { padding: '12px 16px' } }}
              title={
                <Text strong style={{ fontSize: 13 }}>
                  ⏰ Antecedência mínima por produto (horas)
                </Text>
              }
            >
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={leadTimes} layout="vertical" barCategoryGap="25%">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0f0f0"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `${v}h`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={140}
                  />
                  <RTooltip
                    formatter={(v: ValueType | undefined) =>
                      v != null ? [`${v}h`, 'Antecedência'] : []
                    }
                  />
                  <Bar
                    dataKey="horas"
                    name="Antecedência"
                    fill={C.primary}
                    radius={[0, 4, 4, 0]}
                  >
                    {leadTimes.map((_, i) => (
                      <Cell
                        key={i}
                        fill={i < 2 ? C.primary : i < 4 ? C.primaryLight : '#f5c8bf'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* ── Alertas & Fluxo ── */}
        <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
          {/* Alertas */}
          {/* <Col xs={24} lg={12}>
            <Card
              style={cardStyle}
              styles={{ ...cardHeaderStyles, body: { padding: '12px 16px' } }}
              title={
                <Text strong style={{ fontSize: 13 }}>
                  🔔 Pedidos que precisam de atenção
                </Text>
              }
            >
              <Space orientation="vertical" style={{ width: '100%' }}>
                <Alert
                  type="warning"
                  showIcon
                  description="Bolo de Pedro Costa — prazo de confirmação pendente há 2 dias"
                />
                <Alert
                  type="info"
                  showIcon
                  description="3 pedidos para o fim de semana sem confirmação de pagamento"
                />
                <Alert
                  type="warning"
                  showIcon
                  description="Semana que vem: 7 entregas previstas — capacidade de forno pode ser excedida"
                />
              </Space>
            </Card>
          </Col> */}

          {/* Fluxo do processo */}
          {/* <Col xs={24} lg={12}>
            <Card
              style={cardStyle}
              styles={{ ...cardHeaderStyles, body: { padding: '12px 16px' } }}
              title={
                <Text strong style={{ fontSize: 13 }}>
                  🔄 Fluxo do processo & ponto de não-retorno
                </Text>
              }
            >
              {flowSteps.map((s, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: s.pnr ? C.cancelled : C.primary,
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      {s.num}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Text strong style={{ fontSize: 13 }}>
                          {s.title}
                        </Text>
                        {s.pnr && (
                          <Tag color="red" style={{ fontSize: 10, margin: 0 }}>
                            ponto de não-retorno
                          </Tag>
                        )}
                      </div>
                      <Text style={{ fontSize: 12, color: '#888' }}>{s.desc}</Text>
                    </div>
                  </div>
                  {i < flowSteps.length - 1 && (
                    <div
                      style={{
                        marginLeft: 11,
                        height: 10,
                        borderLeft: `2px dashed ${i === 3 ? C.cancelled : '#e8e8e8'}`,
                      }}
                    />
                  )}
                </div>
              ))}
            </Card>
          </Col> */}
        </Row>
      </Content>
    </Layout>
  );
}
