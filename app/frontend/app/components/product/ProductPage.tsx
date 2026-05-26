import { Space } from 'antd';
import { useState } from 'react';
import { ProductDrawer } from './ProductDrawer';
import { ProductCategoryList } from '../product-category/ProductCategoryList';
import { ProductCharacteristicList } from '../product-characteristic/ProductCharacteristicList';
import { ModalAddProductCategory } from '../product-category/ModalAddProductCategory';
import { TabbedPage } from '../tab/TabbedPage';
import { ProductList } from './ProductList';
export function ProductPage() {
  const [productDrawerOpen, setProductDrawerOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <ProductDrawer
        drawerOpened={productDrawerOpen}
        onClose={() => setProductDrawerOpen(false)}
      />

      <TabbedPage
        defaultTab="products"
        items={[
          {
            key: 'products',
            label: 'Produtos',
            children: <ProductList />,
          },
          {
            key: 'characteristics',
            label: 'Características',
            children: <ProductCharacteristicList />,
          },
          {
            key: 'categories',
            label: 'Categorias',
            children: <ProductCategoryList />,
          },
        ]}
      />
      <ModalAddProductCategory
        isOpened={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
      />
    </Space>
  );
}
