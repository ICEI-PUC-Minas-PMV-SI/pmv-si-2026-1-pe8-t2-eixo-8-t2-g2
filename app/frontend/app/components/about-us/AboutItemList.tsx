import React, { useMemo, useContext, useState, useEffect } from 'react';
import { Card, Space, Button, Table, message, Input } from 'antd';
import { HolderOutlined, PlusOutlined, PictureOutlined } from '@ant-design/icons';

import { DndContext, type DragEndEvent } from '@dnd-kit/core';

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import type { AboutItem } from '~/@types/about';
import AboutItemController from '~/controllers/AboutItemController';
import { useTableQuery } from '~/hooks/useTableQuery';
// import { ref } from 'process';

interface Props { 
  setItemModalOpen: (v: boolean) => void;
  onRefetch?: () => void; 
}

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

export function AboutItemList({ setItemModalOpen }: Props) {
  const { tableProps, forceRefetch, setSearch, params } = useTableQuery<AboutItem>(
    'about-item',
    (params) => AboutItemController.list<AboutItem>(params),
  );

  const [localData, setLocalData] = useState<AboutItem[]>([]);

    useEffect(() => {
        if (tableProps.dataSource) {
        setLocalData([...tableProps.dataSource]);
        }
    }, [tableProps.dataSource]);

    const onDragEnd = async ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id) return;

        const activeIndex = localData.findIndex((i) => i.id === active.id);
        const overIndex = localData.findIndex((i) => i.id === over?.id);

        const reordered = arrayMove([...localData], activeIndex, overIndex).map(
            (item, index) => ({ ...item, orderIndex: index + 1 })
        );

        setLocalData(reordered);

        await AboutItemController.reorder(reordered.map((item) => ({
            id: item.id,
            orderIndex: item.orderIndex,
        })));

        forceRefetch();
    };

  const columns = [
    {
      key: 'sort',
      width: 60,
      align: 'center' as const,
      render: () => <DragHandle />,
    },
    {
      title: 'Ordem',
      dataIndex: 'orderIndex',
    },
    {
      title: 'Ícone',
      dataIndex: 'name',
      render: (_: any, record: AboutItem) => (
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
            {record.icon ? (
              <img
                src={record.icon}
                alt={record.text}
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
      title: 'Texto',
      dataIndex: 'text',
    },
    
    {
      title: 'Ações',
      render: (_: any, record: AboutItem) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              // exemplo de edição
              message.info(`Editar ${record.text}`);
            }}
          >
            Editar
          </Button>

          <Button
            size="small"
            danger
            onClick={async () => {
              await AboutItemController.delete(record.id);
              forceRefetch();
              message.success('Diferencial removido.');
            }}
          >
            Excluir
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Diferenciais"
      extra={
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setItemModalOpen(true)}
          >
            Adicionar Item
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
            components={{ body: { row: SortableRow } }}
            rowKey="id"
            dataSource={localData}
            columns={columns}
            {...tableProps}
            pagination={false}
          />
        </SortableContext>
      </DndContext>
    </Card>
  );
}
