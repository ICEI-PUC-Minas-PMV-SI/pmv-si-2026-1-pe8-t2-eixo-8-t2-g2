import {
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Flex,
  Image,
  InputNumber,
  Row,
  Space,
  Typography,
} from 'antd';
import { DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import NumberUtil from '~/utils/NumberUtil';
import { useCartStore } from '~/hooks/useCartStore';

const { Text, Title } = Typography;

export function CartPage() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const setItemQuantity = useCartStore((state) => state.setItemQuantity);

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce(
    (total, item) => total + item.quantity * item.product.price,
    0,
  );

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%', padding: 16 }}>
      <Card>
        <Flex justify="space-between" align="center" gap="middle" wrap>
          <div>
            <Title level={3} style={{ marginBottom: 4 }}>
              Carrinho de compras
            </Title>
            <Text type="secondary">
              Revise os itens antes de seguir para a finalização.
            </Text>
          </div>
          <Badge count={totalItems} color="#E06D5B">
            <Button icon={<ShoppingCartOutlined />} />
          </Badge>
        </Flex>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
            {items.length === 0 ? (
              <Card>
                <Empty description="Seu carrinho está vazio" />
              </Card>
            ) : (
              items.map((item) => {
                const subtotalItem = item.quantity * item.product.price;

                return (
                  <Card key={item.product.id}>
                    <Flex gap="middle" vertical={false} align="start">
                      <div
                        style={{
                          width: 96,
                          height: 96,
                          borderRadius: 16,
                          overflow: 'hidden',
                          background: '#f5f5f5',
                          flexShrink: 0,
                        }}
                      >
                        {item.product.imageUrl ? (
                          <Image
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            width={96}
                            height={96}
                            style={{ objectFit: 'cover' }}
                            preview={false}
                          />
                        ) : null}
                      </div>

                      <Space
                        orientation="vertical"
                        style={{ flex: 1, minWidth: 0 }}
                        size={4}
                      >
                        <Text strong style={{ fontSize: 16 }}>
                          {item.product.name}
                        </Text>
                        <Text type="secondary">{item.product.slug}</Text>
                        {item.product.description && (
                          <Text type="secondary">{item.product.description}</Text>
                        )}
                        <Text>
                          Unitário: {NumberUtil.currency(item.product.price)} | Subtotal:{' '}
                          {NumberUtil.currency(subtotalItem)}
                        </Text>
                      </Space>

                      <Space orientation="vertical" align="end" size={8}>
                        <InputNumber
                          min={1}
                          value={item.quantity}
                          onChange={(value) =>
                            setItemQuantity(item.product.id, Number(value || 1))
                          }
                        />
                        <Space>
                          <Button
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => removeItem(item.product.id)}
                          >
                            Remover
                          </Button>
                          <Button onClick={() => decrementItem(item.product.id)}>
                            -
                          </Button>
                          <Button
                            type="primary"
                            onClick={() => incrementItem(item.product.id)}
                          >
                            +
                          </Button>
                        </Space>
                      </Space>
                    </Flex>
                  </Card>
                );
              })
            )}
          </Space>
        </Col>

        <Col xs={24} lg={8}>
          <Card>
            <Title level={4}>Resumo</Title>
            <Divider />
            <Space orientation="vertical" style={{ width: '100%' }} size={8}>
              <Flex justify="space-between">
                <Text>Itens</Text>
                <Text strong>{totalItems}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text>Subtotal</Text>
                <Text strong>{NumberUtil.currency(subtotal)}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text>Entrega</Text>
                <Text strong>Calculado na finalização</Text>
              </Flex>
            </Space>

            <Divider />

            <Space orientation="vertical" style={{ width: '100%' }}>
              <Button type="primary" block disabled={items.length === 0}>
                Continuar para checkout
              </Button>
              <Button block danger onClick={clearCart} disabled={items.length === 0}>
                Limpar carrinho
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
