import { Card, Statistic } from 'antd';
import Text from 'antd/es/typography/Text';
import { RiseOutlined, FallOutlined } from '@ant-design/icons';
import { Colors } from '~/constants/Colors';
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

const cardStyle: React.CSSProperties = {
  borderRadius: 12,
  border: '1px solid #f0f0f0',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
};

export function KpiCard({
  title,
  value,
  prefix,
  suffix,
  trend,
  trendLabel,
  icon,
  loading = false,
  color = Colors.primary,
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
          {/* {trend !== undefined && trendLabel && (
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
          )} */}
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
