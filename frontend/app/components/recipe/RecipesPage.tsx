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
  Row,
  Col,
  Select,
  Divider,
  Alert,
  Tooltip,
  Progress,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CoffeeOutlined,
  TrophyOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Ingredient } from './IngredientsPage';

const { Title, Text } = Typography;

export type RecipeIngredient = {
  ingredientId: string;
  ingredientName: string;
  quantityUsed: number; // em gramas/ml/un
  cost: number;         // calculado
};

export type Recipe = {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  productionCost: number;   // custo de produção (energia, gás, etc)
  packagingCost: number;    // custo da embalagem
  packagingQuantity: number; // quantas embalagens usadas
  quantityPerRecipe: number; // quantas unidades a receita rende
  salePrice: number;        // valor de venda por unidade
  // calculados:
  ingredientsCost?: number;
  finalCost?: number;
  finalCostWithPackaging?: number;
  minSalePrice?: number;
  totalRevenue?: number;
  profitMargin?: number;
};

type Props = {
  recipes: Recipe[];
  ingredients: Ingredient[];
  onAdd: (recipe: Omit<Recipe, 'id' | 'ingredientsCost' | 'finalCost' | 'finalCostWithPackaging' | 'minSalePrice' | 'totalRevenue' | 'profitMargin'>) => void;
  onEdit: (id: string, recipe: Omit<Recipe, 'id' | 'ingredientsCost' | 'finalCost' | 'finalCostWithPackaging' | 'minSalePrice' | 'totalRevenue' | 'profitMargin'>) => void;
  onDelete: (id: string) => void;
  onViewDetail: (recipe: Recipe) => void;
};

