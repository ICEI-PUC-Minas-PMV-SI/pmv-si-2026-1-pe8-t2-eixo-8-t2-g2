import { Avatar, Card, Col, List, Row, Segmented } from 'antd';
import { SectionTitle } from './SectionTitle';
import { CalendarOutlined } from '@ant-design/icons';
import Text from 'antd/es/typography/Text';
import { Colors } from '~/constants/Colors';
import { StatusTag } from './StatusTag';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
} from 'recharts';
import type { DeliveryType, Scheduler, SchedulerStatus } from '~/@types/scheduler';
import { useState } from 'react';
import DashboardController from '~/controllers/DashboardController';
import { useQuery } from '@tanstack/react-query';
import SchedulerController from '~/controllers/SchedulerController';
import type { ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { Duration } from '~/utils/Duration';

const cardStyle: React.CSSProperties = {
  borderRadius: 12,
  border: '1px solid #f0f0f0',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
};
const cardHeaderStyles = {
  header: { borderBottom: '1px solid #f5f5f5', padding: '12px 16px' },
};

export type DeliveryToday = {
  id: string;
  time: string;
  customerName: string;
  productLabel: string;
  deliveryType: DeliveryType;
  status: SchedulerStatus;
};

type ComponentProps = {
  onClick: (order: Scheduler) => void;
};

export function Planning({ onClick }: ComponentProps) {
  const [agendaFilter, setAgendaFilter] = useState<'Todos' | 'Entrega' | 'Retirada'>(
    'Todos',
  );
  const deliveriesToday = useQuery({
    queryKey: ['deliveries-today'],
    queryFn: () => {
      return DashboardController.deliveriesToday();
    },
    staleTime: 0,
  });
  const bookingLeadTime = useQuery({
    queryKey: ['dashboard-booking-lead-time'],
    queryFn: () => {
      return DashboardController.bookingLeadTime().then((result) => {
        return result.map((product) => {
          return {
            name: product.name,
            horas: Duration.minutesToHours(product.bookingLeadMinutes),
          };
        });
      });
    },
    staleTime: 0,
  });
  const filteredAgenda: DeliveryToday[] =
    agendaFilter === 'Todos'
      ? DashboardController.getDeliveriesToday(deliveriesToday.data || [])
      : agendaFilter === 'Entrega'
        ? DashboardController.getDeliveriesToday(deliveriesToday.data || []).filter(
            (a) => a.deliveryType === 'delivery',
          )
        : DashboardController.getDeliveriesToday(deliveriesToday.data || []).filter(
            (a) => a.deliveryType === 'pickup',
          );
  const handleOpenOrder = async (item: DeliveryToday) => {
    const order = await SchedulerController.getById(item.id);
    onClick(order);
  };
  return (
    <>
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
                  onChange={(v) => setAgendaFilter(v as 'Todos' | 'Entrega' | 'Retirada')}
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
                            ? `${Colors.primary}22`
                            : `${Colors.pickup}22`,
                        color:
                          item.deliveryType === 'delivery'
                            ? Colors.primary
                            : Colors.pickup,
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
              <BarChart
                data={bookingLeadTime.data}
                layout="vertical"
                barCategoryGap="25%"
              >
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
                  fill={Colors.primary}
                  radius={[0, 4, 4, 0]}
                >
                  {bookingLeadTime.data?.map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        i < 2 ? Colors.primary : i < 4 ? Colors.primaryLight : '#f5c8bf'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </>
  );
}
