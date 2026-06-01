import type { PublicProduct } from '~/@types/product';
import { PictureOutlined } from '@ant-design/icons';
import { Flex, Tag, Typography } from 'antd';
import NumberUtil from '~/utils/NumberUtil';

export function ProductCardPreview({
  imageUrl,
  product,
}: {
  imageUrl: string | null;
  product?: Partial<PublicProduct>;
}) {
  const name = product?.name || 'Nome do produto';
  const price = product?.price ?? 0;
  const categories = (product?.categories as any[]) ?? [];
  const chars = (product?.characteristics as any[]) ?? [];

  return (
    <div
      style={{
        width: 220,
        borderRadius: 10,
        border: '1.5px solid #F0E8E5',
        overflow: 'hidden',
        background: '#fff',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        flexShrink: 0,
      }}
    >
      {/* Cover */}
      <div
        style={{
          height: 150,
          background: '#F5F0EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <PictureOutlined style={{ fontSize: 36, color: '#C4A882' }} />
        )}
      </div>

      {/* Body */}
      <div
        style={{
          padding: '12px 14px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {/* Categorias */}
        {categories.length > 0 && (
          <Flex wrap="wrap" gap={4}>
            {categories.slice(0, 2).map((cat: any, i: number) => (
              <Typography.Text
                key={i}
                style={{
                  fontSize: 10,
                  color: '#C05A48',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {cat?.category?.name ?? cat?.name ?? cat}
              </Typography.Text>
            ))}
          </Flex>
        )}

        {/* Nome */}
        <Typography.Text
          strong
          style={{ fontSize: 13, lineHeight: 1.3, color: '#1A1A1A' }}
          ellipsis={{ tooltip: name }}
        >
          {name}
        </Typography.Text>

        {/* Características */}
        {chars.length > 0 && (
          <Flex wrap="wrap" gap={3}>
            {chars.slice(0, 2).map((c: any, i: number) => (
              <Tag
                key={i}
                style={{
                  background: 'rgba(224,109,91,0.08)',
                  color: '#C05A48',
                  border: '1px solid rgba(192,90,72,0.2)',
                  borderRadius: 10,
                  fontSize: 10,
                  padding: '0px 6px',
                  lineHeight: '18px',
                  margin: 0,
                }}
              >
                {c?.characteristic?.name ?? c?.name ?? c}
              </Tag>
            ))}
          </Flex>
        )}

        {/* Preço */}
        <div style={{ marginTop: 4 }}>
          <Flex align="center" justify="space-between">
            <Typography.Text style={{ color: '#E06D5B', fontWeight: 700, fontSize: 14 }}>
              {price > 0 ? NumberUtil.currency(price) : 'R$ —'}
            </Typography.Text>
            <Typography.Text style={{ fontSize: 10, color: '#B89990' }}>
              *sujeito a variação
            </Typography.Text>
          </Flex>
          <div
            style={{
              marginTop: 8,
              background: '#E06D5B',
              borderRadius: 6,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography.Text style={{ color: '#fff', fontSize: 12, fontWeight: 500 }}>
              Adicionar ao carrinho
            </Typography.Text>
          </div>
        </div>
      </div>
    </div>
  );
}
