import {
  Button,
  Card,
  Flex,
  Input,
  message,
  Pagination,
  Popconfirm,
  Space,
  Table,
  Tag,
} from 'antd';
import {
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { useTableQuery } from '~/hooks/useTableQuery';
import type {
  Product,
  ProductCategory,
  ProductCharacteristic,
  ProductCharacteristicType,
} from '~/@types/product';
import ProductController from '~/controllers/ProductController';
import type { ColumnsType } from 'antd/es/table';
import NumberUtil from '~/utils/NumberUtil';
import Text from 'antd/es/typography/Text';
import ProductCharacteristicController from '~/controllers/ProductCharacteristicController';
import { CharacteristicBadge } from './CharacteristicBadge';
import { ProductDrawer } from './ProductDrawer';
import { useCartStore } from '~/hooks/useCartStore';
import { ProductImage } from './ProductImage';
import ProductCategoryController from '~/controllers/ProductCategoryController';
import { CategoryChip } from './CategoryChip';
import { useBreakpoint } from '~/hooks/useBreakpoint';
import { ProductCard } from './ProductCard';

export function ProductList() {
  const isMobile = useBreakpoint('md');
  const [deleteProductState, setDeleteProductState] = useState({
    openModal: false,
    showButton: false,
    selectedRows: [] as string[],
  });
  const [productFormState, setProductFormState] = useState({
    isOpened: false,
    product: null as Product | null,
  });
  const productQuery = useTableQuery<Product>('products', (params) =>
    ProductController.list<Product>(params),
  );
  const addItem = useCartStore((state) => state.addItem);
  const {
    tableProps: { dataSource: characteristics = [] },
  } = useTableQuery<ProductCharacteristic>('characteristics', (params) =>
    ProductCharacteristicController.list<ProductCharacteristic>(params),
  );
  const {
    tableProps: { dataSource: categories = [] },
  } = useTableQuery<ProductCategory>('categories', (params) =>
    ProductCategoryController.list<ProductCategory>(params),
  );

  const openProductForm = (product?: Product) => {
    const characteristics = (product?.characteristics ||
      []) as ProductCharacteristicType[];
    setProductFormState({
      isOpened: true,
      product: product ? { ...product, characteristics } : null,
    });
  };

  const productColumns: ColumnsType<Product> = [
    {
      title: 'Produto',
      dataIndex: 'name',
      fixed: 'left',
      render: (_, record) => (
        <Space>
          <div
            style={{
              // width: 42,
              // height: 42,
              borderRadius: 12,
              overflow: 'hidden',
              background: '#f5f5f5',
              flexShrink: 0,
            }}
          >
            <ProductImage src={record.imageUrl ?? undefined} alt={record.name} />
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{record.name}</div>
            <Text type="secondary">{record.description}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Preço',
      dataIndex: 'price',
      width: 120,
      render: (value: number) => NumberUtil.currency(value),
    },
    {
      title: 'Categorias',
      dataIndex: 'categories',
      render: (categoryCollection: { category: ProductCategory }[]) => (
        <Space wrap>
          {categoryCollection?.map((currentCategory) => {
            const category = categories.find((c) => c.id === currentCategory.category.id);
            return category ? (
              <CategoryChip key={category.id} category={category} />
            ) : null;
          })}
        </Space>
      ),
    },
    {
      title: 'Características',
      dataIndex: 'characteristics',
      render: (charCollection: ProductCharacteristicType[]) => (
        <Space wrap>
          {charCollection?.map((currentChar) => {
            const char = characteristics.find(
              (c) => c.id === currentChar.characteristic.id,
            );
            return char ? (
              <CharacteristicBadge key={char.id} characteristic={char} />
            ) : null;
          })}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      width: 100,
      render: (value: boolean, record: Product) => (
        <Tag color={value ? 'green' : 'default'}>{value ? 'Ativo' : 'Inativo'}</Tag>
      ),
    },
    {
      title: 'Ações',
      width: 240,
      render: (_, record) => (
        <Space>
          <Button icon={<ShoppingCartOutlined />} onClick={() => addItem(record)}>
            Adicionar
          </Button>
          <Button icon={<EditOutlined />} onClick={() => openProductForm(record)}>
            Editar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProductDrawer
        drawerOpened={productFormState.isOpened}
        product={productFormState.product}
        onClose={() => {
          setProductFormState((state) => ({ ...state, isOpened: false }));
          productQuery.refetch();
        }}
      />
      {/* <Card
        title="Produtos"
        extra={
          <Space>
            <Popconfirm
              open={deleteProductState.openModal}
              title="Remover produtos selecionados"
              description="Tem certeza que deseja remover os produtos selecionados? Esta ação não pode ser desfeita."
              onConfirm={() => {
                ProductController.deleteMany(deleteProductState.selectedRows).then(
                  (result) => {
                    productQuery.refetch();
                    setDeleteProductState({
                      openModal: false,
                      showButton: false,
                      selectedRows: [],
                    });
                    switch (result.status) {
                      case 'success':
                        message.success(result.message);
                        break;
                      case 'failed':
                        message.error(result.message);
                        break;
                      case 'partial':
                        message.warning(result.message);
                        break;
                    }
                  },
                );
              }}
              onCancel={() => {
                setDeleteProductState((prevState) => {
                  return {
                    ...prevState,
                    openModal: false,
                  };
                });
              }}
              okText="Remover"
              cancelText="Cancelar"
              okButtonProps={{ danger: true }}
            >
              {deleteProductState.showButton && (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() =>
                    setDeleteProductState((state) => ({
                      ...state,
                      openModal: true,
                    }))
                  }
                >
                  Remover selecionados
                </Button>
              )}
            </Popconfirm>
            <Input
              placeholder="Buscar..."
              value={productQuery.params.search}
              onChange={(e) => productQuery.setSearch(e.target.value)}
            />
            
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openProductForm()}
            >
              Novo produto
            </Button>
          </Space>
        }
      > */}
      <Card title="Produtos">
        <Space
          orientation={isMobile ? 'vertical' : 'horizontal'}
          style={{
            width: '100%',
            marginBottom: 16,
          }}
        >
          <Input
            placeholder="Buscar..."
            value={productQuery.params.search}
            onChange={(e) => productQuery.setSearch(e.target.value)}
            style={{
              width: isMobile ? '100%' : 250,
            }}
          />

          <Space
            style={{
              width: isMobile ? '100%' : undefined,
            }}
          >
            {deleteProductState.showButton && (
              <Button danger icon={<DeleteOutlined />} block={isMobile}>
                Remover
              </Button>
            )}

            <Button
              type="primary"
              icon={<PlusOutlined />}
              block={isMobile}
              onClick={() => openProductForm()}
            >
              Novo produto
            </Button>
          </Space>
        </Space>
        {isMobile ? (
          <Space orientation="vertical" style={{ width: '100%' }}>
            {productQuery.tableProps.dataSource?.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categories={categories}
                characteristics={characteristics}
                onEdit={() => openProductForm(product)}
                onAddToCart={() => addItem(product)}
              />
            ))}
            {productQuery.tableProps.pagination && (
              <Flex justify="center" style={{ paddingTop: 8 }}>
                <Pagination
                  {...productQuery.tableProps.pagination}
                  simple
                  size="small"
                  onChange={productQuery.setPage}
                />
              </Flex>
            )}
          </Space>
        ) : (
          <Table
            style={{ overflowX: 'auto' }}
            rowSelection={{
              type: 'checkbox',
              onChange: (selectedRowKeys) => {
                setDeleteProductState((state) => ({
                  ...state,
                  showButton: selectedRowKeys.length > 0,
                  selectedRows: selectedRowKeys as string[],
                }));
              },
            }}
            columns={productColumns}
            {...productQuery.tableProps}
          />
        )}
      </Card>
    </>
  );
}
