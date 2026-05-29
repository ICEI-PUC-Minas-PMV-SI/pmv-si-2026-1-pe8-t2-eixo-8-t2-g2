import { useEffect, useState, useCallback } from 'react';
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
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import {
  CatalogService,
  type PublicProduct,
  type PublicCategory,
} from '~/services/CatalogService';
import { Modal } from 'antd';

// Versão alternativa embutida para ProductDetailModal, para evitar dependências circulares e simplificar a estrutura do projeto.
function ProductDetailModal({
  product,
  open,
  onClose,
}: {
  product: PublicProduct | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      title={product?.name ?? 'Produto'}
      open={open}
      onOk={onClose}
      onCancel={onClose}
      okText="Fechar"
    >
      {product ? (
        <div>
          <p>
            <strong>Preço:</strong>{' '}
            {product.price?.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </p>
          <p>
            <strong>Descrição:</strong>
          </p>
          <p>{(product as any).description ?? '—'}</p>
        </div>
      ) : (
        <p>Nenhum produto selecionado.</p>
      )}
    </Modal>
  );
}

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

// Formata preço para R$
function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Retorna imagem placeholder baseada na categoria do produto
function getProductImage(product: PublicProduct) {
  const categoryNames = product.categories.map((c) => c.name.toLowerCase()).join(' ');
  const slug = product.slug.toLowerCase();

  // Usa Unsplash para imagens de comida baseadas na categoria/nome
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

  // Seed baseado no id para consistência
  const seed = product.id.charCodeAt(0) + product.id.charCodeAt(1);
  return `https://source.unsplash.com/400x300/?${keyword}&sig=${seed}`;
}

export function CatalogPage() {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<PublicProduct | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchProducts = useCallback(async (category?: string, searchTerm?: string) => {
    setLoading(true);
    try {
      const params: { category?: string; search?: string } = {};
      if (category && category !== 'todos') params.category = category;
      if (searchTerm?.trim()) params.search = searchTerm.trim();
      const res = await CatalogService.list(params);
      setProducts(res.data);
    } catch (err) {
      console.error('Erro ao carregar catálogo:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await CatalogService.listCategories();
      setCategories(res.data);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
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

  const handleViewDetails = (product: PublicProduct) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const categoryTabs = [
    { key: 'todos', label: 'Todos' },
    ...categories.map((c) => ({ key: c.slug, label: c.name })),
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Content
        style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px', width: '100%' }}
      >
        {/* Cabeçalho da seção */}
        <Flex justify="space-between" align="flex-start" style={{ marginBottom: 4 }}>
          <div>
            <Title level={2} style={{ margin: 0, color: '#222' }}>
              Nossos Produtos
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Feitos artesanalmente com ingredientes selecionados
            </Text>
          </div>

          {/* Campo de busca */}
          <Search
            placeholder="Buscar produtos..."
            allowClear
            onSearch={handleSearch}
            onChange={(e) => !e.target.value && handleSearch('')}
            style={{ width: 240, marginTop: 4 }}
            prefix={<SearchOutlined />}
          />
        </Flex>

        {/* Abas de categoria */}
        <Tabs
          activeKey={activeCategory}
          onChange={handleCategoryChange}
          items={categoryTabs}
          style={{ marginBottom: 16 }}
          tabBarStyle={{ marginBottom: 0 }}
        />

        {/* Grade de produtos */}
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
                <ProductCard product={product} onViewDetails={handleViewDetails} />
              </Col>
            ))}
          </Row>
        )}
      </Content>

      {/* Modal de detalhamento do produto */}
      <ProductDetailModal
        product={selectedProduct}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedProduct(null);
        }}
      />
    </Layout>
  );
}

/* ─── Card individual de produto ─────────────────────────────────────────── */

type ProductCardProps = {
  product: PublicProduct;
  onViewDetails: (product: PublicProduct) => void;
};

function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const imageUrl = getProductImage(product);
  const categoryName = product.categories[0]?.name ?? '';

  return (
    <Card
      hoverable
      cover={
        <div
          style={{
            height: 160,
            overflow: 'hidden',
            borderRadius: '8px 8px 0 0',
            background: '#f5f5f5',
          }}
        >
          <img
            alt={product.name}
            src={imageUrl}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://placehold.co/400x300/f5f0eb/c4a882?text=Produto';
            }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      }
      styles={{ body: { padding: '12px 16px 16px' } }}
      style={{
        borderRadius: 8,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Flex vertical gap={4} style={{ flex: 1 }}>
        <Text strong style={{ fontSize: 15, lineHeight: '1.3', color: '#222' }}>
          {product.name}
        </Text>

        {categoryName && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {categoryName}
          </Text>
        )}

        <Text style={{ color: '#E06D5B', fontWeight: 700, fontSize: 15, marginTop: 4 }}>
          {formatPrice(product.price)}
        </Text>

        <Button
          block
          style={{
            marginTop: 8,
            borderColor: '#E06D5B',
            color: '#E06D5B',
            borderRadius: 6,
          }}
          onClick={() => onViewDetails(product)}
        >
          Ver detalhes
        </Button>
      </Flex>
    </Card>
  );
}
