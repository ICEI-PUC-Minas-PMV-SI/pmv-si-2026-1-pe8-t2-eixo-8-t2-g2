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
} from '@ant-design/icons';
import { Modal } from 'antd';
import AppHeader from '../header/AppHeader';

// ─── Types ────────────────────────────────────────────────────────────────────

type PublicProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  description?: string;
  categories: { name: string; slug: string }[];
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
  siteName: 'Doce Atelier',
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

const MOCK_SPECIALTIES = [
  { icon: '🎂', label: 'Bolos de Festa' },
  { icon: '🍰', label: 'Tortas Especiais' },
  { icon: '🍫', label: 'Chocolates' },
  { icon: '🥐', label: 'Brunch' },
  { icon: '🍪', label: 'Biscoitos' },
  { icon: '🎁', label: 'Kits Presentes' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getProductImage(product: PublicProduct) {
  const names = product.categories.map((c) => c.name.toLowerCase()).join(' ');
  const slug = product.slug.toLowerCase();
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
  message = 'Olá! Vim pelo site e gostaria de fazer um pedido.',
) {
  if (!phone) return '#';
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
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
          <Button
            size="large"
            icon={<WhatsAppOutlined />}
            href={whatsappLink(settings.whatsapp)}
            target="_blank"
            style={{
              borderColor: '#E06D5B',
              color: '#E06D5B',
              borderRadius: 8,
              height: 48,
              paddingInline: 28,
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            Fazer Pedido
          </Button>
        </Space>
      </div>
    </section>
  );
}

/* Specialties strip */
function SpecialtiesStrip() {
  return (
    <section
      style={{
        background: '#fff',
        padding: '32px 24px',
        borderBottom: '1px solid #F0E8E5',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Row gutter={[8, 16]} justify="center">
          {MOCK_SPECIALTIES.map((s) => (
            <Col key={s.label} xs={8} sm={4}>
              <Flex vertical align="center" gap={8}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: '#FFF4F2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 26,
                    border: '1.5px solid #F5DDD8',
                  }}
                >
                  {s.icon}
                </div>
                <Typography.Text
                  style={{
                    fontSize: 12,
                    color: '#666',
                    textAlign: 'center',
                    lineHeight: 1.3,
                  }}
                >
                  {s.label}
                </Typography.Text>
              </Flex>
            </Col>
          ))}
        </Row>
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
      icon: <WhatsAppOutlined style={{ fontSize: 28, color: '#E06D5B' }} />,
      title: 'Entre em contato',
      desc: 'Fale pelo WhatsApp ou e-mail com o que você tem em mente.',
    },
    {
      icon: <GiftOutlined style={{ fontSize: 28, color: '#E06D5B' }} />,
      title: 'Personalizamos juntos',
      desc: 'Definimos sabor, tamanho, decoração e data de entrega.',
    },
    {
      icon: <CalendarOutlined style={{ fontSize: 28, color: '#E06D5B' }} />,
      title: 'Confirme o pedido',
      desc: 'Após aprovação do orçamento, o agendamento é confirmado.',
    },
    {
      icon: <HeartOutlined style={{ fontSize: 28, color: '#E06D5B' }} />,
      title: 'Receba com amor',
      desc: 'Seu doce chega fresquinho, embalado com cuidado especial.',
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
            Fazer um pedido é simples
          </Typography.Title>
          <Typography.Text style={{ color: '#777', fontSize: 15 }}>
            Quatro passos para o seu doce favorito chegar até você
          </Typography.Text>
        </div>

        <Row gutter={[24, 24]}>
          {steps.map((step, idx) => (
            <Col key={idx} xs={24} sm={12} md={6}>
              <div
                style={{
                  background: '#FDFAF9',
                  borderRadius: 14,
                  padding: '28px 24px',
                  border: '1.5px solid #F0E8E5',
                  height: '100%',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    width: 28,
                    height: 28,
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
                <div style={{ marginBottom: 14 }}>{step.icon}</div>
                <Typography.Title level={5} style={{ marginBottom: 8, color: '#1A1A1A' }}>
                  {step.title}
                </Typography.Title>
                <Typography.Text style={{ color: '#777', fontSize: 14, lineHeight: 1.6 }}>
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
              borderRadius: 8,
              height: 48,
              paddingInline: 32,
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            Solicitar Orçamento no WhatsApp
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
}: {
  product: PublicProduct | null;
  open: boolean;
  onClose: () => void;
  settings: AppSettings;
}) {
  return (
    <Modal
      title={null}
      open={open}
      onOk={onClose}
      onCancel={onClose}
      footer={null}
      width={480}
      styles={{ body: { padding: 0 } }}
    >
      {product ? (
        <div>
          <div
            style={{
              height: 200,
              overflow: 'hidden',
              borderRadius: '8px 8px 0 0',
              background: '#F5F0EB',
            }}
          >
            <img
              src={getProductImage(product)}
              alt={product.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://placehold.co/480x200/f5f0eb/c4a882?text=Produto';
              }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{ padding: '24px' }}>
            <Typography.Title level={4} style={{ marginBottom: 4 }}>
              {product.name}
            </Typography.Title>
            {product.categories[0] && (
              <Tag
                style={{
                  background: 'rgba(224,109,91,0.1)',
                  color: '#C05A48',
                  border: 'none',
                  borderRadius: 12,
                  marginBottom: 14,
                }}
              >
                {product.categories[0].name}
              </Tag>
            )}
            <Typography.Paragraph
              style={{ color: '#555', fontSize: 14, lineHeight: 1.7 }}
            >
              {product.description ??
                'Produto artesanal feito com ingredientes selecionados.'}
            </Typography.Paragraph>
            <Divider style={{ margin: '16px 0' }} />
            <Flex justify="space-between" align="center">
              <Typography.Text
                style={{ fontSize: 22, fontWeight: 700, color: '#E06D5B' }}
              >
                {formatPrice(product.price)}
              </Typography.Text>
              <Button
                type="primary"
                icon={<WhatsAppOutlined />}
                href={whatsappLink(
                  settings.whatsapp,
                  `Olá! Tenho interesse no produto "${product.name}". Poderia me informar a disponibilidade?`,
                )}
                target="_blank"
                style={{
                  background: '#25D366',
                  borderColor: '#25D366',
                  borderRadius: 8,
                }}
              >
                Pedir pelo WhatsApp
              </Button>
            </Flex>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

/* Product Card */
function ProductCard({
  product,
  onViewDetails,
}: {
  product: PublicProduct;
  onViewDetails: (p: PublicProduct) => void;
}) {
  return (
    <Card
      hoverable
      cover={
        <div
          style={{
            height: 180,
            overflow: 'hidden',
            borderRadius: '10px 10px 0 0',
            background: '#F5F0EB',
          }}
        >
          <img
            alt={product.name}
            src={getProductImage(product)}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://placehold.co/400x300/f5f0eb/c4a882?text=Produto';
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
            }}
          />
        </div>
      }
      styles={{ body: { padding: '14px 18px 18px' } }}
      style={{
        borderRadius: 10,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1.5px solid #F0E8E5',
        overflow: 'hidden',
      }}
    >
      <Flex vertical gap={6} style={{ flex: 1 }}>
        {product.categories[0] && (
          <Typography.Text
            style={{
              fontSize: 11,
              color: '#C05A48',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {product.categories[0].name}
          </Typography.Text>
        )}
        <Typography.Text
          strong
          style={{ fontSize: 15, lineHeight: 1.35, color: '#1A1A1A' }}
        >
          {product.name}
        </Typography.Text>
        <Typography.Text
          style={{ color: '#E06D5B', fontWeight: 700, fontSize: 16, marginTop: 4 }}
        >
          {formatPrice(product.price)}
        </Typography.Text>
        <Button
          block
          style={{
            marginTop: 10,
            borderColor: '#E06D5B',
            color: '#E06D5B',
            borderRadius: 8,
            fontWeight: 500,
          }}
          onClick={() => onViewDetails(product)}
        >
          Ver detalhes
        </Button>
      </Flex>
    </Card>
  );
}

/* Catalog Section */
function CatalogSection({
  products,
  categories,
  loading,
  activeCategory,
  search,
  onCategoryChange,
  onSearch,
  onViewDetails,
}: {
  products: PublicProduct[];
  categories: PublicCategory[];
  loading: boolean;
  activeCategory: string;
  search: string;
  onCategoryChange: (key: string) => void;
  onSearch: (value: string) => void;
  onViewDetails: (p: PublicProduct) => void;
}) {
  const screens = useBreakpoint();
  const { Search } = Input;

  const categoryTabs = [
    { key: 'todos', label: 'Todos' },
    ...categories.map((c) => ({ key: c.slug, label: c.name })),
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
            onSearch={onSearch}
            onChange={(e) => !e.target.value && onSearch('')}
            style={{ width: 240, marginTop: 4 }}
            prefix={<SearchOutlined />}
          />
        </Flex>

        <Tabs
          activeKey={activeCategory}
          onChange={onCategoryChange}
          items={categoryTabs}
          style={{ marginBottom: 24 }}
          tabBarStyle={{ marginBottom: 0 }}
        />

        {loading ? (
          <Flex justify="center" style={{ padding: '64px 0' }}>
            <Spin size="large" />
          </Flex>
        ) : products.length === 0 ? (
          <Empty description="Nenhum produto encontrado" style={{ padding: '64px 0' }} />
        ) : (
          <Row gutter={[16, 24]}>
            {products.map((product) => (
              <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                <ProductCard product={product} onViewDetails={onViewDetails} />
              </Col>
            ))}
          </Row>
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
                      {t.occasion}
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
  return (
    <section
      style={{
        padding: screens.md ? '72px 24px' : '48px 20px',
        background: '#FFF4F1',
        borderBottom: '1px solid #F0E8E5',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Row gutter={[48, 40]} align="middle">
          <Col xs={24} md={14}>
            <Typography.Title
              level={2}
              style={{
                fontSize: screens.md ? 36 : 26,
                fontWeight: 700,
                color: '#1A1A1A',
                marginBottom: 12,
              }}
            >
              Vamos criar algo especial juntos?
            </Typography.Title>
            <Typography.Paragraph
              style={{ color: '#555', fontSize: 15, lineHeight: 1.8, marginBottom: 28 }}
            >
              Entre em contato para encomendar seu doce personalizado. Atendemos eventos,
              presentes corporativos e ocasiões especiais.
            </Typography.Paragraph>
            <Space size={12} wrap>
              <Button
                type="primary"
                size="large"
                icon={<WhatsAppOutlined />}
                href={whatsappLink(settings.whatsapp)}
                target="_blank"
                style={{
                  background: '#25D366',
                  borderColor: '#25D366',
                  borderRadius: 8,
                  height: 46,
                  paddingInline: 24,
                  fontWeight: 600,
                }}
              >
                WhatsApp
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
                    borderRadius: 8,
                    height: 46,
                    paddingInline: 24,
                    fontWeight: 600,
                  }}
                >
                  Instagram
                </Button>
              )}
            </Space>
          </Col>
          <Col xs={24} md={10}>
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: '28px',
                border: '1.5px solid #F0E8E5',
              }}
            >
              {settings.serviceHours && (
                <Flex gap={12} align="flex-start" style={{ marginBottom: 18 }}>
                  <ClockCircleOutlined
                    style={{ color: '#E06D5B', fontSize: 18, marginTop: 2 }}
                  />
                  <div>
                    <Typography.Text strong style={{ display: 'block', marginBottom: 2 }}>
                      Horário de atendimento
                    </Typography.Text>
                    <Typography.Text style={{ color: '#777', fontSize: 14 }}>
                      {settings.serviceHours}
                    </Typography.Text>
                  </div>
                </Flex>
              )}
              {settings.address && (
                <Flex gap={12} align="flex-start" style={{ marginBottom: 18 }}>
                  <ShopOutlined
                    style={{ color: '#E06D5B', fontSize: 18, marginTop: 2 }}
                  />
                  <div>
                    <Typography.Text strong style={{ display: 'block', marginBottom: 2 }}>
                      Localização
                    </Typography.Text>
                    <Typography.Text style={{ color: '#777', fontSize: 14 }}>
                      {settings.address}
                    </Typography.Text>
                  </div>
                </Flex>
              )}
              {settings.contactEmail && (
                <Flex gap={12} align="flex-start">
                  <MailOutlined
                    style={{ color: '#E06D5B', fontSize: 18, marginTop: 2 }}
                  />
                  <div>
                    <Typography.Text strong style={{ display: 'block', marginBottom: 2 }}>
                      E-mail
                    </Typography.Text>
                    <Typography.Text style={{ color: '#777', fontSize: 14 }}>
                      {settings.contactEmail}
                    </Typography.Text>
                  </div>
                </Flex>
              )}
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
}

/* Footer */
function SiteFooter({ settings }: { settings: AppSettings }) {
  return (
    <footer
      style={{
        background: '#1A1A1A',
        padding: '40px 24px',
        color: '#aaa',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
          <div>
            <Typography.Title
              level={5}
              style={{ color: '#fff', margin: 0, marginBottom: 4, fontSize: 16 }}
            >
              {settings.siteName ?? 'Confeitaria'}
            </Typography.Title>
            <Typography.Text style={{ color: '#666', fontSize: 13 }}>
              Feito com 🍰 e muito carinho
            </Typography.Text>
          </div>
          <Flex gap={16} align="center">
            {settings.instagram && (
              <a
                href={`https://instagram.com/${settings.instagram}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#888', fontSize: 20 }}
              >
                <InstagramOutlined />
              </a>
            )}
            {settings.whatsapp && (
              <a
                href={whatsappLink(settings.whatsapp)}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#888', fontSize: 20 }}
              >
                <WhatsAppOutlined />
              </a>
            )}
            {settings.contactEmail && (
              <a
                href={`mailto:${settings.contactEmail}`}
                style={{ color: '#888', fontSize: 20 }}
              >
                <MailOutlined />
              </a>
            )}
          </Flex>
        </Flex>
        <Divider style={{ borderColor: '#2A2A2A', margin: '24px 0 16px' }} />
        <Typography.Text style={{ color: '#555', fontSize: 12 }}>
          © {new Date().getFullYear()} {settings.siteName ?? 'Confeitaria'}. Todos os
          direitos reservados.
        </Typography.Text>
      </div>
    </footer>
  );
}

/* ─── Sticky Header ───────────────────────────────────────────────────────── */

function SiteHeader({ settings }: { settings: AppSettings }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.96)' : '#fff',
        borderBottom: '1px solid #F0E8E5',
        padding: '0 24px',
        backdropFilter: 'blur(8px)',
        transition: 'box-shadow 0.2s',
        boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography.Title
          level={4}
          style={{ margin: 0, color: '#E06D5B', fontSize: 20, fontWeight: 700 }}
        >
          {settings.siteName ?? 'Confeitaria'}
        </Typography.Title>
        <nav>
          <Space size={0}>
            {[
              { label: 'Cardápio', href: '#catalogo' },
              { label: 'Sobre', href: '#sobre' },
              { label: 'Contato', href: '#contato' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  padding: '0 16px',
                  color: '#444',
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: 'none',
                  display: 'inline-block',
                  lineHeight: '64px',
                  transition: 'color 0.15s',
                }}
              >
                {item.label}
              </a>
            ))}
          </Space>
        </nav>
      </div>
    </header>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function CatalogPage() {
  // App data
  const [settings] = useState<AppSettings>(MOCK_SETTINGS);
  const [about] = useState<AboutInfo>(MOCK_ABOUT);

  // Catalog state
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('todos');
  const [search, setSearch] = useState('');

  // Modal state
  const [selectedProduct, setSelectedProduct] = useState<PublicProduct | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // NOTE: Substitua os mocks abaixo pelas chamadas reais ao CatalogService
  const fetchProducts = useCallback(async (category?: string, searchTerm?: string) => {
    setLoading(true);
    try {
      // const params: { category?: string; search?: string } = {};
      // if (category && category !== 'todos') params.category = category;
      // if (searchTerm?.trim()) params.search = searchTerm.trim();
      // const res = await CatalogService.list(params);
      // setProducts(res.data);

      // MOCK – remova quando integrar com CatalogService
      await new Promise((r) => setTimeout(r, 600));
      setProducts([
        {
          id: 'p1',
          name: 'Bolo de Chocolate Belga',
          slug: 'bolo-chocolate-belga',
          price: 189.9,
          description: 'Massa úmida de cacau com ganache cremosa de chocolate belga 70%.',
          categories: [{ name: 'Bolos', slug: 'bolos' }],
        },
        {
          id: 'p2',
          name: 'Torta de Morango',
          slug: 'torta-morango',
          price: 145.0,
          description:
            'Torta fina de amêndoas com creme de confeiteiro e morangos frescos.',
          categories: [{ name: 'Tortas', slug: 'tortas' }],
        },
        {
          id: 'p3',
          name: 'Brownie Premium',
          slug: 'brownie-premium',
          price: 12.5,
          description: 'Brownie denso e fudgy com cobertura de flor de sal.',
          categories: [{ name: 'Doces', slug: 'doces' }],
        },
        {
          id: 'p4',
          name: 'Caixa de Biscoitos Artesanais',
          slug: 'biscoitos-artesanais',
          price: 58.0,
          description:
            'Mix de biscoitos amanteigados, de limão e de aveia com gotas de chocolate.',
          categories: [{ name: 'Biscoitos', slug: 'biscoitos' }],
        },
        {
          id: 'p5',
          name: 'Kit Brunch Especial',
          slug: 'kit-brunch-especial',
          price: 220.0,
          description:
            'Seleção de pães artesanais, geleias, bolos e biscoitos para brunch de 8 pessoas.',
          categories: [{ name: 'Brunch', slug: 'brunch' }],
        },
        {
          id: 'p6',
          name: 'Cupcakes (caixa com 6)',
          slug: 'cupcakes-caixa-6',
          price: 78.0,
          description: 'Cupcakes fofos com cobertura de buttercream em vários sabores.',
          categories: [{ name: 'Doces', slug: 'doces' }],
        },
        {
          id: 'p7',
          name: 'Bolo Red Velvet',
          slug: 'bolo-red-velvet',
          price: 175.0,
          description: 'Massa aveludada com cream cheese frosting levemente adocicado.',
          categories: [{ name: 'Bolos', slug: 'bolos' }],
        },
        {
          id: 'p8',
          name: 'Torta de Limão Siciliano',
          slug: 'torta-limao-siciliano',
          price: 138.0,
          description: 'Base crocante de biscoito com curd de limão e merengue italiano.',
          categories: [{ name: 'Tortas', slug: 'tortas' }],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    // const res = await CatalogService.listCategories();
    // setCategories(res.data);
    setCategories([
      { id: 'c1', name: 'Bolos', slug: 'bolos' },
      { id: 'c2', name: 'Tortas', slug: 'tortas' },
      { id: 'c3', name: 'Doces', slug: 'doces' },
      { id: 'c4', name: 'Biscoitos', slug: 'biscoitos' },
      { id: 'c5', name: 'Brunch', slug: 'brunch' },
    ]);
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts]);

  const handleCategoryChange = (key: string) => {
    setActiveCategory(key);
    fetchProducts(key, search);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    fetchProducts(activeCategory, value);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <AppHeader settings={settings} />
      <HeroSection settings={settings} />
      <SpecialtiesStrip />
      <AboutSection about={about} />
      <HowToOrderSection settings={settings} />
      <CatalogSection
        products={products}
        categories={categories}
        loading={loading}
        activeCategory={activeCategory}
        search={search}
        onCategoryChange={handleCategoryChange}
        onSearch={handleSearch}
        onViewDetails={(p) => {
          setSelectedProduct(p);
          setModalOpen(true);
        }}
      />
      <TestimonialsSection />
      <ContactSection settings={settings} />
      <SiteFooter settings={settings} />

      <ProductDetailModal
        product={selectedProduct}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedProduct(null);
        }}
        settings={settings}
      />
    </Layout>
  );
}
