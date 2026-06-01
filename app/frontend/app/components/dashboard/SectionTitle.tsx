import Text from 'antd/es/typography/Text';
import { Colors } from '~/constants/Colors';

export function SectionTitle({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0' }}>
      <span style={{ color: Colors.primary, fontSize: 18 }}>{icon}</span>
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
