import React, { createContext, useContext, useMemo } from 'react';

import { Button, Card, Image, Input, Space, Table, Typography, Upload } from 'antd';

import type { UploadProps } from 'antd';

import {
  HolderOutlined,
  PlusOutlined,
  PictureOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

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

interface Props {
  items: AboutItem[];
  onChange: (items: AboutItem[]) => void;
  onDeletePersistedItem?: (id: string) => void;
}

interface RowContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: any;
}

const RowContext = createContext<RowContextProps>({});

function DragHandle() {
  const { setActivatorNodeRef, listeners } = useContext(RowContext);

  return (
    <Button
      type="text"
      icon={<HolderOutlined />}
      style={{ cursor: 'grab' }}
      ref={setActivatorNodeRef}
      {...listeners}
    />
  );
}

function SortableRow(props: any) {
  const isPlaceholder = props.className?.includes('ant-table-placeholder');

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props['data-row-key'],
    disabled: isPlaceholder,
  });

  if (isPlaceholder) {
    return <tr {...props} />;
  }

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging
      ? {
          position: 'relative',
          zIndex: 9999,
        }
      : {}),
  };

  const contextValue = useMemo(
    () => ({
      setActivatorNodeRef,
      listeners,
    }),
    [setActivatorNodeRef, listeners],
  );

  return (
    <RowContext.Provider value={contextValue}>
      <tr {...props} ref={setNodeRef} style={style} {...attributes} />
    </RowContext.Provider>
  );
}

export function AboutItemList({ items, onChange, onDeletePersistedItem }: Props) {
  const updateItem = (key: string, partial: Partial<AboutItem>) => {
    onChange(
      items.map((item) =>
        (item.id || item.tempId) === key
          ? {
              ...item,
              ...partial,
            }
          : item,
      ),
    );
  };

  const removeItem = (record: AboutItem) => {
    const key = record.id || record.tempId;

    if (record.icon && record.icon.startsWith('blob:')) {
      URL.revokeObjectURL(record.icon);
    }

    if (record.id) {
      onDeletePersistedItem?.(record.id);
    }

    onChange(items.filter((item) => (item.id || item.tempId) !== key));
  };

  const addItem = () => {
    onChange([
      ...items,
      {
        tempId: crypto.randomUUID(),
        text: '',
        icon: '',
        orderIndex: items.length + 1,
      },
    ]);
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => (item.id || item.tempId) === active.id);

    const newIndex = items.findIndex((item) => (item.id || item.tempId) === over.id);

    const reordered = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
      ...item,
      orderIndex: index + 1,
    }));

    onChange(reordered);
  };

  const uploadProps = (record: AboutItem): UploadProps => ({
    showUploadList: false,

    beforeUpload(file) {
      const key = record.id || record.tempId || '';

      if (record.icon && record.icon.startsWith('blob:')) {
        URL.revokeObjectURL(record.icon);
      }

      const url = URL.createObjectURL(file);

      updateItem(key, {
        icon: url,
        file,
      });

      return false;
    },
  });

  const columns = [
    {
      width: 60,
      align: 'center' as const,

      render: () => <DragHandle />,
    },
    {
      title: 'Texto',

      render: (_: any, record: AboutItem) => {
        const key = record.id || record.tempId;

        return (
          <Input
            value={record.text}
            placeholder="Digite o texto..."
            maxLength={50}
            showCount
            onChange={(e) => {
              updateItem(key || '', {
                text: e.target.value,
              });
            }}
          />
        );
      },
    },

    {
      width: 80,

      align: 'center' as const,

      render: (_: any, record: AboutItem) => (
        <Button
          danger
          type="text"
          icon={<DeleteOutlined />}
          onClick={() => removeItem(record)}
        />
      ),
    },
  ];

  return (
    <Card
      title="Diferenciais"
      extra={
        <Space>
          <Typography.Text type="secondary">{items.length}/5</Typography.Text>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={addItem}
            disabled={items.length >= 5}
          >
            Adicionar Item
          </Button>
        </Space>
      }
    >
      <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
        <SortableContext
          items={items.map((item) => item.id || item.tempId || '')}
          strategy={verticalListSortingStrategy}
        >
          <Table
            pagination={false}
            dataSource={items}
            rowKey={(record) => record.id || record.tempId!}
            components={{
              body: {
                row: SortableRow,
              },
            }}
            columns={columns}
          />
        </SortableContext>
      </DndContext>
    </Card>
  );
}
