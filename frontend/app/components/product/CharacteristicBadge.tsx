import { Tag, Tooltip } from 'antd';
import type { ProductCharacteristic } from '~/@types/product';

export function CharacteristicBadge({
  characteristic,
}: {
  characteristic: ProductCharacteristic;
}) {
  return (
    /** Característica com ícone/imagem em tooltip */
    <Tooltip title={characteristic.name}>
      <Tag
        style={{
          cursor: 'default',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {characteristic.iconUrl ? (
          <img
            src={characteristic.iconUrl}
            alt={characteristic.name}
            style={{ width: 14, height: 14, objectFit: 'contain', borderRadius: 2 }}
          />
        ) : (
          <span style={{ fontSize: 10 }}>✦</span>
        )}
        <span>{characteristic.name}</span>
      </Tag>
    </Tooltip>
  );
}
