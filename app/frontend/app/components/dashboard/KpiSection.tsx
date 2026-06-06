import { Col, Row } from 'antd';
import { KpiCard } from './KpiCard';
import { SectionTitle } from './SectionTitle';
import {
  BarChartOutlined,
  ShoppingOutlined,
  DollarOutlined,
  RiseOutlined,
  FireOutlined,
  CarOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import DashboardController from '~/controllers/DashboardController';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '~/constants/Colors';
export function KpiSection() {
  const staleTime = 0; // 60*60*1000;
  const todaySummary = useQuery({
    queryKey: ['today-summary'],
    queryFn: () => {
      return DashboardController.todaySummary();
    },
    staleTime,
  });
  return (
    <>
      <SectionTitle icon={<BarChartOutlined />}>Visão Geral — Hoje</SectionTitle>
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <KpiCard
            loading={todaySummary.isLoading}
            title="Pedidos hoje"
            value={todaySummary.data?.created || 0}
            icon={<ShoppingOutlined />}
            trend={2}
            trendLabel={DashboardController.getTodayOrdersLabel(todaySummary.data)}
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
            icon={<FireOutlined />}
            color={Colors.progress}
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
            color={Colors.cancelled}
          />
        </Col>
      </Row>
    </>
  );
}
