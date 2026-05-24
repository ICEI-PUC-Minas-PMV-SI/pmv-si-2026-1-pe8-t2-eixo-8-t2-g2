import { Card, Space, Button, Table, message, Input, Switch, Tooltip } from 'antd';
import { useTableQuery } from '~/hooks/useTableQuery';
import { SortDropdown } from '../sort-dropdown/SortDropdown';
import type { UserList } from '~/@types/user';
import UserController from '~/controllers/UserController';
import { useAuthStore } from '~/hooks/useAuthStore';
import { useState } from 'react';

export function UserPage() {
  const { tableProps, forceRefetch, params, setSearch, updateSorter, clearSorters } =
    useTableQuery<UserList>('user-list', (params) =>
      UserController.list<UserList>(params),
    );

  const { user } = useAuthStore();
  const [loadingRows, setLoadingRows] = useState<Record<string, boolean>>({});

  const handleRoleChange = async (row: UserList, checked: boolean) => {
    try {
      setLoadingRows((prev) => ({
        ...prev,
        [row.id]: true,
      }));

      await UserController.changeRole(row.id, checked ? 'admin' : 'customer');

      forceRefetch();
    } finally {
      setLoadingRows((prev) => ({
        ...prev,
        [row.id]: false,
      }));
    }
  };

  const columns = [
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
      title: (
        <Space>
          Criado em
          <SortDropdown
            options={[{ key: 'createdAt', label: 'Data' }]}
            activeSorters={params.sorters}
            onSelect={updateSorter}
            onClear={() => {
              clearSorters(['createdAt']);
            }}
          />
        </Space>
      ),
      render: (value: UserList) => {
        return new Date(value.createdAt).toLocaleString().replace(', ', ' às ');
      },
      key: 'createdAt',
    },
    {
      title: 'Admininistrador',
      dataIndex: 'role',
      filters: [
        { text: 'Sim', value: 'admin' },
        { text: 'Não', value: 'customer' },
      ],
      // filterMode: 'tree',
      filteredValue: (params.filters['role'] as string[]) || [],
      onFilter: (filtervalue: any, record: UserList) => {
        return record.role === filtervalue;
      },
      render: (role: string, row: UserList & { loadingRoleChange?: boolean }) => {
        return (
          <Tooltip
            title={
              row.id === user?.id ? 'Você não pode alterar seu próprio papel' : undefined
            }
          >
            <Switch
              disabled={row.id === user?.id}
              value={role === 'admin'}
              loading={loadingRows[row.id]}
              onChange={(value: boolean) => {
                handleRoleChange(row, value);
              }}
            />
          </Tooltip>
        );
      },
    },
    {
      title: 'Ações',
      render: (_: any, record: UserList) => (
        <Space>
          <Button
            size="small"
            danger
            onClick={async () => {
              await UserController.delete(record.id);
              // setCategories((c) => c.filter((x) => x.id !== record.id));
              forceRefetch();
              message.success('Usuário removido.');
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
        title="Usuários"
        extra={
          <Space>
            <Input
              placeholder="Buscar..."
              value={params.search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Space>
        }
      >
        <Table dataSource={tableProps.dataSource} columns={columns} {...tableProps} />
      </Card>
    </>
  );
}
