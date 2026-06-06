import {
  Badge,
  Button,
  Drawer,
  Empty,
  Flex,
  List,
  Popover,
  Space,
  Tag,
  Typography,
} from 'antd';
import {
  DeleteOutlined,
  MinusOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { useMemo, useState } from 'react';
import NumberUtil from '~/utils/NumberUtil';
import { useCartStore } from '~/hooks/useCartStore';
import { useNavigation } from '~/hooks/useNavigation';
import { useBreakpoint } from '~/hooks/useBreakpoint';

const { Text } = Typography;

export function CartPreview() {
  const { goToCart } = useNavigation();
  const [open, setOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const isMobile = useBreakpoint('md');

  const totalItems = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const totalPrice = useMemo(
    () => items.reduce((total, item) => total + item.quantity * item.product.price, 0),
    [items],
  );

  const content = (
    <div
      style={{
        width: isMobile ? 'calc(100vw - 24px)' : 360,
        maxWidth: 360,
      }}
    >
      <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 700 }}>Carrinho</div>
          <Text type="secondary">{totalItems} item(ns)</Text>
        </div>
        <Tag color="volcano">{NumberUtil.currency(totalPrice)}</Tag>
      </Flex>

      {items.length === 0 ? (
        <Empty
          description="Seu carrinho está vazio"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <List
          size="small"
          dataSource={items.slice(0, 3)}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  key="minus"
                  size="small"
                  icon={<MinusOutlined />}
                  onClick={() => decrementItem(item.product.id)}
                />,
                <Button
                  key="plus"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => incrementItem(item.product.id)}
                />,
                <Button
                  key="remove"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeItem(item.product.id)}
                />,
              ]}
            >
              <List.Item.Meta
                title={<Text strong>{item.product.name}</Text>}
                description={`${item.quantity} x ${NumberUtil.currency(item.product.price)}`}
              />
            </List.Item>
          )}
        />
      )}

      <Space orientation="vertical" style={{ width: '100%', marginTop: 12 }}>
        {items.length > 3 && (
          <Text type="secondary">+ {items.length - 3} item(ns) no carrinho</Text>
        )}
        <Button
          type="primary"
          block
          icon={<ShoppingCartOutlined />}
          onClick={() => {
            setOpen(false);
            goToCart();
          }}
        >
          Ver carrinho completo
        </Button>
      </Space>
    </div>
  );

  // if (isMobile) {
  //   return (
  //     <>
  //       <Badge count={totalItems}>
  //         <Button icon={<ShoppingCartOutlined />} onClick={() => setOpen(true)} />
  //       </Badge>

  //       <Drawer
  //         title="Carrinho"
  //         placement="bottom"
  //         size="70vh"
  //         open={open}
  //         onClose={() => setOpen(false)}
  //       >
  //         {content}
  //       </Drawer>
  //     </>
  //   );
  // }

  return (
    <Popover
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      content={content}
      placement={isMobile ? 'bottom' : 'bottomRight'}
      arrow={false}
    >
      <Badge count={totalItems} size="small" overflowCount={99}>
        <Button icon={<ShoppingCartOutlined />} aria-label="Abrir carrinho" />
      </Badge>
    </Popover>
  );
}
