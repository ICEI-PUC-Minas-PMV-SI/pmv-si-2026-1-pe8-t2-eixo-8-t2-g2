import type {
  NameType,
  ValueType,
  Payload,
} from 'recharts/types/component/DefaultTooltipContent';
import type { TooltipProps } from 'recharts';
import Text from 'antd/es/typography/Text';

type CustomTooltipProps = TooltipProps<ValueType, NameType> & {
  prefix?: string;
  suffix?: string;
  payload?: Payload<ValueType, NameType>[];
  label?: string | number;
};

export function CustomTooltip(props: CustomTooltipProps) {
  const { active, payload, label, prefix = '', suffix = '' } = props;
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #f0f0f0',
        borderRadius: 8,
        padding: '8px 14px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}
    >
      <Text style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>
        {String(label)}
      </Text>
      {payload.map((p: Payload<ValueType, NameType>, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: (p.color ?? p.fill) as string,
            }}
          />
          <Text style={{ fontSize: 13 }}>
            {p.name}:{' '}
            <strong>
              {prefix}
              {typeof p.value === 'number' ? p.value.toLocaleString('pt-BR') : p.value}
              {suffix}
            </strong>
          </Text>
        </div>
      ))}
    </div>
  );
}
