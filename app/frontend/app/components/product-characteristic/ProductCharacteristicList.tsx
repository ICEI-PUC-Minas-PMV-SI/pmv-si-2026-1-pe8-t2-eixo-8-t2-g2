import { Card, Space, Button, Table, message, Input } from 'antd';
import { PlusOutlined, PictureOutlined } from '@ant-design/icons';
import type { ProductCharacteristic } from '~/@types/product';
import ProductCharacteristicController from '~/controllers/ProductCharacteristicController';
import { useTableQuery } from '~/hooks/useTableQuery';
import { SortDropdown } from '../sort-dropdown/SortDropdown';
import { useState } from 'react';
import { ProductCharacteristicForm } from './ProductCharacteristicForm';

export function ProductCharacteristicList() {
  const [charModalState, setCharModalState] = useState(false);
  const { tableProps, forceRefetch, params, setSearch, updateSorter, clearSorters } =
    useTableQuery<ProductCharacteristic>('product-characteristic', (params) =>
      ProductCharacteristicController.list<ProductCharacteristic>(params),
    );

  const [editingChar, setEditingChar] = useState<ProductCharacteristic | null>(null);

  // 🔥 Colunas
  const columns = [
    {
      title: 'Ícone',
      dataIndex: 'name',
      render: (_: any, record: ProductCharacteristic) => (
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
            {record.iconUrl ? (
              <img
                src={record.iconUrl}
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
        </Space>
      ),
    },
    {
      title: (
        <Space>
          Nome
          <SortDropdown
            options={[{ key: 'name', label: 'Nome', type: 'string' }]}
            activeSorters={params.sorters}
            onSelect={updateSorter}
            onClear={() => {
              clearSorters(['name']);
            }}
          />
        </Space>
      ),
      dataIndex: 'name',
    },
    {
      title: 'Ações',
      render: (_: any, record: ProductCharacteristic) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              setEditingChar(record);
              setCharModalState(true);
            }}
          >
            Editar
          </Button>

          <Button
            size="small"
            danger
            onClick={async () => {
              await ProductCharacteristicController.delete(record.id);
              // setCategories((c) => c.filter((x) => x.id !== record.id));
              forceRefetch();
              message.success('Característica removida.');
            }}
          >
            Excluir
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title="Características"
        extra={
          <Space>
            <Input
              placeholder="Buscar..."
              value={params.search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCharModalState(true)}
            >
              Nova característica
            </Button>
          </Space>
        }
      >
        <Table dataSource={tableProps.dataSource} columns={columns} {...tableProps} />
      </Card>
      <ProductCharacteristicForm
        isOpened={charModalState}
        editingChar={editingChar}
        onClose={(reason) => {
          setCharModalState(false);
          setEditingChar(null);
          if (reason === 'save') forceRefetch();
        }}
      />
    </>
    
  );
}
