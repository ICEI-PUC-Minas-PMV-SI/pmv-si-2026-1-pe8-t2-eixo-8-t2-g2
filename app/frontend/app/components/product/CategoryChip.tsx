import { Tag, Tooltip } from 'antd';
import type { ProductCategory } from '~/@types/product';

export function CategoryChip({ category }: { category: ProductCategory }) {
  return (
    <Tooltip title={category.name}>
      <Tag
        style={{
          cursor: 'default',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <span>{category.name}</span>
      </Tag>
    </Tooltip>
  );
}
