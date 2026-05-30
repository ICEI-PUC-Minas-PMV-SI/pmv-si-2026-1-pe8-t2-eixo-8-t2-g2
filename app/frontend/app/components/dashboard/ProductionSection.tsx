import { Alert, Badge, Button, Card, Col, Progress, Row, Space, Table } from 'antd';
import { SectionTitle } from './SectionTitle';
import { ToolOutlined } from '@ant-design/icons';
import Text from 'antd/es/typography/Text';
import { useQuery } from '@tanstack/react-query';
import DashboardController, {
  type DashboardAlert,
  type TopProducts,
} from '~/controllers/DashboardController';
import { useState } from 'react';
import { Colors } from '~/constants/Colors';
import type { ColumnsType } from 'antd/es/table';
const cardStyle: React.CSSProperties = {
  borderRadius: 12,
  border: '1px solid #f0f0f0',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
};
const cardHeaderStyles = {
  header: { borderBottom: '1px solid #f5f5f5', padding: '12px 16px' },
};

type ComponentProps = {
  onClick: (alert: DashboardAlert) => void;
};
export function ProductionSection({ onClick }: ComponentProps) {
  const topProductsSummary = useQuery({
    queryKey: ['top-products-summary'],
    queryFn: () => {
      return DashboardController.topProducts();
    },
    staleTime: 0,
  });
  const dashboardAlerts = useQuery({
    queryKey: ['dashboard-alerts'],
    queryFn: () => {
      return DashboardController.dashboardAlerts();
    },
    staleTime: 0,
  });
  const alerts = DashboardController.getAlertComponentData(dashboardAlerts.data || null);
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
        <Progress
          percent={v}
          size="small"
          strokeColor={Colors.primary}
          showInfo={false}
        />
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
    <>
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
              {alerts.map((alert) => (
                <Alert
                  key={alert.id}
                  type={alert.type}
                  showIcon
                  title={alert.title}
                  description={alert.description}
                  action={
                    <Badge count={alert.orders.length}>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => {
                          onClick(alert);
                        }}
                      >
                        Ver detalhes
                      </Button>
                    </Badge>
                  }
                />
              ))}
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
    </>
  );
}
