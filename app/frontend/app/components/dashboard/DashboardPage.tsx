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
  BellOutlined,
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

const { Content } = Layout;
const { Title, Text } = Typography;

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
type DeliveryType = 'pickup' | 'delivery';

interface AgendaItem {
  time: string;
  name: string;
  product: string;
  status: SchedulerStatus;
  type: DeliveryType;
}

interface ProductRow {
  key: number;
  name: string;
  orders: number;
  revenue: number;
  pct: number;
}

interface FlowStep {
  num: number;
  title: string;
  desc: string;
  pnr: boolean;
}

// ─── Data ────────────────────────────────────────────────────────────────────
const weeklyData = [
  { label: 'Sem 1', confirmados: 18, pendentes: 4 },
  { label: 'Sem 2', confirmados: 22, pendentes: 3 },
  { label: 'Sem 3', confirmados: 17, pendentes: 5 },
  { label: 'Sem 4', confirmados: 28, pendentes: 2 },
  { label: 'Sem 5', confirmados: 24, pendentes: 4 },
  { label: 'Sem 6', confirmados: 31, pendentes: 3 },
  { label: 'Sem 7', confirmados: 26, pendentes: 5 },
  { label: 'Sem 8', confirmados: 33, pendentes: 2 },
];

const monthlyData = [
  { label: 'Nov', confirmados: 72, pendentes: 12 },
  { label: 'Dez', confirmados: 68, pendentes: 9 },
  { label: 'Jan', confirmados: 83, pendentes: 14 },
  { label: 'Fev', confirmados: 90, pendentes: 11 },
  { label: 'Mar', confirmados: 78, pendentes: 13 },
  { label: 'Abr', confirmados: 97, pendentes: 8 },
];

const revenueData = [
  { label: 'Nov', value: 8200 },
  { label: 'Dez', value: 14800 },
  { label: 'Jan', value: 7400 },
  { label: 'Fev', value: 9600 },
  { label: 'Mar', value: 11200 },
  { label: 'Abr', value: 13500 },
];

const statusData = [
  { name: 'Pendente', value: 22, color: C.pending },
  { name: 'Confirmado', value: 38, color: C.confirmed },
  { name: 'Em produção', value: 18, color: C.progress },
  { name: 'Concluído', value: 17, color: C.completed },
  { name: 'Cancelado', value: 5, color: C.cancelled },
];

const deliveryData = [
  { name: 'Entrega', value: 61, color: C.primary },
  { name: 'Retirada', value: 39, color: C.pickup },
];

const paymentData = [
  { name: 'Pix', value: 48, color: C.confirmed },
  { name: 'Cartão', value: 31, color: C.card },
  { name: 'Dinheiro', value: 13, color: C.cash },
  { name: 'Transferência', value: 8, color: C.transfer },
];

const topProducts: ProductRow[] = [
  { key: 1, name: 'Bolo de Chocolate Decorado', orders: 34, revenue: 5780, pct: 100 },
  { key: 2, name: 'Brigadeiro Gourmet (cx 30)', orders: 28, revenue: 2240, pct: 82 },
  { key: 3, name: 'Torta de Morango', orders: 19, revenue: 3610, pct: 56 },
  { key: 4, name: 'Cupcake Personalizado', orders: 17, revenue: 1020, pct: 50 },
  { key: 5, name: 'Bolo no Pote (6un)', orders: 14, revenue: 840, pct: 41 },
  { key: 6, name: 'Naked Cake', orders: 9, revenue: 2700, pct: 26 },
];

const prodTimes = [
  { name: 'Bolo decorado', min: 180, pct: 75 },
  { name: 'Naked cake', min: 150, pct: 63 },
  { name: 'Torta', min: 120, pct: 50 },
  { name: 'Cupcake personalizado', min: 90, pct: 38 },
  { name: 'Brigadeiro gourmet', min: 60, pct: 25 },
  { name: 'Bolo no pote', min: 45, pct: 19 },
];

const capacidades = [
  { name: 'Horas de produção', pct: 72, warning: false },
  { name: 'Capacidade de forno', pct: 58, warning: false },
  { name: 'Espaço em geladeira', pct: 84, warning: true },
  { name: 'Pedidos vs máximo', pct: 65, warning: false },
];

const leadTimes = [
  { name: 'Bolo decorado', horas: 72 },
  { name: 'Torta', horas: 72 },
  { name: 'Brigadeiro gourmet', horas: 48 },
  { name: 'Cupcake personalizado', horas: 48 },
  { name: 'Bolo no pote', horas: 24 },
  { name: 'Pronta entrega', horas: 0 },
];

