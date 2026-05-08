import { Card, Col, Layout, Row, Statistic, Typography } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { use, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { useNavigation } from '~/hooks/useNavigation';
import Request from '~/utils/Request';

const { Title } = Typography;

// 🔹 Dados fake (depois você conecta API)
const revenueData = [
  { day: 'Seg', value: 120 },
  { day: 'Ter', value: 200 },
  { day: 'Qua', value: 150 },
  { day: 'Qui', value: 278 },
  { day: 'Sex', value: 350 },
  { day: 'Sáb', value: 500 },
  { day: 'Dom', value: 420 },
];

const ordersStatus = [
  { name: 'Concluídos', value: 18 },
  { name: 'Pendentes', value: 7 },
  { name: 'Cancelados', value: 3 },
];

const topProducts = [
  { name: 'Bolo de Chocolate', value: 12 },
  { name: 'Brigadeiro', value: 20 },
  { name: 'Cupcake', value: 15 },
];

const COLORS = ['#52c41a', '#faad14', '#ff4d4f'];

export function DashboardPage() {
  const { goToLogin } = useNavigation();
  useEffect(() => {
    Request.post('/auth/validate').catch(goToLogin);
  }, []);
  return (
    <Layout>
      <Content>
        <Title level={3}>Dashboard</Title>

        {/* KPIs */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic title="Faturamento (Hoje)" value={350} prefix="R$" />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic title="Pedidos" value={25} />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic title="Ticket Médio" value={14} prefix="R$" />
            </Card>
          </Col>
        </Row>

        {/* Gráficos */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {/* Faturamento */}
          <Col xs={24} md={16}>
            <Card title="Faturamento (últimos 7 dias)">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#1677ff" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Status */}
          <Col xs={24} md={8}>
            <Card title="Pedidos por status">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ordersStatus}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                  >
                    {ordersStatus.map((_, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Produtos */}
          <Col xs={24}>
            <Card title="Produtos mais vendidos">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#722ed1" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