export function RecipesPage({ recipes, ingredients, onAdd, onEdit, onDelete, onViewDetail }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const openAdd = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ quantityPerRecipe: 1, productionCost: 0, packagingCost: 0, packagingQuantity: 0 });
    setModalOpen(true);
  };

  const openEdit = (record: Recipe) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      productionCost: record.productionCost,
      packagingCost: record.packagingCost,
      packagingQuantity: record.packagingQuantity,
      quantityPerRecipe: record.quantityPerRecipe,
      salePrice: record.salePrice,
      ingredients: record.ingredients.map((ri) => ({
        ingredientId: ri.ingredientId,
        quantityUsed: ri.quantityUsed,
      })),
    });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      // Enrich ingredient names
      const enrichedIngredients = (values.ingredients || []).map((ri: any) => {
        const found = ingredients.find((i) => i.id === ri.ingredientId);
        const costPerUnit = found?.costPerGram ?? 0;
        return {
          ingredientId: ri.ingredientId,
          ingredientName: found?.name ?? '',
          quantityUsed: ri.quantityUsed,
          cost: costPerUnit * ri.quantityUsed,
        };
      });
      const payload = { ...values, ingredients: enrichedIngredients };
      if (editingId) {
        onEdit(editingId, payload);
      } else {
        onAdd(payload);
      }
      setModalOpen(false);
      form.resetFields();
    });
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 50) return '#52c41a';
    if (margin >= 30) return '#faad14';
    return '#ff4d4f';
  };

  const columns: ColumnsType<Recipe> = [
    {
      title: 'Receita',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Space>
          <CoffeeOutlined style={{ color: '#a0522d' }} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Custo ingredientes',
      dataIndex: 'ingredientsCost',
      key: 'ingredientsCost',
      align: 'right',
      render: (v: number) => (
        <Text>{v?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
      ),
    },
    {
      title: 'Custo final',
      dataIndex: 'finalCostWithPackaging',
      key: 'finalCostWithPackaging',
      align: 'right',
      render: (v: number) => (
        <Tag color="volcano">
          {v?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </Tag>
      ),
    },
    {
      title: 'Valor de venda',
      dataIndex: 'salePrice',
      key: 'salePrice',
      align: 'right',
      render: (v: number) => (
        <Text strong style={{ color: '#1677ff' }}>
          {v?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </Text>
      ),
    },
    {
      title: 'Margem de lucro',
      dataIndex: 'profitMargin',
      key: 'profitMargin',
      align: 'center',
      render: (v: number) => {
        if (v == null) return '-';
        const color = getMarginColor(v);
        return (
          <Space direction="vertical" size={2} style={{ width: 80 }}>
            <Text strong style={{ color }}>
              {v.toFixed(2)}%
            </Text>
            <Progress
              percent={Math.min(v, 100)}
              showInfo={false}
              strokeColor={color}
              size="small"
            />
          </Space>
        );
      },
    },
    {
      title: 'Rende',
      dataIndex: 'quantityPerRecipe',
      key: 'quantityPerRecipe',
      align: 'center',
      render: (v: number) => <Tag>{v} un.</Tag>,
    },
    {
      title: 'Ações',
      key: 'actions',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver detalhes">
            <Button size="small" onClick={() => onViewDetail(record)}>
              Detalhes
            </Button>
          </Tooltip>
          <Tooltip title="Editar">
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Excluir receita?"
            onConfirm={() => onDelete(record.id)}
            okText="Excluir"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" icon={<DeleteOutlined />} danger />
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
            🎂 Receitas
          </Title>
          <Text type="secondary">
            Monte suas receitas e veja os custos e margens calculados automaticamente
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openAdd}
          size="large"
          disabled={ingredients.length === 0}
        >
          Nova receita
        </Button>
      </div>

      {ingredients.length === 0 && (
        <Alert
          type="warning"
          icon={<WarningOutlined />}
          showIcon
          message="Cadastre ingredientes primeiro antes de criar receitas."
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
      )}

      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Table
          columns={columns}
          dataSource={recipes}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Nenhuma receita cadastrada' }}
        />
      </Card>

      <Modal
        title={editingId ? 'Editar receita' : 'Nova receita'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editingId ? 'Salvar' : 'Cadastrar'}
        cancelText="Cancelar"
        width={720}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Nome da receita"
            name="name"
            rules={[{ required: true, message: 'Informe o nome' }]}
          >
            <Input placeholder="Ex.: Mousse de chocolate, Panqueca..." />
          </Form.Item>

          <Divider orientation="left">Ingredientes da receita</Divider>

          <Form.List name="ingredients">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <Row gutter={8} key={key} align="middle" style={{ marginBottom: 8 }}>
                    <Col flex={1}>
                      <Form.Item
                        {...rest}
                        name={[name, 'ingredientId']}
                        rules={[{ required: true, message: 'Selecione' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Select
                          placeholder="Selecione o ingrediente"
                          options={ingredients.map((i) => ({
                            label: (
                              <Space>
                                {i.name}
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                  (
                                  {i.costPerGram?.toLocaleString('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                    minimumFractionDigits: 4,
                                  })}{' '}
                                  / {i.unit})
                                </Text>
                              </Space>
                            ),
                            value: i.id,
                          }))}
                          showSearch
                          optionFilterProp="label"
                        />
                      </Form.Item>
                    </Col>
                    <Col style={{ width: 140 }}>
                      <Form.Item
                        {...rest}
                        name={[name, 'quantityUsed']}
                        rules={[{ required: true, message: 'Qtd.' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <InputNumber
                          min={0.01}
                          style={{ width: '100%' }}
                          placeholder="Qtd. usada"
                        />
                      </Form.Item>
                    </Col>
                    <Col>
                      <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => remove(name)}
                        style={{ marginBottom: 0 }}
                      />
                    </Col>
                  </Row>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  block
                  style={{ marginBottom: 8 }}
                >
                  Adicionar ingrediente
                </Button>

                {/* Live cost preview */}
                <Form.Item noStyle shouldUpdate>
                  {({ getFieldValue }) => {
                    const items = getFieldValue('ingredients') || [];
                    let total = 0;
                    const rows: { name: string; qty: number; cost: number; unit: string }[] = [];
                    items.forEach((item: any) => {
                      if (!item?.ingredientId || !item?.quantityUsed) return;
                      const ing = ingredients.find((i) => i.id === item.ingredientId);
                      if (!ing) return;
                      const cost = (ing.costPerGram ?? 0) * item.quantityUsed;
                      total += cost;
                      rows.push({ name: ing.name, qty: item.quantityUsed, cost, unit: ing.unit });
                    });
                    if (rows.length === 0) return null;
                    return (
                      <Card
                        size="small"
                        style={{ background: '#fafafa', borderRadius: 8, marginBottom: 8 }}
                        title={<Text type="secondary" style={{ fontSize: 12 }}>Custo dos ingredientes</Text>}
                      >
                        {rows.map((r, idx) => (
                          <Row key={idx} justify="space-between">
                            <Text style={{ fontSize: 12 }}>
                              {r.name} ({r.qty} {r.unit})
                            </Text>
                            <Text style={{ fontSize: 12 }}>
                              {r.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </Text>
                          </Row>
                        ))}
                        <Divider style={{ margin: '6px 0' }} />
                        <Row justify="space-between">
                          <Text strong style={{ fontSize: 12 }}>Total ingredientes</Text>
                          <Text strong style={{ color: '#fa8c16' }}>
                            {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </Text>
                        </Row>
                      </Card>
                    );
                  }}
                </Form.Item>
              </>
            )}
          </Form.List>

          <Divider orientation="left">Custos extras</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Custo de produção (R$)"
                name="productionCost"
                tooltip="Energia, gás, mão de obra, etc."
              >
                <InputNumber min={0} precision={2} style={{ width: '100%' }} prefix="R$" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Custo da embalagem (R$)"
                name="packagingCost"
                tooltip="Custo unitário de cada embalagem"
              >
                <InputNumber min={0} precision={2} style={{ width: '100%' }} prefix="R$" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Qtd. de embalagens usadas"
                name="packagingQuantity"
                tooltip="Quantas embalagens esta receita usa"
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Rende (unidades)"
                name="quantityPerRecipe"
                tooltip="Quantas unidades esta receita produz"
                rules={[{ required: true, message: 'Informe a quantidade' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Precificação</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Valor de venda por unidade (R$)"
                name="salePrice"
                rules={[{ required: true, message: 'Informe o valor' }]}
              >
                <InputNumber min={0} precision={2} style={{ width: '100%' }} prefix="R$" />
              </Form.Item>
            </Col>
          </Row>

          {/* Full cost summary */}
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const items = getFieldValue('ingredients') || [];
              const productionCost = getFieldValue('productionCost') || 0;
              const packagingCost = getFieldValue('packagingCost') || 0;
              const packagingQty = getFieldValue('packagingQuantity') || 0;
              const qty = getFieldValue('quantityPerRecipe') || 1;
              const salePrice = getFieldValue('salePrice') || 0;

              let ingredientsCost = 0;
              items.forEach((item: any) => {
                if (!item?.ingredientId || !item?.quantityUsed) return;
                const ing = ingredients.find((i) => i.id === item.ingredientId);
                if (!ing) return;
                ingredientsCost += (ing.costPerGram ?? 0) * item.quantityUsed;
              });

              const packagingTotal = packagingCost * packagingQty;
              const finalCost = ingredientsCost + productionCost;
              const finalCostWithPkg = finalCost + packagingTotal;
              const minSalePrice = finalCostWithPkg * 3;
              const totalRevenue = salePrice * qty;
              const profitMargin =
                totalRevenue > 0
                  ? ((totalRevenue - finalCostWithPkg) / totalRevenue) * 100
                  : 0;

              if (ingredientsCost === 0 && productionCost === 0) return null;

              const marginColor = getMarginColor(profitMargin);

              return (
                <Card
                  style={{
                    background: profitMargin >= 30 ? '#f6ffed' : '#fff7e6',
                    border: `1px solid ${profitMargin >= 30 ? '#b7eb8f' : '#ffd591'}`,
                    borderRadius: 10,
                  }}
                  title={
                    <Space>
                      <TrophyOutlined style={{ color: marginColor }} />
                      <Text strong>Resumo financeiro</Text>
                    </Space>
                  }
                >
                  <Row gutter={[8, 4]}>
                    {[
                      { label: 'Custo ingredientes', value: ingredientsCost },
                      { label: 'Custo produção', value: productionCost },
                      { label: 'Custo embalagem', value: packagingTotal },
                      { label: 'Custo final', value: finalCostWithPkg, strong: true },
                      { label: 'Preço mínimo sugerido (3×)', value: minSalePrice },
                    ].map((row) => (
                      <Col span={24} key={row.label}>
                        <Row justify="space-between">
                          <Text type={row.strong ? undefined : 'secondary'} strong={row.strong}>
                            {row.label}
                          </Text>
                          <Text strong={row.strong}>
                            {row.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </Text>
                        </Row>
                      </Col>
                    ))}
                    <Col span={24}>
                      <Divider style={{ margin: '6px 0' }} />
                      <Row justify="space-between">
                        <Text strong>Receita total (venda × {qty} un.)</Text>
                        <Text strong style={{ color: '#1677ff' }}>
                          {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </Text>
                      </Row>
                      <Row justify="space-between" style={{ marginTop: 4 }}>
                        <Text strong>Margem de lucro</Text>
                        <Text strong style={{ color: marginColor, fontSize: 18 }}>
                          {profitMargin.toFixed(2)}%
                        </Text>
                      </Row>
                      <Progress
                        percent={Math.min(profitMargin, 100)}
                        showInfo={false}
                        strokeColor={marginColor}
                        style={{ marginTop: 4 }}
                      />
                    </Col>
                  </Row>
                </Card>
              );
            }}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
