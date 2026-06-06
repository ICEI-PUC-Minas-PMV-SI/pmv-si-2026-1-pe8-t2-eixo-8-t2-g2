import { useState } from 'react';
import { Layout, Card, Row, Col, Typography, Space, Spin } from 'antd';
import {
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import DashboardController from '~/controllers/DashboardController';
import type { Scheduler } from '~/@types/scheduler';
import { SchedulerPreviewModal } from '../scheduler/SchedulerPreviewModal';
import { KpiSection } from './KpiSection';
import { CustomTooltip } from './CustomTooltip';
import { DemandLatestMonths } from './DemandLatestMonths';
import { AlertModal } from './AlertModal';
import { ProductionSection } from './ProductionSection';
import { Planning } from './Planning';
import { Colors } from '~/constants/Colors';

const { Content } = Layout;
const { Text } = Typography;

interface DashboardAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  orders: any[];
}

const cardStyle: React.CSSProperties = {
  borderRadius: 12,
  border: '1px solid #f0f0f0',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
};

const cardHeaderStyles = {
  header: { borderBottom: '1px solid #f5f5f5', padding: '12px 16px' },
};

export function DashboardPage() {
  const [alertState, setAlertState] = useState({
    isOpened: false as boolean,
    alert: null as DashboardAlert | null,
  });
  const [schedulerPreviewState, setSchedulerPreviewState] = useState<{
    isOpened: boolean;
    order: Scheduler | null;
  }>({ isOpened: false, order: null });
  const staleTime = 0; // 60*60*1000;

  const latestMonthsRevenueSummary = useQuery({
    queryKey: ['latest-months-revenue-summary'],
    queryFn: () => {
      return DashboardController.latestMonthsRevenue();
    },
    staleTime,
  });

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%', padding: 16 }}>
      <Layout style={{ background: '#f8f8f7', minHeight: '100vh' }}>
        <SchedulerPreviewModal
          open={schedulerPreviewState.isOpened}
          onClose={() => setSchedulerPreviewState({ isOpened: false, order: null })}
          order={schedulerPreviewState.order}
        />
        <AlertModal
          isOpened={alertState.isOpened}
          alert={alertState.alert}
          onClose={() => {
            setAlertState({
              isOpened: false,
              alert: null,
            });
          }}
        />
        <Content
          style={{
            margin: '0 auto',
            width: '100%',
          }}
        >
          {/* ── KPIs ── */}
          <KpiSection />

          {/* ── Demanda ── */}
          <DemandLatestMonths />

          {/* ── Produtos & Produção ── */}
          <ProductionSection
            onClick={(alert) => setAlertState({ isOpened: true, alert })}
          />

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
                          <stop
                            offset="5%"
                            stopColor={Colors.primary}
                            stopOpacity={0.18}
                          />
                          <stop offset="95%" stopColor={Colors.primary} stopOpacity={0} />
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
                        stroke={Colors.primary}
                        strokeWidth={2.5}
                        fill="url(#revGrad)"
                        dot={{ r: 4, fill: Colors.primary }}
                        activeDot={{ r: 6 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Spin>
              </Card>
            </Col>
          </Row>

          <Planning
            onClick={(order) =>
              setSchedulerPreviewState({
                isOpened: true,
                order,
              })
            }
          />
        </Content>
      </Layout>
    </Space>
  );
}
