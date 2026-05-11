// AgendamentosResumo.tsx
import { Card, Col, Row, Tooltip, Typography } from 'antd';

const { Text } = Typography;

interface StatusConfig {
  label: string;
  value: number;
  color: string;
  bg: string;
}

type ComponentProps = {
  stats: {
    total: number;
    status: StatusConfig[];
  };
};

export function SchedulerSummary({ stats }: ComponentProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      {/* Cards de status */}
      <Row gutter={[12, 12]}>
        {/* Card total */}
        <Col xs={12} sm={12} md={4}>
          <Card
            size="small"
            style={{ borderRadius: 12 }}
            styles={{ body: { padding: '14px 16px' } }}
          >
            <Text
              type="secondary"
              style={{ fontSize: 12, display: 'block', marginBottom: 4 }}
            >
              Total
            </Text>
            <div style={{ fontSize: 26, fontWeight: 500, lineHeight: 1 }}>
              {stats.total}
            </div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              pedidos exibidos
            </Text>
          </Card>
        </Col>

        {/* Cards por status */}
        {stats.status.map(({ label, value, color }) => {
          const pct = Math.round((value / stats.total) * 100);
          return (
            <Col xs={12} sm={12} md={5} key={label}>
              <Card
                size="small"
                style={{ borderRadius: 12, borderTop: `3px solid ${color}` }}
                styles={{ body: { padding: '14px 16px' } }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    display: 'block',
                    marginBottom: 4,
                    color: '#888',
                  }}
                >
                  {label}
                </Text>
                <div style={{ fontSize: 26, fontWeight: 500, lineHeight: 1, color }}>
                  {value}
                </div>
                <Text style={{ fontSize: 11, fontWeight: 500, color }}>{pct}%</Text>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Barra de distribuição */}
      <div style={{ marginTop: 16 }}>
        <div
          style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}
        >
          <Text type="secondary" style={{ fontSize: 12 }}>
            Distribuição por status
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {stats.total} pedidos exibidos
          </Text>
        </div>

        {/* Barra segmentada */}
        <div
          style={{
            display: 'flex',
            height: 10,
            borderRadius: 20,
            overflow: 'hidden',
            gap: 2,
          }}
        >
          {stats.status.map(({ label, value, color }) => {
            const pct = (value / stats.total) * 100;
            return (
              <Tooltip key={label} title={`${label}: ${value} (${Math.round(pct)}%)`}>
                <div
                  style={{
                    width: `${pct}%`,
                    background: color,
                    borderRadius: 20,
                    transition: 'width 0.3s',
                    cursor: 'default',
                  }}
                />
              </Tooltip>
            );
          })}
        </div>

        {/* Legenda */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 10 }}>
          {stats.status.map(({ label, value, color, bg }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: color,
                  flexShrink: 0,
                }}
              />
              <Text style={{ fontSize: 12, color: '#888' }}>{label}</Text>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  background: bg,
                  color,
                  borderRadius: 4,
                  padding: '1px 6px',
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
