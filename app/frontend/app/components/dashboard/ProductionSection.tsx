import { Badge, Button, Card, Col, Progress, Row, Space, Table, Typography } from 'antd';
import { SectionTitle } from './SectionTitle';
import {
  ToolOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import Text from 'antd/es/typography/Text';
import { useQuery } from '@tanstack/react-query';
import DashboardController, {
  type DashboardAlert,
  type TopProducts,
} from '~/controllers/DashboardController';
import { Colors } from '~/constants/Colors';
import type { ColumnsType } from 'antd/es/table';

// ─── Estilos compartilhados ───────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  borderRadius: 12,
  border: '1px solid #f0f0f0',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  height: '100%',
};

const cardHeaderStyles = {
  header: { borderBottom: '1px solid #f5f5f5', padding: '12px 16px' },
};

// ─── Configuração visual por tipo de alerta ───────────────────────────────────

const ALERT_CONFIG = {
  error: {
    bg: '#FFF1F0',
    border: '#FFCCC7',
    iconBg: '#FF4D4F',
    icon: <ExclamationCircleOutlined style={{ color: '#fff', fontSize: 14 }} />,
    labelColor: '#CF1322',
    badgeColor: '#FF4D4F',
  },
  warning: {
    bg: '#FFFBE6',
    border: '#FFE58F',
    iconBg: '#FAAD14',
    icon: <WarningOutlined style={{ color: '#fff', fontSize: 14 }} />,
    labelColor: '#AD6800',
    badgeColor: '#FAAD14',
  },
  info: {
    bg: '#E6F4FF',
    border: '#91CAFF',
    iconBg: '#1677FF',
    icon: <InfoCircleOutlined style={{ color: '#fff', fontSize: 14 }} />,
    labelColor: '#0958D9',
    badgeColor: '#1677FF',
  },
} as const;

// ─── AlertCard ────────────────────────────────────────────────────────────────

function AlertCard({
  alert,
  onClick,
}: {
  alert: DashboardAlert;
  onClick: (alert: DashboardAlert) => void;
}) {
  const cfg = ALERT_CONFIG[alert.type as keyof typeof ALERT_CONFIG] ?? ALERT_CONFIG.info;

  return (
    <div
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: 10,
        padding: '14px 16px',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        transition: 'box-shadow 0.15s',
        cursor: 'pointer',
      }}
      onClick={() => onClick(alert)}
    >
      {/* Ícone */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: cfg.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        {cfg.icon}
      </div>

      {/* Texto */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Typography.Text
          strong
          style={{
            fontSize: 13,
            color: cfg.labelColor,
            display: 'block',
            marginBottom: 2,
          }}
        >
          {alert.title}
        </Typography.Text>
        <Typography.Text style={{ fontSize: 12, color: '#595959', lineHeight: 1.5 }}>
          {alert.description}
        </Typography.Text>
      </div>

      {/* Ação */}
      <Badge count={alert.orders.length} style={{ backgroundColor: cfg.badgeColor }}>
        <Button
          type="text"
          size="small"
          icon={<ArrowRightOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onClick(alert);
          }}
          style={{
            color: cfg.labelColor,
            fontSize: 12,
            fontWeight: 500,
            padding: '0 6px',
            height: 28,
            borderRadius: 6,
            border: `1px solid ${cfg.border}`,
            background: 'rgba(255,255,255,0.6)',
          }}
        >
          Ver
        </Button>
      </Badge>
    </div>
  );
}

// ─── EmptyAlerts ──────────────────────────────────────────────────────────────

function EmptyAlerts() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        gap: 10,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: '#F6FFED',
          border: '1.5px solid #B7EB8F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CheckCircleOutlined style={{ fontSize: 22, color: '#52C41A' }} />
      </div>
      <Typography.Text strong style={{ fontSize: 14, color: '#262626' }}>
        Tudo em dia!
      </Typography.Text>
      <Typography.Text
        style={{ fontSize: 13, color: '#8C8C8C', textAlign: 'center', maxWidth: 220 }}
      >
        Nenhum pedido requer atenção no momento.
      </Typography.Text>
    </div>
  );
}

// ─── Colunas da tabela ────────────────────────────────────────────────────────

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
      <Progress percent={v} size="small" strokeColor={Colors.primary} showInfo={false} />
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

// ─── ProductionSection ────────────────────────────────────────────────────────

type ComponentProps = {
  onClick: (alert: DashboardAlert) => void;
};

export function ProductionSection({ onClick }: ComponentProps) {
  const topProductsSummary = useQuery({
    queryKey: ['top-products-summary'],
    queryFn: () => DashboardController.topProducts(),
    staleTime: 0,
  });

  const dashboardAlerts = useQuery({
    queryKey: ['dashboard-alerts'],
    queryFn: () => DashboardController.dashboardAlerts(),
    staleTime: 0,
  });

  const alerts = DashboardController.getAlertComponentData(dashboardAlerts.data || null);

  return (
    <>
      <SectionTitle icon={<ToolOutlined />}>Produtos & Produção</SectionTitle>

      <Row gutter={[12, 12]}>
        {/* Alertas */}
        <Col xs={24} lg={12}>
          <Card
            style={cardStyle}
            styles={{ ...cardHeaderStyles, body: { padding: '12px 16px' } }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClockCircleOutlined style={{ color: '#FAAD14', fontSize: 14 }} />
                <Text strong style={{ fontSize: 13 }}>
                  Pedidos que precisam de atenção
                </Text>
                {alerts.length > 0 && (
                  <Badge
                    count={alerts.reduce((acc, a) => acc + a.orders.length, 0)}
                    style={{ backgroundColor: '#FF4D4F', marginLeft: 2 }}
                  />
                )}
              </div>
            }
          >
            {alerts.length === 0 ? (
              <EmptyAlerts />
            ) : (
              <Space orientation="vertical" size={8} style={{ width: '100%' }}>
                {alerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} onClick={onClick} />
                ))}
              </Space>
            )}
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
              rowKey="id"
              loading={topProductsSummary.isLoading}
              dataSource={topProductsSummary.data || []}
              columns={productColumns}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}
