import {
  Modal,
  Typography,
  Flex,
  Button,
  InputNumber,
  Tag,
  Divider,
} from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PublicProduct } from '~/services/CatalogService';

const { Title, Text, Paragraph } = Typography;

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getProductImage(product: PublicProduct) {
  const categoryNames = product.categories.map((c) => c.name.toLowerCase()).join(' ');
  const slug = product.slug.toLowerCase();
  const keyword = encodeURIComponent(
    categoryNames.includes('torta')
      ? 'pie tart pastry'
      : categoryNames.includes('biscoito') || categoryNames.includes('artesanal')
        ? 'artisan cookies biscuits'
        : categoryNames.includes('brunch')
          ? 'brunch food'
          : categoryNames.includes('lanche')
            ? 'snack food bread'
            : categoryNames.includes('doce')
              ? 'sweet dessert cake'
              : slug.includes('brownie')
                ? 'brownie chocolate'
                : slug.includes('bolo')
                  ? 'cake'
                  : 'bakery food',
  );
  const seed = product.id.charCodeAt(0) + product.id.charCodeAt(1);
  return `https://source.unsplash.com/400x300/?${keyword}&sig=${seed}`;
}

type Props = {
  product: PublicProduct | null;
  open: boolean;
  onClose: () => void;
};

/**
 * ProductDetailModal
 *
 * Modal de detalhamento do produto exibido para usuários NÃO logados.
 * Exibe imagem, nome, categoria, descrição, quantidade e CTA de login
 * para prosseguir com o pedido (Figura 26).
 */
export function ProductDetailModal({ product, open, onClose }: Props) {
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  if (!product) return null;

  const categoryName = product.categories[0]?.name ?? '';
  const imageUrl = getProductImage(product);

  const handleLoginRedirect = () => {
    onClose();
    navigate('/login');
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={520}
      centered
      styles={{
        content: { padding: 0, borderRadius: 12, overflow: 'hidden' },
      }}
    >
      <Flex>
        {/* Imagem lateral */}
        <div
          style={{
            width: 200,
            minWidth: 200,
            background: '#f5f0eb',
            flexShrink: 0,
          }}
        >
          <img
            src={imageUrl}
            alt={product.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://placehold.co/400x400/f5f0eb/c4a882?text=Produto';
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              minHeight: 260,
            }}
          />
        </div>

        {/* Conteúdo */}
        <Flex
          vertical
          gap={12}
          style={{ padding: '24px 24px 20px', flex: 1 }}
        >
          {/* Nome e categoria */}
          <div>
            <Title level={4} style={{ margin: 0, color: '#222', lineHeight: 1.3 }}>
              {product.name}
            </Title>
            {categoryName && (
              <Text type="secondary" style={{ fontSize: 13 }}>
                {categoryName}
              </Text>
            )}
          </div>

          {/* Descrição */}
          {product.description && (
            <Paragraph
              style={{ fontSize: 13, color: '#555', margin: 0, lineHeight: 1.5 }}
              ellipsis={{ rows: 4 }}
            >
              {product.description}
            </Paragraph>
          )}

          {/* Tags de características */}
          {product.characteristics.length > 0 && (
            <Flex wrap="wrap" gap={4}>
              {product.characteristics.map((c) => (
                <Tag key={c.id} color="orange" style={{ fontSize: 11, margin: 0 }}>
                  {c.name}
                </Tag>
              ))}
            </Flex>
          )}

          <Divider style={{ margin: '4px 0' }} />

          {/* Preço */}
          <Text style={{ color: '#E06D5B', fontWeight: 700, fontSize: 18 }}>
            {formatPrice(product.price)}
          </Text>

          {/* Quantidade */}
          <div>
            <Text style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>
              Quantidade
            </Text>
            <Flex align="center" gap={8}>
              <Button
                size="small"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                style={{ width: 28, height: 28, padding: 0, fontWeight: 700 }}
              >
                −
              </Button>
              <Text style={{ minWidth: 24, textAlign: 'center', fontWeight: 600 }}>
                {quantity}
              </Text>
              <Button
                size="small"
                onClick={() => setQuantity((q) => q + 1)}
                style={{ width: 28, height: 28, padding: 0, fontWeight: 700 }}
              >
                +
              </Button>
            </Flex>
          </div>

          {/* CTAs */}
          <Flex vertical gap={8} style={{ marginTop: 4 }}>
            {/* Botão principal: redireciona para login */}
            <Button
              type="primary"
              block
              style={{ background: '#E06D5B', borderColor: '#E06D5B', fontWeight: 600 }}
              onClick={handleLoginRedirect}
            >
              Login
            </Button>

            <Button block onClick={onClose} style={{ color: '#888' }} type="text">
              Fechar
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Modal>
  );
}