import { Card, Col, Row, Space, Spin } from 'antd';
import { SectionTitle } from './SectionTitle';
import { BarChartOutlined } from '@ant-design/icons';
import Text from 'antd/es/typography/Text';
import { Colors } from '~/constants/Colors';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  Cell,
} from 'recharts';
import DashboardController from '~/controllers/DashboardController';
import { useQuery } from '@tanstack/react-query';
import { CustomTooltip } from './CustomTooltip';
import type { ValueType } from 'recharts/types/component/DefaultTooltipContent';
const cardStyle: React.CSSProperties = {
  borderRadius: 12,
  border: '1px solid #f0f0f0',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
};
const cardHeaderStyles = {
  header: { borderBottom: '1px solid #f5f5f5', padding: '12px 16px' },
};

export function DemandLatestMonths() {
  const latestMonthsSummary = useQuery({
    queryKey: ['latest-months-summary'],
    queryFn: () => {
      return DashboardController.latestMonths();
    },
    staleTime: 0,
  });
  return (
    <>
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
                    background: Colors.primary,
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
                    background: Colors.primaryLight,
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
                    fill={Colors.primary}
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="pendentes"
                    name="Pendentes"
                    stackId="a"
                    fill={Colors.primaryLight}
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
                      data={DashboardController.getStatusPercent(
                        latestMonthsSummary.data?.statusPercent || null,
                      )}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={72}
                      paddingAngle={2}
                    >
                      {DashboardController.getStatusPercent(
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
                {DashboardController.getStatusPercent(
                  latestMonthsSummary.data?.statusPercent || null,
                ).map((s, i) => (
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
            <Spin spinning={latestMonthsSummary.isLoading} fullscreen={false}>
              <ResponsiveContainer width="100%" height={100}>
                <PieChart>
                  <Pie
                    data={DashboardController.getMonthSummaryDelivery(
                      latestMonthsSummary.data?.months || [],
                    )}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={44}
                    paddingAngle={2}
                  >
                    {DashboardController.getMonthSummaryDelivery(
                      latestMonthsSummary.data?.months || [],
                    ).map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <RTooltip
                    formatter={(v: ValueType | undefined) => (v != null ? [`${v}%`] : [])}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Spin>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              {DashboardController.getMonthSummaryDelivery(
                latestMonthsSummary.data?.months || [],
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
                    data={DashboardController.getMonthsSummaryPayment(
                      latestMonthsSummary.data?.summary.paymentMethod,
                    )}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={44}
                    paddingAngle={2}
                  >
                    {DashboardController.getMonthsSummaryPayment(
                      latestMonthsSummary.data?.summary.paymentMethod,
                    ).map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <RTooltip
                    formatter={(v: ValueType | undefined) => (v != null ? [`${v}%`] : [])}
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
              {DashboardController.getMonthsSummaryPayment(
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
    </>
  );
}
