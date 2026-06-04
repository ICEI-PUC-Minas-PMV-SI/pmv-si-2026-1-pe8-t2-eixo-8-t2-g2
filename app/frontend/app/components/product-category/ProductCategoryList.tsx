import React, { useMemo, useContext, useState, useEffect } from 'react';
import { Card, Space, Button, Table, message, Input, Tag, Switch } from 'antd';
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
import { SortDropdown } from '../sort-dropdown/SortDropdown';

interface RowContextProps {
  setActivatorNodeRef?: (el: HTMLElement | null) => void;
  listeners?: any;
}

const RowContext = React.createContext<RowContextProps>({});

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

const SortableRow = (props: any) => {
  const isPlaceholder = props.className?.includes('ant-table-placeholder');
  if (isPlaceholder) {
    return <tr {...props} />;
  }
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props['data-row-key'], disabled: isPlaceholder });

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
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [localData, setLocalData] = useState<ProductCategory[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingRows, setLoadingRows] = useState<Record<string, boolean>>({});
  const { tableProps, forceRefetch, params, setSearch, updateSorter, clearSorters } =
    useTableQuery<ProductCategory>('product-category', (params) =>
      ProductCategoryController.list<ProductCategory>(params),
    );

  const handleToggleActive = async (row: ProductCategory, checked: boolean) => {
    try {
      setLoadingRows((prev) => ({
        ...prev,
        [row.id]: true,
      }));

      await ProductCategoryController.toggleActive(row.id, checked);
      setLocalData((prev) =>
        prev.map((item) => (item.id === row.id ? { ...item, isActive: checked } : item)),
      );
    } finally {
      setLoadingRows((prev) => ({
        ...prev,
        [row.id]: false,
      }));
    }
  };

  useEffect(() => {
    if (tableProps.dataSource) {
      setLocalData([...tableProps.dataSource]);
      setIsDirty(false);
    }
  }, [tableProps.dataSource]);

  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const activeIndex = localData.findIndex((i) => i.id === active.id);
    const overIndex = localData.findIndex((i) => i.id === over?.id);

    const reordered = arrayMove([...localData], activeIndex, overIndex).map(
      (category, index) => ({ ...category, orderIndex: index + 1 }),
    );

    setLocalData(reordered);
    setIsDirty(true);
  };

  const handleSaveOrder = async () => {
    setIsSaving(true);
    try {
      await ProductCategoryController.reorder(
        localData.map((category) => ({
          id: category.id,
          orderIndex: category.orderIndex,
        })),
      );
      message.success('Ordenação salva com sucesso!');
      setIsDirty(false);
      forceRefetch();
    } catch {
      message.error('Erro ao salvar ordenação.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardOrder = () => {
    if (tableProps.dataSource) {
      setLocalData([...tableProps.dataSource]);
    }
    setIsDirty(false);
  };

  const columns = [
    {
      key: 'sort',
      width: 60,
      align: 'center' as const,
      render: () => <DragHandle />,
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
      title: 'Vigência',
      width: 80,
      align: 'center' as const,
      render: (_: any, record: ProductCategory) => {
        if (!record.startsAt && !record.endsAt) return '—';
        return record.isRecurring ? (
          <Tag color="blue">Anual</Tag>
        ) : (
          <Tag color="default">Única</Tag>
        );
      },
    },
    {
      title: 'Período',
      render: (_: any, record: ProductCategory) => {
        if (!record.startsAt && !record.endsAt) return '—';

        const fmt = (d: string | Date, withYear: boolean) =>
          new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            ...(withYear
              ? { year: 'numeric', timeZone: 'America/Sao_Paulo' }
              : { timeZone: 'UTC' }),
          }).format(new Date(d));

        const withYear = !record.isRecurring;
        const start = record.startsAt ? fmt(record.startsAt, withYear) : '?';
        const end = record.endsAt ? fmt(record.endsAt, withYear) : '?';

        return `${start} → ${end}`;
      },
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      width: 100,
      render: (value: boolean, record: ProductCategory) => (
        <Switch
          checkedChildren="Ativo"
          unCheckedChildren="Inativo"
          loading={loadingRows[record.id]}
          checked={record.isActive}
          onChange={(checked) => {
            handleToggleActive(record, checked);
            // event.stopPropagation();
          }}
        />
        // <Tag color={value ? 'green' : 'default'}>{value ? 'Ativo' : 'Inativo'}</Tag>
      ),
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
              disabled={isDirty}
            />
            {isDirty ? (
              <>
                <Button onClick={handleDiscardOrder}>Descartar</Button>
                <Button type="primary" loading={isSaving} onClick={handleSaveOrder}>
                  Salvar ordem
                </Button>
              </>
            ) : (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCategoryModalOpen(true)}
              >
                Nova categoria
              </Button>
            )}
          </Space>
        }
      >
        <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
          <SortableContext
            items={localData.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <Table
              {...tableProps}
              components={{
                body: {
                  row: SortableRow,
                },
              }}
              columns={columns}
              dataSource={localData}
              rowKey="id"
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
