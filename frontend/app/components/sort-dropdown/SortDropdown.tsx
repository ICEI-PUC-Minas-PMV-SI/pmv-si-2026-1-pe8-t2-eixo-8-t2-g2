import { Badge, Dropdown, Button, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { ArrowDownShortWide } from '../icon/components/ArrowDownShortWide';
import { ArrowUpWideShort } from '../icon/components/ArrowUpWideShort';
import { ArrowDown19, ArrowDownAZ, ArrowDownZA } from '../icon/components';
import { ArrowDown91 } from '../icon/components';

type SortState = {
  key: string;
  order: 'ascend' | 'descend';
};

type Props = {
  options: { key: string; label: string; type?: 'string' | 'number' | 'generic' }[];
  activeSorters: SortState[];
  onSelect: (key: string, order: 'ascend' | 'descend') => void;
  onClear: () => void;
};

const getSortIcon = (order: 'asc' | 'desc', type?: 'string' | 'number' | 'generic') => {
  const sortType = type || 'generic';
  switch (sortType) {
    case 'string':
      return order === 'asc' ? <ArrowDownAZ /> : <ArrowDownZA />;
    case 'number':
      return order === 'asc' ? <ArrowDown19 /> : <ArrowDown91 />;
    default:
      return order === 'asc' ? <ArrowDownShortWide /> : <ArrowUpWideShort />;
  }
};

export function SortDropdown({ options, activeSorters, onSelect, onClear }: Props) {
  const items = [
    ...options.flatMap((opt) => {
      return [
        {
          key: `${opt.key}|asc`,
          label: (
            <Space>
              {getSortIcon('asc', opt.type)}
              {opt.label}
              {/* <SortAscendingOutlined /> */}
            </Space>
          ),
        },
        {
          key: `${opt.key}|desc`,
          label: (
            <Space>
              {getSortIcon('desc', opt.type)}
              {opt.label}
              {/* <SortDescendingOutlined /> */}
            </Space>
          ),
        },
      ];
    }),
    { type: 'divider' as const },
    { key: 'clear', label: '❌ Limpar ordenação' },
  ];

  // Deriva as keys selecionadas a partir dos sorters ativos que pertencem a este dropdown
  const selectedKeys = activeSorters
    .filter((s) => options.some((o) => o.key === s.key))
    .map((s) => `${s.key}|${s.order === 'ascend' ? 'asc' : 'desc'}`);

  const active = activeSorters.filter((s) => options.some((o) => o.key === s.key));

  return (
    <Dropdown
      menu={{
        items,
        selectedKeys, // ← destaca visualmente a opção ativa
        selectable: true, // ← habilita o estilo de seleção no menu
        onClick: ({ key }) => {
          if (key === 'clear') return onClear();

          const separatorIdx = key.lastIndexOf('|');
          const field = key.slice(0, separatorIdx);
          const order = key.slice(separatorIdx + 1);
          onSelect(field, order === 'asc' ? 'ascend' : 'descend');
        },
      }}
      trigger={['click']}
    >
      <Badge count={active.length || null} size="small">
        <Button size="small">
          <Space>
            <DownOutlined />
          </Space>
        </Button>
      </Badge>
    </Dropdown>
  );
}
