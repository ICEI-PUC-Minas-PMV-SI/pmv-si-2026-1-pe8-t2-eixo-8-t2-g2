import { useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  Typography,
  Tag,
  Popconfirm,
  Card,
  Statistic,
  Row,
  Col,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExperimentOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

export type Ingredient = {
  id: string;
  name: string;
  totalCost: number;      // Custo do pacote/unidade comprada
  totalQuantity: number;  // Quantidade total do pacote (em gramas)
  unit: string;           // 'g' | 'ml' | 'un'
  costPerGram?: number;   // calculado automaticamente
};

type Props = {
  ingredients: Ingredient[];
  onAdd: (ingredient: Omit<Ingredient, 'id' | 'costPerGram'>) => void;
  onEdit: (id: string, ingredient: Omit<Ingredient, 'id' | 'costPerGram'>) => void;
  onDelete: (id: string) => void;
};

const UNIT_OPTIONS = [
  { label: 'Gramas (g)', value: 'g' },
  { label: 'Mililitros (ml)', value: 'ml' },
  { label: 'Unidade (un)', value: 'un' },
];

export function IngredientsPage({ ingredients, onAdd, onEdit, onDelete }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const totalIngredients = ingredients.length;
  const avgCostPerGram =
    ingredients.length > 0
      ? ingredients.reduce((acc, i) => acc + (i.costPerGram ?? 0), 0) / ingredients.length
      : 0;

  const openAdd = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldValue('unit', 'g');
    setModalOpen(true);
  };

  const openEdit = (record: Ingredient) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      totalCost: record.totalCost,
      totalQuantity: record.totalQuantity,
      unit: record.unit,
    });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editingId) {
        onEdit(editingId, values);
      } else {
        onAdd(values);
      }
      setModalOpen(false);
      form.resetFields();
    });
  };

  const columns: ColumnsType<Ingredient> = [
    {
      title: 'Ingrediente',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string) => (
        <Space>
          <ExperimentOutlined style={{ color: '#a0522d' }} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          Custo do pacote
          <Tooltip title="Quanto você pagou pelo pacote/unidade completa">
            <InfoCircleOutlined style={{ color: '#aaa' }} />
          </Tooltip>
        </Space>
      ),
      dataIndex: 'totalCost',
      key: 'totalCost',
      align: 'right',
      render: (v: number) => (
        <Text>
          {v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </Text>
      ),
    },
    {
      title: (
        <Space>
          Qtd. do pacote
          <Tooltip title="Quantidade total que veio no pacote">
            <InfoCircleOutlined style={{ color: '#aaa' }} />
          </Tooltip>
        </Space>
      ),
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      align: 'right',
      render: (v: number, record: Ingredient) => (
        <Text>
          {v.toLocaleString('pt-BR')} {record.unit}
        </Text>
      ),
    },
    {
      title: (
        <Space>
          Custo por {' '}
          <Tooltip title="Calculado automaticamente: Custo do pacote ÷ Quantidade">
            <InfoCircleOutlined style={{ color: '#aaa' }} />
          </Tooltip>
        </Space>
      ),
      dataIndex: 'costPerGram',
      key: 'costPerGram',
      align: 'right',
      render: (v: number, record: Ingredient) => (
        <Tag color="orange" style={{ fontWeight: 600 }}>
          {v?.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
          })}{' '}
          / {record.unit}
        </Tag>
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Excluir ingrediente?"
            description="Receitas que usam este ingrediente podem ser afetadas."
            onConfirm={() => onDelete(record.id)}
            okText="Excluir"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Excluir">
              <Button size="small" icon={<DeleteOutlined />} danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            🧂 Ingredientes
          </Title>
          <Text type="secondary">
            Cadastre os ingredientes com o custo real do pacote comprado
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd} size="large">
          Novo ingrediente
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card bordered={false} style={{ background: '#fdf6ec', borderRadius: 12 }}>
            <Statistic
              title="Total de ingredientes"
              value={totalIngredients}
              suffix="itens"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ background: '#fdf6ec', borderRadius: 12 }}>
            <Statistic
              title="Custo médio / unidade"
              value={avgCostPerGram}
              precision={4}
              prefix="R$"
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Table
          columns={columns}
          dataSource={ingredients}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Nenhum ingrediente cadastrado' }}
        />
      </Card>

      <Modal
        title={editingId ? 'Editar ingrediente' : 'Novo ingrediente'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editingId ? 'Salvar' : 'Cadastrar'}
        cancelText="Cancelar"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Nome do ingrediente"
            name="name"
            rules={[{ required: true, message: 'Informe o nome' }]}
          >
            <Input placeholder="Ex.: Chocolate blend, Manteiga..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Custo do pacote (R$)"
                name="totalCost"
                rules={[{ required: true, message: 'Informe o custo' }]}
                tooltip="Quanto você pagou pelo pacote completo"
              >
                <InputNumber
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  prefix="R$"
                  placeholder="0,00"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Quantidade do pacote"
                name="totalQuantity"
                rules={[{ required: true, message: 'Informe a quantidade' }]}
                tooltip="Total que veio no pacote (gramas, ml ou unidades)"
              >
                <InputNumber
                  min={0.01}
                  style={{ width: '100%' }}
                  placeholder="Ex.: 1000"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Unidade de medida"
            name="unit"
            rules={[{ required: true, message: 'Selecione a unidade' }]}
          >
            <Space>
              {UNIT_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  type={form.getFieldValue('unit') === opt.value ? 'primary' : 'default'}
                  onClick={() => {
                    form.setFieldValue('unit', opt.value);
                  }}
                >
                  {opt.label}
                </Button>
              ))}
            </Space>
          </Form.Item>

          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const cost = getFieldValue('totalCost');
              const qty = getFieldValue('totalQuantity');
              const unit = getFieldValue('unit') || 'g';
              if (cost && qty && qty > 0) {
                const cpg = cost / qty;
                return (
                  <Card
                    size="small"
                    style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8 }}
                  >
                    <Text>
                      Custo calculado:{' '}
                      <Text strong style={{ color: '#389e0d' }}>
                        {cpg.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          minimumFractionDigits: 4,
                          maximumFractionDigits: 4,
                        })}{' '}
                        por {unit}
                      </Text>
                    </Text>
                  </Card>
                );
              }
              return null;
            }}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
