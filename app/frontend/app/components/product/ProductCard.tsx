import { Card, Space, Tag, Button } from 'antd';
import { ShoppingCartOutlined, EditOutlined } from '@ant-design/icons';
import { ProductImage } from './ProductImage';
import type { Product, ProductCategory, ProductCharacteristic } from '~/@types/product';
import Text from 'antd/es/typography/Text';
import NumberUtil from '~/utils/NumberUtil';
import { CategoryChip } from './CategoryChip';
import { CharacteristicBadge } from './CharacteristicBadge';
import Paragraph from 'antd/es/typography/Paragraph';

type ComponentProps = {
  product: Product;
  categories: ProductCategory[] | readonly ProductCategory[];
  characteristics: ProductCharacteristic[] | readonly ProductCharacteristic[];
  onEdit: () => void;
  onAddToCart: () => void;
};

export function ProductCard({
  product,
  categories,
  characteristics,
  onAddToCart,
  onEdit,
}: ComponentProps) {
  return (
    <Card size="small">
      <Space
        orientation="vertical"
        style={{
          width: '100%',
        }}
      >
        <ProductImage
          height={180}
          width={'100%'}
          src={product.imageUrl ?? undefined}
          alt={product.name}
        />

        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <Space style={{ justifyContent: 'space-between', display: 'flex' }}>
            <Text strong>{product.name}</Text>

            <Tag color={product.isActive ? 'green' : 'default'}>
              {product.isActive ? 'Ativo' : 'Inativo'}
            </Tag>
          </Space>

          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#e06d5b',
            }}
          >
            {NumberUtil.currency(product.price)}
          </div>

          <Paragraph
            type="secondary"
            ellipsis={{
              rows: 2,
            }}
            style={{
              marginBottom: 0,
            }}
          >
            {product.description}
          </Paragraph>
        </div>
        <div hidden={!product.categories?.length}>
          <Text strong>Categorias</Text>
          <Space wrap style={{ marginTop: 4 }}>
            {product.categories?.map((currentCategory) => {
              const category = categories.find(
                (c) => c.id === currentCategory.category.id,
              );

              return category ? (
                <CategoryChip key={category.id} category={category} />
              ) : null;
            })}
          </Space>
        </div>
        <div hidden={!product.characteristics?.length}>
          <Text strong>Características</Text>
          <Space wrap style={{ marginTop: 4 }}>
            {product.characteristics?.map((currentChar) => {
              const char = characteristics.find(
                (c) => c.id === currentChar.characteristic.id,
              );

              return char ? (
                <CharacteristicBadge key={char.id} characteristic={char} />
              ) : null;
            })}
          </Space>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        ></div>

        <Space.Compact block style={{ justifyContent: 'center' }}>
          <Button type="primary" icon={<ShoppingCartOutlined />} onClick={onAddToCart}>
            Adicionar
          </Button>

          <Button icon={<EditOutlined />} onClick={onEdit}>
            Editar
          </Button>
        </Space.Compact>
      </Space>
    </Card>
  );
}
