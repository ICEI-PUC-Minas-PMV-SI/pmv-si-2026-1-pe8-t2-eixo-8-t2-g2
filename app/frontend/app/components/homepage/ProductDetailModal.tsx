import { Button, Divider, Flex, Modal, Tag, Typography } from 'antd';
import type { AppSettings } from '~/@types/app-settings';
import type { PublicProduct } from '~/@types/product';
import ProductController from '~/controllers/ProductController';
import { useCartStore } from '~/hooks/useCartStore';
import {
  PictureOutlined,
  ShoppingCartOutlined,
  MinusOutlined,
  PlusOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons';
import NumberUtil from '~/utils/NumberUtil';
import { CharacteristicBadge } from './CharacteristicBadge';
import TextUtil from '~/utils/TextUtil';

export function ProductDetailModal({
  product,
  open,
  onClose,
  settings,
  onAddToCart,
}: {
  product: PublicProduct | null;
  open: boolean;
  onClose: () => void;
  settings: AppSettings;
  onAddToCart: (p: PublicProduct) => void;
}) {
  if (!product) return null;

  const chars = ProductController.getCharacteristics(product);
  const categories = ProductController.getCategories(product);
  const cartItem = useCartStore((state) =>
    product ? state.items.find((item) => item.product.id === product.id) : undefined,
  );

  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);

  return (
    <Modal
      title={null}
      open={open}
      onOk={onClose}
      onCancel={onClose}
      footer={null}
      width={500}
      styles={{ body: { padding: 0 } }}
    >
      <div>
        {/* Imagem */}
        <div
          style={{
            height: 220,
            overflow: 'hidden',
            borderRadius: '8px 8px 0 0',
            background: '#F5F0EB',
          }}
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Flex
              justify="center"
              align="center"
              style={{ height: '100%', color: '#C4A882' }}
            >
              <PictureOutlined style={{ fontSize: 48 }} />
            </Flex>
          )}
        </div>

        <div style={{ padding: '24px' }}>
          {/* Todas as categorias */}
          {categories.length > 0 && (
            <Flex wrap="wrap" gap={4} style={{ marginBottom: 10 }}>
              {categories.map((cat) => (
                <Tag
                  key={cat.id}
                  style={{
                    background: 'rgba(224,109,91,0.1)',
                    color: '#C05A48',
                    border: 'none',
                    borderRadius: 12,
                    margin: 0,
                  }}
                >
                  {cat.name}
                </Tag>
              ))}
            </Flex>
          )}

          <Typography.Title level={4} style={{ marginBottom: 6 }}>
            {product.name}
          </Typography.Title>

          {/* Características */}
          {chars.length > 0 && (
            <Flex wrap="wrap" gap={4} style={{ marginBottom: 12 }}>
              {chars.map((c) => (
                <CharacteristicBadge key={c.id} char={c} />
              ))}
            </Flex>
          )}

          <Typography.Paragraph
            style={{ color: '#555', fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}
          >
            {product.description ??
              'Produto artesanal feito com ingredientes selecionados.'}
          </Typography.Paragraph>

          {/* Alerta de variação de preço */}
          <div
            style={{
              background: '#FFFBF0',
              border: '1px solid #F5E0A0',
              borderRadius: 8,
              padding: '10px 14px',
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 15, lineHeight: 1, marginTop: 1 }}>⚠️</span>
            <Typography.Text style={{ fontSize: 12, color: '#7A6020', lineHeight: 1.55 }}>
              Os preços podem variar conforme disponibilidade de ingredientes,
              sazonalidade e customizações solicitadas. O valor final será confirmado no
              orçamento.
            </Typography.Text>
          </div>

          <Divider style={{ margin: '16px 0' }} />

          <Flex justify="space-between" align="center" gap={12} wrap="wrap">
            <div>
              <Typography.Text
                style={{ fontSize: 11, color: '#AAA', display: 'block', marginBottom: 2 }}
              >
                A partir de
              </Typography.Text>
              <Typography.Text
                style={{ fontSize: 24, fontWeight: 700, color: '#E06D5B' }}
              >
                {NumberUtil.currency(product.price)}
              </Typography.Text>
            </div>
            <Flex gap={8}>
              {!cartItem ? (
                <Button
                  icon={<ShoppingCartOutlined />}
                  onClick={() => onAddToCart(product)}
                  style={{
                    borderColor: '#E06D5B',
                    color: '#E06D5B',
                    borderRadius: 8,
                  }}
                >
                  Adicionar
                </Button>
              ) : (
                <Flex
                  align="center"
                  gap={8}
                  style={{
                    border: '1px solid #E06D5B',
                    borderRadius: 8,
                    padding: '4px 8px',
                  }}
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<MinusOutlined />}
                    onClick={() => decrementItem(product.id)}
                  />

                  <Typography.Text strong>{cartItem.quantity}</Typography.Text>

                  <Button
                    type="text"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => incrementItem(product.id)}
                  />
                </Flex>
              )}
              <Button
                type="primary"
                icon={<WhatsAppOutlined />}
                href={TextUtil.whatsappLink(
                  settings.whatsapp,
                  `Olá! Tenho interesse no produto "${product.name}". Poderia me informar a disponibilidade?`,
                )}
                target="_blank"
                style={{ background: '#25D366', borderColor: '#25D366', borderRadius: 8 }}
              >
                WhatsApp
              </Button>
            </Flex>
          </Flex>
        </div>
      </div>
    </Modal>
  );
}
