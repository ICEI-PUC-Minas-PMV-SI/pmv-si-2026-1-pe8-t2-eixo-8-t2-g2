import {
  Col,
  Empty,
  Flex,
  Grid,
  Input,
  message,
  Pagination,
  Row,
  Spin,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import type { PublicCategory } from '~/@types/category';
import type { PublicProduct } from '~/@types/product';
import ProductCategoryController from '~/controllers/ProductCategoryController';
import ProductController from '~/controllers/ProductController';
import { useCartStore } from '~/hooks/useCartStore';
import { useTableQuery } from '~/hooks/useTableQuery';
import { SearchOutlined } from '@ant-design/icons';
import { ProductCard } from './ProductCard';
const PAGE_SIZE = 8;

export function CatalogSection({
  onViewDetails,
}: {
  onViewDetails: (p: PublicProduct) => void;
}) {
  const screens = Grid.useBreakpoint();
  const { Search } = Input;
  const [searchInput, setSearchInput] = useState('');
  const productQuery = useTableQuery<PublicProduct>(
    'public-products',
    (params) => ProductController.list<PublicProduct>(params),
    {
      initialParams: { pageSize: PAGE_SIZE },
      persist: false,
    },
  );
  const { tableProps, setSearch, params, setFilters } = productQuery;
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchInput, setSearch]);

  const {
    tableProps: { dataSource: rawCategories = [] },
  } = useTableQuery<PublicCategory>('public-categories', (params) =>
    ProductCategoryController.list<PublicCategory>({ ...params, pageSize: 100 }),
  );

  const [activeCategory, setActiveCategory] = useState<string>('all');

  const products = (tableProps.dataSource ?? []) as PublicProduct[];
  const total = tableProps.pagination ? ((tableProps.pagination as any).total ?? 0) : 0;
  const currentPage = (tableProps.pagination as any)?.current ?? 1;

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
        maxWidth: '100vw',
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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
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
