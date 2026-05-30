import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Layout,
  Typography,
  Row,
  Col,
  Card,
  Button,
  Input,
  Tabs,
  Spin,
  Empty,
  Flex,
  Tag,
  Divider,
  Space,
  Grid,
  Pagination,
  Tooltip,
  Badge,
  message,
} from 'antd';
import {
  SearchOutlined,
  CalendarOutlined,
  HeartOutlined,
  StarFilled,
  WhatsAppOutlined,
  InstagramOutlined,
  MailOutlined,
  ClockCircleOutlined,
  ShopOutlined,
  GiftOutlined,
  CheckCircleOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  EditOutlined,
  PictureOutlined,
  MinusOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Modal } from 'antd';
import AppHeader from '../header/AppHeader';
import { AppFooter } from '../footer';
import { useTableQuery } from '~/hooks/useTableQuery';
import ProductController from '~/controllers/ProductController';
import ProductCategoryController from '~/controllers/ProductCategoryController';
import { useCartStore } from '~/hooks/useCartStore';
import type { Product, ProductCharacteristicType } from '~/@types/product';

// ─── Types ────────────────────────────────────────────────────────────────────

type PublicCharacteristic = {
  id: string;
  name: string;
};

// Reutiliza o tipo Product já existente, que o backend já inclui categories e characteristics
type PublicProduct = Product & {
  characteristics?: { characteristic: PublicCharacteristic }[];
};

type PublicCategory = {
  id: string;
  name: string;
  slug: string;
};

type AppSettings = {
  siteName?: string;
  logoUrl?: string;
  whatsapp?: string;
  contactEmail?: string;
  serviceHours?: string;
  address?: string;
  instagram?: string;
  primaryColor?: string;
};

type AboutInfo = {
  title: string;
  subtitle: string;
  main: string;
  complementary: string;
  items: { id: string; text: string; orderIndex: number }[];
};

// ─── Mock / placeholder data (substitua pelas chamadas reais de API) ──────────

const MOCK_SETTINGS: AppSettings = {
  siteName: 'Doce & Cia',
  whatsapp: '5531999999999',
  contactEmail: 'contato@doceatelier.com.br',
  serviceHours: 'Seg–Sex 8h–18h · Sáb 8h–14h',
  address: 'Belo Horizonte, MG',
  instagram: 'doceatelier',
};

const MOCK_ABOUT: AboutInfo = {
  title: 'Feito com amor, entregue com cuidado',
  subtitle: 'Nossa história',
  main: 'Somos uma confeitaria artesanal que acredita que cada mordida deve ser uma experiência única. Trabalhamos com ingredientes selecionados e técnicas tradicionais para criar doces que encantam.',
  complementary:
    'Cada encomenda é tratada com atenção especial, do primeiro contato até a entrega. Personalizamos tudo para o seu momento especial.',
  items: [
    { id: '1', text: 'Ingredientes 100% naturais', orderIndex: 0 },
    { id: '2', text: 'Receitas artesanais exclusivas', orderIndex: 1 },
    { id: '3', text: 'Embalagens sustentáveis', orderIndex: 2 },
    { id: '4', text: 'Entrega com cuidado e pontualidade', orderIndex: 3 },
  ],
};