const agenda: AgendaItem[] = [
  {
    time: '08:30',
    name: 'Maria Silva',
    product: 'Bolo de Chocolate',
    status: 'confirmed',
    type: 'pickup',
  },
  {
    time: '10:00',
    name: 'João Santos',
    product: 'Torta de Morango + Brigadeiros',
    status: 'in_progress',
    type: 'delivery',
  },
  {
    time: '11:30',
    name: 'Ana Oliveira',
    product: 'Cupcakes (12 un)',
    status: 'confirmed',
    type: 'pickup',
  },
  {
    time: '13:00',
    name: 'Pedro Costa',
    product: 'Bolo Naked Cake',
    status: 'pending',
    type: 'delivery',
  },
  {
    time: '15:00',
    name: 'Carla Mendes',
    product: 'Brigadeiros Gourmet (cx 30)',
    status: 'confirmed',
    type: 'delivery',
  },
  {
    time: '16:30',
    name: 'Lucas Ferreira',
    product: 'Bolo de Aniversário Decorado',
    status: 'in_progress',
    type: 'pickup',
  },
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
}

function KpiCard({
  title,
  value,
  prefix,
  suffix,
  trend,
  trendLabel,
  icon,
  color = C.primary,
}: KpiCardProps) {
  return (
    <Card
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
            valueStyle={{ fontSize: 26, fontWeight: 600, color: '#1a1a1a' }}
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
  const [volPeriod, setVolPeriod] = useState<'Semanal' | 'Mensal'>('Semanal');
  const [agendaFilter, setAgendaFilter] = useState<'Todos' | 'Entrega' | 'Retirada'>(
    'Todos',
  );

  const volData = volPeriod === 'Semanal' ? weeklyData : monthlyData;

  const filteredAgenda: AgendaItem[] =
    agendaFilter === 'Todos'
      ? agenda
      : agendaFilter === 'Entrega'
        ? agenda.filter((a) => a.type === 'delivery')
        : agenda.filter((a) => a.type === 'pickup');

  const productColumns: ColumnsType<ProductRow> = [
    {
      title: 'Produto',
      dataIndex: 'name',
      key: 'name',
      render: (t: string) => <Text style={{ fontSize: 13 }}>{t}</Text>,
    },
    {
      title: 'Pedidos',
      dataIndex: 'orders',
      key: 'orders',
      width: 80,
      render: (v: number) => <Text strong>{v}</Text>,
    },
    {
      title: 'Volume',
      dataIndex: 'pct',
      key: 'pct',
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

  return (
    <Layout style={{ background: '#f8f8f7', minHeight: '100vh' }}>
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
              title="Pedidos hoje"
              value={14}
              icon={<ShoppingOutlined />}
              trend={2}
              trendLabel="↑ 2 vs ontem"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={5}>
            <KpiCard
              title="Faturamento estimado"
              value={2480}
              prefix="R$"
              icon={<DollarOutlined />}
              trend={12}
              trendLabel="↑ 12% vs semana passada"
              color="#389e0d"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <KpiCard
              title="Ticket médio"
              value={177}
              prefix="R$"
              icon={<RiseOutlined />}
              color="#722ed1"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <KpiCard
              title="Em produção"
              value={5}
              suffix=" pedidos"
              icon={<FireOutlined />}
              color={C.progress}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <KpiCard
              title="Entregas hoje"
              value={8}
              icon={<CarOutlined />}
              trend={0}
              trendLabel="3 retirada · 5 entrega"
              color="#fa8c16"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <KpiCard
              title="Cancelamentos"
              value={4.2}
              suffix="%"
              icon={<WarningOutlined />}
              trend={-1}
              trendLabel="↑ 1,1pp vs mês"
              color={C.cancelled}
            />
          </Col>
        </Row>

        {/* ── Demanda ── */}
        <SectionTitle icon={<BarChartOutlined />}>Demanda & Volume</SectionTitle>
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
                  <Segmented
                    size="small"
                    options={['Semanal', 'Mensal']}
                    value={volPeriod}
                    onChange={(v) => setVolPeriod(v as 'Semanal' | 'Mensal')}
                  />
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
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={volData} barCategoryGap="30%">
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
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={72}
                      paddingAngle={2}
                    >
                      {statusData.map((s, i) => (
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

                {/* Legenda */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  {statusData.map((s, i) => (
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
                  ))}
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
              <ResponsiveContainer width="100%" height={100}>
                <PieChart>
                  <Pie
                    data={deliveryData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={44}
                    paddingAngle={2}
                  >
                    {deliveryData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <RTooltip
                    formatter={(v: ValueType | undefined) => (v != null ? [`${v}%`] : [])}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                {deliveryData.map((d, i) => (
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

            <Card
              style={cardStyle}
              styles={{ ...cardHeaderStyles, body: { padding: '8px 16px' } }}
              title={
                <Text strong style={{ fontSize: 13 }}>
                  Pagamento
                </Text>
              }
            >
              <ResponsiveContainer width="100%" height={100}>
                <PieChart>
                  <Pie
                    data={paymentData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={44}
                    paddingAngle={2}
                  >
                    {paymentData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <RTooltip
                    formatter={(v: ValueType | undefined) => (v != null ? [`${v}%`] : [])}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '4px 12px',
                  justifyContent: 'center',
                }}
              >
                {paymentData.map((d, i) => (
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
              <Table<ProductRow>
                dataSource={topProducts}
                columns={productColumns}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>

          {/* Tempo de produção */}
          <Col xs={24} sm={24} lg={12}>
            <Card
              style={cardStyle}
              styles={{ ...cardHeaderStyles, body: { padding: '12px 16px' } }}
              title={
                <Text strong style={{ fontSize: 13 }}>
                  ⏱ Tempo médio de produção
                </Text>
              }
            >
              {prodTimes.map((p, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 3,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: '#666' }}>{p.name}</Text>
                    <Text strong style={{ fontSize: 12 }}>
                      {p.min} min
                    </Text>
                  </div>
                  <Progress
                    percent={p.pct}
                    size="small"
                    strokeColor={C.primary}
                    showInfo={false}
                    trailColor="#f5ece9"
                  />
                </div>
              ))}
            </Card>
          </Col>

          {/* Capacidade produtiva
          <Col xs={24} sm={12} lg={6}>
            <Card
              style={cardStyle}
              styles={{ ...cardHeaderStyles, body: { padding: "12px 16px" } }}
              title={<Text strong style={{ fontSize: 13 }}>🏭 Capacidade produtiva</Text>}
            >
              {capacidades.map((c, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <Text style={{ fontSize: 12, color: "#666" }}>{c.name}</Text>
                    <Text strong style={{ fontSize: 12, color: c.warning ? C.cancelled : "#1a1a1a" }}>
                      {c.warning && <WarningOutlined style={{ marginRight: 4 }} />}
                      {c.pct}%
                    </Text>
                  </div>
                  <Progress
                    percent={c.pct}
                    size="small"
                    strokeColor={c.warning ? C.cancelled : C.primary}
                    showInfo={false}
                    trailColor="#f5ece9"
                  />
                </div>
              ))}
              <Alert
                type="warning"
                showIcon
                description="Geladeira em 84% — evite novos pedidos para esta semana"
                style={{ fontSize: 11, padding: "6px 10px", marginTop: 8 }}
              />
            </Card>
          </Col> */}
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
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={revenueData}>
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
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`}
                  />
                  <RTooltip content={<CustomTooltip prefix="R$ " />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name="Faturamento"
                    stroke={C.primary}
                    strokeWidth={2.5}
                    fill="url(#revGrad)"
                    dot={{ r: 4, fill: C.primary }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
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
              <List<AgendaItem>
                dataSource={filteredAgenda}
                renderItem={(item) => (
                  <List.Item style={{ padding: '10px 0' }}>
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
                            item.type === 'delivery' ? `${C.primary}22` : `${C.pickup}22`,
                          color: item.type === 'delivery' ? C.primary : C.pickup,
                          fontSize: 13,
                          flexShrink: 0,
                        }}
                      >
                        {item.type === 'delivery' ? '🚗' : '🏪'}
                      </Avatar>
                      <div style={{ flex: 1 }}>
                        <Text strong style={{ fontSize: 13, display: 'block' }}>
                          {item.name}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#888' }}>
                          {item.product}
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
                <Alert
                  type="warning"
                  showIcon
                  description="Semana que vem: 7 entregas previstas — capacidade de forno pode ser excedida"
                />
                {/* <Alert type="error"   showIcon description="Geladeira com 84% de capacidade — evite novos pedidos com entrega esta semana" /> */}
              </Space>
            </Card>
          </Col>

          {/* Fluxo do processo */}
          <Col xs={24} lg={12}>
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
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
