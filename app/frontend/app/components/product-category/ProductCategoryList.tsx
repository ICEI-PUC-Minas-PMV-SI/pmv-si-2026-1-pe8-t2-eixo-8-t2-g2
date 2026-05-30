import React, { useMemo, useContext, useState, useEffect } from 'react';
import { Card, Space, Button, Table, message, Input } from 'antd';
import { HolderOutlined, PlusOutlined } from '@ant-design/icons';
import { ModalAddProductCategory } from '../product-category/ModalAddProductCategory';

import { DndContext, type DragEndEvent } from '@dnd-kit/core';

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import type { ProductCategory } from '~/@types/product';
import ProductCategoryController from '~/controllers/ProductCategoryController';
import { useTableQuery } from '~/hooks/useTableQuery';

interface RowContextProps {
  setActivatorNodeRef?: (el: HTMLElement | null) => void;
  listeners?: any;
}

const RowContext = React.createContext<RowContextProps>({});

// 🔥 Botão de drag
const DragHandle = () => {
  const { setActivatorNodeRef, listeners } = useContext(RowContext);

  return (
    <Button
      type="text"
      size="small"
      icon={<HolderOutlined />}
      style={{ cursor: 'grab' }}
      ref={setActivatorNodeRef}
      {...listeners}
    />
  );
};

// 🔥 Row customizada com sortable
const SortableRow = (props: any) => {
  const isPlaceholder = props.className?.includes('ant-table-placeholder');
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props['data-row-key'], disabled: isPlaceholder });

  if (isPlaceholder) {
    return <tr {...props} />;
  }

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  };

  const contextValue = useMemo(
    () => ({ setActivatorNodeRef, listeners }),
    [setActivatorNodeRef, listeners],
  );

  return (
    <RowContext.Provider value={contextValue}>
      <tr {...props} ref={setNodeRef} style={style} {...attributes} />
    </RowContext.Provider>
  );
};

export function ProductCategoryList() {
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const { tableProps, forceRefetch, params, setSearch } = useTableQuery<ProductCategory>(
    'product-category',
    (params) => ProductCategoryController.list<ProductCategory>(params),
  );

  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);

  const [localData, setLocalData] = useState<ProductCategory[]>([]);

  useEffect(() => {
    if (tableProps.dataSource) {
      setLocalData([...tableProps.dataSource]);
    }
  }, [tableProps.dataSource]);

  // 🔥 Drag end
  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const activeIndex = localData.findIndex((i) => i.id === active.id);
    const overIndex = localData.findIndex((i) => i.id === over?.id);

    const reordered = arrayMove([...localData], activeIndex, overIndex).map(
      (category, index) => ({ ...category, orderIndex: index + 1 }),
    );

    setLocalData(reordered);

    await ProductCategoryController.reorder(
      reordered.map((category) => ({
        id: category.id,
        orderIndex: category.orderIndex,
      })),
    );

    forceRefetch();
  };

  // 🔥 Colunas
  const columns = [
    {
      key: 'sort',
      width: 60,
      align: 'center' as const,
      render: () => <DragHandle />,
    },
    {
      title: 'Nome',
      dataIndex: 'name',
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
    },
    {
      title: 'Status',
      dataIndex: 'status',
    },
    {
      title: 'Ações',
      render: (_: any, record: ProductCategory) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              setEditingCategory(record);
              setCategoryModalOpen(true);
            }}
          >
            Editar
          </Button>
          <Button
            size="small"
            danger
            onClick={async () => {
              await ProductCategoryController.delete(record.id);
              // setCategories((c) => c.filter((x) => x.id !== record.id));
              forceRefetch();
              message.success('Categoria removida.');
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
        title="Categorias"
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
              onClick={() => setCategoryModalOpen(true)}
            >
              Nova categoria
            </Button>
          </Space>
        }
      >
        <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
          <SortableContext
            items={localData.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <Table
              components={{
                body: {
                  row: SortableRow,
                },
              }}
              dataSource={localData}
              columns={columns}
              {...tableProps}
            />
          </SortableContext>
        </DndContext>
      </Card>

      <ModalAddProductCategory
        isOpened={categoryModalOpen}
        editingCategory={editingCategory}
        onClose={(reason) => {
          setCategoryModalOpen(false);
          setEditingCategory(null);
          if (reason === 'save') forceRefetch();
        }}
      />
    </>
  );
}