const MOCK_TESTIMONIALS = [
  {
    id: '1',
    name: 'Mariana S.',
    text: 'O bolo de casamento foi perfeito! Todos os convidados elogiaram muito. Recomendo demais!',
    stars: 5,
    occasion: 'Casamento',
  },
  {
    id: '2',
    name: 'Roberto A.',
    text: 'Encomendei brownies para o aniversário da minha filha e ela adorou. Sabor incrível!',
    stars: 5,
    occasion: 'Aniversário',
  },
  {
    id: '3',
    name: 'Fernanda C.',
    text: 'Atendimento impecável e produto delicioso. Já é minha confeitaria favorita!',
    stars: 5,
    occasion: 'Brunch',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getProductImage(product: PublicProduct) {
  if (product.imageUrl) return product.imageUrl;

  const names = (product.categories ?? [])
    .map((c: any) => {
      const catName = c?.category?.name ?? c?.name ?? '';
      return catName.toLowerCase();
    })
    .join(' ');
  const slug = product.slug?.toLowerCase() ?? '';

  const keyword = encodeURIComponent(
    names.includes('torta')
      ? 'pie tart pastry'
      : names.includes('biscoito') || names.includes('artesanal')
        ? 'artisan cookies biscuits'
        : names.includes('brunch')
          ? 'brunch food'
          : names.includes('doce')
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

function whatsappLink(
  phone?: string,
  msg = 'Olá! Vim pelo site e gostaria de fazer um pedido.',
) {
  if (!phone) return '#';
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
}

/** Normaliza categories do backend: suporta { category: { id, name } }[] ou { name, slug }[] */
function getCategories(product: PublicProduct): { id: string; name: string }[] {
  return (product.categories ?? [])
    .map((c: any) => ({
      id: c?.category?.id ?? c?.id ?? c?.name ?? '',
      name: c?.category?.name ?? c?.name ?? '',
    }))
    .filter((c) => c.name);
}

function getCharacteristics(product: PublicProduct): PublicCharacteristic[] {
  return (product.characteristics ?? []).map((c: any) => c?.characteristic ?? c);
}

// ─── Characteristic Badge ─────────────────────────────────────────────────────

function CharBadge({ char }: { char: PublicCharacteristic }) {
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

// ─── Sub-components ───────────────────────────────────────────────────────────

const { useBreakpoint } = Grid;

/* Hero Section */
function HeroSection({ settings }: { settings: AppSettings }) {
  const screens = useBreakpoint();

  return (
    <section
      style={{
        background: 'linear-gradient(135deg, #FFF7F5 0%, #FFF0EA 50%, #FDEEE9 100%)',
        padding: screens.md ? '80px 24px 72px' : '48px 20px 56px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid #F5E0D8',
        minHeight: 'fit-content',
      }}
    >
      {/* Decorative blobs */}
      <div
        style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'rgba(224,109,91,0.07)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -40,
          left: -40,
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'rgba(224,109,91,0.05)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative' }}>
        <Tag
          style={{
            background: 'rgba(224,109,91,0.12)',
            color: '#C05A48',
            border: 'none',
            borderRadius: 20,
            padding: '4px 14px',
            fontSize: 13,
            marginBottom: 20,
            fontWeight: 500,
          }}
          icon={<HeartOutlined />}
        >
          Feito artesanalmente
        </Tag>

        <Typography.Title
          level={1}
          style={{
            fontSize: screens.md ? 52 : 34,
            fontWeight: 700,
            color: '#1A1A1A',
            lineHeight: 1.15,
            marginBottom: 20,
            letterSpacing: '-0.5px',
          }}
        >
          {settings.siteName ?? 'Nossa Confeitaria'}
        </Typography.Title>

        <Typography.Paragraph
          style={{
            fontSize: screens.md ? 18 : 16,
            color: '#555',
            maxWidth: 520,
            margin: '0 auto 36px',
            lineHeight: 1.7,
          }}
        >
          Doces artesanais para tornar cada momento ainda mais especial. Encomendas
          personalizadas para qualquer ocasião.
        </Typography.Paragraph>

        <Space size={12} wrap style={{ justifyContent: 'center' }}>
          <Button
            type="primary"
            size="large"
            icon={<CalendarOutlined />}
            href="#catalogo"
            style={{
              background: '#E06D5B',
              borderColor: '#E06D5B',
              borderRadius: 8,
              height: 48,
              paddingInline: 28,
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            Ver Cardápio
          </Button>
        </Space>
      </div>
    </section>
  );
}

/* About Section */
function AboutSection({ about }: { about: AboutInfo }) {
  const screens = useBreakpoint();
  return (
    <section
      id="sobre"
      style={{
        padding: screens.md ? '72px 24px' : '48px 20px',
        background: '#FDFAF9',
        borderBottom: '1px solid #F0E8E5',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Row gutter={[48, 40]} align="middle">
          <Col xs={24} md={12}>
            <Tag
              style={{
                background: 'rgba(224,109,91,0.1)',
                color: '#C05A48',
                border: 'none',
                borderRadius: 20,
                padding: '3px 12px',
                fontSize: 12,
                marginBottom: 16,
                fontWeight: 500,
              }}
            >
              {about.subtitle}
            </Tag>
            <Typography.Title
              level={2}
              style={{
                fontSize: screens.md ? 36 : 26,
                fontWeight: 700,
                color: '#1A1A1A',
                marginBottom: 16,
              }}
            >
              {about.title}
            </Typography.Title>
            <Typography.Paragraph
              style={{ color: '#555', fontSize: 15, lineHeight: 1.8, marginBottom: 12 }}
            >
              {about.main}
            </Typography.Paragraph>
            <Typography.Paragraph
              style={{ color: '#777', fontSize: 14, lineHeight: 1.8 }}
            >
              {about.complementary}
            </Typography.Paragraph>
          </Col>
          <Col xs={24} md={12}>
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: '28px 32px',
                border: '1.5px solid #F0E8E5',
              }}
            >
              {[...about.items]
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((item) => (
                  <Flex
                    key={item.id}
                    gap={14}
                    align="flex-start"
                    style={{ marginBottom: 18 }}
                  >
                    <CheckCircleOutlined
                      style={{
                        color: '#E06D5B',
                        fontSize: 18,
                        marginTop: 2,
                        flexShrink: 0,
                      }}
                    />
                    <Typography.Text style={{ fontSize: 15, color: '#333' }}>
                      {item.text}
                    </Typography.Text>
                  </Flex>
                ))}
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
}

/* How to Order Section */
function HowToOrderSection({ settings }: { settings: AppSettings }) {
  const screens = useBreakpoint();

  const steps = [
    {
      icon: <ShoppingCartOutlined style={{ fontSize: 28, color: '#E06D5B' }} />,
      title: 'Monte seu pedido',
      desc: 'Adicione os doces favoritos ao carrinho de forma rápida e prática.',
    },
    {
      icon: <UserOutlined style={{ fontSize: 28, color: '#E06D5B' }} />,
      title: 'Entre na sua conta',
      desc: 'Faça login ou crie sua conta para continuar o pedido.',
    },
    {
      icon: <EditOutlined style={{ fontSize: 28, color: '#E06D5B' }} />,
      title: 'Defina os detalhes',
      desc: 'Escolha a data, horário e adicione observações ou personalizações.',
    },
    {
      icon: <WhatsAppOutlined style={{ fontSize: 28, color: '#25D366' }} />,
      title: 'Receba nossa confirmação',
      desc: 'A confeitaria entra em contato pelo WhatsApp para confirmar tudo.',
    },
  ];

  return (
    <section
      style={{
        padding: screens.md ? '72px 24px' : '48px 20px',
        background: '#fff',
        borderBottom: '1px solid #F0E8E5',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Tag
            style={{
              background: 'rgba(224,109,91,0.1)',
              color: '#C05A48',
              border: 'none',
              borderRadius: 20,
              padding: '3px 12px',
              fontSize: 12,
              marginBottom: 16,
              fontWeight: 500,
            }}
          >
            Como funciona
          </Tag>

          <Typography.Title
            level={2}
            style={{
              fontSize: screens.md ? 34 : 24,
              fontWeight: 700,
              color: '#1A1A1A',
              marginBottom: 8,
            }}
          >
            Peça seus doces em poucos passos
          </Typography.Title>

          <Typography.Text
            style={{
              color: '#777',
              fontSize: 15,
            }}
          >
            Um processo simples, rápido e personalizado
          </Typography.Text>
        </div>

        <Row gutter={[24, 24]}>
          {steps.map((step, idx) => (
            <Col key={idx} xs={24} sm={12} md={6}>
              <div
                style={{
                  background: '#FDFAF9',
                  borderRadius: 16,
                  padding: '28px 24px',
                  border: '1.5px solid #F0E8E5',
                  height: '100%',
                  position: 'relative',
                  transition: 'all .2s ease',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: 'rgba(224,109,91,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#E06D5B',
                  }}
                >
                  {idx + 1}
                </div>

                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: 'rgba(224,109,91,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 18,
                  }}
                >
                  {step.icon}
                </div>

                <Typography.Title
                  level={5}
                  style={{
                    marginBottom: 8,
                    color: '#1A1A1A',
                  }}
                >
                  {step.title}
                </Typography.Title>

                <Typography.Text
                  style={{
                    color: '#777',
                    fontSize: 14,
                    lineHeight: 1.7,
                  }}
                >
                  {step.desc}
                </Typography.Text>
              </div>
            </Col>
          ))}
        </Row>

        <Flex justify="center" style={{ marginTop: 40 }}>
          <Button
            type="primary"
            size="large"
            icon={<WhatsAppOutlined />}
            href={whatsappLink(settings.whatsapp)}
            target="_blank"
            style={{
              background: '#25D366',
              borderColor: '#25D366',
              borderRadius: 10,
              height: 50,
              paddingInline: 34,
              fontWeight: 600,
              fontSize: 15,
              boxShadow: '0 8px 24px rgba(37,211,102,0.22)',
            }}
          >
            Falar com a confeitaria
          </Button>
        </Flex>
      </div>
    </section>
  );
}

/* Product Detail Modal */
function ProductDetailModal({
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

  const chars = getCharacteristics(product);
  const categories = getCategories(product);
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
                <CharBadge key={c.id} char={c} />
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
                {formatPrice(product.price)}
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
              {/* <Button
                icon={<ShoppingCartOutlined />}
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                style={{ borderColor: '#E06D5B', color: '#E06D5B', borderRadius: 8 }}
              >
                Adicionar
              </Button> */}
              <Button
                type="primary"
                icon={<WhatsAppOutlined />}
                href={whatsappLink(
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

/* Product Card */
function ProductCard({
  product,
  onViewDetails,
  onAddToCart,
}: {
  product: PublicProduct;
  onViewDetails: (p: PublicProduct) => void;
  onAddToCart: (p: PublicProduct) => void;
}) {
  const categories = getCategories(product);
  const chars = getCharacteristics(product);
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
              <CharBadge key={c.id} char={c} />
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
            {formatPrice(product.price)}
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
        {/* <Button
          type="primary"
          block
          icon={<ShoppingCartOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          style={{
            background: '#E06D5B',
            borderColor: '#E06D5B',
            borderRadius: 8,
            fontWeight: 500,
          }}
        >
          Adicionar ao carrinho
        </Button> */}
      </div>
    </Card>
  );
}

const PAGE_SIZE = 8;

/* Catalog Section */
function CatalogSection({
  settings,
  onViewDetails,
}: {
  settings: AppSettings;
  onViewDetails: (p: PublicProduct) => void;
}) {
  const screens = useBreakpoint();
  const { Search } = Input;
  const addItem = useCartStore((state) => state.addItem);

  // ── Categorias via ProductCategoryController ──
  const {
    tableProps: { dataSource: rawCategories = [] },
  } = useTableQuery<PublicCategory>('public-categories', (params) =>
    ProductCategoryController.list<PublicCategory>({ ...params, pageSize: 100 }),
  );

  const [activeCategory, setActiveCategory] = useState<string>('all');

  // ── Produtos via ProductController + useTableQuery ──
  const productQuery = useTableQuery<PublicProduct>(
    'public-products',
    (params) => ProductController.list<PublicProduct>(params),
    {
      initialParams: { pageSize: PAGE_SIZE },
      persist: false,
    },
  );

  const { tableProps, setSearch, params, setFilters } = productQuery;
  const products = (tableProps.dataSource ?? []) as PublicProduct[];
  const total = tableProps.pagination ? ((tableProps.pagination as any).total ?? 0) : 0;
  const currentPage = (tableProps.pagination as any)?.current ?? 1;

  // Ao mudar de categoria, filtra pelo slug via filters do hook
  const handleCategoryChange = (key: string) => {
    setActiveCategory(key);
    setFilters(key !== 'all' ? ({ categoryId: key } as any) : ({} as any));
  };

  const handleAddToCart = (product: PublicProduct) => {
    addItem(product as any);
    message.success(`"${product.name}" adicionado ao carrinho!`);
  };

  const categoryTabs = [
    { key: 'all', label: 'Todos' },
    ...rawCategories.map((c) => ({ key: c.id, label: c.name })),
  ];

  return (
    <section
      id="catalogo"
      style={{
        padding: screens.md ? '72px 24px' : '48px 20px',
        background: '#FDFAF9',
        borderBottom: '1px solid #F0E8E5',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Cabeçalho */}
        <Flex
          justify="space-between"
          align="flex-start"
          wrap="wrap"
          gap={16}
          style={{ marginBottom: 8 }}
        >
          <div>
            <Tag
              style={{
                background: 'rgba(224,109,91,0.1)',
                color: '#C05A48',
                border: 'none',
                borderRadius: 20,
                padding: '3px 12px',
                fontSize: 12,
                marginBottom: 10,
                fontWeight: 500,
                display: 'block',
              }}
            >
              Cardápio
            </Tag>
            <Typography.Title
              level={2}
              style={{
                margin: 0,
                color: '#1A1A1A',
                fontSize: screens.md ? 34 : 24,
                fontWeight: 700,
              }}
            >
              Nossos Produtos
            </Typography.Title>
            <Typography.Text style={{ color: '#888', fontSize: 14 }}>
              Feitos artesanalmente com ingredientes selecionados
            </Typography.Text>
          </div>
          <Search
            placeholder="Buscar produtos..."
            allowClear
            onSearch={(v) => setSearch(v)}
            onChange={(e) => !e.target.value && setSearch('')}
            style={{ width: 240, marginTop: 4 }}
            prefix={<SearchOutlined />}
          />
        </Flex>

        {/* Abas de categoria */}
        <Tabs
          activeKey={activeCategory}
          onChange={handleCategoryChange}
          items={categoryTabs}
          style={{ marginBottom: 24 }}
          tabBarStyle={{ marginBottom: 0 }}
        />

        {/* Grade de produtos */}
        {tableProps.loading ? (
          <Flex justify="center" style={{ padding: '64px 0' }}>
            <Spin size="large" />
          </Flex>
        ) : products.length === 0 ? (
          <Empty description="Nenhum produto encontrado" style={{ padding: '64px 0' }} />
        ) : (
          <>
            <Row gutter={[16, 24]}>
              {products.map((product) => (
                <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                  <ProductCard
                    product={product}
                    onViewDetails={onViewDetails}
                    onAddToCart={handleAddToCart}
                  />
                </Col>
              ))}
            </Row>

            {/* Paginação */}
            {total > PAGE_SIZE && (
              <Flex justify="center" style={{ marginTop: 40 }}>
                <Pagination
                  current={currentPage}
                  pageSize={PAGE_SIZE}
                  total={total}
                  showSizeChanger={false}
                  styles={{ item: { backgroundColor: 'transparent', border: 'none' } }}
                  onChange={(page) => {
                    tableProps.onChange?.(
                      { current: page, pageSize: PAGE_SIZE },
                      {},
                      [],
                      { currentDataSource: [], action: 'paginate' },
                    );
                    // Scroll suave de volta ao catálogo
                    document
                      .getElementById('catalogo')
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  itemRender={(page, type, original) => {
                    if (type === 'page') {
                      const isActive = page === currentPage;
                      return (
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isActive ? '#E06D5B' : 'transparent',
                            color: isActive ? '#fff' : '#555',
                            border: isActive ? 'none' : '1px solid #E8D5CF',
                            fontWeight: isActive ? 600 : 400,
                            fontSize: 14,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                        >
                          {page}
                        </div>
                      );
                    }
                    return original;
                  }}
                />
              </Flex>
            )}

            {/* Indicador discreto de total */}
            <Flex justify="center" style={{ marginTop: 12 }}>
              <Typography.Text style={{ color: '#B89990', fontSize: 12 }}>
                Exibindo{' '}
                {Math.min(currentPage * PAGE_SIZE, total) -
                  Math.min((currentPage - 1) * PAGE_SIZE, total) +
                  (currentPage - 1) * PAGE_SIZE >
                total
                  ? total
                  : products.length}{' '}
                de {total} produto{total !== 1 ? 's' : ''}
              </Typography.Text>
            </Flex>
          </>
        )}
      </div>
    </section>
  );
}

/* Testimonials Section */
function TestimonialsSection() {
  const screens = useBreakpoint();
  return (
    <section
      style={{
        padding: screens.md ? '72px 24px' : '48px 20px',
        background: '#fff',
        borderBottom: '1px solid #F0E8E5',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Tag
            style={{
              background: 'rgba(224,109,91,0.1)',
              color: '#C05A48',
              border: 'none',
              borderRadius: 20,
              padding: '3px 12px',
              fontSize: 12,
              marginBottom: 16,
              fontWeight: 500,
            }}
          >
            Depoimentos
          </Tag>
          <Typography.Title
            level={2}
            style={{
              fontSize: screens.md ? 34 : 24,
              fontWeight: 700,
              color: '#1A1A1A',
              marginBottom: 4,
            }}
          >
            O que nossos clientes dizem
          </Typography.Title>
        </div>

        <Row gutter={[24, 24]}>
          {MOCK_TESTIMONIALS.map((t) => (
            <Col key={t.id} xs={24} md={8}>
              <div
                style={{
                  background: '#FDFAF9',
                  borderRadius: 14,
                  padding: '28px',
                  border: '1.5px solid #F0E8E5',
                  height: '100%',
                }}
              >
                <Flex gap={4} style={{ marginBottom: 16 }}>
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <StarFilled key={i} style={{ color: '#E06D5B', fontSize: 14 }} />
                  ))}
                </Flex>
                <Typography.Paragraph
                  style={{
                    color: '#444',
                    fontSize: 14,
                    lineHeight: 1.75,
                    fontStyle: 'italic',
                    marginBottom: 20,
                  }}
                >
                  "{t.text}"
                </Typography.Paragraph>
                <Flex gap={10} align="center">
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: 'rgba(224,109,91,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#C05A48',
                      flexShrink: 0,
                    }}
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <Typography.Text
                      strong
                      style={{ fontSize: 14, display: 'block', color: '#1A1A1A' }}
                    >
                      {t.name}
                    </Typography.Text>
                    <Typography.Text style={{ fontSize: 12, color: '#888' }}>
                      {'8 itens'}
                    </Typography.Text>
                  </div>
                </Flex>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
}

/* Contact / CTA Section */
function ContactSection({ settings }: { settings: AppSettings }) {
  const screens = useBreakpoint();

  const benefits = [
    'Escolha seus produtos online',
    'Defina data e personalizações',
    'Acompanhe tudo com praticidade',
    'Receba confirmação pelo WhatsApp',
  ];

  return (
    <section
      style={{
        padding: screens.md ? '84px 24px' : '56px 20px',
        background: 'linear-gradient(180deg, #FFF7F5 0%, #FFF1EC 100%)',
        borderBottom: '1px solid #F0E8E5',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Row gutter={[48, 40]} align="middle">
          <Col xs={24} md={14}>
            <Tag
              style={{
                background: 'rgba(224,109,91,0.1)',
                color: '#C05A48',
                border: 'none',
                borderRadius: 20,
                padding: '4px 14px',
                fontWeight: 600,
                marginBottom: 18,
              }}
            >
              Pedido online simples
            </Tag>

            <Typography.Title
              level={2}
              style={{
                fontSize: screens.md ? 40 : 28,
                lineHeight: 1.15,
                fontWeight: 700,
                color: '#1A1A1A',
                marginBottom: 16,
              }}
            >
              Monte seu pedido do seu jeito
            </Typography.Title>

            <Typography.Paragraph
              style={{
                color: '#666',
                fontSize: 16,
                lineHeight: 1.9,
                marginBottom: 32,
                maxWidth: 560,
              }}
            >
              Escolha seus doces favoritos, personalize os detalhes e envie seu pedido em
              poucos minutos. Nossa equipe entra em contato pelo WhatsApp para confirmar
              tudo com você.
            </Typography.Paragraph>

            <Space size={14} wrap>
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                style={{
                  background: '#E06D5B',
                  borderColor: '#E06D5B',
                  borderRadius: 10,
                  height: 50,
                  paddingInline: 28,
                  fontWeight: 600,
                  fontSize: 15,
                  boxShadow: '0 10px 24px rgba(224,109,91,0.18)',
                }}
              >
                Começar pedido
              </Button>

              {settings.instagram && (
                <Button
                  size="large"
                  icon={<InstagramOutlined />}
                  href={`https://instagram.com/${settings.instagram}`}
                  target="_blank"
                  style={{
                    borderColor: '#E06D5B',
                    color: '#E06D5B',
                    borderRadius: 10,
                    height: 50,
                    paddingInline: 24,
                    fontWeight: 600,
                    background: '#fff',
                  }}
                >
                  Ver Instagram
                </Button>
              )}
            </Space>
          </Col>

          <Col xs={24} md={10}>
            <div
              style={{
                background: '#fff',
                borderRadius: 22,
                padding: '30px',
                border: '1px solid #F3DFDA',
                boxShadow: '0 18px 40px rgba(0,0,0,0.04)',
              }}
            >
              <Typography.Title
                level={4}
                style={{
                  marginBottom: 24,
                  color: '#1A1A1A',
                }}
              >
                Como funciona seu pedido
              </Typography.Title>

              <Flex vertical gap={18}>
                {benefits.map((item, idx) => (
                  <Flex key={idx} gap={14} align="center">
                    <div
                      style={{
                        minWidth: 34,
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: 'rgba(224,109,91,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#E06D5B',
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      ✓
                    </div>

                    <Typography.Text
                      style={{
                        color: '#555',
                        fontSize: 15,
                      }}
                    >
                      {item}
                    </Typography.Text>
                  </Flex>
                ))}
              </Flex>

              <div
                style={{
                  marginTop: 28,
                  padding: '18px 20px',
                  borderRadius: 14,
                  background: '#FFF6F3',
                  border: '1px solid #F5DFD9',
                }}
              >
                <Typography.Text
                  style={{
                    color: '#7A5A54',
                    fontSize: 14,
                    lineHeight: 1.7,
                  }}
                >
                  Após o envio do pedido, nossa equipe confirma disponibilidade, detalhes
                  e pagamento diretamente com você.
                </Typography.Text>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function CatalogPage() {
  const [settings] = useState<AppSettings>(MOCK_SETTINGS);
  const [about] = useState<AboutInfo>(MOCK_ABOUT);

  const [selectedProduct, setSelectedProduct] = useState<PublicProduct | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (product: PublicProduct) => {
    addItem(product as any);
    message.success(`"${product.name}" adicionado ao carrinho!`);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      {/* <SiteHeader settings={settings} /> */}
      <AppHeader settings={settings} />
      <HeroSection settings={settings} />
      <AboutSection about={about} />
      <HowToOrderSection settings={settings} />
      <CatalogSection
        settings={settings}
        onViewDetails={(p) => {
          setSelectedProduct(p);
          setModalOpen(true);
        }}
      />
      <TestimonialsSection />
      <ContactSection settings={settings} />
      {/* <SiteFooter settings={settings} /> */}
      <AppFooter useFullFooter />

      <ProductDetailModal
        product={selectedProduct}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedProduct(null);
        }}
        settings={settings}
        onAddToCart={handleAddToCart}
      />
    </Layout>
  );
}
