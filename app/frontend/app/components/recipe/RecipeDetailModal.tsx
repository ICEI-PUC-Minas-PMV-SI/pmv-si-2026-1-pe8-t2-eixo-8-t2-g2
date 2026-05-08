import {
  Modal,
  Table,
  Typography,
  Tag,
  Divider,
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Space,
} from 'antd';
import {
  DollarOutlined,
  ShoppingOutlined,
  RocketOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import type { Recipe } from './RecipesPage';

const { Title, Text } = Typography;

type Props = {
  recipe: Recipe | null;
  open: boolean;
  onClose: () => void;
};

export function RecipeDetailModal({ recipe, open, onClose }: Props) {
  if (!recipe) return null;

  const getMarginColor = (margin: number) => {
    if (margin >= 50) return '#52c41a';
    if (margin >= 30) return '#faad14';
    return '#ff4d4f';
  };

  const marginColor = getMarginColor(recipe.profitMargin ?? 0);

  const ingredientColumns = [
    {
      title: 'Ingrediente',
      dataIndex: 'ingredientName',
      key: 'ingredientName',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Qtd. usada',
      dataIndex: 'quantityUsed',
      key: 'quantityUsed',
      align: 'right' as const,
      render: (v: number) => <Text>{v.toLocaleString('pt-BR')}</Text>,
    },
    {
      title: 'Custo',
      dataIndex: 'cost',
      key: 'cost',
      align: 'right' as const,
      render: (v: number) => (
        <Text style={{ color: '#fa8c16' }}>
          {v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </Text>
      ),
    },
  ];

  const fmt = (v?: number) =>
    (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <Modal
      title={
        <Space>
          <span style={{ fontSize: 20 }}>🎂</span>
          <Title level={4} style={{ margin: 0 }}>
            {recipe.name}
          </Title>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={680}
    >
      {/* KPI row */}
      <Row gutter={12} style={{ marginBottom: 20, marginTop: 8 }}>
        <Col span={6}>
          <Card
            size="small"
            bordered={false}
            style={{ background: '#fff7e6', borderRadius: 10, textAlign: 'center' }}
          >
            <Statistic
              title="Custo ingredientes"
              value={recipe.ingredientsCost}
              precision={2}
              prefix="R$"
              valueStyle={{ fontSize: 16 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            size="small"
            bordered={false}
            style={{ background: '#fff1f0', borderRadius: 10, textAlign: 'center' }}
          >
            <Statistic
              title="Custo final"
              value={recipe.finalCostWithPackaging}
              precision={2}
              prefix="R$"
              valueStyle={{ fontSize: 16, color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            size="small"
            bordered={false}
            style={{ background: '#e6f4ff', borderRadius: 10, textAlign: 'center' }}
          >
            <Statistic
              title={`Venda (${recipe.quantityPerRecipe} un.)`}
              value={recipe.totalRevenue}
              precision={2}
              prefix="R$"
              valueStyle={{ fontSize: 16, color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            size="small"
            bordered={false}
            style={{
              background: (recipe.profitMargin ?? 0) >= 30 ? '#f6ffed' : '#fff7e6',
              borderRadius: 10,
              textAlign: 'center',
            }}
          >
            <Statistic
              title="Margem de lucro"
              value={recipe.profitMargin}
              precision={2}
              suffix="%"
              valueStyle={{ fontSize: 16, color: marginColor }}
            />
          </Card>
        </Col>
      </Row>

      <Progress
        percent={Math.min(recipe.profitMargin ?? 0, 100)}
        showInfo={false}
        strokeColor={marginColor}
        style={{ marginBottom: 20 }}
      />

      {/* Ingredients table */}
      <Text strong style={{ display: 'block', marginBottom: 8 }}>
        🧂 Ingredientes utilizados
      </Text>
      <Table
        columns={ingredientColumns}
        dataSource={recipe.ingredients}
        rowKey="ingredientId"
        pagination={false}
        size="small"
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0}>
              <Text strong>Total ingredientes</Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={1} />
            <Table.Summary.Cell index={2} align="right">
              <Text strong style={{ color: '#fa8c16' }}>
                {fmt(recipe.ingredientsCost)}
              </Text>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
        style={{ marginBottom: 16 }}
      />

      {/* Cost breakdown */}
      <Text strong style={{ display: 'block', marginBottom: 8 }}>
        💰 Composição de custos
      </Text>
      <Card size="small" style={{ borderRadius: 10, marginBottom: 16 }}>
        {[
          {
            icon: <ShoppingOutlined />,
            label: 'Custo de ingredientes',
            value: recipe.ingredientsCost,
          },
          {
            icon: <RocketOutlined />,
            label: 'Custo de produção',
            value: recipe.productionCost,
          },
          {
            icon: <ShoppingOutlined />,
            label: `Embalagem (${recipe.packagingQuantity} × ${fmt(recipe.packagingCost)})`,
            value: recipe.packagingCost * recipe.packagingQuantity,
          },
        ].map((row, idx) => (
          <Row key={idx} justify="space-between" style={{ marginBottom: 6 }}>
            <Space>
              {row.icon}
              <Text type="secondary">{row.label}</Text>
            </Space>
            <Text>{fmt(row.value)}</Text>
          </Row>
        ))}
        <Divider style={{ margin: '8px 0' }} />
        <Row justify="space-between">
          <Text strong>Custo final</Text>
          <Text strong>{fmt(recipe.finalCostWithPackaging)}</Text>
        </Row>
        <Row justify="space-between" style={{ marginTop: 4 }}>
          <Text type="secondary">Preço mínimo sugerido (markup 3×)</Text>
          <Tag color="orange">{fmt(recipe.minSalePrice)}</Tag>
        </Row>
      </Card>

      {/* Pricing */}
      <Text strong style={{ display: 'block', marginBottom: 8 }}>
        <TrophyOutlined style={{ color: marginColor }} /> Precificação
      </Text>
      <Card
        size="small"
        style={{
          borderRadius: 10,
          background: (recipe.profitMargin ?? 0) >= 30 ? '#f6ffed' : '#fff7e6',
          border: `1px solid ${marginColor}40`,
        }}
      >
        {[
          {
            label: `Quantidade por receita`,
            value: `${recipe.quantityPerRecipe} unidade(s)`,
            currency: false,
          },
          {
            label: 'Valor de venda unitário',
            value: fmt(recipe.salePrice),
            currency: false,
          },
          {
            label: `Receita total (${recipe.quantityPerRecipe} × ${fmt(recipe.salePrice)})`,
            value: fmt(recipe.totalRevenue),
            currency: false,
          },
        ].map((row, idx) => (
          <Row key={idx} justify="space-between" style={{ marginBottom: 4 }}>
            <Text type="secondary">{row.label}</Text>
            <Text strong>{row.value}</Text>
          </Row>
        ))}
        <Divider style={{ margin: '8px 0' }} />
        <Row justify="space-between" align="middle">
          <Text strong style={{ fontSize: 15 }}>
            <DollarOutlined /> Margem de lucro
          </Text>
          <Text strong style={{ fontSize: 22, color: marginColor }}>
            {(recipe.profitMargin ?? 0).toFixed(2)}%
          </Text>
        </Row>
        <Row justify="space-between" style={{ marginTop: 4 }}>
          <Text type="secondary">Lucro absoluto</Text>
          <Text strong style={{ color: marginColor }}>
            {fmt((recipe.totalRevenue ?? 0) - (recipe.finalCostWithPackaging ?? 0))}
          </Text>
        </Row>
      </Card>
    </Modal>
  );
}
