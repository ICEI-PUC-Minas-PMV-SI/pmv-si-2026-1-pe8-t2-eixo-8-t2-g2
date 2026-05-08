import { Button, Card, Input, message, Popconfirm, Space, Table, Tag } from 'antd';
import {
  EditOutlined,
  PictureOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { useTableQuery } from '~/hooks/useTableQuery';
import type { Product, ProductCharacteristic } from '~/@types/product';
import ProductController from '~/controllers/ProductController';
import type { ColumnsType } from 'antd/es/table';
import NumberUtil from '~/utils/NumberUtil';
import Text from 'antd/es/typography/Text';
import ProductCharacteristicController from '~/controllers/ProductCharacteristicController';
import { CharacteristicBadge } from './CharacteristicBadge';
import { ModalAddProductCategory } from '../product-category/ModalAddProductCategory';
import { ProductDrawer } from './ProductDrawer';

export function ProductList() {
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
  const {
    tableProps: { dataSource: characteristics = [] },
  } = useTableQuery<ProductCharacteristic>('characteristics', (params) =>
    ProductCharacteristicController.list<ProductCharacteristic>(params),
  );

  const openProductForm = (product?: Product) => {
    setProductFormState({
      isOpened: true,
      product: product || null,
    });
  };

  const productColumns: ColumnsType<Product> = [
    {
      title: 'Produto',
      dataIndex: 'name',
      render: (_, record) => (
        <Space>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              overflow: 'hidden',
              background: '#f5f5f5',
              flexShrink: 0,
            }}
          >
            {record.imageUrl ? (
              <img
                src={record.imageUrl}
                alt={record.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <PictureOutlined />
              </div>
            )}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{record.name}</div>
            <Text type="secondary">{record.slug}</Text>
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
      title: 'Características',
      dataIndex: 'characteristics',
      render: (ids: string[]) => (
        <Space wrap>
          {ids.map((id) => {
            const char = characteristics.find((c) => c.id === id);
            return char ? <CharacteristicBadge key={id} characteristic={char} /> : null;
          })}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      width: 100,
      render: (value: boolean, record: Product) => (
        // <Switch
        //   checkedChildren="Ativo"
        //   unCheckedChildren="Inativo"
        //   defaultChecked={value}
        //   onChange={(checked) => {
        //     setProducts((current) => {
        //       return current.map((p) =>
        //         p.id === record.id ? { ...p, isActive: checked } : p,
        //       );
        //     });
        //   }}
        // />
        <Tag color={value ? 'green' : 'default'}>{value ? 'Ativo' : 'Inativo'}</Tag>
      ),
    },
    {
      title: 'Ações',
      width: 120,
      render: (_, record) => (
        <Button icon={<EditOutlined />} onClick={() => openProductForm(record)}>
          Editar
        </Button>
      ),
    },
  ];

  return (
    <>
      <ProductDrawer
        drawerOpened={productFormState.isOpened}
        product={productFormState.product}
        onClose={() => setProductFormState((state) => ({ ...state, isOpened: false }))}
      />
      <Card
        title="Produtos"
        extra={
          <Space>
            <Popconfirm
              open={deleteProductState.openModal}
              title="Remover produtos selecionados"
              description="Tem certeza que deseja remover os produtos selecionados? Esta ação não pode ser desfeita."
              onConfirm={() => {
                ProductController.deleteMany(deleteProductState.selectedRows).then(() => {
                  productQuery.refetch();
                  setDeleteProductState({
                    openModal: false,
                    showButton: false,
                    selectedRows: [],
                  });
                  message.success('Produtos removidos.');
                });
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
            {/* <Button onClick={() => setCharModalOpen(true)}>Nova característica</Button> */}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openProductForm()}
            >
              Novo produto
            </Button>
          </Space>
        }
      >
        <Table
          rowSelection={{
            type: 'checkbox',
            onChange: (selectedRowKeys) => {
              console.log('Selected row keys: ', selectedRowKeys);
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
      </Card>
    </>
  );
}
