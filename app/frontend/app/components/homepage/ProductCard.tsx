import { Button, Card, Flex, Tag, Tooltip, Typography } from 'antd';
import type { PublicProduct } from '~/@types/product';
import ProductController from '~/controllers/ProductController';
import { useCartStore } from '~/hooks/useCartStore';
import { PictureOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { CharacteristicBadge } from './CharacteristicBadge';
import NumberUtil from '~/utils/NumberUtil';

export function ProductCard({
  product,
  onViewDetails,
  onAddToCart,
}: {
  product: PublicProduct;
  onViewDetails: (p: PublicProduct) => void;
  onAddToCart: (p: PublicProduct) => void;
}) {
  const categories = ProductController.getCategories(product);
  const chars = ProductController.getCharacteristics(product);
  const cartItem = useCartStore((state) =>
    state.items.find((item) => item.product.id === product.id),
  );

  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);

  return (
    <Card
      hoverable
      onClick={() => onViewDetails(product)}
      cover={
        <div
          style={{
            height: 180,
            overflow: 'hidden',
            borderRadius: '10px 10px 0 0',
            background: '#F5F0EB',
            position: 'relative',
          }}
        >
          {product.imageUrl ? (
            <img
              alt={product.name}
              src={product.imageUrl}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s ease',
              }}
            />
          ) : (
            <Flex
              justify="center"
              align="center"
              style={{ height: '100%', color: '#C4A882' }}
            >
              <PictureOutlined style={{ fontSize: 36 }} />
            </Flex>
          )}
        </div>
      }
      styles={{
        body: {
          padding: '14px 16px 16px',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        },
      }}
      style={{
        borderRadius: 10,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1.5px solid #F0E8E5',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {/* Área de conteúdo: cresce para empurrar o botão para baixo */}
      <Flex vertical gap={6} style={{ flex: 1 }}>
        {/* Categorias — todas, sem limite */}
        {categories.length > 0 && (
          <Flex wrap="wrap" gap={4}>
            {categories.map((cat) => (
              <Typography.Text
                key={cat.id}
                style={{
                  fontSize: 11,
                  color: '#C05A48',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {cat.name}
              </Typography.Text>
            ))}
          </Flex>
        )}

        {/* Nome */}
        <Typography.Text
          strong
          style={{ fontSize: 15, lineHeight: 1.35, color: '#1A1A1A' }}
        >
          {product.name}
        </Typography.Text>

        {/* Características */}
        {chars.length > 0 && (
          <Flex wrap="wrap" gap={4} style={{ marginTop: 2 }}>
            {chars.slice(0, 2).map((c) => (
              <CharacteristicBadge key={c.id} char={c} />
            ))}
            {chars.length > 2 && (
              <Tooltip
                title={chars
                  .slice(2)
                  .map((c) => c.name)
                  .join(', ')}
              >
                <Tag
                  style={{
                    background: '#F5EDE9',
                    color: '#9C7A74',
                    border: 'none',
                    borderRadius: 12,
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  +{chars.length - 2}
                </Tag>
              </Tooltip>
            )}
          </Flex>
        )}
      </Flex>

      {/* Área inferior: preço + botão sempre no fim do card */}
      <div style={{ marginTop: 12 }}>
        <Flex align="center" justify="space-between" style={{ marginBottom: 10 }}>
          <Typography.Text style={{ color: '#E06D5B', fontWeight: 700, fontSize: 16 }}>
            {NumberUtil.currency(product.price)}
          </Typography.Text>
          <Tooltip title="Preço pode variar por customização">
            <Typography.Text style={{ fontSize: 11, color: '#B89990', cursor: 'help' }}>
              *sujeito a variação
            </Typography.Text>
          </Tooltip>
        </Flex>

        {/* stopPropagation para não abrir o modal ao clicar no botão */}
        {!cartItem ? (
          <Button
            type="primary"
            block
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.(product);
            }}
          >
            Adicionar ao carrinho
          </Button>
        ) : (
          <Flex align="center" justify="space-between">
            <Button
              icon={<MinusOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                decrementItem(product.id);
              }}
            />

            <Typography.Text strong>{cartItem.quantity}</Typography.Text>

            <Button
              icon={<PlusOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                incrementItem(product.id);
              }}
            />
          </Flex>
        )}
      </div>
    </Card>
  );
}
