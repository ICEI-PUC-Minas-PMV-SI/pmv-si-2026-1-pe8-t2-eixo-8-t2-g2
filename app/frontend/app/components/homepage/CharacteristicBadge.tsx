import { Tag } from 'antd';
import type { PublicCharacteristic } from '~/@types/characteristic';

export function CharacteristicBadge({ char }: { char: PublicCharacteristic }) {
  return (
    <Tag
      key={char.id}
      style={{
        background: 'rgba(224,109,91,0.08)',
        color: '#C05A48',
        border: '1px solid rgba(192,90,72,0.2)',
        borderRadius: 12,
        fontSize: 11,
        padding: '1px 8px',
        lineHeight: '20px',
      }}
    >
      {char.name}
    </Tag>
  );
}
