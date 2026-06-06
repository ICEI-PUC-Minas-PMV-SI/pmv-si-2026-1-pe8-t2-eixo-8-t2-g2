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
import Text from 'antd/es/typography/Text';
import { useBreakpoint } from '~/hooks/useBreakpoint';
import type { ColumnsType } from 'antd/es/table';

const formatCategoryPeriod = (category: ProductCategory) => {
  if (!category.startsAt && !category.endsAt) {
    return '—';
  }

  const fmt = (d: string | Date, withYear: boolean) =>
    new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      ...(withYear
        ? { year: 'numeric', timeZone: 'America/Sao_Paulo' }
        : { timeZone: 'UTC' }),
    }).format(new Date(d));

  const withYear = !category.isRecurring;

  const start = category.startsAt ? fmt(category.startsAt, withYear) : '?';

  const end = category.endsAt ? fmt(category.endsAt, withYear) : '?';

  return `${start} → ${end}`;
};
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
  const isMobile = useBreakpoint('md');
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

  const columns: ColumnsType<ProductCategory> = [
    {
      key: 'sort',
      width: 60,
      hidden: isMobile,
      align: 'center' as const,
      render: () => <DragHandle />,
    },
    {
      hidden: !isMobile,
      title: 'Categoria',
      render: (_: any, record: ProductCategory) => (
        <Space orientation="vertical" size={2}>
          <Text strong>{record.name}</Text>

          {!record.startsAt ? (
            <Text type="secondary">Sem vigência</Text>
          ) : (
            <Space wrap size={4}>
              <Tag color={record.isRecurring ? 'blue' : 'default'}>
                {record.isRecurring ? 'Recorrente' : 'Temporária'}
              </Tag>

              <Text type="secondary">{formatCategoryPeriod(record)}</Text>
            </Space>
          )}
        </Space>
      ),
    },
    {
      hidden: isMobile,
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
      hidden: isMobile,
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
      hidden: isMobile,
      title: 'Período',
      render: (_: any, record: ProductCategory) => {
        if (!record.startsAt && !record.endsAt) return '—';

        return `${formatCategoryPeriod(record)}`;
      },
    },
    {
      title: '',
      dataIndex: 'isActive',
      width: 60,
      align: 'center',
      render: (value: boolean, record: ProductCategory) => (
        <Switch
          checkedChildren="Ativo"
          unCheckedChildren="Inativo"
          loading={loadingRows[record.id]}
          checked={record.isActive}
          onChange={(checked) => {
            handleToggleActive(record, checked);
          }}
        />
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
        styles={{
          body: isMobile ? { padding: 6 } : {},
        }}
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
              scroll={{ x: true }}
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
